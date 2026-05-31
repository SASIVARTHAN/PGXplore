import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import EmptyState from '../components/EmptyState'
import Filters from '../components/Filters'
import PGCard from '../components/PGCard'
import AutocompleteSearchBar from '../components/AutocompleteSearchBar'
import { useToast } from '../components/Toast'
import SkeletonCard from '../components/SkeletonCard'
import { pgListings } from '../data/pgData'
import { hasActiveListingFilters } from '../utils/navigation'
import { filterListingsBySearch } from '../utils/pgSearch'
import { getStartingRent, getVacancySummary } from '../utils/vacancy'

export const defaultFilters = {
  area: '',
  gender: '',
  maxRent: 15000,
  sort: 'updated',
  foodOnly: false,
  acOnly: false,
  availableOnly: false,
}

export default function ListingsPage() {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const areaFromUrl = searchParams.get('area') || ''
  const queryFromUrl = searchParams.get('q') || ''
  const compactAreaMode = Boolean(areaFromUrl) && searchParams.get('full') !== '1'

  const [query, setQuery] = useState(queryFromUrl)
  const [filters, setFilters] = useState({
    ...defaultFilters,
    area: areaFromUrl,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setFilters((prev) => ({ ...prev, area: areaFromUrl }))
    setQuery(queryFromUrl)
  }, [areaFromUrl, queryFromUrl])

  const updateUrl = (nextArea, nextQuery, keepFull) => {
    const params = new URLSearchParams()
    if (nextArea) params.set('area', nextArea)
    if (nextQuery?.trim()) params.set('q', nextQuery.trim())
    if (keepFull) params.set('full', '1')
    setSearchParams(params, { replace: true })
  }

  const handleFiltersChange = (next) => {
    setFilters(next)
    updateUrl(next.area, query, searchParams.get('full') === '1')
  }

  const handleQueryChange = (nextQuery) => {
    setQuery(nextQuery)
    updateUrl(filters.area, nextQuery, searchParams.get('full') === '1')
  }

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [query, filters])

  const resetAll = () => {
    setQuery('')
    setFilters(defaultFilters)
    setSearchParams({}, { replace: true })
  }

  const clearAreaOnly = () => {
    const next = { ...filters, area: '' }
    setFilters(next)
    updateUrl('', query, false)
  }

  const results = useMemo(() => {
    let list = filterListingsBySearch(pgListings, query, {
      area: filters.area,
      gender: filters.gender,
      foodOnly: filters.foodOnly,
      acOnly: filters.acOnly,
      availableOnly: filters.availableOnly,
      maxRent: filters.maxRent,
      getVacancySummary,
    })

    list.sort((a, b) => {
      switch (filters.sort) {
        case 'price-asc':
          return getStartingRent(a.sharing) - getStartingRent(b.sharing)
        case 'price-desc':
          return getStartingRent(b.sharing) - getStartingRent(a.sharing)
        case 'rating':
          return b.rating - a.rating
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

    return list
  }, [query, filters])

  const title = filters.area ? `PGs in ${filters.area}` : 'Browse PGs'
  const hasActiveFilters = hasActiveListingFilters(filters, query)
  const hasOtherFilters = Boolean(
    query.trim() ||
      filters.gender ||
      filters.foodOnly ||
      filters.acOnly ||
      filters.availableOnly ||
      filters.maxRent < 15000,
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">
      <BackButton fallback="/home" />
      <div className="mt-4">
        <h1 className="text-3xl font-bold text-main">{title}</h1>
        <p className="mt-2 text-muted">
          {filters.area
            ? `${results.length} listing${results.length === 1 ? '' : 's'} in this area`
            : 'Search and filter listings across Chennai.'}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {!compactAreaMode && (
          <AutocompleteSearchBar
            value={query}
            onChange={setQuery}
            onSearch={(q) => handleQueryChange(q)}
            onInvalidSearch={(msg) => showToast(msg, 'error')}
          />
        )}
        <Filters
          filters={filters}
          onChange={handleFiltersChange}
          onReset={compactAreaMode ? clearAreaOnly : resetAll}
          onClearAll={compactAreaMode ? resetAll : undefined}
          compact={compactAreaMode}
          hasActiveFilters={hasActiveFilters}
          hasOtherFilters={hasOtherFilters}
        />
        {compactAreaMode && (
          <button
            type="button"
            onClick={() => setSearchParams({ area: filters.area, full: '1' }, { replace: true })}
            className="text-sm font-medium text-brand-emphasis hover:underline"
          >
            Show all filter options →
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-muted">
        {loading ? 'Loading PGs...' : `${results.length} PG${results.length === 1 ? '' : 's'} found`}
      </p>

      {loading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No PGs match your search"
            description="Try increasing your budget, changing the area, or removing some filters."
            actionLabel="Clear all filters"
            onAction={resetAll}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((pg) => (
            <PGCard key={pg.id} pg={pg} />
          ))}
        </div>
      )}
    </div>
  )
}
