import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { fetchAdminStatsApi } from '../api/admin'
import {
  createPgApi,
  deletePgApi,
  fetchAdminListings,
  fetchAllListings,
  fetchMyListings,
  fetchPgById,
  updatePgApi,
} from '../api/listings'
import {
  ADMIN_STATE_KEY,
  computeDashboardStats,
  loadAdminState,
  logActivity,
  persistAdminState,
  pushNotification,
} from '../admin/adminStore'
import { createSeedState, ROOM_TYPES } from '../admin/seedData'
import { pgListings } from '../data/pgData'
import { canApproveDeletion, canModifyAccount, getSession, hasBackendAdminAccess, ROLES } from '../utils/auth'
import { getPGByIdFromListings, getSimilarPGsFromListings } from '../utils/listingsHelpers'

const AdminContext = createContext(null)

function ensureApiSession() {
  const session = getSession()
  if (!session?.accessToken) {
    throw new Error(
      'Sign in with your API account (admin@pgxplore.com or rajesh@example.com) to create or update PG listings.',
    )
  }
  return session
}

export function AdminProvider({ children }) {
  const { session, bootstrapping } = useAuth()
  const [state, setState] = useState(() => loadAdminState())
  const [apiListings, setApiListings] = useState([])
  const [myListings, setMyListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [listingsError, setListingsError] = useState(null)
  const [pgCache, setPgCache] = useState({})
  const [apiStats, setApiStats] = useState(null)

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

  const refreshListings = useCallback(async () => {
    setListingsLoading(true)
    setListingsError(null)
    try {
      const session = getSession()
      const isAdmin =
        session?.backendRole === 'ADMIN' || session?.role === ROLES.ADMIN
      const isOwner =
        session?.backendRole === 'PG_OWNER' || session?.role === ROLES.PG_OWNER

      let items
      let ownedItems = []
      if (isAdmin && session?.accessToken) {
        items = await fetchAdminListings({ size: 200 })
      } else if (isOwner && session?.accessToken) {
        const [allItems, mine] = await Promise.all([
          fetchAllListings({ size: 200 }),
          fetchMyListings(),
        ])
        items = allItems
        ownedItems = mine
      } else {
        items = await fetchAllListings({ size: 200 })
      }

      setApiListings(items)
      setMyListings(ownedItems)
      setState((prev) => {
        const next = { ...prev, pgs: items }
        persistAdminState(next)
        return next
      })
    } catch (err) {
      setListingsError(err?.message || 'Could not load listings from server. Showing offline data.')
      setApiListings(pgListings)
      setMyListings([])
      setState((prev) => {
        const next = { ...prev, pgs: pgListings }
        persistAdminState(next)
        return next
      })
    } finally {
      setListingsLoading(false)
    }
  }, [])

  const listingsSessionKey = [
    session?.accessToken ?? '',
    session?.backendRole ?? session?.role ?? '',
    session?.id ?? '',
  ].join('|')

  useEffect(() => {
    if (bootstrapping) return
    refreshListings()
  }, [refreshListings, listingsSessionKey, bootstrapping])

  const refreshAdminStats = useCallback(async () => {
    if (!hasBackendAdminAccess(session)) {
      setApiStats(null)
      return
    }
    try {
      setApiStats(await fetchAdminStatsApi())
    } catch {
      setApiStats(null)
    }
  }, [session])

  useEffect(() => {
    if (bootstrapping) return
    refreshAdminStats()
  }, [refreshAdminStats, bootstrapping])

  const listings = useMemo(() => apiListings, [apiListings])

  const getPGById = useCallback(
    (id) =>
      getPGByIdFromListings(listings, id) ||
      getPGByIdFromListings(myListings, id) ||
      pgCache[Number(id)] ||
      null,
    [listings, myListings, pgCache],
  )

  const loadPGById = useCallback(
    async (id) => {
      const existing = getPGById(id)
      if (existing) return existing
      try {
        const pg = await fetchPgById(id)
        if (pg) {
          setPgCache((prev) => ({ ...prev, [Number(id)]: pg }))
        }
        return pg
      } catch {
        return null
      }
    },
    [getPGById],
  )

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

  const stats = useMemo(() => {
    const base = computeDashboardStats(state)
    if (apiStats && typeof apiStats.pendingOwnerApprovals === 'number') {
      return { ...base, pendingOwnerApprovals: apiStats.pendingOwnerApprovals }
    }
    return base
  }, [state, apiStats])

  const addPG = useCallback(
    async (pg) => {
      ensureApiSession()
      const created = await createPgApi(pg)
      await refreshListings()
      save((prev) => {
        const next = { ...prev }
        logActivity(next, 'PG added', created.name)
        pushNotification(next, { type: 'vacancy', title: 'New PG listed', message: created.name })
        return next
      })
      return created
    },
    [save, refreshListings],
  )

  const updatePG = useCallback(
    async (id, updates) => {
      ensureApiSession()
      const updated = await updatePgApi(id, updates)
      setPgCache((prev) => {
        const next = { ...prev }
        delete next[Number(id)]
        return next
      })
      await refreshListings()
      save((prev) => {
        const next = { ...prev }
        logActivity(next, 'PG updated', updates.name || `PG #${id}`)
        return next
      })
      return updated
    },
    [save, refreshListings],
  )

  /** Permanently remove a PG (used only after a deletion request is approved). */
  const removePGPermanently = useCallback(
    async (id) => {
      await deletePgApi(id)
      await refreshListings()
      save((prev) => {
        const next = { ...prev }
        const pg = next.pgs.find((p) => p.id === id)
        next.rooms = next.rooms.filter((r) => r.pgId !== id)
        logActivity(next, 'PG deleted', pg?.name || `PG #${id}`)
        return next
      })
    },
    [save, refreshListings],
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
          requestedByName: requestedBy?.name || 'Privileged Account',
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
          next.rooms = next.rooms.filter((r) => r.pgId !== request.pgId)
          logActivity(next, 'Deletion approved', pg?.name || request.pgName)
          deletePgApi(request.pgId).then(() => refreshListings()).catch(() => {})
        } else {
          logActivity(next, 'Deletion rejected', request.pgName)
        }
        result = { ok: true }
        return next
      })
      return result
    },
    [save, refreshListings],
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
    myListings,
    listingsLoading,
    listingsError,
    refreshListings,
    refreshAdminStats,
    getPGById,
    loadPGById,
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

/** Public site + admin — live PG listings from the API */
export function useListings() {
  const { listings, listingsLoading, listingsError, refreshListings, getPGById, loadPGById, getSimilarPGs } =
    useAdmin()
  return { listings, listingsLoading, listingsError, refreshListings, getPGById, loadPGById, getSimilarPGs }
}
