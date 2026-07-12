import { Link } from 'react-router-dom'
import { FiBell, FiMenu } from 'react-icons/fi'
import ThemeToggle from '../ThemeToggle'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminTopbar({ title, onMenuClick, session, roleLabel, onLogout }) {
  const { state } = useAdmin()
  const unread = state.notifications.filter((n) => !n.read).length

  return (
    <header className="admin-topbar">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" className="admin-menu-btn lg:hidden" onClick={onMenuClick} aria-label="Menu">
          <FiMenu aria-hidden className="text-xl" />
        </button>
        <h1 className="truncate text-lg font-bold text-main md:text-xl">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden max-w-[12rem] truncate text-sm text-muted md:inline lg:max-w-none">
          Signed in as {session?.name} · {roleLabel}
        </span>
        <Link to="/admin/notifications" aria-label="Notifications" className="relative rounded-lg p-2 hover:bg-card-muted">
          <FiBell aria-hidden className="text-xl" />
          {unread > 0 && (
            <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Link>
        <ThemeToggle />
        <button type="button" onClick={onLogout} className="btn-secondary text-sm">
          Logout
        </button>
      </div>
    </header>
  )
}
