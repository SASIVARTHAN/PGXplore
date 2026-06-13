import { searchListingsApi } from '../api/listings'
import { AREAS, pgListings } from '../data/pgData'
import { isFoodServiceAvailable } from './foodAvailability'
import { sharingToEntries } from './sharingTypes'
import { getStartingRent } from './vacancy'

/** Normalized area lookup (handles typos like thambaram → Tambaram) */
const AREA_LOOKUP = AREAS.reduce((map, area) => {
  const key = area.toLowerCase()
  map[key] = area
  map[key.replace(/[^a-z]/g, '')] = area
  return map
}, {})

const AREA_TYPOS = {
  thambaram: 'Tambaram',
  tambram: 'Tambaram',
  chrompet: 'Chromepet',
  perungalathur: 'Perungalathur',
  guduvanchery: 'Guduvanchery',
  pallavaram: 'Pallavaram',
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'in',
  'at',
  'on',
  'for',
  'to',
  'of',
  'me',
  'my',
  'find',
  'show',
  'get',
  'search',
  'looking',
  'want',
  'need',
  'pg',
  'pgs',
  'paying',
  'guest',
  'guests',
  'hostel',
  'hostels',
  'near',
  'around',
  'close',
  'within',
])

/**
 * Parse a natural-language search into structured filters.
 * Designed so the same shape can be sent to an API later.
 */
export function parseSearchQuery(rawQuery = '') {
  let text = rawQuery.toLowerCase().trim().replace(/\s+/g, ' ')
  const result = {
    raw: rawQuery.trim(),
    keywords: [],
    area: null,
    maxRent: null,
    minRent: null,
    requireFood: null,
    excludeFood: null,
    gender: null,
    requireAc: null,
  }

  if (!text) return result

  // Price: "under 5k", "below 6000", "less than 7k", "under 5 k"
  text = text.replace(
    /\b(?:under|below|less\s+than|max|upto|up\s+to)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(k|thousand)?\b/gi,
    (_, amount, unit) => {
      const n = Number(amount)
      result.maxRent = unit ? Math.round(n * 1000) : n
      return ' '
    },
  )

  text = text.replace(
    /\b(?:above|over|more\s+than|min)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(k|thousand)?\b/gi,
    (_, amount, unit) => {
      const n = Number(amount)
      result.minRent = unit ? Math.round(n * 1000) : n
      return ' '
    },
  )

  // Food intent (including common typo "foot")
  if (/\b(?:without|no|exclude)\s+(?:food|foot|meals?)\b/.test(text)) {
    result.excludeFood = true
    text = text.replace(/\b(?:without|no|exclude)\s+(?:food|foot|meals?)\b/g, ' ')
  }
  if (/\b(?:with\s+food|food\s+included|veg\s+food|food\s+available)\b/.test(text)) {
    result.requireFood = true
    text = text.replace(/\b(?:with\s+food|food\s+included|veg\s+food|food\s+available)\b/g, ' ')
  }

  // AC
  if (/\b(?:with\s+ac|ac\s+available|air\s*conditioned)\b/.test(text)) {
    result.requireAc = true
    text = text.replace(/\b(?:with\s+ac|ac\s+available|air\s*conditioned)\b/g, ' ')
  }
  if (/\b(?:without\s+ac|no\s+ac)\b/.test(text)) {
    result.requireAc = false
    text = text.replace(/\b(?:without\s+ac|no\s+ac)\b/g, ' ')
  }

  // Gender
  if (/\b(?:boys?|gents|men)\b/.test(text)) {
    result.gender = 'Boys'
    text = text.replace(/\b(?:boys?|gents|men)\b/g, ' ')
  } else if (/\b(?:girls?|ladies|women)\b/.test(text)) {
    result.gender = 'Girls'
    text = text.replace(/\b(?:girls?|ladies|women)\b/g, ' ')
  } else if (/\bco[- ]?living\b/.test(text)) {
    result.gender = 'Co-living'
    text = text.replace(/\bco[- ]?living\b/g, ' ')
  }

  // Area: known names + typo table + fuzzy token match
  const areaMatch = findAreaInText(text)
  if (areaMatch) {
    result.area = areaMatch
    text = text.replace(new RegExp(areaMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ')
    const typoKey = Object.keys(AREA_TYPOS).find((k) => AREA_TYPOS[k] === areaMatch)
    if (typoKey) text = text.replace(new RegExp(typoKey, 'gi'), ' ')
  }

  for (const [typo, area] of Object.entries(AREA_TYPOS)) {
    if (text.includes(typo)) {
      result.area = result.area || area
      text = text.replace(new RegExp(typo, 'gi'), ' ')
    }
  }

  result.keywords = text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))

  return result
}

