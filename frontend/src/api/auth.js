import { apiRequest, ApiError } from './client'
import {
  DEMO_OTP,
  canUseDemoPhoneFallback,
  demoRegister,
  demoSendOtp,
  demoVerifyOtp,
} from './demoAuth'
import { clearSession, ROLES, saveSession } from '../utils/auth'

export { DEMO_OTP }

function mapBackendRole(role) {
  if (role === 'ADMIN') return ROLES.ADMIN
  if (role === 'PG_OWNER') return ROLES.PG_OWNER
  return ROLES.NORMAL
}

function buildSession(data, phone = '') {
  return {
    id: String(data.userId),
    name: data.name,
    email: data.email || '',
    role: mapBackendRole(data.role),
    backendRole: data.role,
    accessToken: data.accessToken || data.token,
    refreshToken: data.refreshToken,
    phone: data.phone || phone,
    ownerApprovalStatus: data.ownerApprovalStatus,
    authProvider: data.authProvider,
  }
}

function shouldUseDemoFallback(err, phone) {
  if (!canUseDemoPhoneFallback(phone)) return false
  if (err instanceof ApiError) {
    return err.status === 0 || err.status >= 500 || err.status === 404
  }
  return true
}

export async function loginWithCognitoApi({ idToken, name, role, portal }) {
  const data = await apiRequest('/api/auth/cognito', {
    method: 'POST',
    body: {
      idToken,
      ...(name ? { name } : {}),
      ...(role ? { role } : {}),
      ...(portal ? { portal } : {}),
    },
    auth: false,
  })

  const isOwnerAccount = data.role === 'PG_OWNER'
  const isApprovedOwner = data.ownerApprovalStatus === 'APPROVED'
  if (isOwnerAccount && !isApprovedOwner && !data.accessToken && !data.token) {
    clearSession()
    return {
      pendingOwnerApproval: true,
      name: data.name,
      phone: data.phone || '',
      role: mapBackendRole(data.role),
      backendRole: data.role,
      ownerApprovalStatus: data.ownerApprovalStatus || 'PENDING',
    }
  }

  const session = {
    ...buildSession(data),
    authProvider: 'phone',
  }
  saveSession(session)
  return session
}

export async function fetchCognitoConfigApi() {
  return apiRequest('/api/auth/cognito/config', { auth: false })
}

export async function sendLoginOtpApi(phone) {
  try {
    return await apiRequest('/api/auth/otp/send', {
      method: 'POST',
      body: { phone },
      auth: false,
    })
  } catch (err) {
    if (shouldUseDemoFallback(err, phone)) {
      return demoSendOtp(phone)
    }
    throw err
  }
}

export async function verifyLoginOtpApi(phone, otp, portal = 'user') {
  try {
    const data = await apiRequest('/api/auth/otp/verify', {
      method: 'POST',
      body: { phone, otp, portal },
      auth: false,
    })
    const session = buildSession(data, phone)
    saveSession(session)
    return session
  } catch (err) {
    // Only fall back to browser-only demo when the API is unreachable / broken —
    // never just because the OTP equals 123456 (that is also the real AWS/local OTP).
    if (shouldUseDemoFallback(err, phone)) {
      return demoVerifyOtp(phone, otp, portal)
    }
    throw err
  }
}

export async function loginPrivilegedApi(email, password) {
  const data = await apiRequest('/api/auth/login/privileged', {
    method: 'POST',
    body: { email, password },
    auth: false,
  })

  const session = buildSession(data)
  saveSession(session)
  return session
}

export async function registerApi(payload) {
  clearSession()

  try {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: {
        name: payload.name,
        password: payload.password,
        phone: payload.phone,
        role: payload.role === 'owner' ? 'PG_OWNER' : 'USER',
        pgName: payload.pgName,
        address: payload.address,
      },
      auth: false,
    })
    return finishRegister(data, payload)
  } catch (err) {
    if (shouldUseDemoFallback(err, payload.phone)) {
      return demoRegister(payload)
    }
    throw err
  }
}

function finishRegister(data, payload) {
  const isOwnerSignup = payload.role === 'owner'
  const isOwnerAccount = isOwnerSignup || data.role === 'PG_OWNER'
  const isApprovedOwner = data.ownerApprovalStatus === 'APPROVED'

  if (isOwnerAccount && !isApprovedOwner) {
    clearSession()
    return {
      pendingOwnerApproval: true,
      name: data.name,
      phone: payload.phone,
      role: mapBackendRole(data.role),
      backendRole: data.role,
      ownerApprovalStatus: data.ownerApprovalStatus || 'PENDING',
    }
  }

  const session = buildSession(data, payload.phone)
  saveSession(session)
  return session
}
