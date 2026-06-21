import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiFeather, FiHome, FiLock, FiMapPin, FiShield, FiTool, FiZap } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'
import { clearRememberedNavOrigin, createOriginState, rememberNavOrigin } from '../utils/navigation'

const FEATURES = [
  { icon: <FiShield aria-hidden />, label: 'Verified listings' },
  { icon: <FiMapPin aria-hidden />, label: 'Across Chennai' },
  { icon: <FiZap aria-hidden />, label: 'Live vacancy soon' },
]

const PARTICLES = [
  { Icon: FiFeather, left: '8%', top: '70%', size: '2rem', duration: '9s', delay: '0s' },
  { Icon: FiHome, left: '18%', top: '40%', size: '1.5rem', duration: '11s', delay: '1.5s' },
  { Icon: HiSparkles, left: '30%', top: '80%', size: '1.25rem', duration: '7s', delay: '0.8s' },
  { Icon: FiMapPin, left: '72%', top: '75%', size: '1.5rem', duration: '10s', delay: '2s' },
  { Icon: FiFeather, left: '85%', top: '45%', size: '2.25rem', duration: '12s', delay: '0.4s' },
  { Icon: HiSparkles, left: '62%', top: '30%', size: '1rem', duration: '8s', delay: '2.6s' },
  { Icon: FiHome, left: '90%', top: '82%', size: '1.4rem', duration: '13s', delay: '1.1s' },
]

export default function EntryPage() {
  const navigate = useNavigate()
  const { session, canAccessAdminPanel } = useAuth()
  const isStaff = Boolean(session && canAccessAdminPanel)

  useEffect(() => {
    clearRememberedNavOrigin()
  }, [])

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
          <p.Icon />
        </span>
      ))}

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <div className="entry-rise entry-glow entry-card relative z-10 w-full max-w-lg rounded-3xl border border-white/60 bg-white/80 p-7 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 sm:p-9">
        <div className="entry-float entry-logo-wrap max-w-[20rem]">
          <img
            src="/pgxplore-logo.png"
            alt="PGXplore — Find PGs near you"
            className="w-full"
            width="1024"
            height="683"
          />
        </div>

        <p className="entry-stagger mt-5 text-base text-muted" style={{ animationDelay: '0.15s' }}>
          Find trusted PGs with real vacancy updates in{' '}
          <span className="entry-shimmer-text font-semibold">Chennai</span>.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
          {FEATURES.map((f, i) => (
            <span
              key={f.label}
              className="entry-stagger inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50/80 px-3 py-1.5 text-xs font-medium text-brand-900 dark:border-white/10 dark:bg-white/5 dark:text-brand-100"
              style={{ animationDelay: `${0.25 + i * 0.1}s` }}
            >
              <span aria-hidden>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>

        <div className="mt-10 space-y-4 text-left">
          <button
            type="button"
            onClick={() => {
              rememberNavOrigin('/')
              navigate('/home', { state: createOriginState('/') })
            }}
            className="entry-option entry-stagger bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg shadow-brand-600/25 hover:from-brand-500 hover:to-accent-500 dark:from-brand-500 dark:to-accent-500"
            style={{ animationDelay: '0.55s' }}
          >
            <span className="entry-option__icon bg-white/20" aria-hidden>
              <FiHome />
            </span>
            <span className="flex-1">
              <span className="block text-base">Continue as User</span>
              <span className="block text-xs font-normal text-white/80">
                Explore the dashboard — sign in to search PGs
              </span>
            </span>
            <FiArrowRight aria-hidden className="entry-option__arrow text-lg" />
          </button>

          {session ? (
            <button
              type="button"
              onClick={() => navigate(isStaff ? '/admin' : '/account')}
              className="entry-option entry-stagger border border-brand-200 bg-white text-brand-900 hover:border-brand-300 hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              style={{ animationDelay: '0.7s' }}
            >
              <span className="entry-option__icon bg-brand-100 dark:bg-white/10" aria-hidden>
                <FiTool />
              </span>
              <span className="flex-1">
                <span className="block text-base">{isStaff ? 'Back to Privileged Accounts Panel' : 'My account'}</span>
                <span className="block text-xs font-normal text-muted">
                  Signed in as {session.name}
                </span>
              </span>
              <FiArrowRight aria-hidden className="entry-option__arrow text-lg" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="entry-option entry-stagger border border-brand-200 bg-white text-brand-900 hover:border-brand-300 hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                style={{ animationDelay: '0.7s' }}
              >
                <span className="entry-option__icon bg-brand-100 dark:bg-white/10" aria-hidden>
                  <FiLock />
                </span>
                <span className="flex-1">
                  <span className="block text-base">User sign in</span>
                  <span className="block text-xs font-normal text-muted">
                    Save PGs, reviews &amp; history per account
                  </span>
                </span>
                <FiArrowRight aria-hidden className="entry-option__arrow text-lg" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="entry-option entry-stagger border border-brand-200 bg-white text-brand-900 hover:border-brand-300 hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                style={{ animationDelay: '0.85s' }}
              >
                <span className="entry-option__icon bg-brand-100 dark:bg-white/10" aria-hidden>
                  <FiLock />
                </span>
                <span className="flex-1">
                  <span className="block text-base">Create account</span>
                  <span className="block text-xs font-normal text-muted">Register as a new user</span>
                </span>
                <FiArrowRight aria-hidden className="entry-option__arrow text-lg" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin-login')}
                className="entry-option entry-stagger border border-dashed border-brand-200 bg-white/70 text-brand-900 hover:border-brand-300 hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                style={{ animationDelay: '1s' }}
              >
                <span className="entry-option__icon bg-brand-100 dark:bg-white/10" aria-hidden>
                  <FiTool />
                </span>
                <span className="flex-1">
                  <span className="block text-base">Privileged Accounts login</span>
                  <span className="block text-xs font-normal text-muted">Privileged accounts team access</span>
                </span>
                <FiArrowRight aria-hidden className="entry-option__arrow text-lg" />
              </button>
            </>
          )}
        </div>

        <p className="entry-stagger mt-8 text-xs text-muted" style={{ animationDelay: '0.85s' }}>
          Sign in is required to search and browse PG listings.
        </p>
      </div>
    </div>
  )
}
