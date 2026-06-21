import { useEffect, useRef, useState } from 'react'

const ROTATE_MS = 3500
const FADE_MS = 300

export default function HeroFeatureRotator({ items }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const fadeTimeoutRef = useRef(null)

  useEffect(() => {
    if (items.length < 2) return undefined

    const intervalId = setInterval(() => {
      setVisible(false)
      fadeTimeoutRef.current = setTimeout(() => {
        setIndex((current) => (current + 1) % items.length)
        setVisible(true)
      }, FADE_MS)
    }, ROTATE_MS)

    return () => {
      clearInterval(intervalId)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [items.length])

  const active = items[index]

  return (
    <div className="hero-feature-rotator" aria-live="polite" aria-atomic="true">
      <p className="hero-feature-rotator__heading">WHY PGXPLORE</p>

      <div className="hero-feature-rotator__stage" style={{ opacity: visible ? 1 : 0 }}>
        {active && (
          <div className="hero-feature-pill hero-feature-pill--featured">
            <span className="hero-feature-pill__icon hero-feature-pill__icon--lg" aria-hidden>
              {active.icon}
            </span>
            <span className="hero-feature-pill__label hero-feature-pill__label--lg">{active.text}</span>
          </div>
        )}
      </div>

      <ol className="hero-feature-rotator__list" aria-label="Platform highlights">
        {items.map((item, i) => (
          <li
            key={item.text}
            className={`hero-feature-rotator__list-item ${i === index ? 'hero-feature-rotator__list-item--active' : ''}`}
            aria-current={i === index ? 'step' : undefined}
          >
            <span className="hero-feature-rotator__list-num">{i + 1}</span>
            <span className="hero-feature-rotator__list-icon" aria-hidden>
              {item.icon}
            </span>
            <span className="hero-feature-rotator__list-text">{item.text}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
