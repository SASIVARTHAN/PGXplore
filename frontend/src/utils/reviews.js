const REVIEWS_KEY = 'pgxplore_user_reviews'
const EDIT_WINDOW_MS = 60 * 60 * 1000

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeAll(data) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(data))
}

export function getUserReviews(pgId) {
  return readAll()[String(pgId)] || []
}

export function addUserReview(pgId, review) {
  const all = readAll()
  const key = String(pgId)
  const list = all[key] || []
  const entry = {
    ...review,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
  }
  all[key] = [entry, ...list]
  writeAll(all)
  return entry
}

export function updateUserReview(pgId, reviewId, updates) {
  const all = readAll()
  const key = String(pgId)
  const list = all[key] || []
  const index = list.findIndex((r) => r.id === reviewId)
  if (index === -1) return null

  const existing = list[index]
  if (!canEditReview(existing)) return null

  list[index] = {
    ...existing,
    ...updates,
    editedAt: new Date().toISOString(),
  }
  all[key] = list
  writeAll(all)
  return list[index]
}

export function deleteUserReview(pgId, reviewId) {
  const all = readAll()
  const key = String(pgId)
  const list = all[key] || []
  const next = list.filter((r) => r.id !== reviewId)
  if (next.length === list.length) return false
  all[key] = next
  writeAll(all)
  return true
}

export function canEditReview(review) {
  if (!review?.at) return false
  return Date.now() - new Date(review.at).getTime() <= EDIT_WINDOW_MS
}
