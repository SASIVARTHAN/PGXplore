import { apiRequest } from './client'
import { ROLES, saveSession } from '../utils/auth'

function mapBackendRole(role) {
  if (role === 'ADMIN') return ROLES.ADMIN
  if (role === 'PG_OWNER') return ROLES.PG_OWNER
  return ROLES.NORMAL
}

export async function loginApi(email, password) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })

  const session = {
    id: String(data.userId),
    name: data.name,
    email: data.email,
    role: mapBackendRole(data.role),
    backendRole: data.role,
    accessToken: data.accessToken || data.token,
    refreshToken: data.refreshToken,
    phone: '',
  }

  saveSession(session)
  return session
}

export async function fetchGoogleAuthConfigApi() {
  return apiRequest('/api/auth/google/config', { auth: false })
}

export async function fetchFirebaseConfigApi() {
  return apiRequest('/api/auth/firebase/config', { auth: false })
}

export async function loginWithFirebaseApi(idToken) {
  const data = await apiRequest('/api/auth/firebase', {
    method: 'POST',
    body: { idToken },
    auth: false,
  })

  const session = {
    id: String(data.userId),
    name: data.name,
    email: data.email,
    role: mapBackendRole(data.role),
    backendRole: data.role,
    accessToken: data.accessToken || data.token,
    refreshToken: data.refreshToken,
    phone: data.phone || '',
    authProvider: data.phone ? 'phone' : 'google',
    profilePicture: data.profilePicture || '',
  }

  saveSession(session)
  return session
}

export async function loginWithGoogleDevApi(payload = {}) {
  const data = await apiRequest('/api/auth/google/dev', {
    method: 'POST',
    body: payload,
    auth: false,
  })

  const session = {
    id: String(data.userId),
    name: data.name,
    email: data.email,
    role: mapBackendRole(data.role),
    backendRole: data.role,
    accessToken: data.accessToken || data.token,
    refreshToken: data.refreshToken,
    phone: '',
    authProvider: 'google',
  }

  saveSession(session)
  return session
}

export async function loginWithGoogleApi(idToken) {
  const data = await apiRequest('/api/auth/google', {
    method: 'POST',
    body: { idToken },
    auth: false,
  })

  const session = {
    id: String(data.userId),
    name: data.name,
    email: data.email,
    role: mapBackendRole(data.role),
    backendRole: data.role,
    accessToken: data.accessToken || data.token,
    refreshToken: data.refreshToken,
    phone: '',
    authProvider: 'google',
  }

  saveSession(session)
  return session
}

export async function registerApi(payload) {
  const data = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      role: payload.role === 'owner' ? 'PG_OWNER' : 'USER',
    },
    auth: false,
  })

  const session = {
    id: String(data.userId),
    name: data.name,
    email: data.email,
    role: mapBackendRole(data.role),
    backendRole: data.role,
    accessToken: data.accessToken || data.token,
    refreshToken: data.refreshToken,
    phone: payload.phone,
  }

  saveSession(session)
  return session
}
