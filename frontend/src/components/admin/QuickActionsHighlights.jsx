import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiBarChart2, FiBell, FiClock, FiHome, FiInbox, FiLayers, FiUsers } from 'react-icons/fi'
import { MdKingBed } from 'react-icons/md'
import { displayNumber, NO_DATA_LABEL } from '../../utils/displayValue'

const FEATURE_ROTATE_MS = 4500

function AnimatedNumber({ value, duration = 900, delay = 0 }) {
  const resolved = displayNumber(value)
  const target = resolved === NO_DATA_LABEL ? null : resolved
  const [display, setDisplay] = useState(0)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (target == null) {
      setDisplay(0)
      setSettled(false)
      return undefined
    }

    setDisplay(0)
    setSettled(false)

    let raf
    const delayTimer = window.setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - (1 - progress) ** 3
        setDisplay(Math.round(target * eased))
        if (progress < 1) {
          raf = requestAnimationFrame(tick)
        } else {
          setSettled(true)
        }
      }
      raf = requestAnimationFrame(tick)
    }, delay)

    return () => {
      window.clearTimeout(delayTimer)
      cancelAnimationFrame(raf)
    }
  }, [target, duration, delay])

  if (target == null) {
    return <span className="dash-stat-pill__num dash-stat-pill__num--empty">{NO_DATA_LABEL}</span>
  }

  return (
    <span className={settled ? 'dash-stat-pill__num dash-stat-pill__num--settled' : 'dash-stat-pill__num'}>
      {display}
    </span>
  )
}

const UPCOMING_FEATURES = [
  {
    icon: FiBarChart2,
    title: 'Revenue Analytics',
    blurb: 'Monthly revenue charts, booking trends, and occupancy insights.',
  },
  {
    icon: MdKingBed,
    title: 'Room Management',
    blurb: 'Per-room pricing and availability in one place.',
  },
  {
    icon: FiClock,
    title: 'Live Availability',
    blurb: 'Real-time vacancy updates on every PG listing.',
  },
  {
    icon: FiBell,
    title: 'Smart Alerts',
    blurb: 'Notifications when listings need attention or inquiries arrive.',
  },
  {
    icon: FiLayers,
    title: 'Sharing Insights',
    blurb: 'Compare sharing types and rent performance across areas.',
  },
]

const LIVE_STATS = [
  { key: 'pgs', label: 'PGs listed', tone: 'brand', icon: FiHome },
  { key: 'pending', label: 'Pending', tone: 'amber', icon: FiInbox },
  { key: 'users', label: 'Users', tone: 'green', icon: FiUsers },
]

export default function QuickActionsHighlights({ stats, pgs = [] }) {
  const [featureIndex, setFeatureIndex] = useState(0)
  const [slideDir, setSlideDir] = useState('next')
  const [progress, setProgress] = useState(0)
  const rotateStartRef = useRef(performance.now())

  const pendingApprovals = useMemo(
    () => pgs.filter((pg) => pg.listingStatus === 'pending').length,
    [pgs],
  )

  const liveValues = useMemo(
    () => ({
      pgs: stats?.totalPGs,
      pending: (stats?.pendingDeletionRequests ?? 0) + pendingApprovals,
      users: stats?.totalUsers,
    }),
    [stats?.totalPGs, stats?.pendingDeletionRequests, stats?.totalUsers, pendingApprovals],
  )

  const goToFeature = useCallback((nextIndex) => {
    if (nextIndex === featureIndex) return
    setSlideDir(nextIndex > featureIndex ? 'next' : 'prev')
    setFeatureIndex(nextIndex)
    rotateStartRef.current = performance.now()
    setProgress(0)
  }, [featureIndex])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSlideDir('next')
      setFeatureIndex((i) => (i + 1) % UPCOMING_FEATURES.length)
      rotateStartRef.current = performance.now()
      setProgress(0)
    }, FEATURE_ROTATE_MS)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let raf
    const tick = (now) => {
      const elapsed = now - rotateStartRef.current
      setProgress(Math.min(elapsed / FEATURE_ROTATE_MS, 1))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [featureIndex])

  const feature = UPCOMING_FEATURES[featureIndex]
  const FeatureIcon = feature.icon

  return (
    <div className="dash-highlights mt-4 border-t border-app pt-4">
      <p className="dash-highlights__label">
        <span className="dash-live-dot" aria-hidden />
        Live snapshot
      </p>

      <div className="dash-stat-grid mt-3">
        {LIVE_STATS.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={item.key}
              className="dash-stat-pill"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className={`dash-stat-pill__icon dash-stat-pill__icon--${item.tone}`} aria-hidden>
                <Icon />
              </span>
              <span className={`dash-stat-pill__value dash-stat-pill__value--${item.tone}`}>
                <AnimatedNumber
                  value={liveValues[item.key]}
                  delay={index * 120}
                  duration={850}
                />
              </span>
              <span className="dash-stat-pill__label">{item.label}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        <p className="dash-highlights__label">Coming soon</p>

        <div className="dash-feature-stage mt-2">
          <div
            key={featureIndex}
            className={`dash-feature-card dash-feature-card--${slideDir}`}
          >
            <div className="dash-feature-card__glow" aria-hidden />
            <div className="dash-feature-card__icon" aria-hidden>
              <FeatureIcon />
            </div>
            <div className="dash-feature-card__body">
              <div className="dash-feature-card__title-row">
                <p className="font-semibold text-main">{feature.title}</p>
                <span className="dash-soon-badge">Soon</span>
              </div>
              <p className="dash-feature-card__blurb">{feature.blurb}</p>
            </div>
          </div>
        </div>

        <div
          className="dash-feature-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Feature carousel progress"
        >
          <div
            className="dash-feature-progress__fill"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>

        <div className="dash-feature-nav mt-2">
          <div
            className="dash-feature-nav__slider"
            style={{ '--feature-index': featureIndex }}
            aria-hidden
          />
          {UPCOMING_FEATURES.map((item, i) => {
            const Icon = item.icon
            const active = i === featureIndex
            return (
              <button
                key={item.title}
                type="button"
                className={`dash-feature-chip ${active ? 'dash-feature-chip--active' : ''}`}
                onClick={() => goToFeature(i)}
                title={item.title}
                aria-label={item.title}
                aria-current={active ? 'true' : undefined}
              >
                <Icon aria-hidden />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
