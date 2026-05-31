import BackButton from './BackButton'

export default function PageShell({ title, subtitle, children, backFallback = '/home', backTo }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
      <BackButton fallback={backFallback} to={backTo} />
      <header className="mt-4">
        <h1 className="text-3xl font-bold text-main">{title}</h1>
        {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      </header>
      <div className="mt-8">{children}</div>
    </div>
  )
}
