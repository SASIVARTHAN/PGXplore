export function formatCurrentBillIncluded(included) {
  if (included === true) return 'Included in rent'
  if (included === false) return 'Paid separately'
  return 'Not specified'
}

/** Human-readable notice period for listings (stored as days). */
export function formatNoticePeriod(days) {
  const n = Number(days)
  if (!Number.isFinite(n) || n < 0) return 'Not specified'
  if (n === 0) return 'No notice period'
  if (n === 1) return '1 day'
  return `${n} days`
}
