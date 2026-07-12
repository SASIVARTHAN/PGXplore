import { FiMapPin, FiShield, FiZap } from 'react-icons/fi'

const FEATURES = [
  { icon: <FiShield aria-hidden />, label: 'Verified listings' },
  { icon: <FiMapPin aria-hidden />, label: 'Across Chennai' },
  { icon: <FiZap aria-hidden />, label: 'Live vacancy soon' },
]

export default function EntryBrandPanel() {
  return (
    <section className="entry-page__brand entry-page__brand--adaptive entry-fade-in-left flex w-full flex-col items-center text-center">
      <div className="entry-float entry-logo-wrap entry-logo-wrap--adaptive">
        <img
          src="/pgxplore-logo.png"
          alt="PGXplore — Find PGs near you"
          className="h-auto w-full"
          width="1024"
          height="683"
        />
      </div>

      <p className="entry-brand-copy entry-stagger text-muted" style={{ animationDelay: '0.15s' }}>
        Find trusted PGs with real vacancy updates in{' '}
        <span className="entry-shimmer-text font-semibold">Chennai</span>.
      </p>

      <div className="entry-brand-badges entry-stagger">
        {FEATURES.map((f, i) => (
          <span
            key={f.label}
            className="entry-brand-chip entry-stagger inline-flex items-center rounded-full border border-brand-100 bg-brand-50/80 font-medium text-brand-900 dark:border-white/10 dark:bg-white/5 dark:text-brand-100"
            style={{ animationDelay: `${0.25 + i * 0.1}s` }}
          >
            <span aria-hidden>{f.icon}</span>
            {f.label}
          </span>
        ))}
      </div>
    </section>
  )
}
