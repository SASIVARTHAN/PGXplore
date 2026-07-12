import { useCallback, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import BackToLandingButton from '../components/BackToLandingButton'
import AuthPageLayout from '../components/AuthPageLayout'
import PasswordInput from '../components/PasswordInput'
import { useAuth } from '../contexts/AuthContext'
import { usePageRefresh } from '../contexts/RefreshContext'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, canAccessAdminPanel, loginPrivilegedPortal } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [portalRestriction, setPortalRestriction] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const resetAdminLoginForm = useCallback(() => {
    setEmail('')
    setPassword('')
    setPortalRestriction(false)
    setSubmitting(false)
  }, [])

  usePageRefresh(resetAdminLoginForm)

  if (session && canAccessAdminPanel) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setPortalRestriction(false)
    const result = await loginPrivilegedPortal(email, password)
    setSubmitting(false)
    if (!result.ok) {
      setPassword('')
      setPortalRestriction(true)
      return
    }
    const target = location.state?.from?.startsWith('/admin') ? location.state.from : '/admin'
    navigate(target, { replace: true })
  }

  return (
    <AuthPageLayout centerOnDesktop>
      <div className="auth-page__card w-full max-w-md rounded-2xl border border-app bg-card p-8 shadow-sm">
        <BackToLandingButton label="Back" to="/" />
        <h1 className="mt-4 text-2xl font-bold text-main">Privileged Account Login</h1>
        <p className="mt-2 text-sm text-muted">
          Privileged accounts manage PGs and users. Reviewers handle PG deletion requests.
        </p>

        {portalRestriction && (
          <div
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/40"
            role="alert"
          >
            <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100">
              This portal is reserved for developers and privileged administrators only. If you are a
              User or PG Owner, please use the standard Sign In page.
            </p>
            <div className="mt-4 flex justify-center">
              <Link to="/login" className="btn-primary text-center text-sm">
                Go to Sign In
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-main">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (portalRestriction) setPortalRestriction(false)
              }}
              className="input-app mt-1 w-full"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Password</span>
            <PasswordInput
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (portalRestriction) setPortalRestriction(false)
              }}
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </AuthPageLayout>
  )
}
