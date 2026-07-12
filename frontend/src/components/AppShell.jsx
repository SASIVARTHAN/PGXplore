import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from './Footer'
import CornerThemeToggle from './CornerThemeToggle'
import Header from './Header'
import MobileNav from './MobileNav'
import { PullToRefreshHost } from './PullToRefresh'
import { useAuth } from '../contexts/AuthContext'
import { isMobileView } from '../hooks/useMobileBackNavigation'
import { hasBuiltInMobileThemeToggle, isLegalPage } from '../utils/navigation'
import {
  applyScrollRestore,
  consumePendingScrollRestore,
  getScrollKey,
  peekPendingScrollRestore,
} from '../utils/scrollRestoration'
import {
  applyLandingViewportLock,
  clearLandingViewportLock,
  resetPageScroll,
  syncLandingViewportAfterRoute,
  updateAppViewportHeight,
} from '../utils/viewport'

export default function AppShell({ children }) {
  const location = useLocation()
  const { isAccountUser } = useAuth()
  const mainRef = useRef(null)
  const wasLandingRef = useRef(location.pathname === '/')
  const pathname = location.pathname
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin-login'

  const isLanding = pathname === '/'
  const isLoginPage = pathname === '/login'
  const isAuthRoute =
    isLoginPage || pathname === '/register' || pathname === '/admin-login'
  const showMobileThemeToggle = !hasBuiltInMobileThemeToggle(pathname) && !isAccountUser
  const needsMobileTopInset =
    showMobileThemeToggle || pathname === '/register' || pathname === '/admin-login'

  // Restore scroll after Terms/Help/Privacy; otherwise reset.
  useEffect(() => {
    if (isLanding || isLegalPage(pathname)) {
      if (isLegalPage(pathname)) resetPageScroll(mainRef.current)
      return undefined
    }

    const key = getScrollKey(location)
    const pending = peekPendingScrollRestore()
    const shouldRestore =
      pending === key ||
      pending === pathname ||
      pending === `${pathname}${location.search || ''}`

    if (!shouldRestore) {
      resetPageScroll(mainRef.current)
      return undefined
    }

    consumePendingScrollRestore()
    return applyScrollRestore(key, mainRef.current)
  }, [isLanding, location, pathname])

  // Landing-only viewport lock. App tabs use natural min-h-screen flow
  // (locking to svh/dvh caused Listings/Home to resize when switching).
  useEffect(() => {
    if (!isLanding) {
      if (wasLandingRef.current) {
        clearLandingViewportLock({ resetScroll: true })
      } else {
        document.documentElement.classList.remove('landing-scroll-lock')
        document.documentElement.style.removeProperty('--app-vh')
      }
      wasLandingRef.current = false
      return undefined
    }

    wasLandingRef.current = true
    applyLandingViewportLock(mainRef.current)
    syncLandingViewportAfterRoute(mainRef.current)

    const handleViewportChange = () => {
      updateAppViewportHeight()
    }

    window.visualViewport?.addEventListener('resize', handleViewportChange)
    window.visualViewport?.addEventListener('scroll', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange)
      window.visualViewport?.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('orientationchange', handleViewportChange)
      clearLandingViewportLock({ resetScroll: false })
    }
  }, [isLanding])

  // Prevent WebView/PWA exit on in-app routes. Landing + auth may leave the stack.
  useEffect(() => {
    if (isLanding || isAdminRoute || isAuthRoute) return undefined
    if (!isMobileView()) return undefined

    const arm = () => {
      window.history.pushState({ pgxShellExitGuard: Date.now() }, '', window.location.href)
    }
    const onPopState = () => {
      arm()
      arm()
    }

    arm()
    arm()
    arm()
    const t1 = window.setTimeout(() => {
      arm()
      arm()
    }, 0)
    const t2 = window.setTimeout(() => {
      arm()
      arm()
    }, 60)

    window.addEventListener('popstate', onPopState)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('popstate', onPopState)
    }
  }, [isAdminRoute, isAuthRoute, isLanding, location.search, pathname])

  if (isAdminRoute) {
    return children
  }

  return (
    <div
      className={
        isLanding
          ? 'app-shell--landing flex h-[var(--app-vh,100dvh)] max-h-[var(--app-vh,100dvh)] flex-col overflow-hidden bg-app'
          : 'flex min-h-screen flex-col bg-app'
      }
    >
      <Header />
      {showMobileThemeToggle && <CornerThemeToggle className="md:hidden" />}
      <main
        ref={mainRef}
        className={
          isLanding
            ? 'flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden'
            : isAuthRoute
              ? `flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden${
                  needsMobileTopInset ? ' pt-[clamp(3.25rem,9vw,4rem)] md:pt-0' : ''
                }`
              : `flex-1 overflow-x-hidden${
                  needsMobileTopInset ? ' pt-[clamp(3.25rem,9vw,4rem)] md:pt-0' : ''
                }`
        }
      >
        <PullToRefreshHost containerRef={mainRef} disabled={isLanding}>
          {children}
          {isAuthRoute && <Footer />}
        </PullToRefreshHost>
      </main>
      {!isAuthRoute && <Footer />}
      <MobileNav />
    </div>
  )
}
