import { Link } from 'react-router-dom'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'
import { formatCurrentBillIncluded, formatNoticePeriod } from '../../utils/formatPolicy'
import { getSharingLabel, sharingToEntries } from '../../utils/sharingTypes'
import { getStartingRent } from '../../utils/vacancy'

export default function AdminPGListPage() {
  const { state, deletePG } = useAdmin()
  const { showToast } = useToast()

  const handleDelete = (pg) => {
    if (!window.confirm(`Delete ${pg.name}?`)) return
    deletePG(pg.id)
    showToast('PG deleted.')
  }

  const columns = [
    { key: 'name', label: 'PG Name', render: (row) => <span className="font-medium text-main">{row.name}</span> },
    { key: 'area', label: 'Area' },
    { key: 'gender', label: 'Gender' },
    {
      key: 'sharing',
      label: 'Sharing types',
      render: (row) => (
        <div className="sharing-type-chips max-w-[220px]">
          {sharingToEntries(row.sharing).map((entry) => (
            <span key={entry.type} className="sharing-type-chip">
              {getSharingLabel(entry.type)}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'rent',
      label: 'From',
      render: (row) => `₹${getStartingRent(row.sharing).toLocaleString('en-IN')}`,
    },
    {
      key: 'noticePeriodDays',
      label: 'Notice',
      render: (row) => (
        <span className="text-muted">{formatNoticePeriod(row.noticePeriodDays)}</span>
      ),
    },
    {
      key: 'currentBillIncluded',
      label: 'Current bill',
      render: (row) => (
        <span className="text-muted">{formatCurrentBillIncluded(row.currentBillIncluded)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Availability',
      render: (row) => (
        <span className="admin-badge admin-badge--approved">{row.availabilityStatus || 'active'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Link to={`/pg/${row.id}`} className="text-xs text-brand-emphasis hover:underline">
            View
          </Link>
          <Link to={`/admin/pgs/${row.id}/edit`} className="text-xs text-brand-emphasis hover:underline">
            Edit
          </Link>
          <button type="button" onClick={() => handleDelete(row)} className="text-xs text-rose-600">
            Delete
          </button>
        </div>
      ),
    },
  ]

  const rows = state.pgs.map((pg) => ({
    ...pg,
    _key: pg.id,
    availabilityStatus: pg.availabilityStatus || 'active',
  }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Add, edit, delete PGs. Upload images, amenities, maps location, rent & policies.</p>
        <Link to="/admin/pgs/new" className="btn-primary">
          + Add New PG
        </Link>
      </div>
      <AdminDataTable
        columns={columns}
        rows={rows}
        searchKeys={['name', 'area', 'gender']}
        searchPlaceholder="Search PGs…"
      />
    </div>
  )
}
