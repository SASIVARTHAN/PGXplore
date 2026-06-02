import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './components/AppRoutes'
import AppShell from './components/AppShell'
import ScrollToTop from './components/ScrollToTop'
import { ToastProvider } from './components/Toast'
import { AdminProvider } from './contexts/AdminContext'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <AdminProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppShell>
            <AppRoutes />
          </AppShell>
        </BrowserRouter>
      </ToastProvider>
      </AdminProvider>
    </ThemeProvider>
  )
}
