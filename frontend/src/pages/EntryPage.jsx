import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowRight, FiHome, FiLock, FiTool } from 'react-icons/fi'
import EntryBrandPanel from '../components/EntryBrandPanel'
import EntryPageDecorations from '../components/EntryPageDecorations'
import EntryPageToolbar from '../components/EntryPageToolbar'
import { useAuth } from '../contexts/AuthContext'
import { clearRememberedNavOrigin, createOriginState, rememberAuthBackTarget, rememberNavOrigin } from '../utils/navigation'

export default function EntryPage() {
  const navigate = useNavigate()
  const { session, canAccessAdminPanel } = useAuth()
  const isStaff = Boolean(session && canAccessAdminPanel)

  useEffect(() => {
    clearRememberedNavOrigin()
  }, [])

  return (
    <div className="entry-page entry-page--adaptive relative flex h-full max-h-full min-h-0 w-full max-w-full flex-col items-center justify-center overflow-x-hidden overflow-y-auto overscroll-y-contain bg-gradient-to-br from-brand-50 via-stone-50 to-brand-100 md:overflow-hidden dark:from-slate-950 dark:via-slate-900 dark:to-brand-950">
      {/* Decorative layer — clipped so blobs/particles cannot cause scroll */}
      <EntryPageDecorations />

      <EntryPageToolbar />

      <div className="entry-page__layout entry-page__layout--adaptive relative z-10 w-full max-w-full min-w-0 box-border px-1 sm:px-0">
        {/* Branding column */}
        <EntryBrandPanel />

        {/* Actions column */}
        <section className="entry-page__actions entry-page__actions--adaptive entry-glow entry-card w-full rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
          <div className="entry-panel-stack text-left">
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
              <span className="min-w-0 flex-1">
                <span className="entry-option__title block">Continue as User</span>
                <span className="entry-option__subtitle block font-normal text-white/80">
                  Explore the dashboard — sign in to search PGs
                </span>
              </span>
              <FiArrowRight aria-hidden className="entry-option__arrow shrink-0" />
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
                <span className="min-w-0 flex-1">
                  <span className="entry-option__title block">
                    {isStaff ? 'Back to Privileged Accounts Panel' : 'My account'}
                  </span>
                  <span className="entry-option__subtitle block font-normal text-muted">
                    Signed in as {session.name}
                  </span>
                </span>
                <FiArrowRight aria-hidden className="entry-option__arrow shrink-0" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    rememberAuthBackTarget('/')
                    navigate('/login', { state: { from: '/' } })
                  }}
                  className="entry-option entry-stagger border border-brand-200 bg-white text-brand-900 hover:border-brand-300 hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  style={{ animationDelay: '0.7s' }}
                >
                  <span className="entry-option__icon bg-brand-100 dark:bg-white/10" aria-hidden>
                    <FiLock />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="entry-option__title block">Sign In</span>
                    <span className="entry-option__subtitle block font-normal text-muted">
                      Save PGs, reviews &amp; history per account
                    </span>
                  </span>
                  <FiArrowRight aria-hidden className="entry-option__arrow shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rememberAuthBackTarget('/')
                    navigate('/register', { state: { from: '/' } })
                  }}
                  className="entry-option entry-stagger border border-brand-200 bg-white text-brand-900 hover:border-brand-300 hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  style={{ animationDelay: '0.85s' }}
                >
                  <span className="entry-option__icon bg-brand-100 dark:bg-white/10" aria-hidden>
                    <FiLock />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="entry-option__title block">Create account</span>
                    <span className="entry-option__subtitle block font-normal text-muted">
                      Register as a new user
                    </span>
                  </span>
                  <FiArrowRight aria-hidden className="entry-option__arrow shrink-0" />
                </button>
              </>
            )}
          </div>

          <p className="entry-panel-note entry-stagger text-center text-muted" style={{ animationDelay: '0.85s' }}>
            Sign in is required to search and browse PG listings.
          </p>
        </section>
      </div>
    </div>
  )
}
