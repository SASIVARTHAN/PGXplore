import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useMobileSwipeBack } from './useMobileSwipeBack'

export const MOBILE_MQ = '(max-width: 1023px)'
export const TRAP_KEY = 'pgxMobileBack'

export function isMobileView() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia(MOBILE_MQ).matches) return true
  if (window.matchMedia('(pointer: coarse)').matches) return true
  return false
}

function armMobileBackTrap() {
  window.history.pushState({ [TRAP_KEY]: Date.now() }, '', window.location.href)
}

/**
 * @param {(meta?: { fromPopState?: boolean }) => void} onBack
 * @param {{ enabled?: boolean, trap?: boolean }} [options]
 *   trap: false = do not push history guards (login/legal need a clean stack).
 *   fromPopState: browser already went back one entry — do NOT navigate(-1) again.
 */
export function useMobileBackNavigation(onBack, { enabled = true, trap = true } = {}) {
  const onBackRef = useRef(onBack)
  const location = useLocation()
  const handlingPopRef = useRef(false)

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  useMobileSwipeBack(() => onBackRef.current?.({ fromPopState: false }), { enabled })

  useEffect(() => {
    if (!enabled) return undefined

    const onPopState = () => {
      if (!isMobileView()) return
      if (handlingPopRef.current) return
      handlingPopRef.current = true
      if (trap) armMobileBackTrap()
      try {
        // Browser already popped — tell handler not to history.back() again.
        onBackRef.current?.({ fromPopState: true })
      } finally {
        window.setTimeout(() => {
          handlingPopRef.current = false
        }, 150)
      }
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [enabled, trap])

  useLayoutEffect(() => {
    if (!enabled || !trap || !isMobileView()) return undefined
    armMobileBackTrap()
    armMobileBackTrap()
    return undefined
  }, [enabled, trap, location.pathname, location.search, location.key])
}

export function rearmMobileBackTrap(times = 1) {
  if (!isMobileView()) return
  const n = Math.max(1, times)
  for (let i = 0; i < n; i += 1) armMobileBackTrap()
}
