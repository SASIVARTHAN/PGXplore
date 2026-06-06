import { Link } from 'react-router-dom'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrentBillIncluded, formatNoticePeriod } from '../../utils/formatPolicy'
import { getSharingLabel, sharingToEntries } from '../../utils/sharingTypes'
import { getStartingRent } from '../../utils/vacancy'

export default function AdminPGListPage() {
  const { state, requestPGDeletion, getPendingDeletionRequest } = useAdmin()
  const { session, canRequestPGDeletion } = useAuth()
  const { showToast } = useToast()

  const handleRequestDeletion = (pg) => {
    if (getPendingDeletionRequest(pg.id)) {
      showToast('A deletion request is already pending for this PG.', 'error')
      return
    }
    const reason = window.prompt(`Request deletion of "${pg.name}".\nOptional reason for the reviewer:`, '')
    if (reason === null) return
    const result = requestPGDeletion({ pgId: pg.id, reason, requestedBy: session })
    if (!result.ok) {
      showToast(result.message, 'error')
      return
    }
    showToast('Deletion request submitted. The PG stays active until a reviewer approves it.')
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
      render: (row) =>
        getPendingDeletionRequest(row.id) ? (
          <span className="admin-badge admin-badge--pending">Deletion pending</span>
        ) : (
          <span className="admin-badge admin-badge--approved">{row.availabilityStatus || 'active'}</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const pending = getPendingDeletionRequest(row.id)
        return (
          <div className="flex flex-wrap gap-2">
            <Link to={`/pg/${row.id}`} className="action-btn action-btn--view">
              View
            </Link>
            <Link to={`/admin/pgs/${row.id}/edit`} className="action-btn action-btn--edit">
              Edit
            </Link>
            {canRequestPGDeletion &&
              (pending ? (
                <span className="text-xs text-amber-600 dark:text-amber-400">Awaiting review</span>
              ) : (
                <button type="button" onClick={() => handleRequestDeletion(row)} className="action-btn action-btn--danger">
                  Delete
                </button>
              ))}
          </div>
        )
      },
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
        <p className="text-sm text-muted">Add and edit PGs. Deletion needs reviewer approval — the PG stays active until then.</p>
        <Link to="/admin/pgs/new" className="action-btn action-btn--add">
          <span aria-hidden>＋</span> Add New PG
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
