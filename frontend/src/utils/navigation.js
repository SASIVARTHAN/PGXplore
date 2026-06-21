export const NAV_FROM_KEY = 'from'
export const NAV_ORIGIN_KEY = 'origin'
const ORIGIN_STORAGE_KEY = 'pgxplore_nav_origin'
const LOGIN_FROM_HOME_KEY = 'pgxplore_login_from_home'

/** State to mark that the user entered the app from the landing page. */
export function createOriginState(origin = '/') {
  return { [NAV_ORIGIN_KEY]: origin, from: origin }
}

export function rememberNavOrigin(origin) {
  if (typeof origin === 'string' && origin.startsWith('/')) {
    try {
      sessionStorage.setItem(ORIGIN_STORAGE_KEY, origin)
    } catch {
      /* ignore storage errors */
    }
  }
}

export function getRememberedNavOrigin() {
  try {
    return sessionStorage.getItem(ORIGIN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function clearRememberedNavOrigin() {
  try {
    sessionStorage.removeItem(ORIGIN_STORAGE_KEY)
    sessionStorage.removeItem(LOGIN_FROM_HOME_KEY)
  } catch {
    /* ignore storage errors */
  }
}

export function markLoginRedirectFromHome() {
  try {
    sessionStorage.setItem(LOGIN_FROM_HOME_KEY, '1')
  } catch {
    /* ignore storage errors */
  }
}

export function consumeLoginRedirectFromHome() {
  try {
    const flagged = sessionStorage.getItem(LOGIN_FROM_HOME_KEY) === '1'
    if (flagged) sessionStorage.removeItem(LOGIN_FROM_HOME_KEY)
    return flagged
  } catch {
    return false
  }
}

/** Where auth screens should send users when going back. */
export function resolveLoginBackTarget(locationState, fallback = '/') {
  const origin =
    locationState?.[NAV_ORIGIN_KEY] ?? locationState?.origin ?? getRememberedNavOrigin()
  if (typeof origin === 'string' && origin.startsWith('/')) return origin
  if (typeof locationState?.backTo === 'string' && locationState.backTo.startsWith('/')) {
    return locationState.backTo
  }
  return fallback
}

/** Central helper: send unauthenticated users to login without breaking browser history. */
export function redirectToLogin(navigate, { from, location, replace = true }) {
  const origin = location?.state?.[NAV_ORIGIN_KEY] ?? location?.state?.origin ?? getRememberedNavOrigin()
  if (origin) rememberNavOrigin(origin)
  if (location?.pathname === '/home') markLoginRedirectFromHome()

  navigate('/login', {
    replace,
    state: {
      from,
      [NAV_ORIGIN_KEY]: origin,
      origin,
    },
  })
}

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
      filters.roomType ||
      filters.foodOnly ||
      filters.acOnly ||
      filters.availableOnly ||
      filters.maxRent < 15000,
  )
}
