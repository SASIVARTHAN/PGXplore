import { Link } from 'react-router-dom'
import { FiZap } from 'react-icons/fi'
import { FaStar } from 'react-icons/fa6'
import { useReturnPath } from '../hooks/useReturnPath'
import { getFoodAvailabilityLabel } from '../utils/foodAvailability'
import { createNavState, saveReturnPath } from '../utils/navigation'
import { listingImageSrc } from '../utils/pgImages'
import { formatMonthlyRent } from '../utils/formatCurrency'
import { formatUpdatedAt, getStartingRent } from '../utils/vacancy'

export default function PGCard({ pg, returnTo, replace = false }) {
  const from = useReturnPath(returnTo)
  const rent = getStartingRent(pg.sharing)
  const coverSrc = listingImageSrc(pg.images?.[0], pg.updatedAt)
  const pgPath = `/pg/${pg.id}`

  const handleOpen = () => {
    saveReturnPath(pg.id, from)
  }

  return (
    <Link
      to={pgPath}
      replace={replace}
      state={createNavState(from)}
      onClick={handleOpen}
      className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl border border-app bg-card shadow-sm"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-card-muted">
        <img
          key={coverSrc}
          src={coverSrc}
          alt={pg.name}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {pg.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-600 px-2.5 py-1 text-xs font-semibold text-white">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-main">{pg.name}</h3>
            <p className="text-sm text-muted">
              {pg.area} · {pg.gender}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <FaStar aria-hidden /> {pg.rating}
          </span>
        </div>

        <p className="text-lg font-bold text-brand-emphasis">
          {formatMonthlyRent(rent)}
        </p>

        <p className="text-sm text-muted">Live availability · Coming Soon</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1 truncate">
            {getFoodAvailabilityLabel(pg)}
            {pg.currentBillIncluded === true && (
              <>
                {' · '}
                <FiZap aria-hidden className="shrink-0" /> Bill included
              </>
            )}
            {pg.currentBillIncluded === false && (
              <>
                {' · '}
                <FiZap aria-hidden className="shrink-0" /> Bill extra
              </>
            )}
          </span>
          <span className="shrink-0">{formatUpdatedAt(pg.updatedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
