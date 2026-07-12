import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminStatCard from '../../components/admin/AdminStatCard'
import ActivityList from '../../components/admin/ActivityList'
import PgSharingOverviewList from '../../components/admin/PgSharingOverviewList'
import QuickActionsHighlights from '../../components/admin/QuickActionsHighlights'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { displayCurrency } from '../../utils/displayValue'
import { isBackendPgOwner } from '../../utils/pgPermissions'

const PREVIEW_LIMIT = 3

function ShowMoreLink({ to, total }) {
  if (total <= PREVIEW_LIMIT) return null
  return (
    <Link to={to} className="text-sm font-medium text-brand-emphasis hover:underline">
      Show more ({total - PREVIEW_LIMIT} more)
    </Link>
  )
}

function useMatchPanelHeight(sourceRef) {
  const [height, setHeight] = useState(undefined)

  useEffect(() => {
    const source = sourceRef.current
    if (!source) return undefined

    const media = window.matchMedia('(min-width: 1024px)')

    const sync = () => {
      if (!media.matches) {
        setHeight(undefined)
        return
      }
      setHeight(source.offsetHeight)
    }

    const observer = new ResizeObserver(sync)
    observer.observe(source)
    media.addEventListener('change', sync)
    sync()

    return () => {
      observer.disconnect()
      media.removeEventListener('change', sync)
    }
  }, [sourceRef])

  return height
}

export default function AdminOverviewPage() {
  const activitiesRef = useRef(null)
  const pairedHeight = useMatchPanelHeight(activitiesRef)
  const { session } = useAuth()
  const { stats, state, listingsLoading, listingsError } = useAdmin()
  const isOwner = isBackendPgOwner(session)
  const activities = state.activities || []
  const pgs = state.pgs || []
  const previewActivities = activities.slice(0, PREVIEW_LIMIT)
  const previewPgs = pgs.slice(0, PREVIEW_LIMIT)

  return (
    <div className="admin-overview space-y-4">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total PGs" value={stats.totalPGs} />
        <AdminStatCard label="Total Rooms" value={stats.totalRooms} />
        <AdminStatCard label="Occupied Rooms" value={stats.occupiedRooms} tone="amber" />
        <AdminStatCard label="Vacant Rooms" value={stats.vacantRooms} tone="green" />
        <AdminStatCard label="Total Users" value={stats.totalUsers} />
        <AdminStatCard label="Pending Requests" value={stats.pendingDeletionRequests} tone="amber" />
        <AdminStatCard label="Total Revenue" value={displayCurrency(stats.totalRevenue)} sub="Approved & completed" />
        <AdminStatCard label="Total Beds" value={stats.totalBeds} />
      </div>

      <div className="admin-overview-split">
        <div ref={activitiesRef} className="admin-panel admin-panel--activities">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="admin-panel-title">Recent Activities</h2>
            <ShowMoreLink to="/admin/activities" total={activities.length} />
          </div>
          <div className="mt-3">
            <ActivityList activities={previewActivities} />
          </div>
          {activities.length > PREVIEW_LIMIT ? (
            <div className="mt-3 border-t border-app pt-3">
              <Link to="/admin/activities" className="btn-secondary w-full text-center text-sm">
                View all activities
              </Link>
            </div>
          ) : null}
        </div>

        <div
          className="admin-panel admin-panel--quick admin-panel--paired"
          style={pairedHeight ? { height: pairedHeight } : undefined}
        >
          <h2 className="admin-panel-title">Quick actions</h2>
          <div className="admin-quick-btns">
            <Link to="/admin/pgs/new" className="btn-primary text-center">
              Add New PG
            </Link>
            {isOwner ? (
              <>
                <Link to="/admin/pgs" className="btn-secondary text-center">
                  All PGs
                </Link>
                <Link to="/admin/my-pgs" className="btn-secondary text-center">
                  My PGs
                </Link>
              </>
            ) : (
              <Link to="/admin/pgs" className="btn-secondary text-center">
                PG Management
              </Link>
            )}
            <Link to="/admin/requests" className="btn-secondary text-center">
              Requests
            </Link>
            <Link to="/admin/analytics" className="btn-secondary text-center">
              View Analytics
            </Link>
          </div>
          <QuickActionsHighlights stats={stats} pgs={pgs} />
        </div>
      </div>

      <div className="admin-panel admin-panel--fit">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="admin-panel-title">PG sharing overview</h2>
          <div className="flex flex-wrap items-center gap-3">
            <ShowMoreLink to="/admin/sharing-overview" total={pgs.length} />
            <Link to="/admin/pgs" className="text-sm text-brand-emphasis hover:underline">
              {isOwner ? 'Browse all PGs' : 'Manage PGs'}
            </Link>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">
          {isOwner
            ? 'Configured sharing types and starting rent across all listings on the platform.'
            : 'Configured sharing types and starting rent across your listings.'}
        </p>
        <div className="mt-3">
          {listingsLoading ? (
            <p className="text-sm text-muted">Loading PG listings…</p>
          ) : (
            <PgSharingOverviewList
              pgs={previewPgs}
              emptyMessage={
                listingsError ? 'Could not load listings from the server.' : undefined
              }
            />
          )}
        </div>
        {pgs.length > PREVIEW_LIMIT ? (
          <div className="mt-3 border-t border-app pt-3">
            <Link to="/admin/sharing-overview" className="btn-secondary w-full text-center text-sm">
              View all PG sharing details
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
