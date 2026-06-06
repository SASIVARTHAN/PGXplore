import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, canAccessAdminPanel, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (session) {
    return <Navigate to={canAccessAdminPanel ? '/admin' : '/home'} replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const role = result.session.role
    if (role === 'admin' || role === 'privileged') {
      const target = location.state?.from?.startsWith('/admin') ? location.state.from : '/admin'
      navigate(target, { replace: true })
    } else {
      navigate('/home', { replace: true })
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-app bg-card p-8 shadow-sm">
        <BackButton fallback="/" label="Back" />
        <h1 className="mt-4 text-2xl font-bold text-main">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Admins manage PGs and users. Privileged users review PG deletion requests.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-main">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-app mt-1 w-full"
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
            />
          </label>
          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>

        <div className="mt-6 rounded-xl border border-app bg-card-muted/40 p-4 text-xs text-muted">
          <p className="font-medium text-main">Demo accounts</p>
          <ul className="mt-2 space-y-1">
            <li>Admin — admin@pgxplore.com / admin123</li>
            <li>Privileged — arjun@pgxplore.com / priv123</li>
            <li>Normal — user@pgxplore.com / user123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
