export const SHARING_TYPE_OPTIONS = [
  { id: 'single', label: 'Single Sharing', defaultBeds: 1 },
  { id: 'double', label: 'Double Sharing', defaultBeds: 2 },
  { id: 'triple', label: 'Triple Sharing', defaultBeds: 3 },
  { id: 'four', label: 'Four Sharing', defaultBeds: 4 },
  { id: 'five', label: 'Five Sharing', defaultBeds: 5 },
  { id: 'dormitory', label: 'Dormitory', defaultBeds: null },
]

const LABEL_BY_ID = Object.fromEntries(SHARING_TYPE_OPTIONS.map((o) => [o.id, o.label]))
const DEFAULT_BEDS_BY_ID = Object.fromEntries(SHARING_TYPE_OPTIONS.map((o) => [o.id, o.defaultBeds]))

export function getSharingLabel(type) {
  if (!type) return 'Sharing'
  return (
    LABEL_BY_ID[type] ||
    type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

export function getSharingOption(type) {
  return SHARING_TYPE_OPTIONS.find((o) => o.id === type)
}

export function getDefaultTotalBeds(type) {
  return DEFAULT_BEDS_BY_ID[type] ?? null
}

/** Normalize legacy object or array sharing into a uniform entry list. */
export function sharingToEntries(sharing) {
  if (!sharing) return []
  if (Array.isArray(sharing)) {
    return sharing
      .filter((entry) => entry?.type)
      .map((entry) => ({
        type: entry.type,
        price: entry.price,
        vacancies: entry.vacancies ?? 0,
        totalBeds: entry.totalBeds,
      }))
  }
  return Object.entries(sharing)
    .filter(([, room]) => room && typeof room === 'object')
    .map(([type, room]) => ({
      type,
      price: room.price,
      vacancies: room.vacancies ?? 0,
      totalBeds: room.totalBeds,
    }))
}

/** Persist as keyed object (compatible with existing listings & search). */
export function entriesToSharing(entries) {
  const result = {}
  for (const entry of entries) {
    if (!entry.type) continue
    const defaultBeds = getDefaultTotalBeds(entry.type)
    const totalBedsRaw = entry.totalBeds
    const totalBeds =
      totalBedsRaw !== '' && totalBedsRaw != null && totalBedsRaw !== undefined
        ? Number(totalBedsRaw)
        : defaultBeds

    const vacanciesRaw = entry.vacancies
    const vacancies =
      vacanciesRaw === '' || vacanciesRaw == null || !Number.isFinite(Number(vacanciesRaw))
        ? 0
        : Number(vacanciesRaw)

    result[entry.type] = {
      price: Number(entry.price),
      vacancies,
      totalBeds: Number.isFinite(totalBeds) && totalBeds > 0 ? totalBeds : 1,
    }
  }
  return result
}

export function sharingObjectToFormConfigs(sharing) {
  return sharingToEntries(sharing).map((entry) => ({
    id: entry.type,
    type: entry.type,
    price: entry.price ?? '',
    vacancies: entry.vacancies ?? '',
  }))
}

export function createFormSharingConfig(partial = {}) {
  return {
    id: partial.id || `sh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: partial.type || '',
    price: partial.price ?? '',
    vacancies: partial.vacancies ?? '',
  }
}

export function validateSharingConfigs(configs) {
  if (!configs?.length) {
    return { valid: false, message: 'Add at least one sharing configuration.' }
  }

  const types = new Set()
  for (const config of configs) {
    if (!config.type) {
      return { valid: false, message: 'Select a sharing type for each room configuration.' }
    }
    if (types.has(config.type)) {
      return { valid: false, message: 'Each sharing type can only be added once.' }
    }
    types.add(config.type)

    const label = getSharingLabel(config.type)
    const price = Number(config.price)
    if (!Number.isFinite(price) || price <= 0) {
      return { valid: false, message: `Enter a valid monthly rent for ${label}.` }
    }

    // Vacancies are optional for now — only validate when a value is provided.
    if (config.vacancies !== '' && config.vacancies != null) {
      const vacancies = Number(config.vacancies)
      if (!Number.isFinite(vacancies) || vacancies < 0) {
        return { valid: false, message: `Enter valid available vacancies for ${label}.` }
      }
    }
  }

  return { valid: true }
}

export function formatSharingSummary(sharing, max = 4) {
  const labels = sharingToEntries(sharing).map((e) => getSharingLabel(e.type))
  if (labels.length === 0) return '—'
  if (labels.length <= max) return labels.join(', ')
  return `${labels.slice(0, max).join(', ')} +${labels.length - max} more`
}

export function roomTypeFromSharingId(type) {
  const map = {
    single: 'Single',
    double: 'Double',
    triple: 'Triple',
    four: 'Four',
    five: 'Five',
    dormitory: 'Dormitory',
  }
  return map[type] || getSharingLabel(type).replace(/ Sharing$/, '')
}
