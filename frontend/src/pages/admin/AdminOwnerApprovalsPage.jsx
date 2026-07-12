import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePageRefresh } from '../../contexts/RefreshContext'
import { useToast } from '../../components/Toast'
import { approveOwnerApi, fetchOwnerApprovalsApi, rejectOwnerApi } from '../../api/admin'
import { loadAdminState, persistAdminState } from '../../admin/adminStore'
import { hasBackendAdminAccess } from '../../utils/auth'

const LIVE_ADMIN_HINT =
  'Log out, then sign in at Privileged Account Login with admin@pgxplore.com / Password@123 to load live owner registrations from the database.'

function StatusBadge({ status }) {
  const normalized = String(status || 'pending').toLowerCase()
  const tone =
    normalized === 'approved'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
      : normalized === 'rejected'
        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
        : 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
  const label =
    normalized === 'approved' ? 'Approved' : normalized === 'rejected' ? 'Rejected' : 'Pending'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tone}`}>{label}</span>
}

function mapApiOwner(row) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone || '—',
    pgName: row.pgName || '',
    address: row.address || '',
    status: String(row.status || 'PENDING').toLowerCase(),
    registrationDate: row.registrationDate,
    verificationDocuments: row.verificationDocuments || [],
  }
}

function loadSeedOwners() {
  const state = loadAdminState()
  return Array.isArray(state.ownerApprovals) ? state.ownerApprovals : []
}

function persistSeedOwners(ownerApprovals) {
  const state = loadAdminState()
  const next = { ...state, ownerApprovals }
  persistAdminState(next)
}

export default function AdminOwnerApprovalsPage() {
  const { showToast } = useToast()
  const { session } = useAuth()
  const { refreshAdminStats } = useAdmin()
  const [owners, setOwners] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usingApi, setUsingApi] = useState(false)
  const [loadError, setLoadError] = useState('')

  const refreshOwners = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    if (!hasBackendAdminAccess(session)) {
      setUsingApi(false)
      setOwners([])
      setLoadError(LIVE_ADMIN_HINT)
      setLoading(false)
      return
    }
    try {
      const data = await fetchOwnerApprovalsApi()
      const mapped = (data || []).map(mapApiOwner)
      setOwners(mapped)
      setUsingApi(true)
      persistSeedOwners(mapped)
    } catch (err) {
      setUsingApi(false)
      if (err?.status === 0) {
        setOwners(loadSeedOwners())
        setLoadError(
          err?.message || 'Could not reach the server. Showing offline demo data.',
        )
      } else {
        setOwners([])
        setLoadError(
          err?.status === 500
            ? 'The server could not load owner approvals. Restart the backend to apply the latest database updates, then refresh this page.'
            : err?.message || LIVE_ADMIN_HINT,
        )
      }
    } finally {
      setLoading(false)
    }
  }, [session?.accessToken, session?.backendRole])

  useEffect(() => {
    refreshOwners()
  }, [refreshOwners])

  usePageRefresh(refreshOwners)

  const updateOwnerInList = (updated) => {
    setOwners((prev) => {
      const next = prev.map((owner) => (owner.id === updated.id ? updated : owner))
      if (!usingApi) {
        persistSeedOwners(next)
      }
      return next
    })
    setSelected((prev) => (prev?.id === updated.id ? updated : prev))
  }

  const handleApprove = async (owner) => {
    try {
      if (usingApi) {
        const updated = mapApiOwner(await approveOwnerApi(owner.id))
        updateOwnerInList(updated)
      } else {
        updateOwnerInList({ ...owner, status: 'approved' })
      }
      await refreshAdminStats()
      showToast(`${owner.name} approved. Owner portal access granted.`)
    } catch (err) {
      showToast(err?.message || 'Could not approve owner.', 'error')
    }
  }

  const handleReject = async (owner) => {
    try {
      if (usingApi) {
        const updated = mapApiOwner(await rejectOwnerApi(owner.id))
        updateOwnerInList(updated)
      } else {
        updateOwnerInList({ ...owner, status: 'rejected' })
      }
      await refreshAdminStats()
      showToast(`${owner.name} rejected.`)
    } catch (err) {
      showToast(err?.message || 'Could not reject owner.', 'error')
    }
  }

  const columns = [
    { key: 'name', label: 'Owner Name', render: (r) => <span className="font-medium text-main">{r.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone Number' },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      render: (r) => (r.registrationDate ? new Date(r.registrationDate).toLocaleDateString() : '—'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="text-xs text-brand-emphasis" onClick={() => setSelected(r)}>
            View Profile
          </button>
          {r.status === 'pending' && (
            <>
              <button type="button" className="text-xs text-emerald-600" onClick={() => handleApprove(r)}>
                Approve
              </button>
              <button type="button" className="text-xs text-rose-600" onClick={() => handleReject(r)}>
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <p className="mb-3 text-sm text-muted">
          Review newly registered PG owners. Pending owners cannot access the Owner Portal until approved.
        </p>
        {loadError && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            <p>{loadError}</p>
            {!hasBackendAdminAccess(session) && (
              <Link to="/admin-login" className="mt-2 inline-block text-sm font-medium text-brand-emphasis hover:underline">
                Go to Privileged Account Login
              </Link>
            )}
          </div>
        )}
        {usingApi && !loading && owners.length === 0 && (
          <p className="mb-3 text-sm text-muted">
            No PG owner accounts in the database yet. New owner registrations will appear here automatically.
          </p>
        )}
        {loading ? (
          <div className="admin-panel text-sm text-muted">Loading owner approval requests…</div>
        ) : (
          <AdminDataTable
            columns={columns}
            rows={owners}
            searchKeys={['name', 'email', 'phone', 'pgName', 'status']}
            searchPlaceholder="Search owners…"
            emptyMessage="No owner registration requests found."
          />
        )}
      </div>
      <div className="admin-panel">
        <h2 className="admin-panel-title">Owner profile</h2>
        {selected ? (
          <div className="mt-4 space-y-3 text-sm">
            <p><span className="text-muted">Owner Name:</span> {selected.name}</p>
            <p><span className="text-muted">Email:</span> {selected.email}</p>
            <p><span className="text-muted">Phone Number:</span> {selected.phone}</p>
            <p><span className="text-muted">PG Name:</span> {selected.pgName || 'Not provided'}</p>
            <p><span className="text-muted">Address:</span> {selected.address || 'Not provided'}</p>
            <p>
              <span className="text-muted">Registration Date:</span>{' '}
              {selected.registrationDate ? new Date(selected.registrationDate).toLocaleString() : '—'}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-muted">Account Status:</span> <StatusBadge status={selected.status} />
            </p>
            <div>
              <h3 className="pt-2 font-semibold text-main">Uploaded Verification Documents</h3>
              {selected.verificationDocuments?.length ? (
                <ul className="mt-2 space-y-2">
                  {selected.verificationDocuments.map((doc) => (
                    <li key={doc} className="rounded-lg border border-app bg-card-muted p-2">
                      {doc}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted">No documents uploaded.</p>
              )}
            </div>
            {selected.status === 'pending' && (
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" className="btn-primary text-xs" onClick={() => handleApprove(selected)}>
                  Approve
                </button>
                <button type="button" className="btn-secondary text-xs" onClick={() => handleReject(selected)}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Select an owner to view registration details.</p>
        )}
        <p className="mt-6 rounded-lg border border-app bg-card-muted/50 p-3 text-xs text-muted">
          Approve a pending owner to grant Owner Portal access. Reject to block login with a support message.
        </p>
      </div>
    </div>
  )
}
