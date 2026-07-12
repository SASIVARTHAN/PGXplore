import { ROLES, saveSession } from '../utils/auth'

export const DEMO_OTP = '123456'
const DEMO_USERS_KEY = 'pgxplore_demo_phone_users'

/** Built-in demo accounts (matches backend seed data). */
const BUILTIN_DEMO_USERS = {
  9876543213: {
    id: 'demo-user-4',
    name: 'Ananya Reddy',
    email: 'ananya@example.com',
    backendRole: 'USER',
    role: ROLES.NORMAL,
    ownerApprovalStatus: null,
  },
  9876543211: {
    id: 'demo-owner-2',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    backendRole: 'PG_OWNER',
    role: ROLES.PG_OWNER,
    ownerApprovalStatus: 'APPROVED',
  },
  9876543212: {
    id: 'demo-owner-3',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    backendRole: 'PG_OWNER',
    role: ROLES.PG_OWNER,
    ownerApprovalStatus: 'APPROVED',
  },
}

export function isDemoAuthEnabled() {
  return import.meta.env.VITE_DEMO_AUTH === 'true'
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '').slice(0, 10)
}

function loadRegisteredDemoUsers() {
  try {
    const raw = localStorage.getItem(DEMO_USERS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveRegisteredDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
}

export function findDemoUserByPhone(phone) {
  const normalized = normalizePhone(phone)
  if (!normalized) return null
  return BUILTIN_DEMO_USERS[normalized] || loadRegisteredDemoUsers()[normalized] || null
}

export function isBuiltinDemoPhone(phone) {
  const normalized = normalizePhone(phone)
  return Boolean(BUILTIN_DEMO_USERS[normalized])
}

export function canUseDemoPhoneFallback(phone) {
  return isDemoAuthEnabled() || Boolean(findDemoUserByPhone(phone))
}

function buildDemoSession(user, phone) {
  const normalized = normalizePhone(phone)
  return {
    id: String(user.id),
    name: user.name,
    email: user.email || `${normalized}@phone.pgxplore.local`,
    role: user.role,
    backendRole: user.backendRole,
    accessToken: `demo-token-${user.id}`,
    refreshToken: null,
    phone: normalized,
    ownerApprovalStatus: user.ownerApprovalStatus ?? null,
    isDemo: true,
  }
}

export function demoSendOtp(phone) {
  const normalized = normalizePhone(phone)
  if (normalized.length !== 10) {
    throw new Error('Enter a valid 10-digit phone number.')
  }
  if (!canUseDemoPhoneFallback(normalized)) {
    throw new Error('No account found for this phone number')
  }
  return {
    demoOtp: DEMO_OTP,
    message: 'Demo mode — enter the OTP shown below.',
  }
}

export function demoVerifyOtp(phone, otp, portal = 'user') {
  const normalized = normalizePhone(phone)
  const code = String(otp || '').trim()

  if (code !== DEMO_OTP) {
    throw new Error(`Invalid OTP. Demo OTP is ${DEMO_OTP}.`)
  }

  const user = findDemoUserByPhone(normalized)
  if (!user) {
    throw new Error('No demo account for this phone. Register first or use 9876543213 (user) / 9876543211 (owner).')
  }

  const ownerPortal = portal === 'owner'
  if (ownerPortal) {
    if (user.backendRole !== 'PG_OWNER') {
      throw new Error('This phone number is not registered as a PG Owner account.')
    }
    if (user.ownerApprovalStatus === 'REJECTED') {
      throw new Error('Your account registration has been rejected. Please contact support for further assistance.')
    }
    if (user.ownerApprovalStatus === 'PENDING') {
      throw new Error(
        'Your account is currently awaiting approval from a Privileged Administrator. Please wait until your account has been reviewed and approved.',
      )
    }
  } else {
    if (user.backendRole === 'PG_OWNER') {
      throw new Error('PG Owner accounts must sign in from the PG Owner login option.')
    }
    if (user.backendRole !== 'USER') {
      throw new Error("User doesn't exist")
    }
  }

  const session = buildDemoSession(user, normalized)
  saveSession(session)
  return session
}

export function demoRegister(payload) {
  const normalized = normalizePhone(payload.phone)
  if (normalized.length !== 10) {
    throw new Error('Phone must be exactly 10 digits.')
  }

  const existing = findDemoUserByPhone(normalized)
  if (existing) {
    throw new Error('Phone number already registered')
  }

  const isOwner = payload.role === 'owner'
  const id = `demo-reg-${normalized}`
  const user = {
    id,
    name: payload.name?.trim() || 'Demo User',
    email: `${normalized}@phone.pgxplore.local`,
    backendRole: isOwner ? 'PG_OWNER' : 'USER',
    role: isOwner ? ROLES.PG_OWNER : ROLES.NORMAL,
    ownerApprovalStatus: isOwner ? 'PENDING' : null,
  }

  const registered = loadRegisteredDemoUsers()
  registered[normalized] = user
  saveRegisteredDemoUsers(registered)

  if (isOwner) {
    return {
      pendingOwnerApproval: true,
      name: user.name,
      phone: normalized,
      role: user.role,
      backendRole: user.backendRole,
      ownerApprovalStatus: 'PENDING',
    }
  }

  const session = buildDemoSession(user, normalized)
  saveSession(session)
  return session
}

export const DEMO_AUTH_HINT = `Demo OTP: ${DEMO_OTP}`

export const DEMO_TEST_PHONES = [
  { phone: '9876543213', label: 'User' },
  { phone: '9876543211', label: 'PG Owner' },
]
