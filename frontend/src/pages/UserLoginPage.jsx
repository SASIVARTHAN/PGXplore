import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FiLock } from 'react-icons/fi'
import BackToLandingButton from '../components/BackToLandingButton'
import AuthPageLayout from '../components/AuthPageLayout'
import CognitoPhoneAuth from '../components/CognitoPhoneAuth'
import { useAuth } from '../contexts/AuthContext'
import { usePageRefresh } from '../contexts/RefreshContext'
import { useToast } from '../components/Toast'
import { isMobileView, useMobileBackNavigation } from '../hooks/useMobileBackNavigation'
import { OWNER_REGISTRATION_SUCCESS_MESSAGE, resolveOwnerApprovalBlock } from '../utils/auth'
import {
  clearAuthBackTarget,
  getAuthBackTarget,
  resolvePostAuthPath,
  syncAuthBackTarget,
} from '../utils/navigation'

export default function UserLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, isAccountUser, loginWithCognito, bootstrapping } = useAuth()
  const { showToast } = useToast()
  const [error, setError] = useState('')
  const [ownerBlock, setOwnerBlock] = useState(null)
  const [ownerPendingMessage, setOwnerPendingMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Back uses state.from (often "/"); post-login must not — landing → /home.
  const returnTo = resolvePostAuthPath(location.state?.from, '/home')
  const isOwnerPortal = location.state?.accountType === 'owner'

  // Survives Terms → back (replace clears location.state).
  useEffect(() => {
    syncAuthBackTarget(location.state)
  }, [location.state])

  const resetLoginForm = useCallback(() => {
    setError('')
    setOwnerBlock(null)
    setOwnerPendingMessage('')
    setSubmitting(false)
  }, [])

  usePageRefresh(resetLoginForm)

  const handleTopBack = useCallback(
    (meta = {}) => {
      const target = getAuthBackTarget('/')
      clearAuthBackTarget()
      const fromPopState = Boolean(meta.fromPopState)

      // OS back already popped once — never navigate(-1) again (that closed the app).
      if (fromPopState) {
        navigate(target, { replace: true })
        return
      }

      if (isMobileView()) {
        if (target === '/' && window.history.length > 1) {
          navigate(-1)
          return
        }
        navigate(target, { replace: true })
        return
      }
      if (window.history.length > 1) {
        navigate(-1)
        return
      }
      navigate(target)
    },
    [navigate],
  )

  // No history traps on login — keeps stack as landing → login → terms.
  useMobileBackNavigation(handleTopBack, { trap: false })

  if (session && isAccountUser) {
    return <Navigate to={returnTo} replace />
  }

  const handleCognitoSuccess = async (credentials) => {
    setSubmitting(true)
    setError('')
    setOwnerBlock(null)
    setOwnerPendingMessage('')
    const result = await loginWithCognito(credentials, { ownerPortal: isOwnerPortal })
    setSubmitting(false)

    if (!result.ok) {
      const message = result.error || 'Phone sign-in failed.'
      const approvalBlock = resolveOwnerApprovalBlock(message)
      if (approvalBlock) {
        setOwnerBlock(approvalBlock)
        return
      }
      setError(message)
      return
    }

    if (result.pendingOwnerApproval) {
      setOwnerPendingMessage(OWNER_REGISTRATION_SUCCESS_MESSAGE)
      return
    }

    clearAuthBackTarget()
    const name = result.session?.name?.trim() || 'there'
    showToast(`Welcome, ${name}! You're signed in.`, 'success', 5000)
    navigate(isOwnerPortal ? '/admin' : returnTo, { replace: true })
  }

  return (
    <AuthPageLayout
      brandPanel
      stackFooter={
        <p className="entry-panel-note text-center text-muted">
          New here?{' '}
          <Link
            to="/register"
            state={{ from: returnTo, origin: location.state?.origin }}
            className="font-medium text-brand-emphasis hover:underline"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <div className="auth-login-panel">
        <BackToLandingButton label="Back" className="auth-login-back" onBack={handleTopBack} />

        <div className="auth-login-intro entry-option">
          <span className="entry-option__icon bg-brand-100 dark:bg-white/10" aria-hidden>
            <FiLock />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="entry-option__title block text-main">
              {isOwnerPortal ? 'PG Owner Sign In' : 'Sign In'}
            </span>
            <span className="entry-option__subtitle block font-normal text-muted">
              {isOwnerPortal
                ? 'Sign in with your registered mobile number — we will send a one-time SMS code.'
                : 'Sign in with your phone number — we will send you a one-time SMS code.'}
            </span>
          </span>
        </div>

        {ownerPendingMessage && (
          <div
            className="auth-login-alert rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs dark:border-amber-900/50 dark:bg-amber-950/40"
            role="alert"
          >
            <p className="leading-relaxed text-amber-950 dark:text-amber-100">{ownerPendingMessage}</p>
          </div>
        )}

        {ownerBlock && (
          <div
            className={
              ownerBlock.type === 'rejected'
                ? 'auth-login-alert rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs dark:border-rose-900/50 dark:bg-rose-950/40'
                : 'auth-login-alert rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs dark:border-amber-900/50 dark:bg-amber-950/40'
            }
            role="alert"
          >
            <p
              className={
                ownerBlock.type === 'rejected'
                  ? 'leading-relaxed text-rose-950 dark:text-rose-100'
                  : 'leading-relaxed text-amber-950 dark:text-amber-100'
              }
            >
              {ownerBlock.message}
            </p>
          </div>
        )}

        {!ownerPendingMessage && (
          <div className="mt-2">
            <CognitoPhoneAuth
              mode="login"
              disabled={submitting || bootstrapping}
              onSuccess={handleCognitoSuccess}
              onError={(msg) => {
                setError(msg || '')
                if (msg) setOwnerBlock(null)
              }}
              submitLabel="Send OTP"
            />
          </div>
        )}

        {error && <p className="auth-login-error mt-3 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    </AuthPageLayout>
  )
}
