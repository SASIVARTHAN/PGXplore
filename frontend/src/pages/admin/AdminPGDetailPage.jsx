import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiPhone } from 'react-icons/fi'
import AmenityGrid from '../../components/AmenityGrid'
import CurrentBillBadge from '../../components/CurrentBillBadge'
import FoodTypeBadge from '../../components/FoodTypeBadge'
import ImageGallery from '../../components/ImageGallery'
import LocationMap from '../../components/LocationMap'
import ReviewList from '../../components/ReviewList'
import VacancyDisplay from '../../components/VacancyDisplay'
import { useAdmin, useListings } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatNoticePeriod } from '../../utils/formatPolicy'
import { canModifyPg, isBackendPgOwner, listingStatusLabel } from '../../utils/pgPermissions'
import { formatUpdatedAt, getStartingRent } from '../../utils/vacancy'

export default function AdminPGDetailPage() {
  const { id } = useParams()
  const { getPGById } = useListings()
  const { getPendingDeletionRequest } = useAdmin()
  const { session } = useAuth()
  const pg = useMemo(() => getPGById(id), [id, getPGById])
  const canEdit = pg ? canModifyPg(pg, session) : false
  const isOwner = isBackendPgOwner(session)

  const averageRating = useMemo(() => {
    if (!pg) return null
    const all = pg.reviews || []
    if (all.length === 0) return pg.rating
    const sum = all.reduce((acc, r) => acc + r.rating, 0)
    return sum / all.length
  }, [pg])

  if (!pg) {
    return (
      <div className="admin-panel flex min-h-[320px] flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-main">PG not found</h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          This PG may have been removed or the link is incorrect.
        </p>
        <Link to="/admin/pgs" className="action-btn action-btn--view mt-5 inline-flex items-center gap-1.5">
          <FiArrowLeft aria-hidden /> Back to {isOwner ? 'All PGs' : 'PG Management'}
        </Link>
      </div>
    )
  }

  const pendingDeletion = getPendingDeletionRequest(pg.id)
  const listingStatus = pg.listingStatus || 'approved'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={isOwner && canEdit ? '/admin/my-pgs' : '/admin/pgs'}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300"
        >
          <FiArrowLeft aria-hidden /> Back to {isOwner && canEdit ? 'My PGs' : isOwner ? 'All PGs' : 'PG Management'}
        </Link>
        {canEdit ? (
          <Link
            to={`/admin/pgs/${pg.id}/edit`}
            className="action-btn action-btn--edit inline-flex items-center gap-1.5"
          >
            <FiEdit2 aria-hidden /> Edit PG
          </Link>
        ) : (
          <span className="text-xs text-muted">View only — you cannot edit this listing</span>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ImageGallery images={pg.images} name={pg.name} imageVersion={pg.updatedAt} />

        <div className="space-y-5">
          <div className="rounded-2xl border border-app bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h1 className="text-2xl font-bold text-main">{pg.name}</h1>
              {pendingDeletion ? (
                <span className="admin-badge admin-badge--pending">Deletion pending</span>
              ) : listingStatus === 'approved' ? (
                <span className="admin-badge admin-badge--approved">{pg.availabilityStatus || 'active'}</span>
              ) : (
                <span className={`admin-badge admin-badge--${listingStatus === 'rejected' ? 'rejected' : 'pending'}`}>
                  {listingStatusLabel(listingStatus)}
                </span>
              )}
            </div>
            <p className="mt-1 text-muted">{pg.area}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-amber-100 px-2 py-1 font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
                {averageRating?.toFixed(1) ?? pg.rating} rating
              </span>
              <span className="rounded-lg bg-card-muted px-2 py-1 text-main">{pg.gender}</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-brand-emphasis">
              From ₹{getStartingRent(pg.sharing).toLocaleString('en-IN')}/month
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <p>Deposit: ₹{pg.deposit?.toLocaleString('en-IN')}</p>
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
              <h3 className="text-lg font-semibold text-main">Owner Contact</h3>
              <p className="mt-2 font-medium text-main">{pg.owner.name}</p>
              <p className="text-sm text-muted">{pg.owner.role || 'Property Owner'}</p>
              {pg.owner.phone && (
                <a
                  href={`tel:${pg.owner.phone.replace(/\s/g, '')}`}
                  className="btn-secondary mt-3 inline-flex items-center gap-2 text-sm"
                >
                  <FiPhone aria-hidden /> {pg.owner.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {pg.description && (
        <div className="rounded-xl bg-card p-4 text-sm leading-relaxed text-muted ring-1 ring-app">
          {pg.description}
        </div>
      )}

      <div className="space-y-8">
        <VacancyDisplay sharing={pg.sharing} />
        {pg.amenities?.length > 0 && <AmenityGrid amenities={pg.amenities} />}
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

        <ReviewList reviews={pg.reviews || []} averageRating={averageRating} />
      </div>
    </div>
  )
}
