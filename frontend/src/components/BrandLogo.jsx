import { Link, useLocation } from 'react-router-dom'

export default function BrandLogo() {
  const location = useLocation()
  const onHome = location.pathname === '/home' && !location.search

  return (
    <Link
      to="/home"
      onClick={() => {
        if (onHome) window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="relative z-50 shrink-0 text-xl font-bold text-brand hover:opacity-90"
    >
      PGXplore
    </Link>
  )
}
