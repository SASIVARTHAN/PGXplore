import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import ActivityList from '../../components/admin/ActivityList'
import AdminScrollPanel from '../../components/admin/AdminScrollPanel'
import { useAdmin } from '../../contexts/AdminContext'
import { useIncrementalList } from '../../hooks/useIncrementalList'

const PAGE_SIZE = 5

export default function AdminActivitiesPage() {
  const scrollRef = useRef(null)
  const { state } = useAdmin()
  const activities = state.activities || []
  const { visibleItems, hasMore, sentinelRef, total, loadedCount } = useIncrementalList(
    activities,
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
        title="Recent Activities"
        subtitle={`Showing ${loadedCount} of ${total} ${total === 1 ? 'entry' : 'entries'}. Scroll inside the card to load more.`}
        footer={
          hasMore ? (
            <div ref={sentinelRef} className="admin-loading" aria-hidden />
          ) : total > PAGE_SIZE ? (
            <p className="text-center text-sm text-muted">All activities loaded.</p>
          ) : null
        }
      >
        <ActivityList activities={visibleItems} />
      </AdminScrollPanel>
    </div>
  )
}
