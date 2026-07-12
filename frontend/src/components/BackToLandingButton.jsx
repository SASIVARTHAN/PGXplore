import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import {
  isMobileView,
  rearmMobileBackTrap,
  useMobileBackNavigation,
} from '../hooks/useMobileBackNavigation'
import LogoutConfirmModal from './LogoutConfirmModal'
import { logoutToLanding } from '../utils/navigation'

/**
 * "Back" control.
 * - `to`: navigate directly to this path (e.g. "/" from admin-login).
 * - Default: returns to the previous page (navigate -1), or fallback.
 * - confirmWhenLoggedIn: when authenticated, asks to log out or stay
 *   instead of going back into the browsing history.
 * - On mobile the button is hidden; use swipe-back or the phone back button.
 */
export default function BackToLandingButton({
  label = 'Back',
  fallback = '/',
  to,
  className = '',
  confirmWhenLoggedIn = false,
  onBack,
  'aria-label': ariaLabel,
}) {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const goBack = useCallback(() => {
    if (to) {
      navigate(to)
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }, [fallback, navigate, to])

  const handleBack = useCallback(
    (meta = {}) => {
      if (onBack) {
        onBack(meta)
        return
      }
      if (confirmWhenLoggedIn && isAuthenticated) {
        setConfirmOpen(true)
        queueMicrotask(() => rearmMobileBackTrap())
        return
      }
      const fromPopState = Boolean(meta.fromPopState)
      const target = to || fallback
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
      goBack()
    },
    [confirmWhenLoggedIn, fallback, goBack, isAuthenticated, navigate, onBack, to],
  )

  // When parent passes onBack (login), parent owns the hook. Otherwise trap
  // only when not going straight to landing via history.
  useMobileBackNavigation(handleBack, {
    enabled: !onBack,
    trap: confirmWhenLoggedIn && isAuthenticated,
  })

  const handleLogout = () => {
    setConfirmOpen(false)
    logoutToLanding(logout)
  }

  const handleStay = () => {
    setConfirmOpen(false)
    queueMicrotask(() => rearmMobileBackTrap())
  }

  return (
    <>
      <button
        type="button"
        onClick={handleBack}
        aria-label={ariaLabel ?? (label || 'Back')}
        className={`hidden items-center gap-1 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300 md:inline-flex ${className}`}
      >
        <FiArrowLeft aria-hidden /> {label}
      </button>

      <LogoutConfirmModal
        open={confirmOpen}
        onStay={handleStay}
        onLogout={handleLogout}
        title="Leave dashboard?"
        message="Do you want to log out and return to the landing page, or stay signed in?"
      />
    </>
  )
}
