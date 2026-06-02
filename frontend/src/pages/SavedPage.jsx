import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import EmptyState from '../components/EmptyState'
import PGCard from '../components/PGCard'
import SavedPGCard from '../components/SavedPGCard'
import { useToast } from '../components/Toast'
import { useListings } from '../contexts/AdminContext'
import { getRecentIds, getSavedIds, removeSaved } from '../utils/storage'

export default function SavedPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { listings } = useListings()
  const [savedVersion, setSavedVersion] = useState(0)

  const recentIds = getRecentIds()

  const savedPGs = useMemo(() => {
    return getSavedIds()
      .map((id) => listings.find((pg) => pg.id === id))
      .filter(Boolean)
  }, [savedVersion, listings])

  const recentPGs = useMemo(
    () => recentIds.map((id) => listings.find((pg) => pg.id === id)).filter(Boolean),
    [recentIds, listings],
  )

  const handleRemove = useCallback(
    (id) => {
      removeSaved(id)
      setSavedVersion((v) => v + 1)
      showToast('Removed from saved PGs')
    },
    [showToast],
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
      <BackButton fallback="/home" />
      <h1 className="mt-4 text-3xl font-bold text-main">Saved PGs</h1>
      <p className="mt-2 text-muted">Your saved listings are stored locally on this device.</p>

      {savedPGs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No saved PGs yet"
            description="Tap the heart on any PG detail page to save it for later."
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

      {recentPGs.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold text-main">Recently Viewed</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentPGs.map((pg) => (
              <PGCard key={pg.id} pg={pg} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
