import { Link, useLocation } from 'react-router-dom'

const footerLinks = [
  { to: '/terms', label: 'Terms' },
  { to: '/help-center', label: 'Help Center' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
]

export default function Footer() {
  const location = useLocation()
  if (location.pathname === '/') return null

  return (
    <footer className="mt-auto border-t border-app bg-card pb-20 md:pb-8">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold text-brand">PGXplore</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Find trusted PGs with real vacancy updates across South Chennai.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-app pt-6 text-center text-xs text-muted sm:text-left">
          Copyright © 2026 PGXplore
        </p>
      </div>
    </footer>
  )
}
