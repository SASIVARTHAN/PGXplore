import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiPhone, FiShare2 } from 'react-icons/fi'
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa6'
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
import { useAuth } from '../contexts/AuthContext'
import { useListings } from '../contexts/AdminContext'
import ThankYouModal from '../components/ThankYouModal'
import {
  loadReviewsForPg,
  removeUserReview,
  saveUserReview,
  submitUserReview,
} from '../utils/reviews'
import { isSaved, LoginRequiredError, syncSavedFromApi, toggleSaved, trackRecent } from '../utils/storage'
import { formatCurrency, formatMonthlyRent } from '../utils/formatCurrency'
import { formatNoticePeriod } from '../utils/formatPolicy'
import { formatUpdatedAt, getStartingRent } from '../utils/vacancy'

export default function PGDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const browseReturnTo = location.state?.from ?? '/listings'
  const detailReturnTo = `/pg/${id}`
  const { showToast } = useToast()
  const { session, isAccountUser } = useAuth()
  const { getPGById, loadPGById, getSimilarPGs } = useListings()
  const [pg, setPg] = useState(() => getPGById(id))
  const [saved, setSaved] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [userReviews, setUserReviews] = useState([])
  const [builtInReviews, setBuiltInReviews] = useState([])
  const [showThankYou, setShowThankYou] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const listingId = Number(id)
    if (!listingId) return () => { active = false }

    async function load() {
      setLoading(true)
      const found = getPGById(id) || (await loadPGById(id))
      if (!active) return
      setPg(found || null)
      if (!found) {
        setLoading(false)
        return
      }
      await trackRecent(listingId)
      if (isAccountUser) await syncSavedFromApi(session?.id)
      if (!active) return
      setSaved(isAccountUser ? isSaved(listingId, session?.id) : false)
      const { userReviews: own, builtInReviews: builtIn } = await loadReviewsForPg(listingId)
      if (!active) return
      setUserReviews(own)
      setBuiltInReviews(builtIn)
      setLoading(false)
    }

    load()
    return () => { active = false }
  }, [id, getPGById, loadPGById, isAccountUser, session?.id])

  const averageRating = useMemo(() => {
    if (!pg) return null
    const all = [...userReviews, ...builtInReviews]
    if (all.length === 0) return pg.rating
    const sum = all.reduce((acc, r) => acc + r.rating, 0)
    return sum / all.length
  }, [pg, userReviews, builtInReviews])

  const similar = useMemo(() => (pg ? getSimilarPGs(pg) : []), [pg, getSimilarPGs])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-muted">
        Loading PG details…
      </div>
    )
  }

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

  const handleSave = async () => {
    if (!isAccountUser) {
      showToast('Sign in to save PGs to your account.', 'error')
      navigate('/login', { state: { from: `/pg/${pg.id}` } })
      return
    }
    try {
      const nowSaved = await toggleSaved(pg.id)
      setSaved(nowSaved)
      showToast(nowSaved ? 'PG saved to your account' : 'Removed from saved PGs')
    } catch (err) {
      if (err instanceof LoginRequiredError || err?.needsLogin) {
        navigate('/login', { state: { from: `/pg/${pg.id}` } })
        return
      }
      showToast(err?.message || 'Could not update saved list.', 'error')
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareData = {
      title: pg.name,
      text: `Check out ${pg.name} on PGXplore`,
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if (err?.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast('Link copied to clipboard!')
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

  const handleReviewSubmit = async (review) => {
    if (!isAccountUser) {
      showToast('Sign in to post a review.', 'error')
      navigate('/login', { state: { from: `/pg/${pg.id}` } })
      return
    }
    try {
      const created = await submitUserReview(pg.id, review)
      setUserReviews((prev) => [created, ...prev])
      setShowThankYou(true)
    } catch (err) {
      showToast(err?.message || 'Could not submit review.', 'error')
    }
  }

  const handleReviewUpdate = async (reviewId, data) => {
    try {
      const updated = await saveUserReview(pg.id, reviewId, data)
      if (!updated) {
        showToast('Reviews can only be edited within 1 hour of posting.', 'error')
        return
      }
      setUserReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)))
      showToast('Review updated.')
    } catch (err) {
      showToast(err?.message || 'Could not update review.', 'error')
    }
  }

  const handleReviewDelete = async (reviewId) => {
    try {
      await removeUserReview(pg.id, reviewId)
      setUserReviews((prev) => prev.filter((r) => r.id !== reviewId))
      showToast('Review deleted.')
    } catch (err) {
      showToast(err?.message || 'Could not delete review.', 'error')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
      <BackButton fallback={browseReturnTo} label="Back" returnKey={id} useHistoryBack />

      <div className="mt-4 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ImageGallery images={pg.images} name={pg.name} imageVersion={pg.updatedAt} />

        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-app bg-card p-5">
            <h1 className="text-2xl font-bold text-main md:text-3xl">{pg.name}</h1>
            <p className="mt-1 text-muted">{pg.area}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                <FaStar aria-hidden /> {averageRating?.toFixed(1) ?? pg.rating}
              </span>
              <span className="rounded-lg bg-card-muted px-2 py-1 text-main">{pg.gender}</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-brand-emphasis">
              From {formatMonthlyRent(getStartingRent(pg.sharing))}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <p>Deposit: {formatCurrency(pg.deposit)}</p>
              <p>Notice period: {formatNoticePeriod(pg.noticePeriodDays)}</p>
            </div>
            <p className="mt-1 text-xs text-muted">{formatUpdatedAt(pg.updatedAt)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FoodTypeBadge pg={pg} />
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
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <FiPhone aria-hidden /> Call Now
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
                  ? 'btn-danger flex-1 inline-flex items-center justify-center gap-2'
                  : 'btn-primary flex-1 inline-flex items-center justify-center gap-2'
              }
            >
              {saved ? (
                <>
                  <FaHeart aria-hidden /> Saved
                </>
              ) : (
                <>
                  <FaRegHeart aria-hidden /> Save PG
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="btn-secondary flex-1 inline-flex items-center justify-center gap-2"
            >
              <FiShare2 aria-hidden /> Share
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
          reviews={builtInReviews}
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
