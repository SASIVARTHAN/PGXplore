import { useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopbar from '../components/admin/AdminTopbar'
import { useAuth } from '../contexts/AuthContext'

const titles = {
  '/admin': 'Dashboard Overview',
  '/admin/pgs': 'PG Management',
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
  const { session, roleLabel, canAccessAdminPanel, logout } = useAuth()

  if (!session || !canAccessAdminPanel) {
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />
  }

  const title =
    location.pathname.includes('/edit')
      ? 'Edit PG Details'
      : /^\/admin\/pgs\/\d+$/.test(location.pathname)
      ? 'PG Details'
      : titles[location.pathname] || 'Admin'

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <AdminTopbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <div className="admin-main__toolbar">
          <span className="text-sm text-muted">
            Signed in as {session.name} · {roleLabel}
          </span>
          <button type="button" onClick={handleLogout} className="btn-secondary text-sm">
            Logout
          </button>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  return <AdminShell />
}
