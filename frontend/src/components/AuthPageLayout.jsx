import BrandLogo from './BrandLogo'
import CornerThemeToggle from './CornerThemeToggle'
import EntryBrandPanel from './EntryBrandPanel'
import EntryPageDecorations from './EntryPageDecorations'
import ThemeToggle from './ThemeToggle'

export default function AuthPageLayout({
  children,
  centerOnDesktop = false,
  brandPanel = false,
  stackFooter = null,
}) {
  if (brandPanel) {
    return (
      <div className="entry-page entry-page--adaptive auth-page auth-page--split auth-page--with-footer relative flex h-full min-h-full w-full max-w-full flex-col items-center justify-start overflow-x-hidden bg-gradient-to-br from-brand-50 via-stone-50 to-brand-100 pt-[clamp(2.75rem,9vw,3.75rem)] pb-0 md:max-h-full md:min-h-0 md:justify-center md:overflow-hidden md:pt-0 md:pb-0 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950">
        <EntryPageDecorations />

        <CornerThemeToggle className="z-20" />

        <div className="entry-page__layout entry-page__layout--adaptive relative z-10 w-full max-w-full min-w-0 box-border px-1 sm:px-0">
          <EntryBrandPanel />

          <section className="entry-page__actions entry-page__actions--adaptive entry-page__actions--login entry-glow entry-card w-full rounded-2xl border border-white/60 bg-white/80 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
            <div className="entry-panel-stack text-left">{children}</div>
            {stackFooter}
          </section>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`auth-page flex w-full flex-col overflow-x-hidden bg-app${
        centerOnDesktop ? ' auth-page--center-desktop' : ''
      }`}
    >
      <header className="auth-page__header hidden shrink-0 items-center justify-between gap-3 px-4 py-4 md:flex">
        <BrandLogo />
        <ThemeToggle />
      </header>
      <div className="auth-page__body flex flex-col items-center px-4 pb-6 pt-2 sm:pb-8 sm:pt-4">
        {children}
      </div>
    </div>
  )
}
