import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ThemeToggle from '../components/ThemeToggle'

const DEMO_ADMIN = { email: 'admin@pgxplore.com', password: 'admin123' }

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      sessionStorage.setItem('pgxplore_admin', 'true')
      navigate('/admin-dashboard')
      return
    }
    setError('Invalid email or password. Use admin@pgxplore.com / admin123 for demo.')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-app px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-app bg-card p-8 shadow-sm">
        <BackButton fallback="/" label="Back" />
        <h1 className="mt-4 text-2xl font-bold text-main">Admin Login</h1>
        <p className="mt-2 text-sm text-muted">Sign in to manage PG listings.</p>

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
      </div>
    </div>
  )
}
