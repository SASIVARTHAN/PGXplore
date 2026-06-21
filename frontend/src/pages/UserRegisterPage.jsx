import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import BackToLandingButton from '../components/BackToLandingButton'
import BrandLogo from '../components/BrandLogo'
import FirebaseGoogleButton from '../components/FirebaseGoogleButton'
import FirebasePhoneButton from '../components/FirebasePhoneButton'
import PasswordInput from '../components/PasswordInput'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

const ACCOUNT_TYPES = [
  {
    value: 'user',
    label: 'User',
    description: 'Browse PGs, save listings, and leave reviews.',
  },
  {
    value: 'owner',
    label: 'PG Owner',
    description: 'Create and manage your PG listings.',
  },
]

export default function UserRegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isAccountUser, register, loginWithFirebase } = useAuth()
  const returnTo = location.state?.from || '/home'

  const [form, setForm] = useState({
    accountType: 'user',
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session && isAccountUser) {
    return <Navigate to={returnTo} replace />
  }

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
    if (error) setError('')
  }

  const validate = ({ name, email, phone, password }) => {
    const errors = {}
    if (!name) {
      errors.name = 'Full name is required.'
    }
    if (!email) {
      errors.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.'
    }
    if (!phone) {
      errors.phone = 'Phone number is required.'
    } else if (phone.length !== 10) {
      errors.phone = 'Phone must be exactly 10 digits.'
    }
    if (!password) {
      errors.password = 'Password is required.'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.'
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const name = form.name.trim()
    const email = form.email.trim()
    const phone = form.phone.replace(/\D/g, '')

    const errors = validate({ name, email, phone, password: form.password })
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setSubmitting(true)
    const result = await register({
      name,
      email,
      password: form.password,
      phone,
      role: form.accountType,
    })
    setSubmitting(false)

    if (!result.ok) {
      if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
        setFieldErrors(result.fieldErrors)
      } else {
        setError(result.error)
      }
      return
    }
    navigate(returnTo, { replace: true })
  }

  const handleGoogleToken = async (idToken) => {
    setSubmitting(true)
    setError('')
    setFieldErrors({})
    const result = await loginWithFirebase(idToken)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(returnTo, { replace: true })
  }

  const selectedAccountType = ACCOUNT_TYPES.find((type) => type.value === form.accountType) || ACCOUNT_TYPES[0]

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app px-4 py-10">
      <div className="absolute left-4 top-4 z-20">
        <BrandLogo />
      </div>
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-app bg-card p-8 shadow-sm">
        <BackToLandingButton label="Back" />
        <h1 className="mt-4 text-2xl font-bold text-main">Create account</h1>
        <p className="mt-2 text-sm text-muted">
          {selectedAccountType.description}
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          <FirebaseGoogleButton
            disabled={submitting}
            label="Sign up with Google"
            onToken={handleGoogleToken}
            onError={(msg) => setError(msg)}
          />
          <FirebasePhoneButton
            disabled={submitting}
            onToken={handleGoogleToken}
            onError={(msg) => setError(msg)}
          />
        </div>

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-app" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted">or register with email</span>
          <span className="h-px flex-1 bg-app" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-main">Account type</span>
            <select
              value={form.accountType}
              onChange={(e) => set('accountType', e.target.value)}
              className="select-app mt-1 w-full"
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Full name</span>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              className={`input-app mt-1 w-full ${fieldErrors.name ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''}`}
            />
            {fieldErrors.name && (
              <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{fieldErrors.name}</span>
            )}
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              className={`input-app mt-1 w-full ${fieldErrors.email ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''}`}
            />
            {fieldErrors.email && (
              <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email}</span>
            )}
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Phone (10 digits)</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
              className={`input-app mt-1 w-full ${fieldErrors.phone ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''}`}
              placeholder="9876543210"
            />
            {fieldErrors.phone && (
              <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{fieldErrors.phone}</span>
            )}
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">Password</span>
            <PasswordInput
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              className={
                fieldErrors.password ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''
              }
            />
            {fieldErrors.password ? (
              <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{fieldErrors.password}</span>
            ) : (
              <span className="mt-1 block text-xs text-muted">Use at least 8 characters.</span>
            )}
          </label>
          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            state={{ from: returnTo, origin: location.state?.origin }}
            className="font-medium text-brand-emphasis hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
