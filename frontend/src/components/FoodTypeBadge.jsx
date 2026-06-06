import {
  getFoodAvailabilityLabel,
  isFoodServiceAvailable,
  normalizeFoodAvailability,
} from '../utils/foodAvailability'

const ICONS = {
  available: '🍽',
  breakfast_only: '🥐',
  lunch_dinner: '🍱',
  all_meals: '🍛',
}

export default function FoodTypeBadge({ pg, foodAvailable, foodType, foodAvailability }) {
  const source = pg ?? { foodAvailable, foodType, foodAvailability }
  const value = normalizeFoodAvailability(source)
  const label = getFoodAvailabilityLabel(source)

  if (!isFoodServiceAvailable(source)) {
    return (
      <span className="inline-flex items-center rounded-lg bg-card-muted px-3 py-1.5 text-sm text-muted">
        🚫 {label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
      {ICONS[value] || '🍽'} {label}
    </span>
  )
}
