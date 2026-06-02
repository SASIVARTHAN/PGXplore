import { useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopbar from '../components/admin/AdminTopbar'
const titles = {
  '/admin': 'Dashboard Overview',
  '/admin/pgs': 'PG Management',
  '/admin/pgs/new': 'Add New PG',
  '/admin/rooms': 'Room Management',
  '/admin/bookings': 'Booking Management',
  '/admin/users': 'User Management',
  '/admin/reviews': 'Reviews & Ratings',
  '/admin/analytics': 'Revenue Analytics',
  '/admin/notifications': 'Notifications',
}

function AdminShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAdmin = sessionStorage.getItem('pgxplore_admin') === 'true'

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />
  }

  const title =
    location.pathname.includes('/edit')
      ? 'Edit PG Details'
      : titles[location.pathname] || 'Admin'

  const handleLogout = () => {
    sessionStorage.removeItem('pgxplore_admin')
    navigate('/', { replace: true })
  }

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <AdminTopbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <div className="admin-main__toolbar">
          <span className="text-sm text-muted">Signed in as admin</span>
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
