import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  ROLE_LABELS,
  authenticate,
  canAccessAdminPanel,
  canManageUsers,
  canRequestPGDeletion,
  canReviewRequests,
  clearSession,
  getSession,
  saveSession,
} from '../utils/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession())

  const login = useCallback((email, password) => {
    const next = authenticate(email, password)
    if (!next) return { ok: false, error: 'Invalid email or password.' }
    saveSession(next)
    setSession(next)
    return { ok: true, session: next }
  }, [])

  const logout = useCallback(() => {
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
      canAccessAdminPanel: canAccessAdminPanel(role),
      canReviewRequests: canReviewRequests(role),
      canManageUsers: canManageUsers(role),
      canRequestPGDeletion: canRequestPGDeletion(role),
      login,
      logout,
    }
  }, [session, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
