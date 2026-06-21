import { formatCurrency } from '../utils/formatCurrency'
import { getSharingLabel, sharingToEntries } from '../utils/sharingTypes'

/** Live vacancy is paused — show pricing with a coming-soon status. */
export default function VacancyDisplay({ sharing }) {
  const rows = sharingToEntries(sharing).map((entry) => ({
    type: entry.type,
    label: getSharingLabel(entry.type),
    price: entry.price,
    vacancies: entry.vacancies,
    totalBeds: entry.totalBeds,
  }))

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-app bg-card p-6 text-center text-sm text-muted">
        No sharing configurations listed for this PG yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-main">Room availability & pricing</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.type} className="rounded-xl border border-app bg-card p-4">
            <p className="text-sm font-medium text-muted">{row.label}</p>
            <p className="mt-1 text-xl font-bold text-main">
              {row.price != null ? formatCurrency(row.price) : '—'}
              <span className="text-sm font-normal text-muted"> / month</span>
            </p>
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
              Live availability · Coming Soon
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
