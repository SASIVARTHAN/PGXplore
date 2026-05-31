const FOOD_ICONS = {
  Veg: '🍛 Veg',
  'Non-Veg': '🍗 Non-Veg',
  Both: '🍽 Both',
  None: 'No food',
}

export default function FoodTypeBadge({ foodAvailable, foodType }) {
  if (!foodAvailable) {
    return (
      <span className="inline-flex items-center rounded-lg bg-card-muted px-3 py-1.5 text-sm text-muted">
        No food provided
      </span>
    )
  }

  return (
    <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
      Food Available — {FOOD_ICONS[foodType] || foodType}
    </span>
  )
}
