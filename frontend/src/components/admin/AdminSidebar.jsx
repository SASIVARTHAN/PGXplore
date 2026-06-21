import { NavLink, Link } from 'react-router-dom'
import { FiBookmark, FiChevronLeft, FiChevronRight, FiExternalLink, FiGrid, FiHome, FiInbox, FiStar, FiTrendingUp, FiUsers } from 'react-icons/fi'
import { MdKingBed } from 'react-icons/md'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { isBackendPgOwner } from '../../utils/pgPermissions'

export default function AdminSidebar({ open, onClose, collapsed, onToggleSidebar }) {
  const { canManageUsers, session } = useAuth()
  const { stats } = useAdmin()
  const isOwner = isBackendPgOwner(session)
  const pendingRequests = stats.pendingDeletionRequests || 0

  const links = [
    { to: '/admin', end: true, label: 'Dashboard', icon: <FiGrid aria-hidden /> },
    isOwner
      ? { to: '/admin/pgs', label: 'All PGs', icon: <FiHome aria-hidden /> }
      : { to: '/admin/pgs', label: 'PG Management', icon: <FiHome aria-hidden /> },
    isOwner && { to: '/admin/my-pgs', label: 'My PGs', icon: <FiBookmark aria-hidden /> },
    { to: '/admin/rooms', label: 'Room Management', icon: <MdKingBed aria-hidden /> },
    {
      to: '/admin/requests',
      label: 'Requests',
      icon: <FiInbox aria-hidden />,
      badge: pendingRequests || null,
    },
    canManageUsers && { to: '/admin/users', label: 'Users', icon: <FiUsers aria-hidden /> },
    { to: '/admin/reviews', label: 'Reviews', icon: <FiStar aria-hidden /> },
    { to: '/admin/analytics', label: 'Analytics', icon: <FiTrendingUp aria-hidden /> },
  ].filter(Boolean)

  const sidebarClass = [
    'admin-sidebar',
    open ? 'admin-sidebar--open' : '',
    collapsed ? 'admin-sidebar--collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

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
      <aside className={sidebarClass}>
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-full text-lg font-bold tracking-tight text-brand">PGXplore</span>
          <span className="admin-sidebar__brand-mark text-base font-bold tracking-tight text-brand" aria-hidden>
            PX
          </span>
        </div>

        <button
          type="button"
          className="admin-sidebar__toggle hidden lg:flex"
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? <FiChevronRight aria-hidden /> : <FiChevronLeft aria-hidden />}
        </button>

        <Link
          to="/home"
          className="admin-sidebar__link mx-3 mb-2 border border-app bg-card-muted/50"
          onClick={onClose}
          title="Home"
        >
          <FiExternalLink aria-hidden />
          <span className="admin-sidebar__link-label flex-1">Home</span>
        </Link>

        <nav className="admin-sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              title={link.label}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              <span className="relative shrink-0" aria-hidden>
                {link.icon}
                {link.badge && collapsed ? (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-rose-500" />
                ) : null}
              </span>
              <span className="admin-sidebar__link-label flex-1">{link.label}</span>
              {link.badge && !collapsed ? (
                <span className="admin-sidebar__badge ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
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
