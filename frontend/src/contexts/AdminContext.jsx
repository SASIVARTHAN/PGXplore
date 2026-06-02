import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  ADMIN_STATE_KEY,
  computeDashboardStats,
  loadAdminState,
  logActivity,
  persistAdminState,
  pushNotification,
} from '../admin/adminStore'
import { createSeedState, ROOM_TYPES } from '../admin/seedData'
import { getPGByIdFromListings, getSimilarPGsFromListings } from '../utils/listingsHelpers'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [state, setState] = useState(() => loadAdminState())

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== ADMIN_STATE_KEY || !event.newValue) return
      try {
        setState(JSON.parse(event.newValue))
      } catch {
        /* ignore corrupt cross-tab payload */
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const listings = useMemo(() => state.pgs, [state.pgs])

  const getPGById = useCallback((id) => getPGByIdFromListings(listings, id), [listings])

  const getSimilarPGs = useCallback(
    (pg, limit = 3) => getSimilarPGsFromListings(listings, pg, limit),
    [listings],
  )

  const save = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persistAdminState(next)
      return next
    })
  }, [])

  const stats = useMemo(() => computeDashboardStats(state), [state])

  const addPG = useCallback(
    (pg) => {
      save((prev) => {
        const next = { ...prev }
        const id = Math.max(0, ...next.pgs.map((p) => p.id)) + 1
        const entry = { ...pg, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        next.pgs = [...next.pgs, entry]
        logActivity(next, 'PG added', entry.name)
        pushNotification(next, { type: 'vacancy', title: 'New PG listed', message: entry.name })
        return next
      })
    },
    [save],
  )

  const updatePG = useCallback(
    (id, updates) => {
      save((prev) => {
        const next = { ...prev }
        next.pgs = next.pgs.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
        )
        logActivity(next, 'PG updated', updates.name || `PG #${id}`)
        return next
      })
    },
    [save],
  )

  const deletePG = useCallback(
    (id) => {
      save((prev) => {
        const next = { ...prev }
        const pg = next.pgs.find((p) => p.id === id)
        next.pgs = next.pgs.filter((p) => p.id !== id)
        next.rooms = next.rooms.filter((r) => r.pgId !== id)
        logActivity(next, 'PG deleted', pg?.name || `PG #${id}`)
        return next
      })
    },
    [save],
  )

  const addRoom = useCallback(
    (room) => {
      save((prev) => {
        const next = { ...prev }
        next.rooms = [...next.rooms, { ...room, id: `room-${Date.now()}` }]
        logActivity(next, 'Room added', `${room.type} at ${room.pgName}`)
        return next
      })
    },
    [save],
  )

  const updateRoom = useCallback(
    (id, updates) => {
      save((prev) => {
        const next = { ...prev }
        next.rooms = next.rooms.map((r) => (r.id === id ? { ...r, ...updates } : r))
        return next
      })
    },
    [save],
  )

  const deleteRoom = useCallback(
    (id) => {
      save((prev) => {
        const next = { ...prev }
        next.rooms = next.rooms.filter((r) => r.id !== id)
        return next
      })
    },
    [save],
  )

  const updateBooking = useCallback(
    (id, status) => {
      save((prev) => {
        const next = { ...prev }
        next.bookings = next.bookings.map((b) => (b.id === id ? { ...b, status } : b))
        const b = next.bookings.find((x) => x.id === id)
        if (b) logActivity(next, `Booking ${status}`, `${b.userName} — ${b.pgName}`)
        return next
      })
    },
    [save],
  )

  const updateUser = useCallback(
    (id, updates) => {
      save((prev) => {
        const next = { ...prev }
        next.users = next.users.map((u) => (u.id === id ? { ...u, ...updates } : u))
        if (updates.status === 'blocked') {
          logActivity(next, 'User blocked', next.users.find((u) => u.id === id)?.name)
        }
        return next
      })
    },
    [save],
  )

  const deleteReview = useCallback(
    (reviewKey) => {
      save((prev) => {
        const next = { ...prev }
        next.deletedReviewIds = [...(next.deletedReviewIds || []), reviewKey]
        logActivity(next, 'Review removed', reviewKey)
        return next
      })
    },
    [save],
  )

  const markNotificationRead = useCallback(
    (id) => {
      save((prev) => {
        const next = { ...prev }
        next.notifications = next.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        return next
      })
    },
    [save],
  )

  const markAllNotificationsRead = useCallback(() => {
    save((prev) => {
      const next = { ...prev }
      next.notifications = next.notifications.map((n) => ({ ...n, read: true }))
      return next
    })
  }, [save])

  const resetDemoData = useCallback(() => {
    const seed = createSeedState()
    persistAdminState(seed)
    setState(seed)
  }, [])

  const value = {
    state,
    listings,
    getPGById,
    getSimilarPGs,
    stats,
    save,
    addPG,
    updatePG,
    deletePG,
    addRoom,
    updateRoom,
    deleteRoom,
    updateBooking,
    updateUser,
    deleteReview,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    ROOM_TYPES,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}

/** Public site + admin — live PG listings from the same store */
export function useListings() {
  const { listings, getPGById, getSimilarPGs } = useAdmin()
  return { listings, getPGById, getSimilarPGs }
}
