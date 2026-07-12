import { addFavoriteApi, fetchFavoritesApi, removeFavoriteApi } from '../api/favorites'
import { fetchRecentlyViewedApi, trackRecentlyViewedApi } from '../api/recentlyViewed'
import { getSession } from './auth'

const LEGACY_SAVED_KEY = 'pgxplore_saved'
const LEGACY_RECENT_KEY = 'pgxplore_recent'

function savedKey(userId) {
  return userId ? `pgxplore_saved_${userId}` : LEGACY_SAVED_KEY
}

function recentKey(userId) {
  return userId ? `pgxplore_recent_${userId}` : LEGACY_RECENT_KEY
}

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

function currentUserId() {
  return getSession()?.id || null
}

function isApiUser() {
  return Boolean(getSession()?.accessToken)
}

export class LoginRequiredError extends Error {
  constructor(message = 'Please sign in to save PGs to your account.') {
    super(message)
    this.name = 'LoginRequiredError'
    this.needsLogin = true
  }
}

export function getSavedIds(userId = currentUserId()) {
  if (!userId) return []
  return read(savedKey(userId))
}

export function isSaved(id, userId = currentUserId()) {
  if (!userId) return false
  return getSavedIds(userId).includes(Number(id))
}

export async function toggleSaved(id) {
  if (!isApiUser()) {
    throw new LoginRequiredError()
  }

  const userId = currentUserId()
  const numId = Number(id)
  const key = savedKey(userId)

  if (isSaved(numId, userId)) {
    await removeFavoriteApi(numId)
    const next = getSavedIds(userId).filter((item) => item !== numId)
    write(key, next)
    return false
  }

  await addFavoriteApi(numId)
  write(key, [...getSavedIds(userId), numId])
  return true
}

export async function removeSaved(id) {
  if (!isApiUser()) {
    throw new LoginRequiredError()
  }

  const userId = currentUserId()
  const numId = Number(id)
  await removeFavoriteApi(numId)
  const next = getSavedIds(userId).filter((item) => item !== numId)
  write(savedKey(userId), next)
}

export async function syncSavedFromApi(userId = currentUserId()) {
  if (!isApiUser() || !userId) return []
  try {
    const favorites = await fetchFavoritesApi()
    const ids = favorites.map((pg) => pg.id)
    write(savedKey(userId), ids)
    return ids
  } catch {
    return getSavedIds(userId)
  }
}

export function getRecentIds(userId = currentUserId()) {
  if (!userId) return []
  return read(recentKey(userId))
}

export async function trackRecent(id) {
  const userId = currentUserId()
  const numId = Number(id)

  if (isApiUser()) {
    try {
      await trackRecentlyViewedApi(numId)
    } catch {
      /* fall through to local cache */
    }
  }

  if (!userId) return

  const key = recentKey(userId)
  const ids = getRecentIds(userId).filter((item) => item !== numId)
  write(key, [numId, ...ids].slice(0, 6))
}

export async function syncRecentFromApi(userId = currentUserId()) {
  if (!isApiUser() || !userId) return []
  try {
    const items = await fetchRecentlyViewedApi()
    const ids = items.map((pg) => pg.id)
    write(recentKey(userId), ids)
    return ids
  } catch {
    return getRecentIds(userId)
  }
}

export function clearUserStorageCache(userId) {
  if (!userId) return
  localStorage.removeItem(savedKey(userId))
  localStorage.removeItem(recentKey(userId))
}
