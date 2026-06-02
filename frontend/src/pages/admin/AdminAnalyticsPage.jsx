import AdminBarChart from '../../components/admin/AdminBarChart'
import AdminStatCard from '../../components/admin/AdminStatCard'
import { getBookingTrends, getMonthlyRevenue, getOccupancyChart } from '../../admin/adminStore'
import { useAdmin } from '../../contexts/AdminContext'

export default function AdminAnalyticsPage() {
  const { state, stats } = useAdmin()
  const monthly = getMonthlyRevenue(state.bookings)
  const trends = getBookingTrends(state.bookings)
  const occupancy = getOccupancyChart(state.rooms)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} />
        <AdminStatCard label="Occupancy rate" value={`${stats.totalBeds ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0}%`} />
        <AdminStatCard label="Bookings this month" value={state.bookings.length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminBarChart title="Monthly revenue chart" data={monthly} valuePrefix="₹" />
        <AdminBarChart title="Booking trends" data={trends} />
      </div>
      <AdminBarChart title="Occupancy chart (beds)" data={occupancy} />
    </div>
  )
}
