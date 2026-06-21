import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiLogOut, FiTool, FiUser } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { redirectToLogin } from '../utils/navigation'
import BrandLogo from './BrandLogo'
import LogoutConfirmModal from './LogoutConfirmModal'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/home', label: 'Dashboard', protected: false },
  { to: '/listings', label: 'Browse PGs', protected: true },
  { to: '/saved', label: 'Saved PGs', protected: true },
]

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, isAccountUser, isAuthenticated, canAccessAdminPanel, staffNavLabel, logout } = useAuth()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const hideNav =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/admin-login'

  if (hideNav) return null

  const isActive = (path) => {
    if (path === '/home') return location.pathname === '/home'
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    setLogoutConfirmOpen(false)
    navigate('/')
  }

  const handleNav = (link) => {
    if (link.protected && !isAuthenticated) {
      redirectToLogin(navigate, { from: link.to, location })
      return
    }
    navigate(link.to)
  }

  const linkClass = (path) =>
    `text-sm font-medium transition ${
      isActive(path)
        ? 'text-brand-emphasis'
        : 'text-neutral-800 hover:text-brand-900 dark:text-stone-300 dark:hover:text-brand-400'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-app bg-elevated backdrop-blur pointer-events-auto">
      <div className="relative z-50 mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <BrandLogo />
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
            {links.map((link) =>
              link.protected && !isAuthenticated ? (
                <button
                  key={link.to}
                  type="button"
                  onClick={() => handleNav(link)}
                  className={linkClass(link.to)}
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.to} to={link.to} className={linkClass(link.to)}>
                  {link.label}
                </Link>
              ),
            )}
            {isAccountUser ? (
              <>
                <Link
                  to="/account"
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition ${
                    location.pathname === '/account'
                      ? 'text-brand-emphasis'
                      : 'text-neutral-800 hover:text-brand-900 dark:text-stone-300 dark:hover:text-brand-400'
                  }`}
                >
                  <FiUser aria-hidden />
                  {session.name.split(' ')[0]}
                </Link>
                {canAccessAdminPanel && staffNavLabel && (
                  <Link to="/admin" className="header-admin-link">
                    <FiTool aria-hidden />
                    {staffNavLabel}
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setLogoutConfirmOpen(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-800 transition hover:text-brand-900 dark:text-stone-300 dark:hover:text-brand-400"
                >
                  <FiLogOut aria-hidden />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  state={{ from: location.pathname + location.search, origin: location.state?.origin }}
                  className="text-sm font-medium text-neutral-800 transition hover:text-brand-900 dark:text-stone-300 dark:hover:text-brand-400"
                >
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary px-3 py-1.5 text-sm">
                  Register
                </Link>
              </>
            )}
          </nav>
          <ThemeToggle />
        </div>
      </div>
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onStay={() => setLogoutConfirmOpen(false)}
        onLogout={handleLogout}
        title="Leave dashboard?"
        message="Do you want to log out and return to the landing page, or stay signed in?"
      />
    </header>
  )
}
