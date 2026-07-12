import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import PgSharingOverviewList from '../../components/admin/PgSharingOverviewList'
import AdminScrollPanel from '../../components/admin/AdminScrollPanel'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { useIncrementalList } from '../../hooks/useIncrementalList'
import { isBackendPgOwner } from '../../utils/pgPermissions'

const PAGE_SIZE = 5

export default function AdminSharingOverviewPage() {
  const scrollRef = useRef(null)
  const { session } = useAuth()
  const { state } = useAdmin()
  const isOwner = isBackendPgOwner(session)
  const pgs = state.pgs || []
  const { visibleItems, hasMore, sentinelRef, total, loadedCount } = useIncrementalList(
    pgs,
    PAGE_SIZE,
    scrollRef,
  )

  return (
    <div className="admin-page-fill">
      <Link
        to="/admin"
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300"
      >
        <FiArrowLeft aria-hidden /> Back to dashboard
      </Link>

      <AdminScrollPanel
        ref={scrollRef}
        title="PG sharing overview"
        subtitle={
          isOwner
            ? `Showing ${loadedCount} of ${total} approved ${total === 1 ? 'listing' : 'listings'} on the platform. Scroll inside the card to load more.`
            : `Showing ${loadedCount} of ${total} ${total === 1 ? 'PG' : 'PGs'}. Scroll inside the card to load more.`
        }
        headerActions={
          <Link to="/admin/pgs" className="text-sm text-brand-emphasis hover:underline">
            {isOwner ? 'Browse all PGs' : 'Manage PGs'}
          </Link>
        }
        footer={
          hasMore ? (
            <div ref={sentinelRef} className="admin-loading" aria-hidden />
          ) : total > PAGE_SIZE ? (
            <p className="text-center text-sm text-muted">All listings loaded.</p>
          ) : null
        }
      >
        <PgSharingOverviewList pgs={visibleItems} />
      </AdminScrollPanel>
    </div>
  )
}
