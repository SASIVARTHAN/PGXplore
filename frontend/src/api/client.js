import { clearSession, getSession, saveSession } from '../utils/auth'

const AWS_API_BASE = 'http://3.105.160.225'

function resolveApiBase() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  // Browser: same-origin so Vite (or nginx) can proxy /api → backend.
  if (typeof window !== 'undefined') return window.location.origin
  return AWS_API_BASE
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

function buildUrl(path, params) {
  const apiBase = resolveApiBase()
  const url = path.startsWith('http')
    ? new URL(path)
    : new URL(path.startsWith('/') ? path : `/${path}`, `${apiBase}/`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

function offlineMessage() {
  const base = resolveApiBase()
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.'))
  if (isLocal || base.includes('localhost') || base.includes('127.0.0.1') || base.includes('192.168.')) {
    return 'Could not reach the API. Is the local backend running on port 8080, and did you restart the Vite dev server?'
  }
  return `Could not reach the API server at ${base || AWS_API_BASE}. Check your internet connection and that the backend is running.`
}

function serverUnavailableMessage(status) {
  if (status === 503 || status === 502 || status === 504) {
    return 'The API server is temporarily unavailable. If you are developing locally, ensure Spring Boot is running on port 8080.'
  }
  if (status === 500) {
    return 'The API server returned an error. Check backend logs (and DB migrations if recently updated).'
  }
  return null
}

export async function apiRequest(path, { method = 'GET', body, params, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  const session = getSession()

  if (auth && session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`
  }

  const init = { method, headers }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(buildUrl(path, params), init)
  } catch (err) {
    const offline =
      err?.message === 'Failed to fetch' ||
      err?.message?.toLowerCase?.().includes('network')
    throw new ApiError(offline ? offlineMessage() : err?.message || 'Network request failed.', 0, null)
  }

  const text = await response.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && session?.accessToken) {
      clearSession()
    }
    const fieldErrors = json?.errors
    const fieldMessage =
      fieldErrors && typeof fieldErrors === 'object'
        ? Object.values(fieldErrors).find(Boolean)
        : null
    const isPublicAuth = path.startsWith('/api/auth/')
    const fallback403 = isPublicAuth
      ? 'Could not complete this request. Please check your connection and try again.'
      : 'You do not have permission for this action. Sign in as a privileged account or PG owner.'
    const unavailable = serverUnavailableMessage(response.status)
    const genericDetail = json?.detail === 'An unexpected error occurred' ? unavailable : null
    const message =
      fieldMessage ||
      genericDetail ||
      json?.detail ||
      json?.message ||
      json?.title ||
      unavailable ||
      (response.status === 403 ? fallback403 : response.statusText)
    throw new ApiError(message, response.status, json)
  }

  if (json && typeof json.success === 'boolean') {
    if (!json.success) throw new ApiError(json.message || 'Request failed', response.status, json)
    return json.data
  }

  return json
}

export function getApiBaseUrl() {
  return resolveApiBase()
}

export function updateSessionTokens(tokens) {
  const session = getSession()
  if (!session) return
  saveSession({ ...session, ...tokens })
}
