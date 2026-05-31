const SAVED_KEY = 'pgxplore_saved'
const RECENT_KEY = 'pgxplore_recent'

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getSavedIds() {
  return read(SAVED_KEY)
}

export function isSaved(id) {
  return getSavedIds().includes(id)
}

export function toggleSaved(id) {
  const ids = getSavedIds()
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
  write(SAVED_KEY, next)
  return next.includes(id)
}

export function removeSaved(id) {
  const next = getSavedIds().filter((item) => item !== id)
  write(SAVED_KEY, next)
}

export function getRecentIds() {
  return read(RECENT_KEY)
}

export function trackRecent(id) {
  const ids = getRecentIds().filter((item) => item !== id)
  write(RECENT_KEY, [id, ...ids].slice(0, 6))
}
