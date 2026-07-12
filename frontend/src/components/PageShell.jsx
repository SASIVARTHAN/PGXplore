import { useLocation } from 'react-router-dom'
import BackButton from './BackButton'
import CornerThemeToggle from './CornerThemeToggle'
import { isLegalPage } from '../utils/navigation'

export default function PageShell({ title, subtitle, children, backFallback = '/home', backTo }) {
  const location = useLocation()
  const legalPage = isLegalPage(location.pathname)

  return (
    <>
      {legalPage && <CornerThemeToggle />}
      {/* Match /home body→footer spacing; footer owns mobile-nav clearance. */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <BackButton fallback={backFallback} to={backTo} />
        <header className="mt-4">
          <h1 className="text-3xl font-bold text-main">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        </header>
        <div className="mt-8">{children}</div>
      </div>
    </>
  )
}
