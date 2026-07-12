import { useState } from 'react'
import { FiLock } from 'react-icons/fi'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { ROLE_LABELS, canModifyAccount } from '../../utils/auth'

function RoleBadge({ role }) {
  const tone =
    role === 'admin'
      ? 'bg-brand-100 text-brand-emphasis dark:bg-brand-950/50'
      : role === 'privileged'
      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
      : 'bg-card-muted text-muted'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{ROLE_LABELS[role] || 'Normal User'}</span>
}

export default function AdminUsersPage() {
  const { state, updateUser } = useAdmin()
  const { role: actorRole } = useAuth()
  const { showToast } = useToast()
  const [selected, setSelected] = useState(null)

  const userBookings = selected
    ? state.bookings.filter((b) => b.userId === selected.id)
    : []

  const handleToggleStatus = (user) => {
    const next = user.status === 'active' ? 'blocked' : 'active'
    const result = updateUser(user.id, { status: next }, actorRole)
    if (!result.ok) {
      showToast(result.message, 'error')
      return
    }
    showToast(next === 'blocked' ? 'User blocked.' : 'User unblocked.')
  }

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-main">{r.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <RoleBadge role={r.role} /> },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className={r.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}>{r.status}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => {
        const editable = canModifyAccount(actorRole, r)
        return (
          <div className="flex gap-2">
            <button type="button" className="text-xs text-brand-emphasis" onClick={() => setSelected(r)}>
              Profile
            </button>
            {r.protected ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted" title="Protected privileged account"><FiLock aria-hidden /> Protected</span>
            ) : (
              <button
                type="button"
                className={`text-xs ${editable ? '' : 'cursor-not-allowed opacity-40'}`}
                disabled={!editable}
                onClick={() => editable && handleToggleStatus(r)}
              >
                {r.status === 'active' ? 'Block' : 'Unblock'}
              </button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <p className="mb-3 text-sm text-muted">
          Privileged accounts manage users. Protected accounts cannot be removed by normal users.
        </p>
        <AdminDataTable columns={columns} rows={state.users} searchKeys={['name', 'email', 'role']} searchPlaceholder="Search users…" />
      </div>
      <div className="admin-panel">
        <h2 className="admin-panel-title">User profile</h2>
        {selected ? (
          <div className="mt-4 space-y-3 text-sm">
            <p><span className="text-muted">Name:</span> {selected.name}</p>
            <p><span className="text-muted">Email:</span> {selected.email}</p>
            <p><span className="text-muted">Phone:</span> {selected.phone}</p>
            <p className="flex items-center gap-2"><span className="text-muted">Role:</span> <RoleBadge role={selected.role} /></p>
            <p><span className="text-muted">Joined:</span> {new Date(selected.joinedAt).toLocaleDateString()}</p>
            <h3 className="pt-2 font-semibold text-main">Booking history</h3>
            {userBookings.length === 0 ? (
              <p className="text-muted">No bookings.</p>
            ) : (
              <ul className="space-y-2">
                {userBookings.map((b) => (
                  <li key={b.id} className="rounded-lg border border-app bg-card-muted p-2">
                    {b.pgName} — {b.status}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Select a user to view profile and booking history.</p>
        )}
      </div>
    </div>
  )
}
