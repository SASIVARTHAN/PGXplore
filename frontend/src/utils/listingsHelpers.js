import { enrichPG } from '../data/pgMeta'
import { sharingToEntries } from './sharingTypes'

function getMinRent(pg) {
  const prices = sharingToEntries(pg.sharing).map((room) => room.price).filter((p) => Number.isFinite(p))
  return prices.length ? Math.min(...prices) : 0
}

export function getPGByIdFromListings(listings, id) {
  const pg = listings.find((p) => p.id === Number(id))
  return enrichPG(pg)
}

export function getSimilarPGsFromListings(listings, pg, limit = 3) {
  if (!pg) return []
  return listings
    .filter(
      (item) =>
        item.id !== pg.id &&
        (item.area === pg.area ||
          item.gender === pg.gender ||
          Math.abs(getMinRent(item) - getMinRent(pg)) < 1500),
    )
    .slice(0, limit)
}
