import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

export default function EntryPage() {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-stone-50 to-brand-100 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="entry-glow w-full max-w-md rounded-3xl border border-app bg-card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 text-2xl font-bold text-white">
          P
        </div>
        <h1 className="mt-5 text-4xl font-bold text-brand">PGXplore</h1>
        <p className="mt-3 text-muted">Find trusted PGs with real vacancy updates in Chennai.</p>

        <div className="mt-8 space-y-3">
          <button type="button" onClick={() => navigate('/home')} className="btn-primary w-full py-3.5 font-semibold">
            Continue as User
          </button>
          <button type="button" onClick={() => navigate('/admin-login')} className="btn-secondary w-full py-3.5 font-semibold">
            Login as Admin
          </button>
        </div>

        <p className="mt-6 text-xs text-muted">No login required to browse PG listings.</p>
      </div>
    </div>
  )
}
