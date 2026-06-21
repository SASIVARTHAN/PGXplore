import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import EmptyState from '../components/EmptyState'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import PGCard from '../components/PGCard'
import { useToast } from '../components/Toast'
import { fetchFavoritesApi } from '../api/favorites'
import { fetchUserSummaryApi } from '../api/users'
import { useAuth } from '../contexts/AuthContext'
import { formatRoleLabel } from '../utils/auth'

export default function UserAccountPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { session, isAccountUser, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [savedPGs, setSavedPGs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  useEffect(() => {
    if (!isAccountUser) return

    let active = true
    async function load() {
      setLoading(true)
      try {
        const [userSummary, favorites] = await Promise.all([
          fetchUserSummaryApi(),
          fetchFavoritesApi(),
        ])
        if (!active) return
        setSummary(userSummary)
        setSavedPGs(favorites)
      } catch (err) {
        if (active) showToast(err?.message || 'Could not load account data.', 'error')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [isAccountUser, showToast])

  if (!isAccountUser) {
    return <Navigate to="/login" replace state={{ from: '/account' }} />
  }

  const handleLogout = () => {
    logout()
    setLogoutConfirmOpen(false)
    showToast('Signed out.')
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
      <BackButton fallback="/home" />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-main">My account</h1>
          <p className="mt-2 text-muted">Your profile and saved PGs are stored on the server per account.</p>
        </div>
        <button type="button" onClick={() => setLogoutConfirmOpen(true)} className="btn-secondary">
          Sign out
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-muted">Loading account…</p>
      ) : (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Saved PGs', value: summary?.savedPgCount ?? 0 },
              { label: 'Reviews', value: summary?.reviewCount ?? 0 },
              { label: 'Recently viewed', value: summary?.recentlyViewedCount ?? 0 },
              { label: 'Member since', value: summary?.createdAt ? new Date(summary.createdAt).toLocaleDateString() : '—' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-app bg-card p-5">
                <p className="text-2xl font-bold text-brand-emphasis">{stat.value}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </section>

          <section className="mt-8 rounded-2xl border border-app bg-card p-5">
            <h2 className="text-lg font-semibold text-main">Profile</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Name</dt>
                <dd className="font-medium text-main">{summary?.name || session?.name}</dd>
              </div>
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="font-medium text-main">{summary?.email || session?.email}</dd>
              </div>
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="font-medium text-main">{summary?.phone || session?.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Account type</dt>
                <dd className="font-medium text-main">{formatRoleLabel(summary?.role || session?.backendRole || 'USER')}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-main">Saved PGs</h2>
              <Link to="/saved" className="text-sm font-medium text-brand-emphasis hover:underline">
                View all
              </Link>
            </div>
            {savedPGs.length === 0 ? (
              <EmptyState
                title="No saved PGs yet"
                description="Tap the heart on any PG to save it to your account."
                actionLabel="Browse PGs"
                onAction={() => navigate('/listings')}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {savedPGs.slice(0, 6).map((pg) => (
                  <PGCard key={pg.id} pg={pg} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
      <LogoutConfirmModal
        open={logoutConfirmOpen}
        onStay={() => setLogoutConfirmOpen(false)}
        onLogout={handleLogout}
        title="Leave dashboard?"
        message="Do you want to log out and return to the landing page, or stay signed in?"
      />
    </div>
  )
}
