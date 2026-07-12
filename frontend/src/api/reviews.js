import { apiRequest } from './client'

export function mapReviewFromApi(review, currentUserId) {
  if (!review) return null
  const isOwn = currentUserId != null && String(review.userId) === String(currentUserId)
  return {
    id: String(review.id),
    userId: review.userId,
    name: review.userName,
    rating: review.rating,
    text: review.reviewText,
    at: review.createdAt,
    isUser: isOwn,
  }
}

export async function fetchReviewsForPg(pgId, { page = 0, size = 20, currentUserId } = {}) {
  const data = await apiRequest(`/api/reviews/pg/${pgId}`, {
    params: { page, size },
    auth: false,
  })
  return (data?.content || []).map((r) => mapReviewFromApi(r, currentUserId)).filter(Boolean)
}

export async function createReviewApi({ pgId, rating, reviewText }, currentUserId) {
  const data = await apiRequest('/api/reviews', {
    method: 'POST',
    body: { pgId: Number(pgId), rating, reviewText },
  })
  return mapReviewFromApi(data, currentUserId)
}

export async function updateReviewApi(id, { pgId, rating, reviewText }, currentUserId) {
  const data = await apiRequest(`/api/reviews/${id}`, {
    method: 'PUT',
    body: { pgId: Number(pgId), rating, reviewText },
  })
  return mapReviewFromApi(data, currentUserId)
}

export async function deleteReviewApi(id) {
  await apiRequest(`/api/reviews/${id}`, { method: 'DELETE' })
}
