import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import FirebaseGoogleButton from '../components/FirebaseGoogleButton'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <span className="h-px flex-1 bg-app" />
      <span className="text-xs font-medium uppercase tracking-wide text-muted">or</span>
      <span className="h-px flex-1 bg-app" />
    </div>
  )
}

export default function UserLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isAccountUser, login, loginWithFirebase } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const returnTo = location.state?.from || '/home'

  if (session && isAccountUser) {
    return <Navigate to={returnTo} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await login(email, password)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(returnTo, { replace: true })
  }

  const handleGoogleToken = async (idToken) => {
    setSubmitting(true)
    setError('')
    const result = await loginWithFirebase(idToken)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(returnTo, { replace: true })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-app bg-card p-8 shadow-sm">
        <BackButton fallback="/" label="Back" />
        <h1 className="mt-4 text-2xl font-bold text-main">User sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to save PGs, track recently viewed listings, and post reviews — all tied to your account.
        </p>

        <div className="mt-6 flex justify-center">
          <FirebaseGoogleButton
            disabled={submitting}
            onToken={handleGoogleToken}
            onError={(msg) => setError(msg)}
          />
        </div>

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-main">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-app mt-1 w-full"
              autoComplete="email"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-app mt-1 w-full"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in with email'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          New here?{' '}
          <Link to="/register" state={{ from: returnTo }} className="font-medium text-brand-emphasis hover:underline">
            Create an account
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-app bg-card-muted/40 p-4 text-xs text-muted">
          <p className="font-medium text-main">Demo account</p>
          <p className="mt-1">ananya@example.com / Password@123</p>
        </div>
      </div>
    </div>
  )
}
