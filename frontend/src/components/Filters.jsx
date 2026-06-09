import { FiX } from 'react-icons/fi'
import { AREAS } from '../data/pgData'
import { SHARING_TYPE_OPTIONS } from '../utils/sharingTypes'

export default function Filters({
  filters,
  onChange,
  onReset,
  onClearAll,
  compact = false,
  hasActiveFilters = false,
  hasOtherFilters = false,
}) {
  const update = (key, value) => onChange({ ...filters, [key]: value })

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
    <div className="space-y-3">
      <div className="grid gap-4 rounded-2xl border border-app bg-card p-4 md:grid-cols-2 lg:grid-cols-4">
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
  )
}
