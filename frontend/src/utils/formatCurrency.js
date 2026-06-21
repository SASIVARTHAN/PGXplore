/**
 * Format a number as Indian Rupees (₹).
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return '₹0'
  return `₹${value.toLocaleString('en-IN')}`
}

/**
 * Format monthly rent with ₹ symbol.
 * @param {number} amount
 * @returns {string}
 */
export function formatMonthlyRent(amount) {
  return `${formatCurrency(amount)}/month`
}
