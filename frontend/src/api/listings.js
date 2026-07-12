import { getSession } from '../utils/auth'
import { apiRequest } from './client'
import { mapGenderToApi, mapPgFromApi, mapPgListFromApi, mapPgToApiRequest } from './mappers/pgListing'

export async function fetchAllListings({ page = 0, size = 100 } = {}) {
  const data = await apiRequest('/api/pg/all', {
    params: { page, size, sortBy: 'createdAt', sortDir: 'desc' },
    auth: false,
  })
  return mapPgListFromApi(data?.content || [])
}

export async function fetchAdminListings({ page = 0, size = 100 } = {}) {
  const data = await apiRequest('/api/pg/admin/all', {
    params: { page, size, sortBy: 'createdAt', sortDir: 'desc' },
  })
  return mapPgListFromApi(data?.content || [])
}

export async function fetchMyListings() {
  const data = await apiRequest('/api/pg/owner/me')
  return mapPgListFromApi(data || [])
}

export async function fetchPendingListings() {
  const data = await apiRequest('/api/pg/admin/pending')
  return mapPgListFromApi(data || [])
}

export async function fetchPgById(id) {
  const session = getSession()
  const data = await apiRequest(`/api/pg/${id}`, {
    auth: Boolean(session?.accessToken),
  })
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

  const data = await apiRequest('/api/pg/search', { params })
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

export async function approvePgListingApi(id) {
  const data = await apiRequest(`/api/pg/${id}/approve`, { method: 'POST' })
  return mapPgFromApi(data)
}

export async function rejectPgListingApi(id) {
  const data = await apiRequest(`/api/pg/${id}/reject`, { method: 'POST' })
  return mapPgFromApi(data)
}
