import { useMemo, useState } from 'react'
import ReviewForm from './ReviewForm'
import { formatRelativeTime } from '../utils/relativeTime'
import { canEditReview } from '../utils/reviews'

function Stars({ rating }) {
  return (
    <span className="text-amber-500 dark:text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </span>
  )
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
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-lg font-semibold text-main">Reviews</h3>
        {averageRating != null && (
          <p className="text-sm text-muted">
            Average: <span className="font-semibold text-main">{averageRating.toFixed(1)}</span> (
            {allReviews.length} review{allReviews.length === 1 ? '' : 's'})
          </p>
        )}
      </div>

      {onSubmitReview && !showForm && !editingId && (
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary mt-4">
          Write a review
        </button>
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

      <div className="mt-4 space-y-3">
        {allReviews.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet. Be the first to share your experience.</p>
        ) : (
          allReviews.map((review) => (
            <div key={review.id || `${review.name}-${review.text}`} className="rounded-xl border border-app bg-card-muted p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-main">{review.name}</p>
                  <p className="text-xs text-muted">
                    {review.at ? formatRelativeTime(review.at) : ''}
                    {review.editedAt ? ' · edited' : ''}
                  </p>
                </div>
                <Stars rating={review.rating} />
              </div>
              <p className="mt-2 text-sm text-muted">{review.text}</p>
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
