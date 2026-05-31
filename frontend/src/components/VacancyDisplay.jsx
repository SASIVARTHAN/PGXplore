import { getSharingStatus } from '../utils/vacancy'

export default function VacancyDisplay({ sharing }) {
  const rows = ['single', 'double', 'triple'].map((type) => getSharingStatus(type, sharing[type]))

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-main">Room Availability</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.type} className="rounded-xl border border-app bg-card p-4">
            <p className="text-sm font-medium text-muted">{row.label}</p>
            <p className="mt-1 text-xl font-bold text-main">₹{row.price.toLocaleString('en-IN')}</p>
            <p className={`mt-2 text-sm font-medium ${row.tone === 'green' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {row.tone === 'green' ? '🟢' : '🔴'} {row.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
