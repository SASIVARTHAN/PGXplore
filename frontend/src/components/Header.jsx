import { Link, useLocation } from 'react-router-dom'
import { FiTool } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import BrandLogo from './BrandLogo'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/home', label: 'Dashboard' },
  { to: '/listings', label: 'Browse PGs' },
  { to: '/saved', label: 'Saved PGs' },
]

export default function Header() {
  const location = useLocation()
  const { session, canAccessAdminPanel } = useAuth()
  const hideNav = location.pathname === '/'

  if (hideNav) return null

  const isActive = (path) => {
    if (path === '/home') return location.pathname === '/home'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-app bg-elevated backdrop-blur pointer-events-auto">
      <div className="relative z-50 mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <BrandLogo />
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden items-center gap-4 lg:flex xl:gap-6">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'text-brand-emphasis'
                    : 'text-neutral-800 hover:text-brand-900 dark:text-stone-300 dark:hover:text-brand-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {session && canAccessAdminPanel ? (
              <Link to="/admin" className="header-admin-link">
                <FiTool aria-hidden />
                Admin Panel
              </Link>
            ) : (
              <Link
                to="/"
                className="text-sm font-medium text-neutral-800 transition hover:text-brand-900 dark:text-stone-300 dark:hover:text-brand-400"
              >
                Login
              </Link>
            )}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
