import { Link } from 'react-router-dom'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrentBillIncluded, formatNoticePeriod } from '../../utils/formatPolicy'
import {
  canModifyPg,
  isBackendPgOwner,
  listingStatusLabel,
  ownsPg,
} from '../../utils/pgPermissions'
import { getSharingLabel, sharingToEntries } from '../../utils/sharingTypes'
import { getStartingRent } from '../../utils/vacancy'

function ListingStatusBadge({ pg, pendingDeletion }) {
  if (pendingDeletion) {
    return <span className="admin-badge admin-badge--pending">Deletion pending</span>
  }
  const status = pg.listingStatus || 'approved'
  if (status === 'approved') {
    return <span className="admin-badge admin-badge--approved">{pg.availabilityStatus || 'active'}</span>
  }
  const tone = status === 'rejected' ? 'rejected' : 'pending'
  return <span className={`admin-badge admin-badge--${tone}`}>{listingStatusLabel(status)}</span>
}

export default function AdminPGListPage({ listScope = 'all' }) {
  const isMineView = listScope === 'mine'
  const { state, myListings, requestPGDeletion, getPendingDeletionRequest, listingsLoading, listingsError } =
    useAdmin()
  const { session, canRequestPGDeletion } = useAuth()
  const { showToast } = useToast()
  const isOwner = isBackendPgOwner(session)

  const sourcePgs = isMineView ? myListings : state.pgs

  const handleRequestDeletion = (pg) => {
    if (!canModifyPg(pg, session)) {
      showToast('You can only request deletion for PG listings that you own.', 'error')
      return
    }
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
    {
      key: 'name',
      label: 'PG Name',
      render: (row) => (
        <div>
          <span className="font-medium text-main">{row.name}</span>
          {isOwner && !isMineView ? (
            <p className="mt-0.5 text-xs">
              {ownsPg(row, session) ? (
                <span className="font-medium text-brand-emphasis">Yours</span>
              ) : (
                <span className="text-muted">Other owner</span>
              )}
            </p>
          ) : null}
        </div>
      ),
    },
    { key: 'area', label: 'Area' },
    { key: 'gender', label: 'Gender' },
    {
      key: 'sharing',
      label: 'Sharing types',
      className: 'admin-table-col--sharing',
      headerClassName: 'admin-table-col--sharing',
      render: (row) => (
        <div className="sharing-type-chips">
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
      label: 'Status',
      render: (row) => (
        <ListingStatusBadge pg={row} pendingDeletion={getPendingDeletionRequest(row.id)} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'admin-table-col--actions',
      headerClassName: 'admin-table-col--actions',
      render: (row) => {
        const pending = getPendingDeletionRequest(row.id)
        const canEdit = canModifyPg(row, session)
        const canDelete = canRequestPGDeletion && canModifyPg(row, session)
        return (
          <div className="admin-table-actions">
            <Link to={`/admin/pgs/${row.id}`} className="action-btn action-btn--view">
              View
            </Link>
            {canEdit ? (
              <Link to={`/admin/pgs/${row.id}/edit`} className="action-btn action-btn--edit">
                Edit
              </Link>
            ) : null}
            {canDelete &&
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

  const rows = sourcePgs.map((pg) => ({
    ...pg,
    _key: pg.id,
    availabilityStatus: pg.availabilityStatus || 'active',
  }))

  const pageDescription = isMineView
    ? 'PG listings you have added, including those awaiting approval. You can edit or request deletion for these listings only.'
    : isOwner
      ? 'Browse all PG listings on the platform. You can view any listing, but only edit or delete PGs that you own.'
      : 'Add and edit PGs. Owner submissions need privileged accounts approval. Deletion needs reviewer approval — the PG stays active until then.'

  const emptyMessage = listingsError
    ? 'Could not load listings from the server.'
    : isMineView
      ? 'You have no PG listings yet. Click Add New PG to create your first listing.'
      : isOwner
        ? 'No PG listings are available on the platform yet.'
        : 'No records found.'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{pageDescription}</p>
        {(isMineView || !isOwner) && (
          <Link to="/admin/pgs/new" className="action-btn action-btn--add">
            <span aria-hidden>＋</span> Add New PG
          </Link>
        )}
      </div>
      {listingsLoading ? (
        <p className="text-sm text-muted">Loading PG listings…</p>
      ) : (
        <AdminDataTable
          columns={columns}
          rows={rows}
          searchKeys={['name', 'area', 'gender']}
          searchPlaceholder="Search PGs…"
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  )
}
