export const NO_DATA_LABEL = 'No data'

export function hasDisplayValue(value) {
  if (value == null) return false
  if (typeof value === 'string') return value.trim() !== ''
  if (typeof value === 'number') return Number.isFinite(value)
  return true
}

export function displayText(value, fallback = NO_DATA_LABEL) {
  if (!hasDisplayValue(value)) return fallback
  if (typeof value === 'string') return value.trim()
  return String(value)
}

export function displayNumber(value, fallback = NO_DATA_LABEL) {
  if (value == null || value === '') return fallback
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return n
}

export function displayDateTime(value, fallback = NO_DATA_LABEL) {
  if (!hasDisplayValue(value)) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toLocaleString()
}

export function displayCurrency(amount, fallback = NO_DATA_LABEL) {
  const n = displayNumber(amount, fallback)
  if (n === fallback) return fallback
  return `₹${n.toLocaleString('en-IN')}`
}
