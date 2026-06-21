import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopbar from '../components/admin/AdminTopbar'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import { useAuth } from '../contexts/AuthContext'
import { isBackendPgOwner } from '../utils/pgPermissions'

const SIDEBAR_COLLAPSED_KEY = 'pgxplore_admin_sidebar_collapsed'

const titles = {
  '/admin': 'Dashboard Overview',
  '/admin/activities': 'Recent Activities',
  '/admin/sharing-overview': 'PG Sharing Overview',
  '/admin/pgs': 'PG Management',
  '/admin/my-pgs': 'My PGs',
  '/admin/pgs/new': 'Add New PG',
  '/admin/rooms': 'Room Management',
  '/admin/requests': 'Deletion Requests',
  '/admin/users': 'User Management',
  '/admin/reviews': 'Reviews & Ratings',
  '/admin/analytics': 'Revenue Analytics',
  '/admin/notifications': 'Notifications',
}

function AdminShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1',
  )
  const { session, roleLabel, canAccessAdminPanel, logout } = useAuth()
  const isOwner = isBackendPgOwner(session)

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? '1' : '0')
  }, [sidebarCollapsed])

  const toggleSidebarCollapse = () => setSidebarCollapsed((value) => !value)

  if (!session || !canAccessAdminPanel) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />
  }

  const title =
    location.pathname.includes('/edit')
      ? 'Edit PG Details'
      : /^\/admin\/pgs\/\d+$/.test(location.pathname)
        ? 'PG Details'
        : location.pathname === '/admin/pgs' && isOwner
          ? 'All PGs'
          : titles[location.pathname] || 'Privileged Accounts'

  const handleLogoutClick = () => setLogoutConfirmOpen(true)

  const handleLogoutConfirm = () => {
    logout()
    setLogoutConfirmOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebarCollapse}
      />
      <div className={`admin-main ${sidebarCollapsed ? 'admin-main--sidebar-collapsed' : ''}`}>
        <AdminTopbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          session={session}
          roleLabel={roleLabel}
          onLogout={handleLogoutClick}
        />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onStay={() => setLogoutConfirmOpen(false)}
        onLogout={handleLogoutConfirm}
        title="Log out?"
        message="Do you want to log out and leave the privileged accounts panel, or stay signed in?"
      />
    </div>
  )
}

export default function AdminLayout() {
  return <AdminShell />
}
