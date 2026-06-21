import { apiRequest } from './client'

export async function fetchProfileApi() {
  return apiRequest('/api/users/me')
}

export async function fetchUserSummaryApi() {
  return apiRequest('/api/users/me/summary')
}

export async function updateProfileApi({ name, phone }) {
  return apiRequest('/api/users/me', {
    method: 'PUT',
    body: { name, phone },
  })
}
