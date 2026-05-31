export const NAV_FROM_KEY = 'from'

/** Current path + query for return navigation */
export function buildFromPath(location) {
  if (typeof location === 'string') return location
  return `${location.pathname}${location.search}`
}

/** Parse "/path?query" into a React Router location object */
export function parseRouteTarget(path) {
  if (!path || typeof path !== 'string' || !path.startsWith('/')) {
    return { pathname: '/home', search: '', hash: '' }
  }

  const hashIndex = path.indexOf('#')
  const withoutHash = hashIndex >= 0 ? path.slice(0, hashIndex) : path
  const hash = hashIndex >= 0 ? path.slice(hashIndex) : ''
  const qIndex = withoutHash.indexOf('?')

  if (qIndex === -1) {
    return { pathname: withoutHash || '/', search: '', hash }
  }

  return {
    pathname: withoutHash.slice(0, qIndex) || '/',
    search: withoutHash.slice(qIndex),
    hash,
  }
}

export function getBackPath(pathname) {
  if (pathname.startsWith('/pg/')) return '/listings'
  if (/^\/owner\/\d+$/.test(pathname)) {
    const id = pathname.split('/').pop()
    return `/pg/${id}`
  }
  if (pathname === '/listings') return '/home'
  if (pathname === '/saved') return '/home'
  if (pathname === '/terms' || pathname === '/help-center' || pathname === '/privacy-policy') {
    return '/home'
  }
  if (pathname === '/company' || pathname === '/owner') return '/home'
  if (pathname === '/admin-dashboard') return '/admin-login'
  if (pathname === '/admin-login') return '/'
  return '/home'
}

export function saveReturnPath(key, from) {
  if (!key || !from) return
  try {
    sessionStorage.setItem(`pgxplore_return_${key}`, from)
  } catch {
    /* ignore quota / private mode */
  }
}

export function getSavedReturnPath(key) {
  if (!key) return null
  try {
    return sessionStorage.getItem(`pgxplore_return_${key}`)
  } catch {
    return null
  }
}

/** Resolve where Back should go */
export function resolveBackTarget(location, fallback = '/home', returnKey) {
  const current = buildFromPath(location)
  const fromState = location.state?.[NAV_FROM_KEY] ?? location.state?.from
  const fromStorage = returnKey ? getSavedReturnPath(returnKey) : null

  const candidates = [fromState, fromStorage, fallback, getBackPath(location.pathname)]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.startsWith('/') && candidate !== current) {
      return candidate
    }
  }

  const defaultBack = getBackPath(location.pathname)
  return defaultBack !== current ? defaultBack : fallback
}

export function createNavState(from) {
  return { [NAV_FROM_KEY]: from, from }
}

export function hasActiveListingFilters(filters, query) {
  return Boolean(
    query?.trim() ||
      filters.area ||
      filters.gender ||
      filters.foodOnly ||
      filters.acOnly ||
      filters.availableOnly ||
      filters.maxRent < 15000,
  )
}
