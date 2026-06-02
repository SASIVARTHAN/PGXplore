import { NavLink } from 'react-router-dom'

const links = [
  { to: '/admin', end: true, label: 'Dashboard', icon: '📊' },
  { to: '/admin/pgs', label: 'PG Management', icon: '🏠' },
  { to: '/admin/rooms', label: 'Room Management', icon: '🛏️' },
  { to: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/notifications', label: 'Notifications', icon: '🔔' },
]

export default function AdminSidebar({ open, onClose }) {
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
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
