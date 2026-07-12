/** Owner & map metadata keyed by listing id */
export const pgMetaById = {
  1: {
    owner: { name: 'Meenakshi Devi', phone: '+919876543210', email: 'meenakshi@sribalajipg.in', role: 'Proprietor' },
    location: {
      address: 'Near Chromepet Railway Station, Chromepet, Chennai',
      lat: 12.9516,
      lng: 80.1392,
    },
  },
  2: {
    owner: { name: 'Rajan Kumar', phone: '+919765432109', email: 'rajan@metrostay.in', role: 'Manager' },
    location: {
      address: 'Tambaram Bus Stand Road, Tambaram, Chennai',
      lat: 12.9249,
      lng: 80.1000,
    },
  },
  3: {
    owner: { name: 'Priya Shankar', phone: '+919654321098', email: 'priya@sunrisecoliving.in', role: 'Owner' },
    location: {
      address: 'GST Road, Perungalathur, Chennai',
      lat: 12.9057,
      lng: 80.0959,
    },
  },
  4: {
    owner: { name: 'Lakshmi Venkat', phone: '+919543210987', email: 'lakshmi@greenvalley.in', role: 'Warden' },
    location: {
      address: 'Guduvanchery Main Road, Guduvanchery, Chennai',
      lat: 12.8452,
      lng: 80.0619,
    },
  },
  5: {
    owner: { name: 'Suresh Babu', phone: '+919432109876', email: 'suresh@citycomfort.in', role: 'Owner' },
    location: {
      address: 'Pallavaram–Thoraipakkam Road, Pallavaram, Chennai',
      lat: 12.9675,
      lng: 80.1491,
    },
  },
  6: {
    owner: { name: 'Sanjay Menon', phone: '+919321098765', email: 'sanjay@eliteresidency.in', role: 'Manager' },
    location: {
      address: 'Chromepet East, Chennai',
      lat: 12.9548,
      lng: 80.1425,
    },
  },
  7: {
    owner: { name: 'Saraswathi Iyer', phone: '+919210987654', email: 'saraswathi@campusnest.in', role: 'Proprietor' },
    location: {
      address: 'College Road, Perungalathur, Chennai',
      lat: 12.9012,
      lng: 80.0891,
    },
  },
  8: {
    owner: { name: 'Vijay Prakash', phone: '+919109876543', email: 'vijay@royalheights.in', role: 'Owner' },
    location: {
      address: 'Tambaram Sanatorium, Chennai',
      lat: 12.9315,
      lng: 80.1182,
    },
  },
}

export function enrichPG(pg) {
  if (!pg) return null
  const meta = pgMetaById[pg.id] || {}
  return {
    ...pg,
    owner: { ...(meta.owner || {}), ...(pg.owner || {}) },
    location: { ...(meta.location || {}), ...(pg.location || {}) },
  }
}

export function mapsEmbedUrl(location) {
  if (!location?.lat || !location?.lng) return null
  const q = encodeURIComponent(`${location.lat},${location.lng}`)
  return `https://www.google.com/maps?q=${q}&hl=en&z=15&output=embed`
}

export function mapsDirectionsUrl(location) {
  if (!location?.lat || !location?.lng) return null
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
}
