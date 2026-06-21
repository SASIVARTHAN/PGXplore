import { useMemo } from 'react'
import { FaStar } from 'react-icons/fa6'
import AdminDataTable from '../../components/admin/AdminDataTable'
import AdminStatCard from '../../components/admin/AdminStatCard'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminReviewsPage() {
  const { state, deleteReview } = useAdmin()
  const { showToast } = useToast()

  const rows = useMemo(() => {
    const list = []
    state.pgs.forEach((pg) => {
      ;(pg.reviews || []).forEach((r, i) => {
        const key = `builtin-${pg.id}-${i}`
        if (state.deletedReviewIds?.includes(key)) return
        list.push({
          _key: key,
          reviewKey: key,
          pgName: pg.name,
          name: r.name,
          rating: r.rating,
          text: r.text,
          source: 'Listing',
        })
      })
    })
    return list
  }, [state.pgs, state.deletedReviewIds])

  const avgRating = useMemo(() => {
    if (!rows.length) return '—'
    const sum = rows.reduce((s, r) => s + r.rating, 0)
    return (sum / rows.length).toFixed(1)
  }, [rows])

  const columns = [
    { key: 'pgName', label: 'PG' },
    { key: 'name', label: 'Reviewer' },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <span className="inline-flex items-center gap-1">
          <FaStar aria-hidden className="text-amber-500" /> {r.rating}
        </span>
      ),
    },
    { key: 'text', label: 'Review', render: (r) => <span className="line-clamp-2 max-w-xs">{r.text}</span> },
    { key: 'source', label: 'Source' },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="action-btn action-btn--danger"
          onClick={() => {
            deleteReview(r.reviewKey)
            showToast('Review removed.')
          }}
        >
          Delete
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total reviews" value={rows.length} />
        <AdminStatCard label="Average rating" value={avgRating} />
        <AdminStatCard label="PGs reviewed" value={new Set(rows.map((r) => r.pgName)).size} />
      </div>
      <AdminDataTable columns={columns} rows={rows} searchKeys={['pgName', 'name', 'text']} searchPlaceholder="Search reviews…" />
    </div>
  )
}
