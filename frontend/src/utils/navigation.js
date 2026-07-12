export const NAV_FROM_KEY = 'from'
export const NAV_ORIGIN_KEY = 'origin'

export const LEGAL_PAGE_PATHS = ['/terms', '/help-center', '/privacy-policy']

export function isLegalPage(pathname) {
  return LEGAL_PAGE_PATHS.includes(pathname)
}

/** Pathname only from a path or location-like string (strips query/hash). */
export function getPathname(path) {
  if (!path || typeof path !== 'string') return ''
  return path.split('?')[0].split('#')[0] || ''
}

/**
 * Return path for leaving legal pages. Never points at another legal page,
 * so re-tapping Terms/Help/Privacy cannot corrupt swipe-back.
 */
export function getLegalReturnPath(location, fallback = '/home') {
  const fromState = location?.state?.[NAV_FROM_KEY] ?? location?.state?.from
  if (typeof fromState === 'string' && fromState.startsWith('/') && !isLegalPage(getPathname(fromState))) {
    return fromState
  }
  if (location?.pathname && !isLegalPage(location.pathname)) {
    return buildFromPath(location)
  }
  return fallback
}

/** Routes that already render a fixed top-right theme toggle on mobile. */
export function hasBuiltInMobileThemeToggle(pathname) {
  return pathname === '/' || pathname === '/login' || isLegalPage(pathname)
}
const ORIGIN_STORAGE_KEY = 'pgxplore_nav_origin'
const LOGIN_FROM_HOME_KEY = 'pgxplore_login_from_home'
const AUTH_BACK_TARGET_KEY = 'pgxplore_auth_back_target'

/** Where /login or /register should go on mobile back (survives Terms round-trips). */
export function rememberAuthBackTarget(target) {
  if (typeof target !== 'string' || !target.startsWith('/')) return
  try {
    sessionStorage.setItem(AUTH_BACK_TARGET_KEY, target)
  } catch {
    /* ignore */
  }
}

export function getAuthBackTarget(fallback = '/') {
  try {
    const saved = sessionStorage.getItem(AUTH_BACK_TARGET_KEY)
    if (typeof saved === 'string' && saved.startsWith('/')) return saved
  } catch {
    /* ignore */
  }
  return fallback
}

export function clearAuthBackTarget() {
  try {
    sessionStorage.removeItem(AUTH_BACK_TARGET_KEY)
  } catch {
    /* ignore */
  }
}

/** Resolve and persist login/register back target from current location state. */
export function syncAuthBackTarget(locationState) {
  const from = locationState?.from
  const fromHome = (() => {
    try {
      return sessionStorage.getItem(LOGIN_FROM_HOME_KEY) === '1'
    } catch {
      return false
    }
  })()

  // In-app redirect (e.g. Browse while signed out) → dashboard
  if (
    fromHome ||
    (typeof from === 'string' &&
      from.startsWith('/') &&
      from !== '/' &&
      from !== '/login' &&
      from !== '/register')
  ) {
    rememberAuthBackTarget('/home')
    return '/home'
  }

  // Landing → Sign in, or returning from Terms with cleared state → keep landing
  if (from === '/' || from === '/login' || from === '/register') {
    rememberAuthBackTarget('/')
    return '/'
  }

  // No new signal (e.g. back from Terms with replace + empty state) → keep prior
  return getAuthBackTarget('/')
}

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
    sessionStorage.removeItem(AUTH_BACK_TARGET_KEY)
  } catch {
    /* ignore storage errors */
  }
}

/** Wipe SPA nav memory so a later login cannot resume /account etc. */
export function clearSessionNavigationState() {
  clearRememberedNavOrigin()
  try {
    const keysToRemove = []
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i)
      if (
        key &&
        (key.startsWith('pgxplore_return_') ||
          key === 'pgxplore_scroll_map' ||
          key === 'pgxplore_scroll_pending')
      ) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key))
  } catch {
    /* ignore */
  }
}

/**
 * Log out, clear nav/scroll session state, and hard-replace to landing
 * so browser history cannot resurrect a protected return path.
 */
export function logoutToLanding(logoutFn) {
  clearSessionNavigationState()
  logoutFn?.()
  if (typeof window !== 'undefined') {
    window.location.replace('/')
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

/**
 * Where to send the user AFTER a successful login/register.
 * `location.state.from` is often `/` (landing Sign in) for the back button —
 * that must NOT be reused as the post-auth destination (use /home instead).
 * Deep links like /saved, /pg/:id, /account are preserved.
 */
export function resolvePostAuthPath(candidate, fallback = '/home') {
  if (typeof candidate !== 'string' || !candidate.startsWith('/')) return fallback
  const path = getPathname(candidate)
  if (
    !path ||
    path === '/' ||
    path === '/login' ||
    path === '/register' ||
    path === '/admin-login' ||
    isLegalPage(path) ||
    path.startsWith('/admin')
  ) {
    return fallback
  }
  return candidate
}

/** Central helper: send unauthenticated users to login without breaking browser history. */
export function redirectToLogin(navigate, { from, location, replace = true }) {
  const origin = location?.state?.[NAV_ORIGIN_KEY] ?? location?.state?.origin ?? getRememberedNavOrigin()
  if (origin) rememberNavOrigin(origin)
  if (location?.pathname === '/home') markLoginRedirectFromHome()
  rememberAuthBackTarget('/home')

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
  if (/^\/owner\/[^/]+$/.test(pathname)) {
    const id = pathname.split('/').pop()
    return `/pg/${id}`
  }
  if (pathname === '/listings') return '/home'
  if (pathname === '/saved') return '/home'
  if (isLegalPage(pathname)) {
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
  const onLegal = isLegalPage(location.pathname)

  // Prefer route defaults over a stale fallback so legal pages exit to /home,
  // not landing, when `from` is missing or points at the current legal page.
  const candidates = [fromState, fromStorage, getBackPath(location.pathname), fallback]

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate.startsWith('/') || candidate === current) {
      continue
    }
    // Don't bounce between Terms / Help / Privacy — leave the legal cluster.
    if (onLegal && isLegalPage(getPathname(candidate))) continue
    // Never dump in-app back onto landing — that leaves no trap and the next
    // swipe closes the app. Landing is only via /home logout confirm.
    if (getPathname(candidate) === '/' && location.pathname !== '/') continue
    return candidate
  }

  const defaultBack = getBackPath(location.pathname)
  if (defaultBack !== current && getPathname(defaultBack) !== '/') return defaultBack
  if (fallback !== current && getPathname(fallback) !== '/') return fallback
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
