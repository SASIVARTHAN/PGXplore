import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AutocompleteSearchBar from '../components/AutocompleteSearchBar'
import HeroFeatureRotator from '../components/HeroFeatureRotator'
import { useToast } from '../components/Toast'
import { createNavState, saveReturnPath } from '../utils/navigation'
import { AREAS } from '../data/pgData'
import { useListings } from '../contexts/AdminContext'
import { formatUpdatedAt } from '../utils/vacancy'

export default function HomePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { listings } = useListings()
  const [query, setQuery] = useState('')

  const recent = useMemo(
    () => [...listings].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4),
    [listings],
  )
  const recentlyAdded = useMemo(
    () => [...listings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    [listings],
  )

  const heroFeatures = [
    { icon: '⏳', text: 'Live Vacancy coming soon' },
    { icon: '📍', text: 'Google Maps verified' },
    { icon: '🔄', text: 'Realtime updates' },
    { icon: '✓', text: 'Verified PGs' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="hero-section">
        <div className="hero-section__grid">
          <div className="hero-section__main">
            <p className="hero-eyebrow">PGXplore</p>
            <h1 className="hero-title">Find Your Perfect PG</h1>
            <p className="hero-subtitle">
              Verified listings · Real vacancies · Transparent pricing across South Chennai
            </p>
            <div className="relative z-20 mt-8 max-w-xl">
              <AutocompleteSearchBar
                value={query}
                onChange={setQuery}
                navigateOnSearch
                dropdownElevated
                onInvalidSearch={(msg) => showToast(msg, 'error')}
              />
            </div>
            <button type="button" onClick={() => navigate('/listings')} className="hero-cta-outline">
              Browse All PGs →
            </button>
          </div>

          <HeroFeatureRotator items={heroFeatures} />
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: `${listings.length}+ Listings`, sub: 'Across South Chennai' },
          { label: '500+ Beds', sub: 'Tracked availability' },
          { label: 'Daily Updates', sub: 'Fresh vacancy data' },
        ].map((stat) => (
          <div key={stat.label} className="card-hover rounded-2xl border border-app bg-card p-5 text-center">
            <p className="text-2xl font-bold text-brand-emphasis">{stat.label}</p>
            <p className="text-sm text-muted">{stat.sub}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-main">Popular Areas</h2>
        <div className="flex flex-wrap gap-3">
          {AREAS.map((area) => (
            <Link
              key={area}
              to={`/listings?area=${encodeURIComponent(area)}`}
              className="rounded-full border border-app bg-card px-5 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:border-brand-500 hover:text-brand-900 dark:text-stone-100 dark:hover:border-brand-500 dark:hover:text-brand-400"
            >
              📍 {area}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-bold text-main">Recently Updated</h2>
          <div className="space-y-3">
            {recent.map((pg) => (
              <Link
                key={pg.id}
                to={`/pg/${pg.id}`}
                state={createNavState('/home')}
                onClick={() => saveReturnPath(pg.id, '/home')}
                className="card-hover flex items-center justify-between rounded-xl border border-app bg-card p-4"
              >
                <div>
                  <p className="font-medium text-main">{pg.name}</p>
                  <p className="text-sm text-muted">
                    {pg.area} · {pg.gender}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-emerald-800 dark:text-emerald-400">
                  {formatUpdatedAt(pg.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold text-main">Recently Added</h2>
          <div className="space-y-3">
            {recentlyAdded.map((pg) => (
              <Link
                key={pg.id}
                to={`/pg/${pg.id}`}
                state={createNavState('/home')}
                onClick={() => saveReturnPath(pg.id, '/home')}
                className="card-hover flex items-center justify-between rounded-xl border border-app bg-card p-4"
              >
                <div>
                  <p className="font-medium text-main">{pg.name}</p>
                  <p className="text-sm text-muted">{pg.area}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-900 dark:bg-teal-400 dark:text-slate-950">
                  New
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-app bg-card p-8">
        <h2 className="text-2xl font-bold text-main">Why Choose PGXplore?</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            { icon: '🟢', title: 'Real Vacancies', text: 'See availability by sharing type — entire room or individual beds.' },
            { icon: '💰', title: 'Transparent Pricing', text: 'Rent, deposit, and food details shown upfront. No surprises.' },
            { icon: '📍', title: 'Local Focus', text: 'Built for Chromepet, Tambaram, Perungalathur, Guduvanchery & more.' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl bg-card-muted p-5">
              <span className="text-2xl">{item.icon}</span>
              <p className="mt-2 font-semibold text-main">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
