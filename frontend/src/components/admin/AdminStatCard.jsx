export default function AdminStatCard({ label, value, sub, tone = 'brand' }) {
  const toneClass =
    tone === 'green'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'amber'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-brand-emphasis'

  return (
    <div className="admin-stat-card">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold md:text-3xl ${toneClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  )
}
