import { apiRequest } from './client'
import { mapPgListFromApi } from './mappers/pgListing'

export async function trackRecentlyViewedApi(pgId) {
  await apiRequest(`/api/recently-viewed/${pgId}`, { method: 'POST' })
}

export async function fetchRecentlyViewedApi() {
  const data = await apiRequest('/api/recently-viewed')
  return mapPgListFromApi(data || [])
}
