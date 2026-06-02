import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AmenityGrid from '../components/AmenityGrid'
import BackButton from '../components/BackButton'
import EmptyState from '../components/EmptyState'
import CurrentBillBadge from '../components/CurrentBillBadge'
import FoodTypeBadge from '../components/FoodTypeBadge'
import ImageGallery from '../components/ImageGallery'
import LocationMap from '../components/LocationMap'
import PGCard from '../components/PGCard'
import ReportModal from '../components/ReportModal'
import ReviewList from '../components/ReviewList'
import { useToast } from '../components/Toast'
import VacancyDisplay from '../components/VacancyDisplay'
import { useListings } from '../contexts/AdminContext'
import ThankYouModal from '../components/ThankYouModal'
import {
  addUserReview,
  deleteUserReview,
  getUserReviews,
  updateUserReview,
} from '../utils/reviews'
import { isSaved, toggleSaved, trackRecent } from '../utils/storage'
import { formatNoticePeriod } from '../utils/formatPolicy'
import { formatUpdatedAt, getStartingRent } from '../utils/vacancy'

export default function PGDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const browseReturnTo = location.state?.from ?? '/listings'
  const detailReturnTo = `/pg/${id}`
  const { showToast } = useToast()
  const { getPGById, getSimilarPGs } = useListings()
  const pg = useMemo(() => getPGById(id), [id, getPGById])
  const [saved, setSaved] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [userReviews, setUserReviews] = useState([])
  const [showThankYou, setShowThankYou] = useState(false)

  useEffect(() => {
    const listingId = Number(id)
    if (!listingId || !getPGById(id)) return
    trackRecent(listingId)
    setSaved(isSaved(listingId))
    setUserReviews(getUserReviews(listingId))
  }, [id, getPGById])

  const averageRating = useMemo(() => {
    if (!pg) return null
    const all = [...userReviews, ...pg.reviews]
    if (all.length === 0) return pg.rating
    const sum = all.reduce((acc, r) => acc + r.rating, 0)
    return sum / all.length
  }, [pg, userReviews])

  const similar = useMemo(() => (pg ? getSimilarPGs(pg) : []), [pg, getSimilarPGs])

  if (!pg) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          title="PG not found"
          description="This listing may have been removed or the link is incorrect."
          actionLabel="Browse PGs"
          onAction={() => navigate('/listings')}
        />
      </div>
    )
  }

  const handleSave = () => {
    const nowSaved = toggleSaved(pg.id)
    setSaved(nowSaved)
    showToast(nowSaved ? 'PG saved to your list' : 'Removed from saved PGs')
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: pg.name,
          text: `Check out ${pg.name}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        showToast('Link copied to clipboard!')
      }
    } catch {
      showToast('Could not share this listing', 'error')
    }
  }

  const handleReport = ({ type, description }) => {
    const reports = JSON.parse(localStorage.getItem('pgxplore_reports') || '[]')
    reports.push({ pgId: pg.id, pgName: pg.name, type, description, at: new Date().toISOString() })
    localStorage.setItem('pgxplore_reports', JSON.stringify(reports))
    setShowReport(false)
    showToast('Report submitted. Thank you!')
  }

  const handleReviewSubmit = (review) => {
    addUserReview(pg.id, review)
    setUserReviews(getUserReviews(pg.id))
    setShowThankYou(true)
  }

  const handleReviewUpdate = (reviewId, data) => {
    const updated = updateUserReview(pg.id, reviewId, data)
    if (!updated) {
      showToast('Reviews can only be edited within 1 hour of posting.', 'error')
      return
    }
    setUserReviews(getUserReviews(pg.id))
    showToast('Review updated.')
  }

  const handleReviewDelete = (reviewId) => {
    deleteUserReview(pg.id, reviewId)
    setUserReviews(getUserReviews(pg.id))
    showToast('Review deleted.')
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
      <BackButton fallback={browseReturnTo} label="Back" returnKey={id} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ImageGallery images={pg.images} name={pg.name} imageVersion={pg.updatedAt} />

        <div className="space-y-5">
          <div className="rounded-2xl border border-app bg-card p-5">
            <h1 className="text-2xl font-bold text-main md:text-3xl">{pg.name}</h1>
            <p className="mt-1 text-muted">{pg.area}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-amber-100 px-2 py-1 font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                ⭐ {averageRating?.toFixed(1) ?? pg.rating}
              </span>
              <span className="rounded-lg bg-card-muted px-2 py-1 text-main">{pg.gender}</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-brand-emphasis">
              From ₹{getStartingRent(pg.sharing).toLocaleString('en-IN')}/month
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <p>Deposit: ₹{pg.deposit.toLocaleString('en-IN')}</p>
              <p>Notice period: {formatNoticePeriod(pg.noticePeriodDays)}</p>
            </div>
            <p className="mt-1 text-xs text-muted">{formatUpdatedAt(pg.updatedAt)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FoodTypeBadge foodAvailable={pg.foodAvailable} foodType={pg.foodType} />
            <CurrentBillBadge included={pg.currentBillIncluded} />
          </div>

          {pg.owner && (
            <div className="rounded-2xl border border-app bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-main">Owner Contact</h3>
                  <p className="mt-2 font-medium text-main">{pg.owner.name}</p>
                  <p className="text-sm text-muted">Property Owner</p>
                </div>
                <a
                  href={`tel:${pg.owner.phone.replace(/\s/g, '')}`}
                  className="btn-primary"
                >
                  📞 Call Now
                </a>
              </div>
            </div>
          )}

          <div className="detail-actions action-row">
            <button
              type="button"
              onClick={handleSave}
              className={
                saved
                  ? 'btn-danger flex-1'
                  : 'btn-primary flex-1'
              }
            >
              {saved ? '♥ Saved' : '♡ Save PG'}
            </button>
            <button type="button" onClick={handleShare} className="btn-secondary flex-1">
              Share
            </button>
            <button type="button" onClick={() => setShowReport(true)} className="btn-warning flex-1">
              Report
            </button>
          </div>

          </div>
      </div>

      <div className="mt-8 rounded-xl bg-card p-4 text-sm leading-relaxed text-muted ring-1 ring-app">{pg.description}</div>
  
      <div className="mt-10 space-y-10">
        <VacancyDisplay sharing={pg.sharing} />
        <AmenityGrid amenities={pg.amenities} />
        <LocationMap location={pg.location} pgName={pg.name} />

        {pg.houseRules?.length > 0 && (
          <div className="rounded-2xl border border-app bg-card p-5">
            <h3 className="text-lg font-semibold text-main">House Rules</h3>
            <ul className="mt-3 space-y-2">
              {pg.houseRules.map((rule) => (
                <li key={rule} className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-brand-emphasis">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}

        <ReviewList
          reviews={pg.reviews}
          userReviews={userReviews}
          onSubmitReview={handleReviewSubmit}
          onUpdateReview={handleReviewUpdate}
          onDeleteReview={handleReviewDelete}
          averageRating={averageRating}
        />

        {similar.length > 0 && (
          <div>
            <h3 className="mb-4 text-2xl font-bold text-main">You may also like</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <PGCard key={item.id} pg={item} returnTo={detailReturnTo} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal pgName={pg.name} onClose={() => setShowReport(false)} onSubmit={handleReport} />
      )}

      {showThankYou && <ThankYouModal onClose={() => setShowThankYou(false)} />}
    </div>
  )
}
