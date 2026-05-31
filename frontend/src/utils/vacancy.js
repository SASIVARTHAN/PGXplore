const SHARING_LABELS = {
  single: 'Single Sharing',
  double: 'Double Sharing',
  triple: 'Triple Sharing',
}

export function getSharingStatus(type, room) {
  if (!room || room.vacancies === 0) {
    return { type, label: SHARING_LABELS[type], price: room?.price, status: 'Full', tone: 'red' }
  }

  const entireRoom = room.vacancies >= room.totalBeds
  let status

  if (entireRoom) {
    status =
      type === 'single'
        ? 'Entire Single Room Available'
        : type === 'double'
          ? 'Entire Double Sharing Room Available'
          : 'Entire Triple Sharing Room Available'
  } else if (room.vacancies === 1) {
    status = `1 Bed Available in ${SHARING_LABELS[type]}`
  } else {
    status = `${room.vacancies} Beds Available in ${SHARING_LABELS[type]}`
  }

  return { type, label: SHARING_LABELS[type], price: room.price, status, tone: 'green' }
}

export function getVacancySummary(sharing) {
  return ['single', 'double', 'triple']
    .map((type) => getSharingStatus(type, sharing[type]))
    .filter((item) => item.tone === 'green')
}

export function getStartingRent(sharing) {
  const prices = Object.values(sharing)
    .filter((room) => room.vacancies > 0)
    .map((room) => room.price)

  if (prices.length === 0) {
    return Math.min(...Object.values(sharing).map((room) => room.price))
  }

  return Math.min(...prices)
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
