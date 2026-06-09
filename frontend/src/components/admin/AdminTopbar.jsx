import { Link } from 'react-router-dom'
import { FiBell, FiMenu } from 'react-icons/fi'
import ThemeToggle from '../ThemeToggle'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminTopbar({ title, onMenuClick }) {
  const { state } = useAdmin()
  const unread = state.notifications.filter((n) => !n.read).length

  return (
    <header className="admin-topbar">
      <div className="flex items-center gap-3">
        <button type="button" className="admin-menu-btn lg:hidden" onClick={onMenuClick} aria-label="Menu">
          <FiMenu aria-hidden className="text-xl" />
        </button>
        <h1 className="text-lg font-bold text-main md:text-xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/admin/notifications" aria-label="Notifications" className="relative rounded-lg p-2 hover:bg-card-muted">
          <FiBell aria-hidden className="text-xl" />
          {unread > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>
        <Link to="/home" className="hidden text-sm text-brand-emphasis hover:underline sm:inline">
          View site
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
