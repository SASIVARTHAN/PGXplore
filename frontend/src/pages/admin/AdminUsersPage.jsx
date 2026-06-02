import { useState } from 'react'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminUsersPage() {
  const { state, updateUser } = useAdmin()
  const { showToast } = useToast()
  const [selected, setSelected] = useState(null)

  const userBookings = selected
    ? state.bookings.filter((b) => b.userId === selected.id)
    : []

  const columns = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-main">{r.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
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
      render: (r) => (
        <div className="flex gap-2">
          <button type="button" className="text-xs text-brand-emphasis" onClick={() => setSelected(r)}>
            Profile
          </button>
          <button
            type="button"
            className="text-xs"
            onClick={() => {
              const next = r.status === 'active' ? 'blocked' : 'active'
              updateUser(r.id, { status: next })
              showToast(next === 'blocked' ? 'User blocked.' : 'User unblocked.')
            }}
          >
            {r.status === 'active' ? 'Block' : 'Unblock'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <AdminDataTable columns={columns} rows={state.users} searchKeys={['name', 'email', 'phone']} searchPlaceholder="Search users…" />
      </div>
      <div className="admin-panel">
        <h2 className="admin-panel-title">User profile</h2>
        {selected ? (
          <div className="mt-4 space-y-3 text-sm">
            <p><span className="text-muted">Name:</span> {selected.name}</p>
            <p><span className="text-muted">Email:</span> {selected.email}</p>
            <p><span className="text-muted">Phone:</span> {selected.phone}</p>
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
