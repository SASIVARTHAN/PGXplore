import { pgListings } from '../data/pgData'
import { staffAccounts } from '../utils/auth'
import { roomTypeFromSharingId } from '../utils/sharingTypes'

export const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Four', 'Five', 'Dormitory']

export const BOOKING_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'checked_in',
  'checked_out',
]

function roomsFromListings(listings) {
  const rooms = []
  listings.forEach((pg) => {
    Object.entries(pg.sharing || {}).forEach(([key, room]) => {
      if (!room) return
      const totalBeds = room.totalBeds || 1
      const vacant = room.vacancies ?? 0
      rooms.push({
        id: `room-${pg.id}-${key}`,
        pgId: pg.id,
        pgName: pg.name,
        type: roomTypeFromSharingId(key),
        monthlyRent: room.price,
        totalBeds,
        occupiedBeds: Math.max(0, totalBeds - vacant),
        images: pg.images?.slice(0, 1) || [],
        availability: vacant > 0 ? 'available' : 'occupied',
      })
    })
    rooms.push({
      id: `room-${pg.id}-dorm`,
      pgId: pg.id,
      pgName: pg.name,
      type: 'Dormitory',
      monthlyRent: Math.min(...Object.values(pg.sharing).map((r) => r.price)) - 500,
      totalBeds: 8,
      occupiedBeds: 5,
      images: pg.images?.slice(0, 1) || [],
      availability: 'available',
    })
  })
  return rooms
}

export function createSeedState(listings = pgListings) {
  const rooms = roomsFromListings(listings)
  const totalBeds = rooms.reduce((s, r) => s + r.totalBeds, 0)
  const occupiedBeds = rooms.reduce((s, r) => s + r.occupiedBeds, 0)

  return {
    pgs: listings.map((pg) => ({ ...pg })),
    rooms,
    users: [
      ...staffAccounts(),
      { id: 'u1', name: 'Ananya R', email: 'ananya@email.com', phone: '+91 98765 43210', status: 'active', role: 'normal', joinedAt: '2026-03-01T10:00:00.000Z' },
      { id: 'u2', name: 'Karthik M', email: 'karthik@email.com', phone: '+91 91234 56789', status: 'active', role: 'normal', joinedAt: '2026-04-10T10:00:00.000Z' },
      { id: 'u3', name: 'Priya S', email: 'priya@email.com', phone: '+91 99887 76655', status: 'blocked', role: 'normal', joinedAt: '2026-02-15T10:00:00.000Z' },
      { id: 'u4', name: 'Rahul V', email: 'rahul@email.com', phone: '+91 90001 22334', status: 'active', role: 'normal', joinedAt: '2026-05-01T10:00:00.000Z' },
    ],
    bookings: [
      { id: 'b1', userId: 'u1', userName: 'Ananya R', pgId: 1, pgName: listings[0]?.name, roomType: 'Double', status: 'pending', amount: 6500, checkIn: '2026-06-15', checkOut: '2026-12-15', createdAt: '2026-05-28T09:00:00.000Z' },
      { id: 'b2', userId: 'u2', userName: 'Karthik M', pgId: 2, pgName: listings[1]?.name, roomType: 'Single', status: 'approved', amount: 9000, checkIn: '2026-06-01', checkOut: '2026-11-01', createdAt: '2026-05-27T14:00:00.000Z' },
      { id: 'b3', userId: 'u4', userName: 'Rahul V', pgId: 3, pgName: listings[2]?.name, roomType: 'Triple', status: 'checked_in', amount: 5000, checkIn: '2026-05-20', checkOut: '2026-08-20', createdAt: '2026-05-20T11:00:00.000Z' },
      { id: 'b4', userId: 'u2', userName: 'Karthik M', pgId: 1, pgName: listings[0]?.name, roomType: 'Single', status: 'checked_out', amount: 8500, checkIn: '2026-01-01', checkOut: '2026-04-01', createdAt: '2025-12-28T10:00:00.000Z' },
    ],
    notifications: [
      { id: 'n1', type: 'booking', title: 'New booking request', message: 'Ananya R requested Double sharing at Sri Balaji Ladies PG', read: false, at: '2026-05-28T09:00:00.000Z' },
      { id: 'n2', type: 'review', title: 'New review', message: '5-star review on Metro Stay Boys PG', read: false, at: '2026-05-27T16:00:00.000Z' },
      { id: 'n3', type: 'vacancy', title: 'Low vacancy alert', message: 'Sunrise Co-Living has no triple sharing beds left', read: true, at: '2026-05-26T08:00:00.000Z' },
    ],
    activities: [
      { id: 'a1', action: 'Booking approved', detail: 'Karthik M — Metro Stay Boys PG', at: '2026-05-27T15:00:00.000Z' },
      { id: 'a2', action: 'PG updated', detail: 'Sri Balaji Ladies PG rent revised', at: '2026-05-26T12:00:00.000Z' },
      { id: 'a3', action: 'User blocked', detail: 'Priya S account suspended', at: '2026-05-25T10:00:00.000Z' },
      { id: 'a4', action: 'Check-in', detail: 'Rahul V checked in at Sunrise Co-Living', at: '2026-05-20T11:30:00.000Z' },
    ],
    deletionRequests: [],
    deletedReviewIds: [],
    ownerApprovals: [
      {
        id: 'owner-seed-1',
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '9876543210',
        pgName: 'Metro Stay Boys PG',
        address: 'Velachery, Chennai',
        status: 'approved',
        registrationDate: '2026-01-15T10:00:00.000Z',
        verificationDocuments: ['business-license.pdf'],
      },
      {
        id: 'owner-seed-2',
        name: 'Hemanth S',
        email: 'hemanth@gmail.com',
        phone: '9123456780',
        pgName: 'Green Nest PG',
        address: 'Tambaram, Chennai',
        status: 'pending',
        registrationDate: '2026-06-18T09:30:00.000Z',
        verificationDocuments: [],
      },
      {
        id: 'owner-seed-3',
        name: 'Priya Owner',
        email: 'priya.owner@example.com',
        phone: '9988776655',
        pgName: 'Sunrise Ladies PG',
        address: 'Chromepet, Chennai',
        status: 'rejected',
        registrationDate: '2026-06-10T14:20:00.000Z',
        verificationDocuments: ['id-proof.jpg'],
      },
    ],
    stats: { totalBeds, occupiedBeds },
  }
}
