import { clearSession, getSession, saveSession } from '../utils/auth'

function resolveApiBase() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  if (import.meta.env.PROD) return 'http://localhost:8080'
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:8080'
}

const API_BASE = resolveApiBase()

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

function buildUrl(path, params) {
  const url = path.startsWith('http')
    ? new URL(path)
    : new URL(path.startsWith('/') ? path : `/${path}`, `${API_BASE}/`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
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
    throw new ApiError(
      offline
        ? 'Could not reach the server. Start the backend and sign in with your API account.'
        : err?.message || 'Network request failed.',
      0,
      null,
    )
  }

  const text = await response.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }

  if (!response.ok) {
    if (response.status === 401 && session?.accessToken) {
      clearSession()
    }
    const fieldErrors = json?.errors
    const fieldMessage =
      fieldErrors && typeof fieldErrors === 'object'
        ? Object.values(fieldErrors).find(Boolean)
        : null
    const message =
      fieldMessage ||
      json?.detail ||
      json?.message ||
      json?.title ||
      (response.status === 500 &&
      (json?.title === 'Internal Server Error' || !json?.detail || text?.includes('AggregateError'))
        ? 'Backend server is not running. Open a terminal, run: cd backend && .\\mvnw.cmd spring-boot:run'
        : response.status === 404
        ? 'Backend API not found. Start the PGXplore backend on port 8081 (Apache is using 8080 on this machine).'
        : response.status === 403
        ? 'You do not have permission for this action. Sign in as a privileged account or PG owner.'
        : response.statusText)
    throw new ApiError(message, response.status, json)
  }

  if (json && typeof json.success === 'boolean') {
    if (!json.success) throw new ApiError(json.message || 'Request failed', response.status, json)
    return json.data
  }

  return json
}

export function getApiBaseUrl() {
  return API_BASE
}

export function updateSessionTokens(tokens) {
  const session = getSession()
  if (!session) return
  saveSession({ ...session, ...tokens })
}
