import { useEffect, useRef, useState } from 'react'

export const SEARCH_PLACEHOLDER_EXAMPLES = [
  'PGs near Tambaram',
  'PGs under 10k',
  'PGs without food',
  'PGs in Chromepet',
  'Girls PGs with food',
  'PGs under 5k',
  'Boys PGs near Pallavaram',
  'PGs with AC',
]

const ROTATE_MS = 3200
const FADE_MS = 280

/**
 * Cycles placeholder text when the search field is empty and not focused.
 */
export function useRotatingPlaceholder(active, phrases = SEARCH_PLACEHOLDER_EXAMPLES) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const fadeTimeoutRef = useRef(null)

  useEffect(() => {
    if (!active || phrases.length < 2) return undefined

    const intervalId = setInterval(() => {
      setVisible(false)
      fadeTimeoutRef.current = setTimeout(() => {
        setIndex((current) => (current + 1) % phrases.length)
        setVisible(true)
      }, FADE_MS)
    }, ROTATE_MS)

    return () => {
      clearInterval(intervalId)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [active, phrases])

  useEffect(() => {
    if (active) {
      setIndex(0)
      setVisible(true)
    }
  }, [active])

  return {
    text: phrases[index] ?? phrases[0],
    visible,
  }
}
