import { useState } from 'react'
import AdminDataTable from '../../components/admin/AdminDataTable'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminRoomsPage() {
  const { state, addRoom, updateRoom, deleteRoom, ROOM_TYPES } = useAdmin()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    pgId: state.pgs[0]?.id ?? '',
    type: 'Single',
    monthlyRent: 5000,
    totalBeds: 2,
    occupiedBeds: 0,
    imageUrl: '',
    availability: 'available',
  })

  const handleAdd = (e) => {
    e.preventDefault()
    const pg = state.pgs.find((p) => p.id === Number(form.pgId))
    if (!pg) return
    addRoom({
      pgId: pg.id,
      pgName: pg.name,
      type: form.type,
      monthlyRent: Number(form.monthlyRent),
      totalBeds: Number(form.totalBeds),
      occupiedBeds: Number(form.occupiedBeds),
      images: form.imageUrl ? [form.imageUrl] : [],
      availability: form.availability,
    })
    showToast('Room added.')
    setShowForm(false)
  }

  const columns = [
    { key: 'pgName', label: 'PG' },
    { key: 'type', label: 'Room Type' },
    { key: 'rent', label: 'Monthly Rent', render: (r) => `₹${r.monthlyRent.toLocaleString('en-IN')}` },
    {
      key: 'occupancy',
      label: 'Occupancy',
      render: (r) => `${r.occupiedBeds}/${r.totalBeds} beds`,
    },
    {
      key: 'availability',
      label: 'Availability',
      render: (r) => (
        <select
          className="select-app text-xs"
          value={r.availability}
          onChange={(e) => {
            updateRoom(r.id, { availability: e.target.value })
            showToast('Room availability updated.')
          }}
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="maintenance">Maintenance</option>
        </select>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button
          type="button"
          className="text-xs text-rose-600"
          onClick={() => {
            if (window.confirm('Delete this room?')) {
              deleteRoom(r.id)
              showToast('Room deleted.')
            }
          }}
        >
          Delete
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <p className="text-sm text-muted">Single, Double, Triple, Dormitory — rent, images & occupancy tracking.</p>
        <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close form' : '+ Add Room'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="admin-panel grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            PG
            <select className="select-app mt-1 w-full" value={form.pgId} onChange={(e) => setForm({ ...form, pgId: e.target.value })}>
              {state.pgs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Room Type
            <select className="select-app mt-1 w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Monthly Rent
            <input type="number" className="input-app mt-1 w-full" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} />
          </label>
          <label className="text-sm">
            Total / Occupied Beds
            <div className="mt-1 flex gap-2">
              <input type="number" className="input-app w-full" value={form.totalBeds} onChange={(e) => setForm({ ...form, totalBeds: e.target.value })} />
              <input type="number" className="input-app w-full" value={form.occupiedBeds} onChange={(e) => setForm({ ...form, occupiedBeds: e.target.value })} />
            </div>
          </label>
          <label className="text-sm sm:col-span-2">
            Room image URL
            <input className="input-app mt-1 w-full" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </label>
          <button type="submit" className="btn-primary sm:col-span-2">Save Room</button>
        </form>
      )}

      <AdminDataTable columns={columns} rows={state.rooms} searchKeys={['pgName', 'type']} searchPlaceholder="Search rooms…" />
    </div>
  )
}
