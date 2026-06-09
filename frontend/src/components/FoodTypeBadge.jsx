import {
  MdDinnerDining,
  MdFreeBreakfast,
  MdNoMeals,
  MdRestaurant,
  MdRiceBowl,
} from 'react-icons/md'
import {
  getFoodAvailabilityLabel,
  isFoodServiceAvailable,
  normalizeFoodAvailability,
} from '../utils/foodAvailability'

const ICONS = {
  available: MdRestaurant,
  breakfast_only: MdFreeBreakfast,
  lunch_dinner: MdDinnerDining,
  all_meals: MdRiceBowl,
}

export default function FoodTypeBadge({ pg, foodAvailable, foodType, foodAvailability }) {
  const source = pg ?? { foodAvailable, foodType, foodAvailability }
  const value = normalizeFoodAvailability(source)
  const label = getFoodAvailabilityLabel(source)

  if (!isFoodServiceAvailable(source)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-card-muted px-3 py-1.5 text-sm text-muted">
        <MdNoMeals aria-hidden className="shrink-0" /> {label}
      </span>
    )
  }

  const Icon = ICONS[value] || MdRestaurant

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
      <Icon aria-hidden className="shrink-0" /> {label}
    </span>
  )
}
