import { PG_IMAGE_PLACEHOLDER } from '../../utils/pgImages'
import { getStartingRent } from '../../utils/vacancy'
import { sharingToEntries } from '../../utils/sharingTypes'

const GENDER_FROM_API = {
  BOYS: 'Boys',
  GIRLS: 'Girls',
  CO_LIVING: 'Co-living',
}

const GENDER_TO_API = {
  Boys: 'BOYS',
  Girls: 'GIRLS',
  'Co-living': 'CO_LIVING',
}

export function mapGenderFromApi(gender) {
  return GENDER_FROM_API[gender] || gender || 'Boys'
}

export function mapGenderToApi(gender) {
  return GENDER_TO_API[gender] || 'BOYS'
}

function synthesizeSharing(rent, availableBeds) {
  const price = Number(rent) || 0
  const beds = Math.max(0, Number(availableBeds) || 0)
  if (price <= 0 && beds <= 0) return {}
  return {
    single: { price: price || 5000, vacancies: beds, totalBeds: Math.max(beds, 1) },
  }
}

export function mapPgFromApi(item) {
  if (!item) return null
  const imageUrls = (item.images || []).map((img) =>
    typeof img === 'string' ? img : img.imageUrl,
  )
  const rent = Number(item.rent) || 0
  const beds = item.availableBeds ?? 0

  return {
    id: item.id,
    name: item.name,
    area: item.area,
    city: item.city,
    gender: mapGenderFromApi(item.gender),
    rating: Number(item.rating) || 0,
    deposit: Number(item.deposit) || 0,
    foodAvailable: Boolean(item.foodAvailable),
    foodType: item.foodAvailable ? 'Veg' : 'None',
    description: item.description || '',
    amenities: item.amenities || [],
    images: imageUrls.length ? imageUrls : [PG_IMAGE_PLACEHOLDER],
    sharing: synthesizeSharing(rent, beds),
    reviews: [],
    reviewsCount: item.reviewsCount ?? 0,
    location: {
      address: item.address || '',
      lat: item.latitude != null ? Number(item.latitude) : 0,
      lng: item.longitude != null ? Number(item.longitude) : 0,
    },
    owner: {
      name: item.ownerName || 'Owner',
      phone: item.contactNumber || '',
      email: '',
      role: 'Owner',
    },
    ownerId: item.ownerId,
    contactNumber: item.contactNumber,
    noticePeriodDays: 30,
    currentBillIncluded: false,
    featured: false,
    houseRules: [],
    availabilityStatus: item.availabilityStatus || (beds > 0 ? 'active' : 'full'),
    listingStatus: item.listingStatus || 'approved',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt || item.createdAt,
  }
}

export function mapPgListFromApi(items = []) {
  return items.map(mapPgFromApi).filter(Boolean)
}

function normalizeContactNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return digits
  return ''
}

export function mapPgToApiRequest(pg) {
  const sharing = pg.sharing || {}
  const rent = getStartingRent(sharing) || 5000
  const entries = sharingToEntries(sharing)
  const availableBeds = entries.reduce((sum, e) => sum + (e.vacancies ?? 0), 0)
  const availableRooms = entries.filter((e) => (e.vacancies ?? 0) > 0).length

  const amenities = (pg.amenities || []).map((a) => String(a).trim()).filter(Boolean)
  const ownerContactName = (pg.owner?.name || pg.ownerContactName || '').trim()
  const contactNumber = normalizeContactNumber(pg.owner?.phone || pg.contactNumber)

  return {
    name: pg.name,
    description: pg.description || '',
    address: pg.location?.address || pg.address || '',
    city: pg.city || 'Chennai',
    area: pg.area,
    latitude: pg.location?.lat ?? pg.latitude ?? null,
    longitude: pg.location?.lng ?? pg.longitude ?? null,
    rent,
    deposit: Number(pg.deposit) || 0,
    gender: mapGenderToApi(pg.gender),
    amenities,
    availableBeds,
    availableRooms: availableRooms || 1,
    foodAvailable: Boolean(pg.foodAvailable),
    ownerContactName,
    contactNumber,
    availabilityStatus: pg.availabilityStatus || 'active',
    imageUrls: (pg.images || []).filter(Boolean),
  }
}
