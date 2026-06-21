import { FiZap } from 'react-icons/fi'

export default function CurrentBillBadge({ included }) {
  if (included === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
        <FiZap aria-hidden className="shrink-0" /> Current bill included in rent
      </span>
    )
  }

  if (included === false) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-card-muted px-3 py-1.5 text-sm text-muted">
        <FiZap aria-hidden className="shrink-0" /> Current bill not included (paid separately)
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-card-muted px-3 py-1.5 text-sm text-muted">
      <FiZap aria-hidden className="shrink-0" /> Current bill — confirm with owner
    </span>
  )
}
