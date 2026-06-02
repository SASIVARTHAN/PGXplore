import { useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import MobileNav from './MobileNav'

export default function AppShell({ children }) {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin-login'

  if (isAdminRoute) {
    return children
  }

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  )
}
