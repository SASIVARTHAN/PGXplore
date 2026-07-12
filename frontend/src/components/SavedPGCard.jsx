import { Link } from 'react-router-dom'
import { useReturnPath } from '../hooks/useReturnPath'
import { createNavState, saveReturnPath } from '../utils/navigation'
import { formatMonthlyRent } from '../utils/formatCurrency'
import { listingImageSrc } from '../utils/pgImages'
import { getStartingRent } from '../utils/vacancy'

export default function SavedPGCard({ pg, onRemove }) {
  const from = useReturnPath()
  const rent = getStartingRent(pg.sharing)
  const coverSrc = listingImageSrc(pg.images?.[0], pg.updatedAt)
  const pgPath = `/pg/${pg.id}`
  const navState = createNavState(from)

  const handleOpen = () => {
    saveReturnPath(pg.id, from)
  }

  return (
    <article className="card-hover flex flex-col overflow-hidden rounded-2xl border border-app bg-card shadow-sm">
      <Link to={pgPath} state={navState} onClick={handleOpen} className="relative aspect-[4/3] overflow-hidden">
        <img key={coverSrc} src={coverSrc} alt={pg.name} className="h-full w-full object-cover" loading="lazy" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold text-main">{pg.name}</h3>
          <p className="text-sm text-muted">{pg.area}</p>
          <p className="mt-1 text-lg font-bold text-brand-emphasis">
            {formatMonthlyRent(rent)}
          </p>
        </div>
        <div className="action-row mt-auto">
          <Link to={pgPath} state={navState} onClick={handleOpen} className="btn-primary flex-1 text-center">
            View
          </Link>
          <button type="button" onClick={() => onRemove(pg.id)} className="btn-danger flex-1">
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}
