import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { pgListings } from '../data/pgData'
import { createNavState, saveReturnPath } from '../utils/navigation'
import { formatUpdatedAt, getStartingRent, getVacancySummary } from '../utils/vacancy'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const isAdmin = sessionStorage.getItem('pgxplore_admin') === 'true'
  const [listings, setListings] = useState(pgListings)

  const stats = useMemo(
    () => ({
      total: listings.length,
      withVacancy: listings.filter((pg) => getVacancySummary(pg.sharing).length > 0).length,
      featured: listings.filter((pg) => pg.featured).length,
    }),
    [listings],
  )

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />
  }

  const adminReturnPath = '/admin-dashboard'

  const handleLogout = () => {
    sessionStorage.removeItem('pgxplore_admin')
    navigate('/', { replace: true })
  }

  const openPg = (pgId) => {
    saveReturnPath(pgId, adminReturnPath)
  }

  const toggleFeatured = (id) => {
    setListings((prev) =>
      prev.map((pg) => (pg.id === id ? { ...pg, featured: !pg.featured } : pg)),
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-main">Admin Dashboard</h1>
          <p className="mt-1 text-muted">Manage PG listings and vacancy updates.</p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Listings', value: stats.total },
          { label: 'With Vacancies', value: stats.withVacancy },
          { label: 'Featured', value: stats.featured },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-app bg-card p-5">
            <p className="text-sm text-muted">{item.label}</p>
            <p className="text-3xl font-bold text-brand-emphasis">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-app bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-app bg-card-muted">
            <tr>
              <th className="px-4 py-3 font-semibold text-main">PG Name</th>
              <th className="px-4 py-3 font-semibold text-main">Area</th>
              <th className="px-4 py-3 font-semibold text-main">Rent</th>
              <th className="px-4 py-3 font-semibold text-main">Vacancy</th>
              <th className="px-4 py-3 font-semibold text-main">Updated</th>
              <th className="px-4 py-3 font-semibold text-main">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((pg) => {
              const vacancies = getVacancySummary(pg.sharing)
              return (
                <tr key={pg.id} className="border-b border-app last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`/pg/${pg.id}`}
                      state={createNavState(adminReturnPath)}
                      onClick={() => openPg(pg.id)}
                      className="text-brand-emphasis hover:underline"
                    >
                      {pg.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{pg.area}</td>
                  <td className="px-4 py-3 text-main">₹{getStartingRent(pg.sharing).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    {vacancies.length > 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400">{vacancies.length} type(s) open</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">Full</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatUpdatedAt(pg.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(pg.id)}
                      className="rounded-lg bg-card-muted px-2 py-1 text-xs font-medium text-main hover:opacity-80"
                    >
                      {pg.featured ? 'Unfeature' : 'Feature'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Add / Edit / Delete PG and backend sync will be available in Phase 2 with PostgreSQL.
      </p>
    </div>
  )
}
