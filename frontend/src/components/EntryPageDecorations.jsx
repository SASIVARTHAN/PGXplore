import { FiFeather, FiHome, FiMapPin } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi2'

const PARTICLES = [
  { Icon: FiFeather, left: '8%', top: '70%', size: '2rem', duration: '9s', delay: '0s' },
  { Icon: FiHome, left: '18%', top: '40%', size: '1.5rem', duration: '11s', delay: '1.5s' },
  { Icon: HiSparkles, left: '30%', top: '80%', size: '1.25rem', duration: '7s', delay: '0.8s' },
  { Icon: FiMapPin, left: '72%', top: '75%', size: '1.5rem', duration: '10s', delay: '2s' },
  { Icon: FiFeather, left: '85%', top: '45%', size: '2.25rem', duration: '12s', delay: '0.4s' },
  { Icon: HiSparkles, left: '62%', top: '30%', size: '1rem', duration: '8s', delay: '2.6s' },
  { Icon: FiHome, left: '90%', top: '82%', size: '1.4rem', duration: '13s', delay: '1.1s' },
]

export default function EntryPageDecorations() {
  return (
    <div className="entry-page__fx pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="entry-blob entry-blob--adaptive bg-brand-400/40 dark:bg-brand-500/25"
        style={{ top: '-4rem', left: '-3rem' }}
      />
      <div
        className="entry-blob entry-blob--adaptive bg-accent-500/30 dark:bg-accent-600/25"
        style={{ bottom: '-5rem', right: '-4rem', animationDelay: '3s' }}
      />
      <div
        className="entry-blob entry-blob--adaptive bg-emerald-300/30 dark:bg-emerald-500/15"
        style={{ top: '40%', left: '55%', animationDelay: '6s' }}
      />

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="entry-particle"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          <p.Icon />
        </span>
      ))}
    </div>
  )
}
