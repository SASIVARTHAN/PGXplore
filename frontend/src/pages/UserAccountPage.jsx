import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import PageLoading from '../components/PageLoading'
import ThemeSwitch from '../components/ThemeSwitch'
import { useToast } from '../components/Toast'
import { fetchUserSummaryApi } from '../api/users'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { formatRoleLabel } from '../utils/auth'
import { logoutToLanding } from '../utils/navigation'

export default function UserAccountPage() {
  const { showToast } = useToast()
  const { session, isAccountUser, logout, bootstrapping } = useAuth()
  const { isDark } = useTheme()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)

  useEffect(() => {
    if (bootstrapping || !isAccountUser) return

    let active = true
    async function load() {
      setLoading(true)
      try {
        const userSummary = await fetchUserSummaryApi()
        if (!active) return
        setSummary(userSummary)
      } catch (err) {
        if (active) showToast(err?.message || 'Could not load account data.', 'error')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [bootstrapping, isAccountUser, showToast])

  if (bootstrapping) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <BackButton to="/home" fallback="/home" />
        <PageLoading label="Loading account…" />
      </div>
    )
  }

  if (!isAccountUser) {
    return <Navigate to="/login" replace state={{ from: '/account' }} />
  }

  const handleLogout = () => {
    setLogoutConfirmOpen(false)
    logoutToLanding(logout)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <BackButton to="/home" fallback="/home" />
      {loading ? (
        <PageLoading label="Loading account…" />
      ) : (
        <>
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-main">My account</h1>
            <p className="mt-2 text-muted">
              View and manage your profile details. Change appearance anytime, or sign out below.
            </p>
          </div>

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
                <dd className="font-medium text-main">
                  {formatRoleLabel(summary?.role || session?.backendRole || 'USER')}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-8 rounded-2xl border border-app bg-card p-5">
            <h2 className="text-lg font-semibold text-main">Appearance</h2>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-main">Dark mode</p>
                <p className="text-sm text-muted">
                  {isDark ? 'Dark theme is on.' : 'Light theme is on.'}
                </p>
              </div>
              <ThemeSwitch />
            </div>
          </section>

          <div className="mt-10 flex justify-center sm:justify-start">
            <button type="button" onClick={() => setLogoutConfirmOpen(true)} className="btn-secondary w-full sm:w-auto">
              Sign out
            </button>
          </div>
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
