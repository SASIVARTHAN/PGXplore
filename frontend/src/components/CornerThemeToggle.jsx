import ThemeToggle from './ThemeToggle'

export default function CornerThemeToggle({ className = '' }) {
  return (
    <div
      className={`fixed right-[clamp(0.75rem,2vw,1.5rem)] top-[clamp(0.75rem,2vw,1.5rem)] z-50 flex items-center gap-2 ${className}`}
    >
      <ThemeToggle className="h-10 w-10 shrink-0 bg-card/80 backdrop-blur-sm dark:bg-slate-900/60" />
    </div>
  )
}
