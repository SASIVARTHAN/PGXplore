import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import PGImageManager from '../../components/admin/PGImageManager'
import SharingConfigEditor from '../../components/admin/SharingConfigEditor'
import { AMENITY_OPTIONS, AREAS } from '../../data/pgData'
import { useToast } from '../../components/Toast'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'
import { fetchPgById } from '../../api/listings'
import { canModifyPg, isBackendPgOwner } from '../../utils/pgPermissions'
import {
  entriesToSharing,
  sharingObjectToFormConfigs,
  validateSharingConfigs,
} from '../../utils/sharingTypes'
import { normalizeImageList, validatePgImages } from '../../utils/pgImages'
import {
  FOOD_AVAILABILITY_OPTIONS,
  foodAvailabilityToLegacyFields,
  normalizeFoodAvailability,
} from '../../utils/foodAvailability'

const FOOD_AMENITY = 'Food'

const emptyForm = {
  name: '',
  ownerName: '',
  ownerPhone: '',
  area: AREAS[0],
  gender: 'Boys',
  deposit: 10000,
  noticePeriodDays: 30,
  currentBillIncluded: false,
  foodAvailability: 'not_available',
  featured: false,
  description: '',
  amenities: [],
  houseRules: '',
  lat: '',
  lng: '',
  address: '',
  availabilityStatus: 'active',
}

function pgToFormState(pg) {
  if (!pg) return { ...emptyForm }
  const amenities = pg.amenities || []
  const hasFoodAmenity = amenities.includes(FOOD_AMENITY)
  return {
    name: pg.name,
    ownerName: pg.owner?.name ?? '',
    ownerPhone: pg.owner?.phone ?? '',
    area: pg.area,
    gender: pg.gender,
    deposit: pg.deposit,
    noticePeriodDays: pg.noticePeriodDays ?? 30,
    currentBillIncluded: pg.currentBillIncluded ?? false,
    foodAvailability: hasFoodAmenity ? normalizeFoodAvailability(pg) : 'not_available',
    featured: pg.featured,
    description: pg.description,
    amenities,
    houseRules: (pg.houseRules || []).join('\n'),
    lat: pg.location?.lat ?? '',
    lng: pg.location?.lng ?? '',
    address: pg.location?.address ?? '',
    availabilityStatus: pg.availabilityStatus || 'active',
  }
}

