const SCROLL_MAP_KEY = 'pgxplore_scroll_map'
const PENDING_RESTORE_KEY = 'pgxplore_scroll_pending'

export function getScrollKey(location) {
  if (!location) return '/'
  if (typeof location === 'string') return location
  return `${location.pathname}${location.search || ''}`
}

export function getScrollTop(scrollContainer) {
  if (typeof window === 'undefined') return 0
  return Math.max(
    scrollContainer?.scrollTop || 0,
    window.scrollY || 0,
    document.documentElement?.scrollTop || 0,
    document.body?.scrollTop || 0,
  )
}

export function setScrollTop(scrollContainer, top) {
  if (typeof window === 'undefined') return
  const y = Math.max(0, Number(top) || 0)
  if (scrollContainer) scrollContainer.scrollTop = y
  window.scrollTo(0, y)
  document.documentElement.scrollTop = y
  document.body.scrollTop = y
}

function readMap() {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_MAP_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeMap(map) {
  try {
    sessionStorage.setItem(SCROLL_MAP_KEY, JSON.stringify(map))
  } catch {
    /* ignore quota / private mode */
  }
}

/** Call when tapping Terms / Help / Privacy so back can restore this spot. */
export function rememberScrollForPath(path) {
  if (!path || typeof window === 'undefined') return
  const main = document.querySelector('main')
  const map = readMap()
  map[path] = getScrollTop(main)
  writeMap(map)
}

export function readScrollForPath(path) {
  if (!path) return null
  const value = readMap()[path]
  return typeof value === 'number' ? value : null
}

/** Mark that the next mount of `path` should restore scroll / footer. */
export function markPendingScrollRestore(path) {
  if (!path || typeof window === 'undefined') return
  try {
    sessionStorage.setItem(PENDING_RESTORE_KEY, path)
  } catch {
    /* ignore */
  }
}

export function consumePendingScrollRestore() {
  if (typeof window === 'undefined') return null
  try {
    const path = sessionStorage.getItem(PENDING_RESTORE_KEY)
    if (path) sessionStorage.removeItem(PENDING_RESTORE_KEY)
    return path
  } catch {
    return null
  }
}

export function peekPendingScrollRestore() {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(PENDING_RESTORE_KEY)
  } catch {
    return null
  }
}

/**
 * Restore scroll for a path and bring the footer (click target) into view.
 * Retries because mobile layout settles after route paint.
 */
export function applyScrollRestore(path, scrollContainer, { forceFooter = true } = {}) {
  if (typeof window === 'undefined' || !path) return () => {}

  const saved = readScrollForPath(path)

  const run = () => {
    if (typeof saved === 'number' && saved > 0) {
      setScrollTop(scrollContainer, saved)
    }

    if (!forceFooter && !(typeof saved === 'number' && saved > 0)) return

    const footer =
      document.querySelector('footer.auth-footer') ||
      document.querySelector('footer')
    if (!footer) return

    footer.scrollIntoView({ block: 'end', behavior: 'auto' })
    if (typeof saved === 'number' && saved > 0) {
      setScrollTop(scrollContainer, saved)
    }
  }

  run()
  const timers = [0, 32, 80, 160, 320, 500].map((ms) => window.setTimeout(run, ms))
  const frame = requestAnimationFrame(run)

  return () => {
    cancelAnimationFrame(frame)
    timers.forEach((id) => window.clearTimeout(id))
  }
}