function findAreaInText(text) {
  for (const area of AREAS) {
    if (text.includes(area.toLowerCase())) return area
  }
  for (const [typo, area] of Object.entries(AREA_TYPOS)) {
    if (text.includes(typo)) return area
  }
  const tokens = text.split(/\s+/)
  for (const token of tokens) {
    const normalized = token.replace(/[^a-z]/g, '')
    if (AREA_LOOKUP[normalized]) return AREA_LOOKUP[normalized]
  }
  return null
}

function pgSearchableText(pg) {
  return [pg.name, pg.area, pg.gender, isFoodServiceAvailable(pg) ? 'food' : 'no food', ...(pg.amenities || [])]
    .join(' ')
    .toLowerCase()
}

function matchesKeywords(pg, keywords) {
  if (!keywords.length) return true
  const haystack = pgSearchableText(pg)
  return keywords.every((kw) => haystack.includes(kw))
}

function matchesParsedConstraints(pg, parsed) {
  if (parsed.area && pg.area !== parsed.area) return false

  const rent = getStartingRent(pg.sharing)
  if (parsed.maxRent != null && rent > parsed.maxRent) return false
  if (parsed.minRent != null && rent < parsed.minRent) return false

  if (parsed.requireFood === true && !isFoodServiceAvailable(pg)) return false
  if (parsed.excludeFood === true && isFoodServiceAvailable(pg)) return false

  if (parsed.gender && pg.gender !== parsed.gender) return false

  if (parsed.requireAc === true && !pg.amenities?.includes('AC')) return false
  if (parsed.requireAc === false && pg.amenities?.includes('AC')) return false

  return matchesKeywords(pg, parsed.keywords)
}

/**
 * Filter listings using parsed query + optional UI filters.
 * Swap implementation for API fetch when backend is ready.
 */
export function filterListingsBySearch(listings, rawQuery, uiFilters = {}) {
  const parsed = parseSearchQuery(rawQuery)
  const hasQuery = Boolean(parsed.raw)
  const hasParsedRules =
    parsed.area ||
    parsed.maxRent != null ||
    parsed.minRent != null ||
    parsed.requireFood != null ||
    parsed.excludeFood != null ||
    parsed.gender ||
    parsed.requireAc != null ||
    parsed.keywords.length > 0

  let list = [...listings]

  if (hasQuery && hasParsedRules) {
    list = list.filter((pg) => matchesParsedConstraints(pg, parsed))
  } else if (hasQuery) {
    const q = parsed.raw.toLowerCase()
    list = list.filter((pg) => pgSearchableText(pg).includes(q) || pg.name.toLowerCase().includes(q))
  }

  if (uiFilters.area) list = list.filter((pg) => pg.area === uiFilters.area)
  if (uiFilters.gender) list = list.filter((pg) => pg.gender === uiFilters.gender)
  if (uiFilters.roomType) {
    list = list.filter((pg) =>
      sharingToEntries(pg.sharing).some((entry) => entry.type === uiFilters.roomType),
    )
  }
  if (uiFilters.foodOnly) list = list.filter((pg) => isFoodServiceAvailable(pg))
  if (uiFilters.acOnly) list = list.filter((pg) => pg.amenities?.includes('AC'))
  if (uiFilters.availableOnly && uiFilters.getVacancySummary) {
    list = list.filter((pg) => uiFilters.getVacancySummary(pg.sharing).length > 0)
  }
  if (uiFilters.maxRent != null) {
    list = list.filter((pg) => getStartingRent(pg.sharing) <= uiFilters.maxRent)
  }

  return list
}

