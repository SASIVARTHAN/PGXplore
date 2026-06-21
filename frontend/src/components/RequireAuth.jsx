import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getRememberedNavOrigin, redirectToLogin, rememberNavOrigin } from '../utils/navigation'

/**
 * Redirects unauthenticated users to login before accessing protected routes.
 * Uses imperative navigate (not <Navigate>) so browser history stays predictable.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const redirecting = useRef(false)

  useEffect(() => {
    if (bootstrapping || isAuthenticated) {
      redirecting.current = false
      return
    }
    if (redirecting.current) return

    redirecting.current = true
    const origin = location.state?.origin ?? getRememberedNavOrigin()
    if (origin) rememberNavOrigin(origin)

    redirectToLogin(navigate, {
      from: location.pathname + location.search,
      location,
      replace: true,
    })
  }, [bootstrapping, isAuthenticated, location, navigate])

  if (bootstrapping) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted">
        Redirecting to sign in…
      </div>
    )
  }

  return children
}
