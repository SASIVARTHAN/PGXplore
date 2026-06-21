import { ROLES } from './auth'

export function isBackendAdmin(session) {
  return session?.backendRole === 'ADMIN' || session?.role === ROLES.ADMIN
}

export function isBackendPgOwner(session) {
  return session?.backendRole === 'PG_OWNER' || session?.role === ROLES.PG_OWNER
}

export function ownsPg(pg, session) {
  if (!pg || session?.id == null) return false
  return String(pg.ownerId) === String(session.id)
}

/** Whether the signed-in user may edit this PG (admins: any; owners: own listings only). */
export function canModifyPg(pg, session) {
  if (!session) return false
  if (isBackendAdmin(session)) return true
  if (!isBackendPgOwner(session)) return false
  return ownsPg(pg, session)
}

/** Only admins may permanently delete via the API. Owners use the deletion-request flow. */
export function canDirectDeletePg(session) {
  return isBackendAdmin(session)
}

export function canApproveListing(session) {
  return isBackendAdmin(session)
}

export function listingStatusLabel(status) {
  if (status === 'pending') return 'Awaiting approval'
  if (status === 'rejected') return 'Rejected'
  return 'Approved'
}
