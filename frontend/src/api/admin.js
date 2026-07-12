import { apiRequest } from './client'

export async function fetchOwnerApprovalsApi() {
  return apiRequest('/api/admin/owner-approvals')
}

export async function approveOwnerApi(ownerId) {
  return apiRequest(`/api/admin/owner-approvals/${ownerId}/approve`, { method: 'POST' })
}

export async function rejectOwnerApi(ownerId) {
  return apiRequest(`/api/admin/owner-approvals/${ownerId}/reject`, { method: 'POST' })
}

export async function fetchAdminStatsApi() {
  return apiRequest('/api/admin/stats')
}
