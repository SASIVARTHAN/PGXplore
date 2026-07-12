import { useCallback, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import BackToLandingButton from '../components/BackToLandingButton'
import AuthPageLayout from '../components/AuthPageLayout'
import CognitoPhoneAuth from '../components/CognitoPhoneAuth'
import { useAuth } from '../contexts/AuthContext'
import { usePageRefresh } from '../contexts/RefreshContext'
import { useToast } from '../components/Toast'
import { OWNER_REGISTRATION_SUCCESS_MESSAGE, resolveOwnerApprovalBlock } from '../utils/auth'
import { resolvePostAuthPath } from '../utils/navigation'

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

function normalizePhone(value) {
  return value.replace(/\D/g, '').slice(0, 10)
}

export default function UserRegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isAccountUser, loginWithCognito, bootstrapping } = useAuth()
  const { showToast } = useToast()
  const returnTo = resolvePostAuthPath(location.state?.from, '/home')

  const [form, setForm] = useState({
    accountType: 'user',
    name: '',
    phone: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [ownerPendingMessage, setOwnerPendingMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const resetRegisterForm = useCallback(() => {
    setForm({
      accountType: 'user',
      name: '',
      phone: '',
    })
    setFieldErrors({})
    setError('')
    setOwnerPendingMessage('')
    setSubmitting(false)
  }, [])

  usePageRefresh(resetRegisterForm)

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
    if (ownerPendingMessage) setOwnerPendingMessage('')
  }

  const validateBasics = () => {
    const errors = {}
    if (!form.name.trim()) {
      errors.name = 'Full name is required.'
    }
    const phone = normalizePhone(form.phone)
    if (!phone) {
      errors.phone = 'Phone number is required.'
    } else if (phone.length !== 10) {
      errors.phone = 'Phone must be exactly 10 digits.'
    }
    return errors
  }

  const handleCognitoSuccess = async (credentials) => {
    const errors = validateBasics()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)
    setError('')
    setOwnerPendingMessage('')
    const result = await loginWithCognito(credentials)
    setSubmitting(false)

    if (!result.ok) {
      const message = result.error || 'Registration failed.'
      const approvalBlock = resolveOwnerApprovalBlock(message)
      if (approvalBlock) {
        setOwnerPendingMessage(approvalBlock.message)
        return
      }
      setError(message)
      return
    }

    if (result.pendingOwnerApproval) {
      setOwnerPendingMessage(OWNER_REGISTRATION_SUCCESS_MESSAGE)
      return
    }

    const name = result.session?.name?.trim() || 'there'
    showToast(`Welcome, ${name}! Your account is ready.`, 'success', 5000)
    navigate(returnTo, { replace: true })
  }

  const selectedAccountType = ACCOUNT_TYPES.find((type) => type.value === form.accountType) || ACCOUNT_TYPES[0]
  const canSendOtp = form.name.trim() && normalizePhone(form.phone).length === 10

  return (
    <AuthPageLayout>
      <div className="auth-page__card w-full max-w-md rounded-2xl border border-app bg-card px-8 pt-8 pb-8 shadow-sm">
        <BackToLandingButton label="Back" />

        <h1 className="mt-4 text-2xl font-bold text-main">Create account</h1>
        <p className="mt-2 text-sm text-muted">{selectedAccountType.description}</p>

        {ownerPendingMessage && (
          <div
            className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/40"
            role="alert"
          >
            <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100">{ownerPendingMessage}</p>
            <Link
              to="/login"
              state={{ accountType: 'owner' }}
              className="mt-4 inline-block text-sm font-medium text-brand-emphasis hover:underline"
            >
              Go to Owner Login
            </Link>
          </div>
        )}

        {!ownerPendingMessage && (
          <>
            <div className="auth-account-toggle mt-6 grid grid-cols-2 gap-2 rounded-xl border border-app bg-card-muted/40 p-1">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => set('accountType', type.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    form.accountType === type.value
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-muted hover:bg-card hover:text-main'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
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
                <span className="font-medium text-main">Mobile number</span>
                <div className="mt-1 flex gap-2">
                  <span className="input-app flex w-16 items-center justify-center text-muted">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => set('phone', normalizePhone(e.target.value))}
                    aria-invalid={Boolean(fieldErrors.phone)}
                    className={`input-app flex-1 ${fieldErrors.phone ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''}`}
                    placeholder="9876543210"
                  />
                </div>
                {fieldErrors.phone && (
                  <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">{fieldErrors.phone}</span>
                )}
              </label>

              {canSendOtp ? (
                <CognitoPhoneAuth
                  mode="register"
                  name={form.name.trim()}
                  phoneDigits={normalizePhone(form.phone)}
                  role={form.accountType === 'owner' ? 'PG_OWNER' : 'USER'}
                  disabled={submitting || bootstrapping}
                  onSuccess={handleCognitoSuccess}
                  onError={setError}
                  submitLabel="Send OTP to register"
                />
              ) : (
                <p className="text-xs text-muted">Enter your name and a 10-digit mobile number to continue.</p>
              )}

              {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
            </div>

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
          </>
        )}
      </div>
    </AuthPageLayout>
  )
}
