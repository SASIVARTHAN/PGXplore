export const ROLES = {
  NORMAL: 'normal',
  PRIVILEGED: 'privileged',
  ADMIN: 'admin',
  PG_OWNER: 'pg_owner',
}

export const ROLE_LABELS = {
  [ROLES.NORMAL]: 'Normal User',
  [ROLES.PRIVILEGED]: 'Privileged User',
  [ROLES.ADMIN]: 'Privileged Account',
  [ROLES.PG_OWNER]: 'PG Owner',
}

export const BACKEND_ROLE_LABELS = {
  ADMIN: 'Privileged Account',
  PG_OWNER: 'PG Owner',
  USER: 'User',
}

/** User-facing label for a frontend or backend role value. */
export function formatRoleLabel(role) {
  if (!role) return 'User'
  const normalized = String(role)
  if (ROLE_LABELS[normalized]) return ROLE_LABELS[normalized]
  if (BACKEND_ROLE_LABELS[normalized]) return BACKEND_ROLE_LABELS[normalized]
  if (BACKEND_ROLE_LABELS[normalized.toUpperCase()]) return BACKEND_ROLE_LABELS[normalized.toUpperCase()]
  return normalized
}

export const SESSION_KEY = 'pgxplore_session'

/**
 * Demo accounts: 1 admin (full management), 4 protected privileged users
 * (review/approve deletion requests, cannot be removed by normal users),
 * and 1 normal user (standard access only).
 */
export const AUTH_ACCOUNTS = [
  { id: 'admin-1', name: 'Site Privileged Account', email: 'admin@pgxplore.com', password: 'admin123', role: ROLES.ADMIN, phone: '+91 90000 00001' },
  { id: 'priv-1', name: 'Arjun Prakash', email: 'arjun@pgxplore.com', password: 'priv123', role: ROLES.PRIVILEGED, phone: '+91 90000 00011' },
  { id: 'priv-2', name: 'Divya Nair', email: 'divya@pgxplore.com', password: 'priv123', role: ROLES.PRIVILEGED, phone: '+91 90000 00012' },
  { id: 'priv-3', name: 'Karthik Sundar', email: 'karthik@pgxplore.com', password: 'priv123', role: ROLES.PRIVILEGED, phone: '+91 90000 00013' },
  { id: 'priv-4', name: 'Meena Lakshmi', email: 'meena@pgxplore.com', password: 'priv123', role: ROLES.PRIVILEGED, phone: '+91 90000 00014' },
  { id: 'norm-1', name: 'Demo User', email: 'user@pgxplore.com', password: 'user123', role: ROLES.NORMAL, phone: '+91 90000 00021' },
]

/** Staff (admin + privileged) accounts surfaced in admin User Management. */
export function staffAccounts() {
  return AUTH_ACCOUNTS.filter((a) => a.role !== ROLES.NORMAL).map(({ password, ...rest }) => ({
    ...rest,
    status: 'active',
    protected: true,
    joinedAt: '2026-01-01T10:00:00.000Z',
  }))
}

export function isPrivileged(role) {
  return role === ROLES.PRIVILEGED
}

export function isAdmin(role) {
  return role === ROLES.ADMIN
}

export function canAccessAdminPanel(role) {
  return role === ROLES.ADMIN || role === ROLES.PRIVILEGED || role === ROLES.PG_OWNER
}

export function canReviewRequests(role) {
  return role === ROLES.ADMIN || role === ROLES.PRIVILEGED || role === ROLES.PG_OWNER
}

/** Admin and privileged accounts may approve (accept) a PG deletion request. */
export function canApproveDeletion(role) {
  return role === ROLES.ADMIN || role === ROLES.PRIVILEGED
}

export function canManageUsers(role) {
  return role === ROLES.ADMIN
}

export function canRequestPGDeletion(role) {
  return role === ROLES.ADMIN || role === ROLES.PRIVILEGED || role === ROLES.PG_OWNER
}

/** Staff-area navigation label shown in the main site header. */
export function getStaffNavLabel(role, backendRole) {
  const resolved = backendRole || role
  if (role === ROLES.ADMIN || resolved === 'ADMIN') return 'Privileged Accounts Panel'
  if (role === ROLES.PG_OWNER || resolved === 'PG_OWNER') return 'Owner Dashboard'
  if (role === ROLES.PRIVILEGED || resolved === 'PRIVILEGED') return 'Review Dashboard'
  return null
}

/** Sidebar / panel title for the staff workspace. */
export function getStaffPanelTitle(role, backendRole) {
  const resolved = backendRole || role
  if (role === ROLES.ADMIN || resolved === 'ADMIN') return 'Privileged Accounts Panel'
  if (role === ROLES.PG_OWNER || resolved === 'PG_OWNER') return 'Owner Dashboard'
  if (role === ROLES.PRIVILEGED || resolved === 'PRIVILEGED') return 'Review Dashboard'
  return 'Staff Panel'
}

/**
 * Whether an actor with `actorRole` may modify/remove a target account.
 * Protected (privileged/admin) accounts can never be modified by a normal user.
 */
export function canModifyAccount(actorRole, target) {
  const targetIsProtected = target?.protected || target?.role === ROLES.PRIVILEGED || target?.role === ROLES.ADMIN
  if (targetIsProtected) {
    return actorRole === ROLES.ADMIN || actorRole === ROLES.PRIVILEGED
  }
  return actorRole === ROLES.ADMIN || actorRole === ROLES.PRIVILEGED
}

function readRaw() {
  return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
}

export function getSession() {
  try {
    const raw = readRaw()
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.role || !parsed?.email) return null
    return parsed
  } catch {
    return null
  }
}

export function authenticate(email, password) {
  const account = AUTH_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === String(email).trim().toLowerCase() && a.password === password,
  )
  if (!account) return null
  const { password: _pw, ...session } = account
  return session
}

export function saveSession(session) {
  const payload = JSON.stringify(session)
  localStorage.setItem(SESSION_KEY, payload)
  sessionStorage.setItem(SESSION_KEY, payload)
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('pgxplore_admin')
  sessionStorage.removeItem('pgxplore_admin')
}
