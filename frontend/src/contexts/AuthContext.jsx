import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  loginPrivilegedApi,
  loginWithCognitoApi,
  registerApi,
  sendLoginOtpApi,
  verifyLoginOtpApi,
} from '../api/auth'
import {
  formatRoleLabel,
  ROLES,
  canAccessAdminPanel,
  canApproveDeletion,
  canManageUsers,
  canRequestPGDeletion,
  canReviewRequests,
  clearSession,
  getSession,
  getStaffNavLabel,
  getStaffPanelTitle,
  isUserPortalBackendRole,
} from '../utils/auth'
import { clearUserDataOnLogout, syncUserDataAfterLogin } from '../utils/userData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession())
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(getSession()?.accessToken))

  const refreshSession = useCallback(async () => {
    const existing = getSession()
    if (!existing?.accessToken) {
      setSession(existing)
      return existing
    }

    try {
      const next = await syncUserDataAfterLogin(existing)
      const current = getSession()
      if (!current?.accessToken) {
        setSession(null)
        return null
      }
      setSession(next)
      return next
    } catch {
      clearSession()
      setSession(null)
      return null
    }
  }, [])

  useEffect(() => {
    const existing = getSession()
    if (!existing?.accessToken) {
      setBootstrapping(false)
      return
    }
    if (existing.isDemo || String(existing.accessToken).startsWith('demo-token-')) {
      setBootstrapping(false)
      return
    }
    const bootstrapToken = existing.accessToken
    refreshSession()
      .then((next) => {
        const current = getSession()
        if (!current?.accessToken || current.accessToken !== bootstrapToken) {
          setBootstrapping(false)
          return
        }
        if (next) setSession(next)
        setBootstrapping(false)
      })
      .catch(() => {
        clearSession()
        setSession(null)
        setBootstrapping(false)
      })
  }, [refreshSession])

  const sendLoginOtp = useCallback(async (phone) => {
    try {
      const data = await sendLoginOtpApi(phone)
      return { ok: true, demoOtp: data.demoOtp }
    } catch (err) {
      return { ok: false, error: err?.message || 'Could not send OTP.' }
    }
  }, [])

  const loginWithOtp = useCallback(async (phone, otp, { ownerPortal = false } = {}) => {
    try {
      let next = await verifyLoginOtpApi(phone, otp, ownerPortal ? 'owner' : 'user')
      if (!ownerPortal && !isUserPortalBackendRole(next.backendRole)) {
        clearSession()
        return { ok: false, error: "User doesn't exist" }
      }
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch (err) {
      return { ok: false, error: err?.message || 'Invalid OTP.' }
    }
  }, [])

  const loginWithCognito = useCallback(async (credentials, { ownerPortal = false } = {}) => {
    try {
      let next = await loginWithCognitoApi({
        ...credentials,
        portal: ownerPortal ? 'owner' : credentials.portal || 'user',
      })
      if (next?.pendingOwnerApproval) {
        clearSession()
        setSession(null)
        return { ok: true, pendingOwnerApproval: true, session: next }
      }
      if (!ownerPortal && !isUserPortalBackendRole(next.backendRole)) {
        clearSession()
        return { ok: false, error: "User doesn't exist" }
      }
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch (err) {
      return { ok: false, error: err?.message || 'Phone sign-in failed.' }
    }
  }, [])

  const loginPrivilegedPortal = useCallback(async (email, password) => {
    const denyPortal = () => ({ ok: false, portalRestriction: true })

    try {
      let next = await loginPrivilegedApi(email, password)
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch {
      clearSession()
      setSession(null)
      return denyPortal()
    }
  }, [])

  const register = useCallback(async (payload) => {
    try {
      const result = await registerApi(payload)
      if (result?.pendingOwnerApproval) {
        clearSession()
        setSession(null)
        return { ok: true, pendingOwnerApproval: true, session: result }
      }
      let next = result
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch (err) {
      const body = err?.body
      const fieldErrors =
        body?.errors && typeof body.errors === 'object' ? { ...body.errors } : {}

      if (Object.keys(fieldErrors).length === 0 && typeof err?.message === 'string') {
        const lower = err.message.toLowerCase()
        if (lower.includes('phone')) fieldErrors.phone = err.message
      }

      return {
        ok: false,
        error: err?.message || 'Registration failed.',
        fieldErrors,
        status: err?.status ?? null,
      }
    }
  }, [])

  const logout = useCallback(() => {
    clearUserDataOnLogout()
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(() => {
    const role = session?.role ?? null
    return {
      session,
      role,
      roleLabel: role ? formatRoleLabel(session?.backendRole || role) : null,
      isAuthenticated: Boolean(session),
      isAccountUser: Boolean(session?.accessToken),
      isNormalUser: role === ROLES.NORMAL,
      bootstrapping,
      canAccessAdminPanel: canAccessAdminPanel(role),
      canReviewRequests: canReviewRequests(role),
      canApproveDeletion: canApproveDeletion(role),
      canManageUsers: canManageUsers(role),
      canRequestPGDeletion: canRequestPGDeletion(role),
      staffNavLabel: getStaffNavLabel(role, session?.backendRole),
      staffPanelTitle: getStaffPanelTitle(role, session?.backendRole),
      sendLoginOtp,
      loginWithOtp,
      loginWithCognito,
      loginPrivilegedPortal,
      register,
      logout,
      refreshSession,
    }
  }, [
    session,
    bootstrapping,
    sendLoginOtp,
    loginWithOtp,
    loginWithCognito,
    loginPrivilegedPortal,
    register,
    logout,
    refreshSession,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
