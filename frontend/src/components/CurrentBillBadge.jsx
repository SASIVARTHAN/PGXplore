export default function CurrentBillBadge({ included }) {
  if (included === true) {
    return (
      <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
        ⚡ Current bill included in rent
      </span>
    )
  }

  if (included === false) {
    return (
      <span className="inline-flex items-center rounded-lg bg-card-muted px-3 py-1.5 text-sm text-muted">
        ⚡ Current bill not included (paid separately)
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-lg bg-card-muted px-3 py-1.5 text-sm text-muted">
      ⚡ Current bill — confirm with owner
    </span>
  )
}
