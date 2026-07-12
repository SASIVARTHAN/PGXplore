import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createNavState, getLegalReturnPath, isLegalPage } from '../utils/navigation'
import { getScrollKey, rememberScrollForPath } from '../utils/scrollRestoration'

const footerLinks = [
  { to: '/terms', label: 'Terms' },
  { to: '/help-center', label: 'Help Center' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
]

export default function Footer() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const returnPath = getLegalReturnPath(location, '/home')
  const returnState = createNavState(returnPath)
  if (location.pathname === '/') return null

  const isAuthRoute =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/admin-login'
  const useCompactFooter = isAuthRoute || !isAuthenticated

  const rememberScrollBeforeLegal = () => {
    rememberScrollForPath(returnPath)
    rememberScrollForPath(getScrollKey(location))
  }

  const renderLegalLinks = () =>
    footerLinks.map((link) => {
      const isCurrent = location.pathname === link.to
      return (
        <Link
          key={link.to}
          to={link.to}
          state={returnState}
          replace={isCurrent}
          aria-current={isCurrent ? 'page' : undefined}
          onClick={rememberScrollBeforeLegal}
          className="font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300"
        >
          {link.label}
        </Link>
      )
    })

  if (useCompactFooter) {
    return (
      <footer className="auth-footer shrink-0 border-t border-app bg-card">
        <div
          className="auth-footer__inner mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-1.5 px-4 py-3 text-center"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
          <p className="text-sm font-bold text-brand">PGXplore</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            {renderLegalLinks()}
          </nav>
          <p className="text-[0.6875rem] text-muted">Copyright © 2026 PGXplore</p>
        </div>
      </footer>
    )
  }

  return (
    <footer
      className={`shrink-0 border-t border-app bg-card ${
        isLegalPage(location.pathname)
          ? 'mt-auto pb-6'
          : 'mt-auto pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] md:pb-6'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-5 text-center md:py-6">
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg font-bold text-brand">PGXplore</p>
          <p className="max-w-md text-sm text-muted">
            Find trusted PGs with real vacancy updates across South Chennai.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {renderLegalLinks()}
          </nav>
        </div>
        <p className="mt-4 border-t border-app pt-3 text-xs text-muted">
          Copyright © 2026 PGXplore
        </p>
      </div>
    </footer>
  )
}
