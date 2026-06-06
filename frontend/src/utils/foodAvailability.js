export const FOOD_AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Food Available' },
  { value: 'not_available', label: 'Food Not Available' },
  { value: 'breakfast_only', label: 'Breakfast Only' },
  { value: 'lunch_dinner', label: 'Lunch & Dinner' },
  { value: 'all_meals', label: 'All Meals Included' },
]

const LABELS = Object.fromEntries(FOOD_AVAILABILITY_OPTIONS.map((o) => [o.value, o.label]))

/** Resolve a food availability value from a PG (supports legacy boolean fields). */
export function normalizeFoodAvailability(source) {
  if (typeof source === 'string' && source) return source
  if (source && typeof source === 'object') {
    if (source.foodAvailability) return source.foodAvailability
    if (source.foodAvailable === false) return 'not_available'
    if (source.foodAvailable === true) return 'available'
  }
  return 'available'
}

export function isFoodServiceAvailable(source) {
  return normalizeFoodAvailability(source) !== 'not_available'
}

export function getFoodAvailabilityLabel(source) {
  return LABELS[normalizeFoodAvailability(source)] || 'Food Available'
}

/** Persist both the new enum and legacy fields so older views keep working. */
export function foodAvailabilityToLegacyFields(value) {
  const normalized = normalizeFoodAvailability(value)
  return {
    foodAvailability: normalized,
    foodAvailable: normalized !== 'not_available',
    foodType: normalized === 'not_available' ? 'None' : 'Both',
  }
}
