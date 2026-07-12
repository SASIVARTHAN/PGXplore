import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './components/AppRoutes'
import AppShell from './components/AppShell'
import ScrollToTop from './components/ScrollToTop'
import SplashGate from './components/SplashGate'
import { ToastProvider } from './components/Toast'
import { AdminProvider } from './contexts/AdminContext'
import { AuthProvider } from './contexts/AuthContext'
import { RefreshProvider } from './contexts/RefreshContext'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SplashGate>
          <AdminProvider>
            <RefreshProvider>
              <ToastProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <AppShell>
                    <AppRoutes />
                  </AppShell>
                </BrowserRouter>
              </ToastProvider>
            </RefreshProvider>
          </AdminProvider>
        </SplashGate>
      </AuthProvider>
    </ThemeProvider>
  )
}
