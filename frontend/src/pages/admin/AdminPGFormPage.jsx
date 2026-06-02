import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PGImageManager from '../../components/admin/PGImageManager'
import SharingConfigEditor from '../../components/admin/SharingConfigEditor'
import { AMENITY_OPTIONS, AREAS } from '../../data/pgData'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'
import {
  entriesToSharing,
  sharingObjectToFormConfigs,
  validateSharingConfigs,
} from '../../utils/sharingTypes'
import { normalizeImageList, validatePgImages } from '../../utils/pgImages'

const emptyForm = {
  name: '',
  area: AREAS[0],
  gender: 'Boys',
  deposit: 10000,
  noticePeriodDays: 30,
  currentBillIncluded: false,
  foodAvailable: true,
  foodType: 'Veg',
  featured: false,
  description: '',
  amenities: ['WiFi'],
  houseRules: '',
  lat: '',
  lng: '',
  address: '',
  availabilityStatus: 'active',
}

export default function AdminPGFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { state, addPG, updatePG } = useAdmin()
  const { showToast } = useToast()

  const existing = useMemo(() => state.pgs.find((p) => String(p.id) === id), [state.pgs, id])

  const [form, setForm] = useState(() => {
    if (!existing) return emptyForm
    return {
      name: existing.name,
      area: existing.area,
      gender: existing.gender,
      deposit: existing.deposit,
      noticePeriodDays: existing.noticePeriodDays ?? 30,
      currentBillIncluded: existing.currentBillIncluded ?? false,
      foodAvailable: existing.foodAvailable,
      foodType: existing.foodType || 'Veg',
      featured: existing.featured,
      description: existing.description,
      amenities: existing.amenities || [],
      houseRules: (existing.houseRules || []).join('\n'),
      lat: existing.location?.lat ?? '',
      lng: existing.location?.lng ?? '',
      address: existing.location?.address ?? '',
      availabilityStatus: existing.availabilityStatus || 'active',
    }
  })

  const [sharingConfigs, setSharingConfigs] = useState(() => {
    if (!existing) return []
    return sharingObjectToFormConfigs(existing.sharing)
  })

  const [sharingError, setSharingError] = useState('')
  const [images, setImages] = useState(() => (existing ? [...(existing.images || [])] : []))
  const [imagesError, setImagesError] = useState('')

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }))
  }

  const buildPayload = () => ({
    name: form.name.trim(),
    area: form.area,
    gender: form.gender,
    deposit: Number(form.deposit),
    noticePeriodDays: Number(form.noticePeriodDays),
    currentBillIncluded: Boolean(form.currentBillIncluded),
    foodAvailable: form.foodAvailable,
    foodType: form.foodType,
    featured: form.featured,
    description: form.description.trim(),
    amenities: form.amenities,
    houseRules: form.houseRules.split('\n').map((s) => s.trim()).filter(Boolean),
    images: normalizeImageList(images),
    location: {
      address: form.address.trim(),
      lat: Number(form.lat) || 0,
      lng: Number(form.lng) || 0,
    },
    availabilityStatus: form.availabilityStatus,
    rating: existing?.rating ?? 4.2,
    reviews: existing?.reviews ?? [],
    sharing: entriesToSharing(sharingConfigs),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      showToast('PG name is required.', 'error')
      return
    }

    const noticeDays = Number(form.noticePeriodDays)
    if (!Number.isFinite(noticeDays) || noticeDays < 0) {
      showToast('Enter a valid notice period (0 or more days).', 'error')
      return
    }

    const imageValidation = validatePgImages(images)
    if (!imageValidation.valid) {
      setImagesError(imageValidation.message)
      showToast(imageValidation.message, 'error')
      return
    }

    const validation = validateSharingConfigs(sharingConfigs)
    if (!validation.valid) {
      setSharingError(validation.message)
      showToast(validation.message, 'error')
      return
    }

    setImagesError('')
    setSharingError('')
    const payload = buildPayload()
    if (isEdit && existing) {
      updatePG(existing.id, payload)
      showToast('PG updated.')
    } else {
      addPG(payload)
      showToast('PG added.')
    }
    navigate('/admin/pgs')
  }

  if (isEdit && !existing) {
    return (
      <div className="admin-panel">
        <p className="text-muted">PG not found.</p>
        <Link to="/admin/pgs" className="mt-4 inline-block text-brand-emphasis">
          Back to list
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="admin-panel max-w-4xl">
      <h2 className="admin-panel-title">{isEdit ? 'Edit PG Details' : 'Add New PG'}</h2>

      <div className="admin-form-grid">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-main">PG Name</span>
          <input className="input-app mt-1 w-full" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-main">Area</span>
          <select className="select-app mt-1" value={form.area} onChange={(e) => set('area', e.target.value)}>
            {AREAS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-main">Gender</span>
          <select className="select-app mt-1" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
            {['Boys', 'Girls', 'Co-living'].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-main">Deposit (₹)</span>
          <input type="number" min="0" className="input-app mt-1 w-full" value={form.deposit} onChange={(e) => set('deposit', e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-main">Notice period (days)</span>
          <input
            type="number"
            min="0"
            className="input-app mt-1 w-full"
            value={form.noticePeriodDays}
            onChange={(e) => set('noticePeriodDays', e.target.value)}
            placeholder="e.g. 30"
            required
          />
          <span className="mt-1 block text-xs text-muted">Days of notice required before vacating (0 = none).</span>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-main">Availability Status</span>
          <select className="select-app mt-1" value={form.availabilityStatus} onChange={(e) => set('availabilityStatus', e.target.value)}>
            <option value="active">Active</option>
            <option value="limited">Limited</option>
            <option value="full">Full</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      <SharingConfigEditor
        value={sharingConfigs}
        onChange={(next) => {
          setSharingConfigs(next)
          if (sharingError) setSharingError('')
        }}
        error={sharingError}
      />

      <PGImageManager
        value={images}
        onChange={(next) => {
          setImages(next)
          if (imagesError) setImagesError('')
        }}
        error={imagesError}
      />

      <label className="mt-4 block text-sm">
        <span className="font-medium text-main">Description</span>
        <textarea className="input-app mt-1 min-h-24 w-full" value={form.description} onChange={(e) => set('description', e.target.value)} />
      </label>

      <div className="mt-4">
        <p className="text-sm font-medium text-main">Amenities</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 rounded-lg border border-app px-3 py-2 text-sm">
              <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
              {a}
            </label>
          ))}
        </div>
      </div>

      <label className="mt-4 block text-sm">
        <span className="font-medium text-main">Rules & policies (one per line)</span>
        <textarea className="input-app mt-1 min-h-20 w-full" value={form.houseRules} onChange={(e) => set('houseRules', e.target.value)} />
      </label>

      <div className="admin-form-grid mt-4">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium text-main">Google Maps address</span>
          <input className="input-app mt-1 w-full" value={form.address} onChange={(e) => set('address', e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-main">Latitude</span>
          <input className="input-app mt-1 w-full" value={form.lat} onChange={(e) => set('lat', e.target.value)} />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-main">Longitude</span>
          <input className="input-app mt-1 w-full" value={form.lng} onChange={(e) => set('lng', e.target.value)} />
        </label>
      </div>

      <div className="mt-4 space-y-3 rounded-xl border border-app bg-card-muted/50 p-4">
        <p className="text-sm font-medium text-main">Utilities & listing options</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.currentBillIncluded}
              onChange={(e) => set('currentBillIncluded', e.target.checked)}
            />
            <span>
              <span className="font-medium text-main">Current bill included in rent</span>
              <span className="mt-0.5 block text-xs text-muted">
                Electricity / current charges are covered in the monthly rent.
              </span>
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.foodAvailable} onChange={(e) => set('foodAvailable', e.target.checked)} />
            Food available
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            Featured PG
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Create PG'}</button>
        <Link to="/admin/pgs" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  )
}
