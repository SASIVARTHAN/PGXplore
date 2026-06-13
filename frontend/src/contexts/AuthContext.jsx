import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  loginApi,
  loginWithFirebaseApi,
  loginWithGoogleApi,
  loginWithGoogleDevApi,
  registerApi,
} from '../api/auth'
import {
  ROLE_LABELS,
  ROLES,
  authenticate,
  canAccessAdminPanel,
  canApproveDeletion,
  canManageUsers,
  canRequestPGDeletion,
  canReviewRequests,
  clearSession,
  getSession,
  saveSession,
} from '../utils/auth'
import { clearUserDataOnLogout, syncUserDataAfterLogin } from '../utils/userData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession())
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(getSession()?.accessToken))

  useEffect(() => {
    const existing = getSession()
    if (!existing?.accessToken) {
      setBootstrapping(false)
      return
    }
    syncUserDataAfterLogin(existing).then((next) => {
      setSession(next)
      setBootstrapping(false)
    })
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      let next = await loginApi(email, password)
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch (err) {
      const fallback = authenticate(email, password)
      if (fallback) {
        saveSession(fallback)
        setSession(fallback)
        return { ok: true, session: fallback }
      }
      return { ok: false, error: err?.message || 'Invalid email or password.' }
    }
  }, [])

  const register = useCallback(async (payload) => {
    try {
      let next = await registerApi(payload)
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch (err) {
      return { ok: false, error: err?.message || 'Registration failed.' }
    }
  }, [])

  const loginWithGoogle = useCallback(async (idToken) => {
    try {
      let next = await loginWithGoogleApi(idToken)
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch (err) {
      return { ok: false, error: err?.message || 'Google sign-in failed.' }
    }
  }, [])

  const loginWithGoogleDev = useCallback(async (payload) => {
    try {
      let next = await loginWithGoogleDevApi(payload)
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch (err) {
      return { ok: false, error: err?.message || 'Google sign-in failed.' }
    }
  }, [])

  const loginWithFirebase = useCallback(async (idToken) => {
    try {
      let next = await loginWithFirebaseApi(idToken)
      next = await syncUserDataAfterLogin(next)
      setSession(next)
      return { ok: true, session: next }
    } catch (err) {
      return { ok: false, error: err?.message || 'Google sign-in failed.' }
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
      roleLabel: role ? ROLE_LABELS[role] : null,
      isAuthenticated: Boolean(session),
      isAccountUser: Boolean(session?.accessToken),
      isNormalUser: role === ROLES.NORMAL,
      bootstrapping,
      canAccessAdminPanel: canAccessAdminPanel(role),
      canReviewRequests: canReviewRequests(role),
      canApproveDeletion: canApproveDeletion(role),
      canManageUsers: canManageUsers(role),
      canRequestPGDeletion: canRequestPGDeletion(role),
      login,
      register,
      loginWithGoogle,
      loginWithGoogleDev,
      loginWithFirebase,
      logout,
    }
  }, [session, bootstrapping, login, register, loginWithGoogle, loginWithGoogleDev, loginWithFirebase, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