/**
 * Local autocomplete — replace with API suggestions later.
 */
export function getSearchSuggestions(rawQuery, listings = pgListings, limit = 8) {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return []

  const suggestions = []
  const seen = new Set()

  const add = (item) => {
    const key = `${item.type}:${item.value}`
    if (seen.has(key) || suggestions.length >= limit) return
    seen.add(key)
    suggestions.push(item)
  }

  for (const area of AREAS) {
    const label = `PGs in ${area}`
    if (label.toLowerCase().includes(q) || area.toLowerCase().includes(q)) {
      add({
        type: 'area',
        id: `area-${area}`,
        label,
        sublabel: 'Popular area',
        value: `pgs near ${area}`,
        area,
      })
    }
  }

  const parsed = parseSearchQuery(rawQuery)
  if (parsed.area && !seen.has(`area:${parsed.area}`)) {
    add({
      type: 'area',
      id: `area-parsed-${parsed.area}`,
      label: `PGs near ${parsed.area}`,
      sublabel: 'Based on your search',
      value: `pgs near ${parsed.area}`,
      area: parsed.area,
    })
  }

  for (const pg of listings) {
    const name = pg.name.toLowerCase()
    const area = pg.area.toLowerCase()
    if (name.includes(q) || area.includes(q) || `${name} ${area}`.includes(q)) {
      add({
        type: 'listing',
        id: `pg-${pg.id}`,
        label: pg.name,
        sublabel: `${pg.area} · ${pg.gender}`,
        value: pg.name,
        pgId: pg.id,
      })
    }
  }

  const intentSuggestions = [
    { match: /under|below|5k|budget|cheap|affordable/i, value: 'pgs under 5k', label: 'PGs under ₹5,000/month' },
    { match: /without|no\s+food|no\s+foot|foot\b/i, value: 'pgs without food', label: 'PGs without food' },
    { match: /tambaram|thambaram|tambram/i, value: 'pgs near Tambaram', label: 'PGs near Tambaram' },
    { match: /chromepet|chrompet/i, value: 'pgs near Chromepet', label: 'PGs near Chromepet' },
  ]
  for (const item of intentSuggestions) {
    if (item.match.test(q)) {
      add({
        type: 'intent',
        id: `intent-${item.value}`,
        label: item.label,
        sublabel: 'Suggested search',
        value: item.value,
      })
    }
  }

  return suggestions.slice(0, limit)
}

/**
 * Search listings via API when useApi is true, otherwise filter a local list.
 */
export async function searchListings(rawQuery, uiFilters = {}, options = {}) {
  if (options.useApi) {
    const parsed = parseSearchQuery(rawQuery)
    const { items } = await searchListingsApi({
      keyword: parsed.raw || undefined,
      area: uiFilters.area || parsed.area || undefined,
      gender: uiFilters.gender || parsed.gender || undefined,
      minRent: parsed.minRent ?? undefined,
      maxRent: uiFilters.maxRent ?? parsed.maxRent ?? undefined,
      foodOnly: uiFilters.foodOnly || parsed.requireFood || undefined,
      acOnly: uiFilters.acOnly || parsed.requireAc || undefined,
      availableOnly: uiFilters.availableOnly,
      city: uiFilters.city || 'Chennai',
    })
    let list = [...items]
    if (uiFilters.roomType) {
      list = list.filter((pg) =>
        sharingToEntries(pg.sharing).some((entry) => entry.type === uiFilters.roomType),
      )
    }
    if (uiFilters.getVacancySummary && uiFilters.availableOnly) {
      list = list.filter((pg) => uiFilters.getVacancySummary(pg.sharing).length > 0)
    }
    return list
  }
  const source = options.listings || pgListings
  return filterListingsBySearch(source, rawQuery, uiFilters)
}

export function hasMeaningfulSearch(rawQuery) {
  const trimmed = rawQuery.trim()
  if (trimmed.length >= 2) return true
  const parsed = parseSearchQuery(trimmed)
  return Boolean(parsed.area || parsed.maxRent != null || parsed.excludeFood != null)
}
