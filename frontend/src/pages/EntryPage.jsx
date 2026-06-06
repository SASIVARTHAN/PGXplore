import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const FEATURES = [
  { icon: '🛡️', label: 'Verified listings' },
  { icon: '📍', label: 'Across Chennai' },
  { icon: '⚡', label: 'Live vacancy soon' },
]

const PARTICLES = [
  { emoji: '🪶', left: '8%', top: '70%', size: '2rem', duration: '9s', delay: '0s' },
  { emoji: '🏠', left: '18%', top: '40%', size: '1.5rem', duration: '11s', delay: '1.5s' },
  { emoji: '✨', left: '30%', top: '80%', size: '1.25rem', duration: '7s', delay: '0.8s' },
  { emoji: '📍', left: '72%', top: '75%', size: '1.5rem', duration: '10s', delay: '2s' },
  { emoji: '🪶', left: '85%', top: '45%', size: '2.25rem', duration: '12s', delay: '0.4s' },
  { emoji: '✨', left: '62%', top: '30%', size: '1rem', duration: '8s', delay: '2.6s' },
  { emoji: '🏠', left: '90%', top: '82%', size: '1.4rem', duration: '13s', delay: '1.1s' },
]

export default function EntryPage() {
  const navigate = useNavigate()

  return (
    <div className="entry-page relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-stone-50 to-brand-100 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950">
      {/* Animated gradient blobs */}
      <div
        className="entry-blob h-72 w-72 bg-brand-400/40 dark:bg-brand-500/25"
        style={{ top: '-4rem', left: '-3rem' }}
      />
      <div
        className="entry-blob h-80 w-80 bg-accent-500/30 dark:bg-accent-600/25"
        style={{ bottom: '-5rem', right: '-4rem', animationDelay: '3s' }}
      />
      <div
        className="entry-blob h-64 w-64 bg-emerald-300/30 dark:bg-emerald-500/15"
        style={{ top: '40%', left: '55%', animationDelay: '6s' }}
      />

      {/* Floating decorative particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="entry-particle"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          {p.emoji}
        </span>
      ))}

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="entry-rise entry-glow relative z-10 w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 p-7 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-9">
        <div className="entry-float entry-logo-wrap max-w-[20rem]">
          <img
            src="/pgxplore-logo.png"
            alt="PGXplore — Find PGs near you"
            className="w-full"
            width="1024"
            height="683"
          />
        </div>

        <p className="mt-5 text-base text-muted">
          Find trusted PGs with real vacancy updates in Chennai.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {FEATURES.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50/80 px-3 py-1.5 text-xs font-medium text-brand-900 dark:border-white/10 dark:bg-white/5 dark:text-brand-100"
            >
              <span aria-hidden>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-3 text-left">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="entry-option bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-600/25 hover:from-brand-500 hover:to-accent-500 dark:from-brand-500 dark:to-accent-500"
          >
            <span className="entry-option__icon bg-white/20" aria-hidden>
              🏠
            </span>
            <span className="flex-1">
              <span className="block text-base">Continue as User</span>
              <span className="block text-xs font-normal text-white/80">
                Browse PG listings — no login required
              </span>
            </span>
            <span aria-hidden className="text-lg">→</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin-login')}
            className="entry-option border border-brand-200 bg-white text-brand-900 hover:border-brand-300 hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <span className="entry-option__icon bg-brand-100 dark:bg-white/10" aria-hidden>
              🔐
            </span>
            <span className="flex-1">
              <span className="block text-base">Login</span>
              <span className="block text-xs font-normal text-muted">
                Admin &amp; privileged team access
              </span>
            </span>
            <span aria-hidden className="text-lg">→</span>
          </button>
        </div>

        <p className="mt-6 text-xs text-muted">No login required to browse PG listings.</p>
      </div>
    </div>
  )
}
