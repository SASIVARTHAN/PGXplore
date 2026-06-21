import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiRefreshCw,
} from 'react-icons/fi'
import AutocompleteSearchBar from '../components/AutocompleteSearchBar'
import BackToLandingButton from '../components/BackToLandingButton'
import HeroFeatureRotator from '../components/HeroFeatureRotator'
import { useToast } from '../components/Toast'
import { createNavState, redirectToLogin, saveReturnPath } from '../utils/navigation'
import { AREAS } from '../data/pgData'
import { useAuth } from '../contexts/AuthContext'
import { useListings } from '../contexts/AdminContext'
import { getRecentIds, syncRecentFromApi } from '../utils/storage'

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const { session, isAccountUser, isAuthenticated } = useAuth()
  const { listings, listingsLoading } = useListings()
  const [query, setQuery] = useState('')
  const [recentIds, setRecentIds] = useState(() => (isAccountUser ? getRecentIds(session?.id) : []))

  useEffect(() => {
    if (!isAccountUser) {
      setRecentIds([])
      return
    }
    syncRecentFromApi(session?.id).then(setRecentIds)
  }, [isAccountUser, session?.id])

  const recentlyViewed = useMemo(
    () => recentIds.map((id) => listings.find((pg) => pg.id === id)).filter(Boolean).slice(0, 4),
    [recentIds, listings],
  )
  const recentlyAdded = useMemo(
    () => [...listings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    [listings],
  )

  const goToSearch = (path) => {
    if (!isAuthenticated) {
      redirectToLogin(navigate, { from: path, location })
      return
    }
    navigate(path)
  }

  const heroFeatures = [
    {
      icon: <FiClock aria-hidden />,
      text: 'Live availability · Coming Soon',
    },
    {
      icon: <FiMapPin aria-hidden />,
      text: 'Google Maps verified',
    },
    {
      icon: <FiRefreshCw aria-hidden />,
      text: 'Realtime updates',
    },
    {
      icon: <FiCheckCircle aria-hidden />,
      text: 'Verified PGs',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4">
        <BackToLandingButton confirmWhenLoggedIn />
      </div>

      <section className="hero-section">
        <div className="hero-section__grid">
          <div className="hero-section__main">
            <p className="hero-eyebrow">PGXplore</p>
            <h1 className="hero-title">Find Your Perfect PG</h1>
            <p className="hero-subtitle">
              Verified listings · Real vacancies · Transparent pricing across South Chennai
            </p>

            <div className="relative z-20 mt-6 max-w-xl">
              <AutocompleteSearchBar
                value={query}
                onChange={setQuery}
                navigateOnSearch
                requireAuth
                dropdownElevated
                onInvalidSearch={(msg) => showToast(msg, 'error')}
              />
            </div>

            <button
              type="button"
              onClick={() => goToSearch('/listings')}
              className="hero-browse-btn"
            >
              Browse All PGs
              <FiArrowRight aria-hidden className="text-base" />
            </button>
          </div>

          <HeroFeatureRotator items={heroFeatures} />
        </div>
      </section>

      <section className="home-stats mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: listingsLoading ? 'Loading…' : `${Math.max(listings.length, 8)}+ Listings`,
            sub: 'Across South Chennai',
          },
          { label: '500+ Beds', sub: 'Tracked availability' },
          { label: 'Daily Updates', sub: 'Fresh vacancy data' },
        ].map((stat) => (
          <div key={stat.label} className="home-stat-card card-hover rounded-2xl border border-app bg-card p-5 text-center">
            <p className="home-stat-card__value">{stat.label}</p>
            <p className="home-stat-card__sub">{stat.sub}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-main">Popular Areas</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => goToSearch(`/listings?area=${encodeURIComponent(area)}`)}
              className="home-area-pill"
            >
              <FiMapPin aria-hidden className="home-area-pill__icon" />
              {area}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-main">Recently Viewed</h2>
          <div className="mt-4 space-y-3">
            {recentlyViewed.length > 0 ? (
              recentlyViewed.map((pg) => (
                <Link
                  key={pg.id}
                  to={`/pg/${pg.id}`}
                  state={createNavState('/home')}
                  onClick={() => saveReturnPath(pg.id, '/home')}
                  className="card-hover flex items-center justify-between gap-4 rounded-xl border border-app bg-card p-4"
                >
                  <div>
                    <p className="font-semibold text-main">{pg.name}</p>
                    <p className="text-sm text-muted">{pg.area}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-brand-emphasis">View →</span>
                </Link>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-app bg-card px-4 py-5 text-center text-sm text-muted">
                No recently viewed PGs yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-main">Recently Added</h2>
          <div className="mt-4 space-y-3">
            {recentlyAdded.map((pg) => (
              <Link
                key={pg.id}
                to={`/pg/${pg.id}`}
                state={createNavState('/home')}
                onClick={() => saveReturnPath(pg.id, '/home')}
                className="card-hover flex items-center justify-between gap-4 rounded-xl border border-app bg-card p-4"
              >
                <div>
                  <p className="font-semibold text-main">{pg.name}</p>
                  <p className="text-sm text-muted">{pg.area}</p>
                </div>
                <span className="home-new-badge">New</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-why-section mt-12 rounded-2xl border border-app bg-card p-8">
        <h2 className="text-2xl font-bold text-main">Why Choose PGXplore?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <FiCheckCircle aria-hidden className="text-xl" />,
              title: 'Real Vacancies',
              text: 'See availability by sharing type — entire room or individual beds.',
            },
            {
              icon: <span aria-hidden className="text-xl font-bold">₹</span>,
              title: 'Transparent Pricing',
              text: 'Rent, deposit, and food details shown upfront. No surprises.',
            },
            {
              icon: <FiMapPin aria-hidden className="text-xl" />,
              title: 'Local Focus',
              text: 'Built for Chromepet, Tambaram, Perungalathur, Guduvanchery & more.',
            },
          ].map(({ icon, title, text }) => (
            <div key={title} className="home-why-card">
              <div className="home-why-card__icon">{icon}</div>
              <h3 className="mt-3 font-semibold text-main">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
