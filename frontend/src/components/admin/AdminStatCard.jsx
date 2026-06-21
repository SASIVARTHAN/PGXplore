import { displayText, NO_DATA_LABEL } from '../../utils/displayValue'

export default function AdminStatCard({ label, value, sub, tone = 'brand' }) {
  const toneClass =
    tone === 'green'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'amber'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-brand-emphasis'

  const rendered =
    value == null || (typeof value === 'string' && value.trim() === '')
      ? NO_DATA_LABEL
      : value

  const isEmpty = rendered === NO_DATA_LABEL

  return (
    <div className="admin-stat-card">
      <p className="text-sm text-muted">{displayText(label)}</p>
      <p
        className={`mt-1 text-2xl font-bold md:text-3xl ${
          isEmpty ? 'text-sm font-medium text-muted' : toneClass
        }`}
      >
        {rendered}
      </p>
      {sub ? <p className="mt-1 text-xs text-muted">{displayText(sub)}</p> : null}
    </div>
  )
}
