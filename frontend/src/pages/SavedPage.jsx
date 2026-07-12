import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import EmptyState from '../components/EmptyState'
import PageLoading from '../components/PageLoading'
import SavedPGCard from '../components/SavedPGCard'
import { useToast } from '../components/Toast'
import { fetchFavoritesApi } from '../api/favorites'
import { useAuth } from '../contexts/AuthContext'
import { usePageRefresh } from '../contexts/RefreshContext'
import { removeSaved } from '../utils/storage'

export default function SavedPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { isAccountUser, bootstrapping } = useAuth()
  const [savedPGs, setSavedPGs] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSavedPGs = useCallback(async () => {
    if (!isAccountUser) {
      setSavedPGs([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const favorites = await fetchFavoritesApi()
      setSavedPGs(favorites)
    } catch (err) {
      showToast(err?.message || 'Could not load saved PGs.', 'error')
    } finally {
      setLoading(false)
    }
  }, [isAccountUser, showToast])

  useEffect(() => {
    if (bootstrapping) return
    loadSavedPGs()
  }, [bootstrapping, loadSavedPGs])

  usePageRefresh(loadSavedPGs)

  const handleRemove = useCallback(
    async (id) => {
      try {
        await removeSaved(id)
        setSavedPGs((prev) => prev.filter((pg) => pg.id !== id))
        showToast('Removed from saved PGs')
      } catch {
        showToast('Could not remove saved PG.', 'error')
      }
    },
    [showToast],
  )

  if (bootstrapping) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <BackButton fallback="/home" />
        <PageLoading label="Loading…" />
      </div>
    )
  }

  if (!isAccountUser) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <BackButton fallback="/home" />
        <div className="mt-8">
          <EmptyState
            title="Sign in to save PGs"
            description="Saved PGs are stored per account in the database. Create an account or sign in to save and view listings."
            actionLabel="Sign in"
            onAction={() => navigate('/login', { state: { from: '/saved' } })}
          />
          <p className="mt-4 text-center text-sm text-muted">
            New here?{' '}
            <Link to="/register" state={{ from: '/saved' }} className="font-medium text-brand-emphasis hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <BackButton fallback="/home" />
        <PageLoading label="Loading saved PGs…" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BackButton fallback="/home" />
      <h1 className="mt-4 text-3xl font-bold text-main">Saved PGs</h1>
      <p className="mt-2 text-muted">Saved to your account — synced across devices when you sign in.</p>

      {savedPGs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No saved PGs yet"
            description="Tap the heart on any PG detail page to save it to your account."
            actionLabel="Browse PGs"
            onAction={() => navigate('/listings')}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedPGs.map((pg) => (
            <SavedPGCard key={pg.id} pg={pg} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
