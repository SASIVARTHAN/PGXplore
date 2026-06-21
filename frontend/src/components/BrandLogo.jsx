import { Link, useLocation } from 'react-router-dom'

const AUTH_LANDING_PATHS = new Set(['/', '/login', '/register', '/admin-login'])

export default function BrandLogo() {
  const location = useLocation()
  const onHome = location.pathname === '/home' && !location.search
  const to = AUTH_LANDING_PATHS.has(location.pathname) ? '/' : '/home'

  return (
    <Link
      to={to}
      onClick={() => {
        if (onHome) window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="relative z-50 flex shrink-0 items-center gap-2 hover:opacity-90"
      aria-label="PGXplore home"
    >
      <img src="/pgxplore-logo.png" alt="PGXplore" className="h-8 w-auto sm:h-9" width="1024" height="683" />
      <span className="sr-only">PGXplore</span>
    </Link>
  )
}
