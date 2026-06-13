import { apiRequest } from './client'
import { mapGenderToApi, mapPgFromApi, mapPgListFromApi, mapPgToApiRequest } from './mappers/pgListing'

export async function fetchAllListings({ page = 0, size = 100 } = {}) {
  const data = await apiRequest('/api/pg/all', {
    params: { page, size, sortBy: 'createdAt', sortDir: 'desc' },
    auth: false,
  })
  return mapPgListFromApi(data?.content || [])
}

export async function fetchPgById(id) {
  const data = await apiRequest(`/api/pg/${id}`, { auth: false })
  return mapPgFromApi(data)
}

export async function searchListingsApi(filters = {}) {
  const params = {
    page: filters.page ?? 0,
    size: filters.size ?? 50,
    sortBy: filters.sortBy || 'rent',
    sortDir: filters.sortDir || 'asc',
    city: filters.city,
    area: filters.area,
    minRent: filters.minRent,
    maxRent: filters.maxRent,
    gender: filters.gender ? mapGenderToApi(filters.gender) : undefined,
    foodAvailable: filters.foodOnly ? true : undefined,
    ac: filters.acOnly ? true : undefined,
    availableBeds: filters.availableOnly ? 1 : undefined,
    keyword: filters.keyword || filters.query,
  }

  const data = await apiRequest('/api/pg/search', { params, auth: false })
  return {
    items: mapPgListFromApi(data?.content || []),
    total: data?.totalElements ?? 0,
  }
}

export async function createPgApi(pg) {
  const data = await apiRequest('/api/pg', {
    method: 'POST',
    body: mapPgToApiRequest(pg),
  })
  return mapPgFromApi(data)
}

export async function updatePgApi(id, pg) {
  const data = await apiRequest(`/api/pg/${id}`, {
    method: 'PUT',
    body: mapPgToApiRequest(pg),
  })
  return mapPgFromApi(data)
}

export async function deletePgApi(id) {
  await apiRequest(`/api/pg/${id}`, { method: 'DELETE' })
}
