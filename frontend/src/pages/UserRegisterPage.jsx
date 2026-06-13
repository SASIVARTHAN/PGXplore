import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import FirebaseGoogleButton from '../components/FirebaseGoogleButton'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

export default function UserRegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isAccountUser, register, loginWithFirebase } = useAuth()
  const returnTo = location.state?.from || '/home'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session && isAccountUser) {
    return <Navigate to={returnTo} replace />
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const phone = form.phone.replace(/\D/g, '')
    if (phone.length !== 10) {
      setError('Phone must be exactly 10 digits.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    const result = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone,
      role: 'user',
    })
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
    <div className="relative flex min-h-screen items-center justify-center bg-app px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-app bg-card p-8 shadow-sm">
        <BackButton fallback="/login" label="Back" />
        <h1 className="mt-4 text-2xl font-bold text-main">Create account</h1>
        <p className="mt-2 text-sm text-muted">
          Register to save PGs per account, sync across devices, and keep your browsing history.
        </p>

        <div className="mt-6 flex justify-center">
          <FirebaseGoogleButton
            disabled={submitting}
            label="Sign up with Google"
            onToken={handleGoogleToken}
            onError={(msg) => setError(msg)}
          />
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-app" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted">or register with email</span>
          <span className="h-px flex-1 bg-app" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-main">Full name</span>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="input-app mt-1 w-full"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Email</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="input-app mt-1 w-full"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Phone (10 digits)</span>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="input-app mt-1 w-full"
              placeholder="9876543210"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="input-app mt-1 w-full"
            />
          </label>
          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" state={{ from: returnTo }} className="font-medium text-brand-emphasis hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
