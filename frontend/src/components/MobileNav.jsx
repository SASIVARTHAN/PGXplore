import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiHome, FiSearch, FiHeart, FiUser } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { redirectToLogin } from '../utils/navigation'

export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAccountUser, isAuthenticated } = useAuth()
  const hideNav =
    location.pathname === '/' ||
    location.pathname === '/admin-login' ||
    location.pathname === '/login' ||
    location.pathname === '/register'

  if (hideNav) return null

  const items = [
    { to: '/home', label: 'Dashboard', icon: <FiHome aria-hidden />, match: (p) => p === '/home', protected: false },
    {
      to: '/listings',
      label: 'Browse',
      icon: <FiSearch aria-hidden />,
      match: (p) => p.startsWith('/listings'),
      protected: true,
    },
    { to: '/saved', label: 'Saved', icon: <FiHeart aria-hidden />, match: (p) => p.startsWith('/saved'), protected: true },
    {
      to: isAccountUser ? '/account' : '/login',
      label: isAccountUser ? 'Account' : 'Sign in',
      icon: <FiUser aria-hidden />,
      match: (p) => p === '/account' || p === '/login',
      protected: false,
    },
  ]

  const handleItem = (item) => {
    if (item.protected && !isAuthenticated) {
      redirectToLogin(navigate, { from: item.to, location })
      return
    }
    navigate(item.to)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-app bg-elevated md:hidden">
      <div className="mx-auto flex max-w-lg justify-around px-1 py-2">
        {items.map((item) => {
          const active = item.match(location.pathname)
          const className = `flex min-w-0 flex-1 flex-col items-center rounded-lg px-2 py-2 text-[10px] sm:text-xs ${
            active ? 'text-brand-emphasis' : 'text-neutral-800 dark:text-stone-400'
          }`

          if (item.protected && !isAuthenticated) {
            return (
              <button key={item.to} type="button" onClick={() => handleItem(item)} className={className}>
                <span className="text-lg">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            )
          }

          return (
            <Link key={item.to} to={item.to} className={className}>
              <span className="text-lg">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
