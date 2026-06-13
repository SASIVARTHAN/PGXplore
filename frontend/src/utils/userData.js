import { fetchUserSummaryApi } from '../api/users'
import { clearUserStorageCache, syncRecentFromApi, syncSavedFromApi } from './storage'
import { getSession, saveSession } from './auth'

export async function syncUserDataAfterLogin(session) {
  if (!session?.accessToken) return session

  try {
    const summary = await fetchUserSummaryApi()
    const enriched = {
      ...session,
      name: summary.name || session.name,
      email: summary.email || session.email,
      phone: summary.phone || session.phone,
      savedPgCount: summary.savedPgCount ?? 0,
      reviewCount: summary.reviewCount ?? 0,
      recentlyViewedCount: summary.recentlyViewedCount ?? 0,
    }
    saveSession(enriched)
    await syncSavedFromApi(enriched.id)
    await syncRecentFromApi(enriched.id)
    return enriched
  } catch {
    return session
  }
}

export function clearUserDataOnLogout() {
  const session = getSession()
  if (session?.id) {
    clearUserStorageCache(session.id)
  }
}
