import { Link } from 'react-router-dom'
import AdminStatCard from '../../components/admin/AdminStatCard'
import { useAdmin } from '../../contexts/AdminContext'
import { formatCurrentBillIncluded, formatNoticePeriod } from '../../utils/formatPolicy'
import { getSharingLabel, sharingToEntries } from '../../utils/sharingTypes'
import { getStartingRent } from '../../utils/vacancy'

function formatMoney(n) {
  return `₹${n.toLocaleString('en-IN')}`
}

export default function AdminOverviewPage() {
  const { stats, state } = useAdmin()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total PGs" value={stats.totalPGs} />
        <AdminStatCard label="Total Rooms" value={stats.totalRooms} />
        <AdminStatCard label="Occupied Rooms" value={stats.occupiedRooms} tone="amber" />
        <AdminStatCard label="Vacant Rooms" value={stats.vacantRooms} tone="green" />
        <AdminStatCard label="Total Users" value={stats.totalUsers} />
        <AdminStatCard label="Pending Requests" value={stats.pendingDeletionRequests} tone="amber" />
        <AdminStatCard label="Total Revenue" value={formatMoney(stats.totalRevenue)} sub="Approved & completed" />
        <AdminStatCard label="Total Beds" value={stats.totalBeds} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-panel">
          <div className="flex items-center justify-between">
            <h2 className="admin-panel-title">Recent Activities</h2>
          </div>
          <ul className="admin-activity-list">
            {state.activities.slice(0, 6).map((a) => (
              <li key={a.id} className="admin-activity-item">
                <div>
                  <p className="font-medium text-main">{a.action}</p>
                  <p className="text-muted">{a.detail}</p>
                  <p className="mt-1 text-xs text-muted">{new Date(a.at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-panel">
          <div className="flex items-center justify-between">
            <h2 className="admin-panel-title">Quick actions</h2>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link to="/admin/pgs/new" className="btn-primary text-center">
              Add New PG
            </Link>
            <Link to="/admin/pgs" className="btn-secondary text-center">
              PG Management
            </Link>
            <Link to="/admin/requests" className="btn-secondary text-center">
              Requests
            </Link>
            <Link to="/admin/analytics" className="btn-secondary text-center">
              View Analytics
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted">
            Beds: {stats.occupiedBeds} occupied / {stats.totalBeds} total ({stats.vacantBeds} vacant beds)
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="admin-panel-title">PG sharing overview</h2>
          <Link to="/admin/pgs" className="text-sm text-brand-emphasis hover:underline">
            Manage PGs
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">
          Configured sharing types and starting rent across your listings.
        </p>
        <ul className="mt-4 space-y-3">
          {state.pgs.slice(0, 8).map((pg) => (
            <li
              key={pg.id}
              className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-main">{pg.name}</p>
                <p className="text-xs text-muted">{pg.area}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <div className="sharing-type-chips">
                  {sharingToEntries(pg.sharing).map((entry) => (
                    <span key={entry.type} className="sharing-type-chip">
                      {getSharingLabel(entry.type)}
                    </span>
                  ))}
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-brand-emphasis">
                    from ₹{getStartingRent(pg.sharing).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted">
                    {formatNoticePeriod(pg.noticePeriodDays)} notice · {formatCurrentBillIncluded(pg.currentBillIncluded)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
