import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import LogoutConfirmModal from './LogoutConfirmModal'

/**
 * "Back" control.
 * - `to`: navigate directly to this path (e.g. "/" from admin-login).
 * - Default: returns to the previous page (navigate -1), or fallback.
 * - confirmWhenLoggedIn: when authenticated, asks to log out or stay
 *   instead of going back into the browsing history.
 */
export default function BackToLandingButton({
  label = 'Back',
  fallback = '/',
  to,
  className = '',
  confirmWhenLoggedIn = false,
}) {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const goBack = () => {
    if (to) {
      navigate(to)
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallback)
    }
  }

  const handleBack = () => {
    if (confirmWhenLoggedIn && isAuthenticated) {
      setConfirmOpen(true)
      return
    }
    goBack()
  }

  const handleLogout = () => {
    logout()
    setConfirmOpen(false)
    navigate('/')
  }

  return (
    <>
      <button
        type="button"
        onClick={handleBack}
        className={`inline-flex items-center gap-1 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300 ${className}`}
      >
        <FiArrowLeft aria-hidden /> {label}
      </button>

      <LogoutConfirmModal
        open={confirmOpen}
        onStay={() => setConfirmOpen(false)}
        onLogout={handleLogout}
        title="Leave dashboard?"
        message="Do you want to log out and return to the landing page, or stay signed in?"
      />
    </>
  )
}