export default function AdminPGFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { addPG, updatePG } = useAdmin()
  const { showToast } = useToast()
  const { session, isAccountUser } = useAuth()

  const [pgRecord, setPgRecord] = useState(null)
  const [loadingPg, setLoadingPg] = useState(isEdit)
  const [form, setForm] = useState(emptyForm)
  const [sharingConfigs, setSharingConfigs] = useState([])

  const [sharingError, setSharingError] = useState('')
  const [images, setImages] = useState([])
  const [imagesError, setImagesError] = useState('')
  const [amenitiesError, setAmenitiesError] = useState('')
  const [ownerError, setOwnerError] = useState('')

  useEffect(() => {
    if (!isEdit) {
      setPgRecord(null)
      setForm(emptyForm)
      setSharingConfigs([])
      setImages([])
      setLoadingPg(false)
      return undefined
    }

    let cancelled = false
    setLoadingPg(true)

    fetchPgById(id)
      .then((pg) => {
        if (cancelled) return
        if (!pg) {
          setPgRecord(null)
          return
        }
        setPgRecord(pg)
        setForm(pgToFormState(pg))
        setSharingConfigs(sharingObjectToFormConfigs(pg.sharing))
        setImages([...(pg.images || [])])
      })
      .catch(() => {
        if (!cancelled) setPgRecord(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingPg(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, isEdit])

  useEffect(() => {
    if (!isEdit || loadingPg || !pgRecord || !session) return
    if (!canModifyPg(pgRecord, session)) {
      showToast('You can only edit PG listings that you own.', 'error')
      navigate(isBackendPgOwner(session) ? '/admin/my-pgs' : '/admin/pgs', { replace: true })
    }
  }, [isEdit, loadingPg, pgRecord, session, navigate, showToast])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const toggleAmenity = (a) => {
    setForm((f) => {
      const hasAmenity = f.amenities.includes(a)
      const nextAmenities = hasAmenity
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a]
      let nextFoodAvailability = f.foodAvailability
      if (a === FOOD_AMENITY) {
        if (hasAmenity) {
          nextFoodAvailability = 'not_available'
        } else if (f.foodAvailability === 'not_available') {
          nextFoodAvailability = 'available'
        }
      }
      return {
        ...f,
        amenities: nextAmenities,
        foodAvailability: nextFoodAvailability,
      }
    })
    if (amenitiesError) setAmenitiesError('')
  }

  const hasFoodAmenity = form.amenities.includes(FOOD_AMENITY)

  const buildPayload = () => ({
    name: form.name.trim(),
    city: pgRecord?.city || 'Chennai',
    owner: {
      name: form.ownerName.trim(),
      phone: form.ownerPhone.replace(/\D/g, ''),
    },
    area: form.area,
    gender: form.gender,
    deposit: Number(form.deposit),
    noticePeriodDays: Number(form.noticePeriodDays),
    currentBillIncluded: Boolean(form.currentBillIncluded),
    ...foodAvailabilityToLegacyFields(hasFoodAmenity ? form.foodAvailability : 'not_available'),
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
    rating: pgRecord?.rating ?? 4.2,
    reviews: pgRecord?.reviews ?? [],
    sharing: entriesToSharing(sharingConfigs),
  })

  const [submitting, setSubmitting] = useState(false)

  const ownerAccount = isBackendPgOwner(session)
  const pgListPath = ownerAccount ? '/admin/my-pgs' : '/admin/pgs'

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(isEdit ? pgListPath : '/admin')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      showToast('PG name is required.', 'error')
      return
    }

    const ownerName = form.ownerName.trim()
    const ownerPhone = form.ownerPhone.replace(/\D/g, '')
    if (!ownerName) {
      const message = 'Owner name is required.'
      setOwnerError(message)
      showToast(message, 'error')
      return
    }
    if (ownerPhone.length !== 10) {
      const message = 'Enter a valid 10-digit owner phone number.'
      setOwnerError(message)
      showToast(message, 'error')
      return
    }

    if (!isAccountUser) {
      showToast(
        'Sign in with your API account (admin@pgxplore.com or rajesh@example.com) to save PG listings.',
        'error',
      )
      return
    }

    if (!form.amenities?.length) {
      const message = 'Please select at least one amenity.'
      setAmenitiesError(message)
      showToast(message, 'error')
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
    setAmenitiesError('')
    setOwnerError('')
    const payload = buildPayload()
    setSubmitting(true)
    try {
      const ownerSubmitting = isBackendPgOwner(session)
      if (isEdit && pgRecord) {
        await updatePG(pgRecord.id, payload)
        showToast(
          ownerSubmitting
            ? 'Changes submitted for privileged accounts approval.'
            : 'PG updated.',
        )
      } else if (isEdit) {
        showToast('PG not found.', 'error')
        return
      } else {
        await addPG(payload)
        showToast(
          ownerSubmitting
            ? 'PG submitted for privileged accounts approval. It will appear on the site once approved.'
            : 'PG added.',
        )
      }
      navigate(pgListPath)
    } catch (err) {
      const message =
        err?.message ||
        (err?.status === 0
          ? 'Could not reach the server. Ensure the backend is running.'
          : 'Could not save PG. Check your connection and try again.')
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (isEdit && loadingPg) {
    return (
      <div className="admin-form-page">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300"
        >
          <FiArrowLeft aria-hidden /> Back
        </button>
        <div className="admin-panel">
          <p className="text-muted">Loading PG details…</p>
        </div>
      </div>
    )
  }

  if (isEdit && !pgRecord) {
    return (
      <div className="admin-form-page">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300"
        >
          <FiArrowLeft aria-hidden /> Back
        </button>
        <div className="admin-panel">
          <p className="text-muted">PG not found.</p>
          <Link to="/admin/pgs" className="mt-4 inline-block text-brand-emphasis">
            Back to list
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-form-page">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-emphasis transition hover:text-brand-900 dark:hover:text-brand-300"
      >
        <FiArrowLeft aria-hidden /> Back
      </button>
      <form onSubmit={handleSubmit} className="admin-panel admin-panel--fit">
      <h2 className="admin-panel-title">{isEdit ? 'Edit PG Details' : 'Add New PG'}</h2>

      <div className="admin-form-grid">
        <label className="admin-form-field-full block text-sm">
          <span className="font-medium text-main">PG Name</span>
          <input className="input-app mt-1 w-full" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
      </div>

      <div className="mt-6 rounded-xl border border-app bg-card-muted/50 p-4">
        <p className="text-sm font-medium text-main">Owner contact details</p>
        <p className="mt-1 text-xs text-muted">
          Contact shown to tenants on the PG listing. This is separate from your login account.
        </p>
        {ownerError ? (
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400" role="alert">
            {ownerError}
          </p>
        ) : null}
        <div className="admin-form-grid mt-4">
          <label className="block text-sm">
            <span className="font-medium text-main">
              Owner name <span className="text-rose-600 dark:text-rose-400">*</span>
            </span>
            <input
              className="input-app mt-1 w-full"
              value={form.ownerName}
              onChange={(e) => {
                set('ownerName', e.target.value)
                if (ownerError) setOwnerError('')
              }}
              placeholder="e.g. Rajesh Kumar"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-main">
              Owner phone <span className="text-rose-600 dark:text-rose-400">*</span>
            </span>
            <input
              type="tel"
              inputMode="numeric"
              className="input-app mt-1 w-full"
              value={form.ownerPhone}
              onChange={(e) => {
                set('ownerPhone', e.target.value)
                if (ownerError) setOwnerError('')
              }}
              placeholder="10-digit mobile number"
              required
            />
          </label>
        </div>
      </div>

      <div className="admin-form-grid mt-4">
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
        <p className="text-sm font-medium text-main">
          Amenities <span className="text-rose-600 dark:text-rose-400">*</span>
        </p>
        {amenitiesError ? (
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-400" role="alert">
            {amenitiesError}
          </p>
        ) : null}
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
        <label className="admin-form-field-full block text-sm">
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
        <div className="admin-form-grid mt-3">
          <label className="block text-sm">
            <span className={`font-medium ${hasFoodAmenity ? 'text-main' : 'text-muted'}`}>
              Food availability
            </span>
            <select
              className="select-app mt-1 w-full disabled:cursor-not-allowed disabled:opacity-60"
              value={hasFoodAmenity ? form.foodAvailability : 'not_available'}
              onChange={(e) => set('foodAvailability', e.target.value)}
              disabled={!hasFoodAmenity}
              aria-disabled={!hasFoodAmenity}
            >
              {FOOD_AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {!hasFoodAmenity ? (
              <span className="mt-1 block text-xs text-muted">
                Select the Food amenity above to configure meal options.
              </span>
            ) : null}
          </label>
          <div className="flex flex-wrap items-start gap-4 text-sm sm:col-span-2 lg:col-span-2">
            <label className="flex min-w-[14rem] flex-1 cursor-pointer items-start gap-2">
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
            <label className="flex items-center gap-2 self-center">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              Featured PG
            </label>
          </div>
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create PG'}
        </button>
        <Link to="/admin/pgs" className="btn-secondary">Cancel</Link>
      </div>
    </form>
    </div>
  )
}
