import { useId, useState } from 'react'
import { FiChevronDown, FiSliders, FiX } from 'react-icons/fi'
import { AREAS } from '../data/pgData'
import { SHARING_TYPE_OPTIONS } from '../utils/sharingTypes'

function countActiveFilters(filters) {
  let n = 0
  if (filters.area) n += 1
  if (filters.gender) n += 1
  if (filters.roomType) n += 1
  if (filters.maxRent < 15000) n += 1
  if (filters.sort && filters.sort !== 'updated') n += 1
  if (filters.foodOnly) n += 1
  if (filters.acOnly) n += 1
  if (filters.availableOnly) n += 1
  return n
}

export default function Filters({
  filters,
  onChange,
  onReset,
  onClearAll,
  compact = false,
  hasActiveFilters = false,
  hasOtherFilters = false,
  defaultOpen = false,
}) {
  const panelId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const update = (key, value) => onChange({ ...filters, [key]: value })
  const activeCount = countActiveFilters(filters)

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-app bg-card px-4 py-3">
        <p className="text-sm text-muted">
          Showing PGs in <span className="font-semibold text-main">{filters.area}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {filters.area && !hasOtherFilters && (
            <button type="button" onClick={onReset} className="btn-secondary inline-flex items-center gap-1.5 text-sm">
              <FiX aria-hidden /> Clear area: {filters.area}
            </button>
          )}
          {onClearAll && (hasOtherFilters || !filters.area) && hasActiveFilters && (
            <button type="button" onClick={onClearAll} className="btn-secondary inline-flex items-center gap-1.5 text-sm">
              <FiX aria-hidden /> Clear all filters
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-app bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <FiSliders className="h-4 w-4 shrink-0 text-brand-emphasis" aria-hidden />
          <span className="font-medium text-main">Filters</span>
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-950/50 dark:text-brand-200">
              {activeCount} active
            </span>
          )}
        </span>
        <FiChevronDown
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div id={panelId} className="space-y-3 border-t border-app px-4 pb-4 pt-3">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-main">Area</span>
              <select value={filters.area} onChange={(e) => update('area', e.target.value)} className="select-app">
                <option value="">All Areas</option>
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-main">Gender</span>
              <select value={filters.gender} onChange={(e) => update('gender', e.target.value)} className="select-app">
                <option value="">All</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-living">Co-living</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-main">Room Availability</span>
              <select
                value={filters.roomType || ''}
                onChange={(e) => update('roomType', e.target.value)}
                className="select-app"
              >
                <option value="">All Room Types</option>
                {SHARING_TYPE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm lg:col-span-2">
              <span className="mb-1 block font-medium text-main">
                Max Rent: ₹{filters.maxRent.toLocaleString('en-IN')}
              </span>
              <input
                type="range"
                min="3000"
                max="15000"
                step="500"
                value={filters.maxRent}
                onChange={(e) => update('maxRent', Number(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>₹3,000</span>
                <span>₹15,000</span>
              </div>
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-main">Sort By</span>
              <select value={filters.sort} onChange={(e) => update('sort', e.target.value)} className="select-app">
                <option value="updated">Recently Updated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </label>

            <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
              {[
                ['foodOnly', 'Food available only'],
                ['acOnly', 'AC available only'],
                ['availableOnly', 'Show only PGs with vacancies'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-main">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={(e) => update(key, e.target.checked)}
                    className="rounded border-stone-300 accent-brand-600 dark:border-slate-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {onReset && hasActiveFilters && (
            <div className="flex justify-end">
              <button type="button" onClick={onReset} className="btn-secondary inline-flex items-center gap-1.5">
                <FiX aria-hidden /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
