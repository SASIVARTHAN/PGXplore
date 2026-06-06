import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'

function StatusBadge({ status }) {
  const tone = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending'
  return <span className={`admin-badge admin-badge--${tone}`}>{status}</span>
}

export default function AdminRequestsPage() {
  const { state, resolveDeletionRequest } = useAdmin()
  const { session } = useAuth()
  const { showToast } = useToast()

  const requests = state.deletionRequests || []

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

  const columns = [
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
    {
      key: 'actions',
      label: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex flex-wrap gap-1">
            <button type="button" className="btn-primary px-2 py-1 text-xs" onClick={() => resolve(r, true)}>
              Approve
            </button>
            <button type="button" className="btn-danger px-2 py-1 text-xs" onClick={() => resolve(r, false)}>
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted">
            {r.resolvedByName ? `By ${r.resolvedByName}` : '—'}
          </span>
        ),
    },
  ]

  const pending = requests.filter((r) => r.status === 'pending')
  const resolved = requests.filter((r) => r.status !== 'pending')

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        PG deletion requests submitted by admins. PGs stay active until a privileged reviewer approves the request.
      </p>

      <div>
        <h2 className="text-sm font-semibold text-main">Pending requests ({pending.length})</h2>
        <div className="mt-3">
          {pending.length === 0 ? (
            <div className="admin-panel text-sm text-muted">No pending deletion requests.</div>
          ) : (
            <AdminDataTable columns={columns} rows={pending} searchKeys={['pgName', 'requestedByName']} searchPlaceholder="Search requests…" />
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-main">Resolved history</h2>
        <div className="mt-3">
          {resolved.length === 0 ? (
            <div className="admin-panel text-sm text-muted">No resolved requests yet.</div>
          ) : (
            <AdminDataTable
              columns={columns.filter((c) => c.key !== 'actions')}
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
