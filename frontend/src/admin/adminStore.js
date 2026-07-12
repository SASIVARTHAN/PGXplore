import { pgListings } from '../data/pgData'
import { staffAccounts } from '../utils/auth'
import { createSeedState } from './seedData'

export const ADMIN_STATE_KEY = 'pgxplore_admin_state'
const KEY = ADMIN_STATE_KEY

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function write(state) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

/** Upgrade older persisted state to the current shape (roles, staff, requests). */
function migrateState(state) {
  const next = { ...state }
  next.deletionRequests = Array.isArray(next.deletionRequests) ? next.deletionRequests : []
  next.ownerApprovals = Array.isArray(next.ownerApprovals) ? next.ownerApprovals : []
  if (!next.ownerApprovals.length) {
    next.ownerApprovals = createSeedState(next.pgs?.length ? next.pgs : pgListings).ownerApprovals
  }

  const users = Array.isArray(next.users) ? [...next.users] : []
  const existingEmails = new Set(users.map((u) => u.email?.toLowerCase()))
  // Ensure protected staff (admin + privileged) accounts always exist.
  staffAccounts().forEach((staff) => {
    const idx = users.findIndex((u) => u.email?.toLowerCase() === staff.email.toLowerCase())
    if (idx === -1) {
      users.unshift(staff)
      existingEmails.add(staff.email.toLowerCase())
    } else {
      users[idx] = { ...users[idx], role: staff.role, protected: true }
    }
  })
  next.users = users.map((u) => ({ ...u, role: u.role || 'normal' }))
  return next
}

export function loadAdminState() {
  const saved = read()
  if (saved && Array.isArray(saved.pgs)) {
    const migrated = migrateState(saved)
    write(migrated)
    return migrated
  }
  const seed = createSeedState(pgListings)
  write(seed)
  return seed
}

export function persistAdminState(state) {
  write(state)
}

export function computeDashboardStats(state) {
  const { pgs, rooms, users, bookings } = state
  const totalBeds = rooms.reduce((s, r) => s + (r.totalBeds || 0), 0)
  const occupiedBeds = rooms.reduce((s, r) => s + (r.occupiedBeds || 0), 0)
  const vacantBeds = totalBeds - occupiedBeds
  const revenue = bookings
    .filter((b) => ['approved', 'checked_in', 'checked_out'].includes(b.status))
    .reduce((s, b) => s + (b.amount || 0), 0)

  return {
    totalPGs: pgs.length,
    totalRooms: rooms.length,
    totalBeds,
    occupiedRooms: rooms.filter((r) => r.availability === 'occupied').length,
    occupiedBeds,
    vacantRooms: rooms.filter((r) => r.availability === 'available').length,
    vacantBeds,
    totalUsers: users.length,
    totalBookings: bookings.length,
    totalRevenue: revenue,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    pendingDeletionRequests: (state.deletionRequests || []).filter((r) => r.status === 'pending').length,
    pendingOwnerApprovals: (state.ownerApprovals || []).filter((o) => o.status === 'pending').length,
  }
}

export function getMonthlyRevenue(bookings) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((label, i) => {
    const total = bookings
      .filter((b) => ['approved', 'checked_in', 'checked_out'].includes(b.status))
      .reduce((s, b) => s + (b.amount || 0) * (0.85 + (i % 3) * 0.05), 0)
    return { label, value: Math.round(total / 6) }
  })
}

export function getBookingTrends(bookings) {
  return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, i) => ({
    label,
    value: bookings.filter((_, idx) => idx % 4 === i).length + 2,
  }))
}

export function getOccupancyChart(rooms) {
  const occupied = rooms.reduce((s, r) => s + r.occupiedBeds, 0)
  const total = rooms.reduce((s, r) => s + r.totalBeds, 0)
  const vacant = total - occupied
  return [
    { label: 'Occupied', value: occupied },
    { label: 'Vacant', value: vacant },
  ]
}

export function logActivity(state, action, detail) {
  const entry = {
    id: `a-${Date.now()}`,
    action,
    detail,
    at: new Date().toISOString(),
  }
  state.activities = [entry, ...(state.activities || [])].slice(0, 50)
}

export function pushNotification(state, { type, title, message }) {
  const entry = {
    id: `n-${Date.now()}`,
    type,
    title,
    message,
    read: false,
    at: new Date().toISOString(),
  }
  state.notifications = [entry, ...(state.notifications || [])].slice(0, 30)
}
