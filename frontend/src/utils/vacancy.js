import { getSharingLabel, sharingToEntries } from './sharingTypes'

export function getSharingStatus(type, room) {
  const label = getSharingLabel(type)

  if (!room || room.vacancies === 0) {
    return { type, label, price: room?.price, status: 'Full', tone: 'red' }
  }

  const totalBeds = room.totalBeds > 0 ? room.totalBeds : 1
  const entireRoom = room.vacancies >= totalBeds
  let status

  if (entireRoom) {
    status = `Entire ${label} Available`
  } else if (room.vacancies === 1) {
    status = `1 Bed Available in ${label}`
  } else {
    status = `${room.vacancies} Beds Available in ${label}`
  }

  return { type, label, price: room.price, status, tone: 'green' }
}

export function getVacancySummary(sharing) {
  return sharingToEntries(sharing)
    .map(({ type, ...room }) => getSharingStatus(type, room))
    .filter((item) => item.tone === 'green')
}

export function getStartingRent(sharing) {
  const entries = sharingToEntries(sharing)
  if (entries.length === 0) return 0

  const availablePrices = entries
    .filter((room) => (room.vacancies ?? 0) > 0)
    .map((room) => room.price)
    .filter((p) => Number.isFinite(p))

  if (availablePrices.length === 0) {
    return Math.min(...entries.map((room) => room.price).filter((p) => Number.isFinite(p)))
  }

  return Math.min(...availablePrices)
}

export function getCardVacancyLines(sharing, limit = 2) {
  const available = getVacancySummary(sharing)
  if (available.length === 0) return [{ status: 'Fully Occupied', tone: 'red' }]
  return available.slice(0, limit)
}

export function formatUpdatedAt(dateStr) {
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))

  if (hours < 1) return 'Updated just now'
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`
  if (hours < 48) return 'Updated yesterday'
  return `Updated ${Math.floor(hours / 24)} days ago`
}
