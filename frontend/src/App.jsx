import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './components/AppRoutes'
import Footer from './components/Footer'
import Header from './components/Header'
import MobileNav from './components/MobileNav'
import ScrollToTop from './components/ScrollToTop'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './contexts/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex min-h-screen flex-col bg-app">
            <Header />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
            <MobileNav />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
