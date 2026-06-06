import { NavLink } from 'react-router-dom'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminSidebar({ open, onClose }) {
  const { canReviewRequests, canManageUsers } = useAuth()
  const { stats } = useAdmin()
  const pendingRequests = stats.pendingDeletionRequests || 0

  const links = [
    { to: '/admin', end: true, label: 'Dashboard', icon: '📊' },
    { to: '/admin/pgs', label: 'PG Management', icon: '🏠' },
    { to: '/admin/rooms', label: 'Room Management', icon: '🛏️' },
    canReviewRequests && {
      to: '/admin/requests',
      label: 'Requests',
      icon: '📨',
      badge: pendingRequests || null,
    },
    canManageUsers && { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
    { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  ].filter(Boolean)

  return (
    <>
      {open && (
        <button
          type="button"
          className="admin-sidebar-backdrop lg:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}
      <aside className={`admin-sidebar ${open ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <span className="text-lg font-bold text-brand">PGXplore</span>
          <span className="text-xs text-muted">Admin Panel</span>
        </div>
        <nav className="admin-sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              <span aria-hidden>{link.icon}</span>
              <span className="flex-1">{link.label}</span>
              {link.badge ? (
                <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                  {link.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
