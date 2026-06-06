import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Guards an admin sub-route. `allow` is a predicate receiving the auth context.
 * Redirects to the admin dashboard if the current role is not permitted.
 */
export default function RequireRole({ allow, children }) {
  const auth = useAuth()
  if (!allow(auth)) {
    return <Navigate to="/admin" replace />
  }
  return children
}
