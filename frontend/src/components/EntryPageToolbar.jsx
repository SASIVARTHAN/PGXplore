import { useNavigate } from 'react-router-dom'
import { FiTool } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function EntryPageToolbar() {
  const navigate = useNavigate()
  const { session } = useAuth()

  return (
    <div className="entry-page__toolbar absolute right-[clamp(0.75rem,2vw,1.5rem)] top-[clamp(0.75rem,2vw,1.5rem)] z-20 flex items-center gap-2">
      {!session && (
        <button
          type="button"
          onClick={() => navigate('/admin-login')}
          aria-label="Privileged Accounts login"
          title="Privileged Accounts login"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app bg-card/80 text-base text-muted backdrop-blur-sm transition hover:border-brand-300 hover:bg-card-muted hover:text-brand-700 dark:border-white/15 dark:bg-slate-900/60 dark:hover:border-white/25 dark:hover:text-brand-200"
        >
          <FiTool aria-hidden />
        </button>
      )}
      <ThemeToggle className="h-10 w-10 shrink-0 bg-card/80 backdrop-blur-sm dark:bg-slate-900/60" />
    </div>
  )
}
