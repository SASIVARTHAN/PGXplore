import { Link } from 'react-router-dom'
import { useReturnPath } from '../hooks/useReturnPath'
import { createNavState, saveReturnPath } from '../utils/navigation'
import { listingImageSrc } from '../utils/pgImages'
import { formatUpdatedAt, getStartingRent } from '../utils/vacancy'

export default function PGCard({ pg, returnTo }) {
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
      state={createNavState(from)}
      onClick={handleOpen}
      className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-app bg-card shadow-sm"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          key={coverSrc}
          src={coverSrc}
          alt={pg.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
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
          <div>
            <h3 className="font-semibold text-main">{pg.name}</h3>
            <p className="text-sm text-muted">
              {pg.area} · {pg.gender}
            </p>
          </div>
          <span className="rounded-lg bg-amber-50 px-2 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            ⭐ {pg.rating}
          </span>
        </div>

        <p className="text-lg font-bold text-brand-emphasis">
          ₹{rent.toLocaleString('en-IN')}/month
        </p>

        <p className="text-sm text-muted">Live vacancy · Coming soon</p>

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
          <span>
            {pg.foodAvailable ? `🍽 ${pg.foodType}` : 'No food'}
            {pg.currentBillIncluded === true && ' · ⚡ Bill included'}
            {pg.currentBillIncluded === false && ' · ⚡ Bill extra'}
          </span>
          <span>{formatUpdatedAt(pg.updatedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
