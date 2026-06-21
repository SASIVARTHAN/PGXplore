import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import {
  approvePgListingApi,
  fetchPendingListings,
  rejectPgListingApi,
} from '../../api/listings'
import { canApproveListing } from '../../utils/pgPermissions'

function StatusBadge({ status }) {
  const tone = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'
  const label = status === 'pending' ? 'Awaiting approval' : status
  return <span className={`admin-badge admin-badge--${tone}`}>{label}</span>
}

export default function AdminRequestsPage() {
  const { state, resolveDeletionRequest, refreshListings } = useAdmin()
  const { session, canApproveDeletion, canRequestPGDeletion } = useAuth()
  const { showToast } = useToast()
  const [pendingListings, setPendingListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [resolvingListingId, setResolvingListingId] = useState(null)

  const loadPendingListings = useCallback(async () => {
    if (!canApproveListing(session)) {
      setPendingListings([])
      return
    }
    setListingsLoading(true)
    try {
      const items = await fetchPendingListings()
      setPendingListings(items)
    } catch (err) {
      showToast(err?.message || 'Could not load pending PG submissions.', 'error')
      setPendingListings([])
    } finally {
      setListingsLoading(false)
    }
  }, [session, showToast])

  useEffect(() => {
    loadPendingListings()
  }, [loadPendingListings])

  const requests = state.deletionRequests || []
  const pending = requests.filter((r) => r.status === 'pending')
  const resolved = requests.filter((r) => r.status !== 'pending')

  const resolve = (request, approve) => {
    const verb = approve ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${verb} deletion of "${request.pgName}"?`)) return
    const result = resolveDeletionRequest({ requestId: request.id, approve, reviewer: session })
    if (!result.ok) {
      showToast(result.message, 'error')
      return
    }
    showToast(approve ? `${request.pgName} removed after approval.` : 'Deletion request rejected. PG stays active.')
  }

  const resolveListing = async (pg, approve) => {
    const verb = approve ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${verb} "${pg.name}"?`)) return
    setResolvingListingId(pg.id)
    try {
      if (approve) {
        await approvePgListingApi(pg.id)
        showToast(`${pg.name} is now live on the public site.`)
      } else {
        await rejectPgListingApi(pg.id)
        showToast(`${pg.name} was rejected. The owner can edit and resubmit.`)
      }
      await Promise.all([loadPendingListings(), refreshListings()])
    } catch (err) {
      showToast(err?.message || `Could not ${verb} listing.`, 'error')
    } finally {
      setResolvingListingId(null)
    }
  }

  const baseColumns = [
    { key: 'pgName', label: 'PG', render: (r) => <span className="font-medium text-main">{r.pgName}</span> },
    {
      key: 'requestedByName',
      label: 'Requested by',
      render: (r) => <span className="text-muted">{r.requestedByName}</span>,
    },
    {
      key: 'requestedAt',
      label: 'Request date',
      render: (r) => <span className="text-muted">{new Date(r.requestedAt).toLocaleString()}</span>,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (r) => <span className="text-muted">{r.reason || '—'}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ]

  const pendingColumns = [
    ...baseColumns,
    {
      key: 'actions',
      label: 'Actions',
      render: (r) =>
        canApproveDeletion ? (
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className="action-btn action-btn--approve" onClick={() => resolve(r, true)}>
              Approve
            </button>
            <button type="button" className="action-btn action-btn--danger" onClick={() => resolve(r, false)}>
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted">Waiting for privileged accounts approval</span>
        ),
    },
  ]

  const historyColumns = [
    ...baseColumns,
    {
      key: 'resolved',
      label: 'Resolved',
      render: (r) => (
        <span className="text-xs text-muted">
          {r.resolvedByName ? `${r.resolvedByName} · ${r.resolvedAt ? new Date(r.resolvedAt).toLocaleString() : '—'}` : '—'}
        </span>
      ),
    },
  ]

  const listingSubmissionColumns = [
    {
      key: 'name',
      label: 'PG',
      render: (pg) => (
        <Link to={`/admin/pgs/${pg.id}`} className="font-medium text-brand-emphasis hover:underline">
          {pg.name}
        </Link>
      ),
    },
    { key: 'area', label: 'Area' },
    {
      key: 'owner',
      label: 'Owner',
      render: (pg) => <span className="text-muted">{pg.owner?.name || '—'}</span>,
    },
    {
      key: 'updatedAt',
      label: 'Submitted',
      render: (pg) => (
        <span className="text-muted">
          {pg.updatedAt ? new Date(pg.updatedAt).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (pg) => (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="action-btn action-btn--approve"
            disabled={resolvingListingId === pg.id}
            onClick={() => resolveListing(pg, true)}
          >
            Approve
          </button>
          <button
            type="button"
            className="action-btn action-btn--danger"
            disabled={resolvingListingId === pg.id}
            onClick={() => resolveListing(pg, false)}
          >
            Reject
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {canApproveListing(session) ? (
        <div>
          <h2 className="text-sm font-semibold text-main">
            New PG submissions — awaiting approval ({pendingListings.length})
          </h2>
          <p className="mt-1 text-xs text-muted">
            Owner-created or owner-edited listings stay hidden from the public site until you approve them.
          </p>
          <div className="mt-3">
            {listingsLoading ? (
              <div className="admin-panel text-sm text-muted">Loading pending submissions…</div>
            ) : pendingListings.length === 0 ? (
              <div className="admin-panel text-sm text-muted">
                No PG submissions waiting for approval.
              </div>
            ) : (
              <AdminDataTable
                columns={listingSubmissionColumns}
                rows={pendingListings.map((pg) => ({ ...pg, _key: pg.id }))}
                searchKeys={['name', 'area']}
                searchPlaceholder="Search pending submissions…"
              />
            )}
          </div>
        </div>
      ) : null}

      <div className="admin-panel">
        <h1 className="admin-panel-title">PG deletion requests</h1>
        <p className="mt-2 text-sm text-muted">
          PGs stay listed until a privileged account approves removal. Pending requests appear in the queue below;
          approved and rejected requests are kept in history.
        </p>
        {canRequestPGDeletion ? (
          <p className="mt-2 text-sm text-muted">
            To submit a new request, go to{' '}
            <Link to="/admin/pgs" className="font-medium text-brand-emphasis hover:underline">
              PG Management
            </Link>{' '}
            and use Delete on a listing you own.
          </p>
        ) : null}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-main">
          Deletion queue — awaiting approval ({pending.length})
        </h2>
        <div className="mt-3">
          {pending.length === 0 ? (
            <div className="admin-panel text-sm text-muted">
              No PGs waiting for deletion approval. When someone requests a PG removal, it will show up here.
            </div>
          ) : (
            <AdminDataTable
              columns={pendingColumns}
              rows={pending}
              searchKeys={['pgName', 'requestedByName', 'reason']}
              searchPlaceholder="Search pending requests…"
            />
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-main">Deletion history ({resolved.length})</h2>
        <p className="mt-1 text-xs text-muted">Previously approved or rejected deletion requests.</p>
        <div className="mt-3">
          {resolved.length === 0 ? (
            <div className="admin-panel text-sm text-muted">No resolved requests yet.</div>
          ) : (
            <AdminDataTable
              columns={historyColumns}
              rows={resolved}
              searchKeys={['pgName', 'requestedByName', 'status']}
              searchPlaceholder="Search history…"
            />
          )}
        </div>
      </div>
    </div>
  )
}
