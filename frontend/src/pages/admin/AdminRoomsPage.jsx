import { MdKingBed } from 'react-icons/md'

export default function AdminRoomsPage() {
  return (
    <div className="admin-panel flex min-h-[360px] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card-muted text-3xl text-muted" aria-hidden>
        <MdKingBed />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-main">Room Management</h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        Coming Soon. Detailed room-level management is being rebuilt. For now, configure sharing types, rent,
        and beds directly from each PG under PG Management.
      </p>
      <span className="mt-5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
        Coming Soon
      </span>
    </div>
  )
}
