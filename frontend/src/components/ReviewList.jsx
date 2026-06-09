import { useMemo, useState } from 'react'
import { FaRegStar, FaStar } from 'react-icons/fa6'
import ReviewForm from './ReviewForm'
import { formatRelativeTime } from '../utils/relativeTime'
import { canEditReview } from '../utils/reviews'

function Stars({ rating, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-amber-500 dark:text-amber-400 ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) =>
        i < Math.round(rating) ? <FaStar key={i} aria-hidden /> : <FaRegStar key={i} aria-hidden />,
      )}
    </span>
  )
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export default function ReviewList({
  reviews,
  userReviews = [],
  onSubmitReview,
  onUpdateReview,
  onDeleteReview,
  averageRating,
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const builtInReviews = useMemo(
    () => reviews.map((r) => ({ ...r, isUser: false, sortAt: r.at || '' })),
    [reviews],
  )

  const ownReviews = useMemo(
    () =>
      userReviews.map((r) => ({
        ...r,
        isUser: true,
        sortAt: r.at || '',
      })),
    [userReviews],
  )

  const allReviews = useMemo(() => {
    const merged = [...ownReviews, ...builtInReviews]
    return merged.sort((a, b) => {
      if (a.sortAt && b.sortAt) return new Date(b.sortAt) - new Date(a.sortAt)
      return 0
    })
  }, [ownReviews, builtInReviews])

  const editingReview = editingId ? userReviews.find((r) => r.id === editingId) : null

  const handleSubmit = (data) => {
    if (editingId && onUpdateReview) {
      onUpdateReview(editingId, data)
      setEditingId(null)
      setShowForm(false)
      return
    }
    onSubmitReview?.(data)
    setShowForm(false)
  }

  return (
    <div className="rounded-2xl border border-app bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-main">
          Reviews <span className="text-muted">({allReviews.length})</span>
        </h3>
        {onSubmitReview && !showForm && !editingId && (
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
            Write a review
          </button>
        )}
      </div>

      {averageRating != null && allReviews.length > 0 && (
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-card-muted p-4">
          <div className="text-center">
            <p className="text-3xl font-bold leading-none text-main">{averageRating.toFixed(1)}</p>
            <p className="mt-1 text-xs text-muted">out of 5</p>
          </div>
          <div className="border-l border-app pl-4">
            <Stars rating={averageRating} className="text-lg" />
            <p className="mt-1 text-sm text-muted">
              Based on {allReviews.length} review{allReviews.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      )}

      {(showForm || editingId) && (
        <div className="mt-4">
          <ReviewForm
            initialReview={editingReview}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setEditingId(null)
            }}
          />
        </div>
      )}

      <div className="mt-5 space-y-3">
        {allReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-app bg-card-muted/50 px-4 py-8 text-center">
            <p className="text-sm text-muted">No reviews yet. Be the first to share your experience.</p>
          </div>
        ) : (
          allReviews.map((review) => (
            <div key={review.id || `${review.name}-${review.text}`} className="rounded-xl border border-app bg-card-muted p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-emphasis dark:bg-brand-950/50"
                  >
                    {getInitials(review.name) || '?'}
                  </span>
                  <div>
                    <p className="font-medium text-main">
                      {review.name}
                      {review.isUser && (
                        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-emphasis dark:bg-brand-950/50">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {review.at ? formatRelativeTime(review.at) : ''}
                      {review.editedAt ? ' · edited' : ''}
                    </p>
                  </div>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-main">{review.text}</p>
              {review.isUser && (
                <div className="action-row mt-3">
                  {canEditReview(review) && onUpdateReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(review.id)
                      }}
                      className="btn-secondary text-xs"
                    >
                      Edit
                    </button>
                  )}
                  {onDeleteReview && (
                    <button
                      type="button"
                      onClick={() => onDeleteReview(review.id)}
                      className="btn-danger text-xs"
                    >
                      Delete
                    </button>
                  )}
                  {review.isUser && !canEditReview(review) && (
                    <span className="text-xs text-muted">Edit window closed (1 hr)</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
