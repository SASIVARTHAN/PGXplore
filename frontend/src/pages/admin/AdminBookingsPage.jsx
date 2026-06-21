import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'

function StatusBadge({ status }) {
  return <span className={`admin-badge admin-badge--${status}`}>{status.replace('_', ' ')}</span>
}

export default function AdminBookingsPage() {
  const { state, updateBooking } = useAdmin()
  const { showToast } = useToast()

  const setStatus = (id, status) => {
    updateBooking(id, status)
    showToast(`Booking ${status.replace('_', ' ')}.`)
  }

  const columns = [
    { key: 'userName', label: 'User' },
    { key: 'pgName', label: 'PG' },
    { key: 'roomType', label: 'Room' },
    { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount.toLocaleString('en-IN')}` },
    { key: 'checkIn', label: 'Check-in' },
    { key: 'checkOut', label: 'Check-out' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.status === 'pending' && (
            <>
              <button type="button" className="btn-primary px-2 py-1 text-xs" onClick={() => setStatus(r.id, 'approved')}>
                Approve
              </button>
              <button type="button" className="btn-danger px-2 py-1 text-xs" onClick={() => setStatus(r.id, 'rejected')}>
                Reject
              </button>
            </>
          )}
          {r.status === 'approved' && (
            <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => setStatus(r.id, 'checked_in')}>
              Check-in
            </button>
          )}
          {r.status === 'checked_in' && (
            <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => setStatus(r.id, 'checked_out')}>
              Check-out
            </button>
          )}
        </div>
      ),
    },
  ]

  const history = state.bookings.filter((b) => b.status === 'checked_out')
  const active = state.bookings.filter((b) => b.status !== 'checked_out')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-semibold text-main">Active bookings</h2>
        <div className="mt-3">
          <AdminDataTable columns={columns} rows={active} searchKeys={['userName', 'pgName', 'status']} />
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-main">Booking history (checked out)</h2>
        <div className="mt-3">
          <AdminDataTable columns={columns.filter((c) => c.key !== 'actions')} rows={history} searchKeys={['userName', 'pgName']} />
        </div>
      </div>
    </div>
  )
}
