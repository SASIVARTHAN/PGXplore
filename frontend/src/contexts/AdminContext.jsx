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
import { canApproveDeletion, canModifyAccount } from '../utils/auth'
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

  /** Permanently remove a PG (used only after a deletion request is approved). */
  const removePGPermanently = useCallback(
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

  const getPendingDeletionRequest = useCallback(
    (pgId) => (state.deletionRequests || []).find((r) => r.pgId === pgId && r.status === 'pending'),
    [state.deletionRequests],
  )

  /** Admin submits a deletion request; PG stays active until a reviewer approves. */
  const requestPGDeletion = useCallback(
    ({ pgId, reason = '', requestedBy }) => {
      let result = { ok: false, message: 'Could not submit request.' }
      save((prev) => {
        const next = { ...prev }
        const pg = next.pgs.find((p) => p.id === pgId)
        if (!pg) {
          result = { ok: false, message: 'PG not found.' }
          return prev
        }
        const requests = next.deletionRequests || []
        if (requests.some((r) => r.pgId === pgId && r.status === 'pending')) {
          result = { ok: false, message: 'A deletion request is already pending for this PG.' }
          return prev
        }
        const entry = {
          id: `dr-${Date.now()}`,
          pgId,
          pgName: pg.name,
          reason: reason.trim(),
          status: 'pending',
          requestedById: requestedBy?.id || null,
          requestedByName: requestedBy?.name || 'Admin',
          requestedAt: new Date().toISOString(),
          resolvedById: null,
          resolvedByName: null,
          resolvedAt: null,
        }
        next.deletionRequests = [entry, ...requests]
        logActivity(next, 'Deletion requested', pg.name)
        pushNotification(next, {
          type: 'deletion',
          title: 'PG deletion requested',
          message: `${entry.requestedByName} requested removal of ${pg.name}`,
        })
        result = { ok: true }
        return next
      })
      return result
    },
    [save],
  )

  /** Privileged reviewers approve a deletion request; reviewers may reject. */
  const resolveDeletionRequest = useCallback(
    ({ requestId, approve, reviewer }) => {
      let result = { ok: false, message: 'Could not update request.' }
      if (approve && !canApproveDeletion(reviewer?.role)) {
        return { ok: false, message: 'Only privileged accounts can accept deletion requests.' }
      }
      save((prev) => {
        const next = { ...prev }
        const requests = next.deletionRequests || []
        const request = requests.find((r) => r.id === requestId)
        if (!request || request.status !== 'pending') {
          result = { ok: false, message: 'Request is no longer pending.' }
          return prev
        }
        const resolvedAt = new Date().toISOString()
        next.deletionRequests = requests.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: approve ? 'approved' : 'rejected',
                resolvedById: reviewer?.id || null,
                resolvedByName: reviewer?.name || 'Reviewer',
                resolvedAt,
              }
            : r,
        )
        if (approve) {
          const pg = next.pgs.find((p) => p.id === request.pgId)
          next.pgs = next.pgs.filter((p) => p.id !== request.pgId)
          next.rooms = next.rooms.filter((r) => r.pgId !== request.pgId)
          logActivity(next, 'Deletion approved', pg?.name || request.pgName)
        } else {
          logActivity(next, 'Deletion rejected', request.pgName)
        }
        result = { ok: true }
        return next
      })
      return result
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
    (id, updates, actorRole) => {
      let result = { ok: false, message: 'Could not update user.' }
      save((prev) => {
        const next = { ...prev }
        const target = next.users.find((u) => u.id === id)
        if (!target) {
          result = { ok: false, message: 'User not found.' }
          return prev
        }
        if (actorRole && !canModifyAccount(actorRole, target)) {
          result = { ok: false, message: 'You do not have permission to modify this account.' }
          return prev
        }
        next.users = next.users.map((u) => (u.id === id ? { ...u, ...updates } : u))
        if (updates.status === 'blocked') {
          logActivity(next, 'User blocked', target.name)
        } else if (updates.status === 'active') {
          logActivity(next, 'User unblocked', target.name)
        }
        result = { ok: true }
        return next
      })
      return result
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
    removePGPermanently,
    requestPGDeletion,
    resolveDeletionRequest,
    getPendingDeletionRequest,
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
