import { apiRequest } from './client'
import { mapPgListFromApi } from './mappers/pgListing'

export async function fetchFavoritesApi() {
  const data = await apiRequest('/api/users/me/favorites')
  return mapPgListFromApi(data || [])
}

export async function addFavoriteApi(pgId) {
  await apiRequest(`/api/users/me/favorites/${pgId}`, { method: 'POST' })
}

export async function removeFavoriteApi(pgId) {
  await apiRequest(`/api/users/me/favorites/${pgId}`, { method: 'DELETE' })
}
