import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './components/AppRoutes'
import AppShell from './components/AppShell'
import ScrollToTop from './components/ScrollToTop'
import { ToastProvider } from './components/Toast'
import { AdminProvider } from './contexts/AdminContext'
import { AuthProvider } from './contexts/AuthContext'
import { FirebaseAuthConfigProvider } from './contexts/FirebaseAuthConfigContext'
import { GoogleAuthConfigProvider, useGoogleAuthConfig } from './contexts/GoogleAuthConfigContext'
import { ThemeProvider } from './contexts/ThemeContext'

function GoogleOAuthWrapper({ children }) {
  const { clientId } = useGoogleAuthConfig()
  if (!clientId) return children
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
}

export default function App() {
  return (
    <ThemeProvider>
      <GoogleAuthConfigProvider>
        <FirebaseAuthConfigProvider>
        <GoogleOAuthWrapper>
          <AuthProvider>
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
          </AuthProvider>
        </GoogleOAuthWrapper>
        </FirebaseAuthConfigProvider>
      </GoogleAuthConfigProvider>
    </ThemeProvider>
  )
}
