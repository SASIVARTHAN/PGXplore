import {
  createReviewApi,
  deleteReviewApi,
  fetchReviewsForPg,
  updateReviewApi,
} from '../api/reviews'
import { getSession } from './auth'

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

function isApiUser() {
  return Boolean(getSession()?.accessToken)
}

export function getUserReviews(pgId) {
  return readAll()[String(pgId)] || []
}

export async function loadReviewsForPg(pgId) {
  try {
    const session = getSession()
    const apiReviews = await fetchReviewsForPg(pgId, { currentUserId: session?.id })
    const userReviews = apiReviews.filter((r) => r.isUser)
    const builtInReviews = apiReviews.filter((r) => !r.isUser)
    return { userReviews, builtInReviews }
  } catch {
    return { userReviews: getUserReviews(pgId), builtInReviews: [] }
  }
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

export async function submitUserReview(pgId, review) {
  if (isApiUser()) {
    const session = getSession()
    const data = await createReviewApi(
      {
        pgId,
        rating: review.rating,
        reviewText: review.text,
      },
      session?.id,
    )
    return data
  }
  return addUserReview(pgId, review)
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

export async function saveUserReview(pgId, reviewId, updates) {
  if (isApiUser()) {
    const session = getSession()
    const data = await updateReviewApi(
      reviewId,
      {
        pgId,
        rating: updates.rating,
        reviewText: updates.text,
      },
      session?.id,
    )
    return data
  }
  return updateUserReview(pgId, reviewId, updates)
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

export async function removeUserReview(pgId, reviewId) {
  if (isApiUser()) {
    await deleteReviewApi(reviewId)
    return true
  }
  return deleteUserReview(pgId, reviewId)
}

export function canEditReview(review) {
  if (!review?.at) return false
  return Date.now() - new Date(review.at).getTime() <= EDIT_WINDOW_MS
}
