import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiSearch, FiHeart, FiUser } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { isLegalPage } from '../utils/navigation'

export default function MobileNav() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const hideNav =
    !isAuthenticated ||
    location.pathname === '/' ||
    location.pathname === '/admin-login' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    isLegalPage(location.pathname)

  if (hideNav) return null

  const items = [
    { to: '/home', label: 'Dashboard', icon: <FiHome aria-hidden />, match: (p) => p === '/home' },
    {
      to: '/listings',
      label: 'Browse',
      icon: <FiSearch aria-hidden />,
      match: (p) => p.startsWith('/listings'),
    },
    { to: '/saved', label: 'Saved', icon: <FiHeart aria-hidden />, match: (p) => p.startsWith('/saved') },
    {
      to: '/account',
      label: 'Account',
      icon: <FiUser aria-hidden />,
      match: (p) => p === '/account',
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-app bg-elevated md:hidden">
      <div className="mx-auto flex max-w-lg justify-around px-1 py-2">
        {items.map((item) => {
          const active = item.match(location.pathname)
          return (
            <Link
              key={item.to}
              to={item.to}
              replace
              className={`flex min-w-0 flex-1 flex-col items-center rounded-lg px-2 py-2 text-[10px] sm:text-xs ${
                active ? 'text-brand-emphasis' : 'text-neutral-800 dark:text-stone-400'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
