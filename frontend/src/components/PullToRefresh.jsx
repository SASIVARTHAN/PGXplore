import { useCallback, useEffect, useRef, useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { useRefresh } from '../contexts/RefreshContext'

const PULL_THRESHOLD = 72
const MAX_PULL = 110

function getGlobalScrollTop() {
  if (typeof window === 'undefined') return 0
  return Math.max(
    window.scrollY || 0,
    document.documentElement?.scrollTop || 0,
    document.body?.scrollTop || 0,
  )
}

function isAtScrollTop(el, includeGlobalScroll = true) {
  if ((el?.scrollTop || 0) > 1) return false
  if (includeGlobalScroll && getGlobalScrollTop() > 1) return false
  return true
}

export function usePullToRefresh(
  containerRef,
  onRefresh,
  { disabled = false, startZonePx = null, includeGlobalScroll = true } = {},
) {
  const [pull, setPull] = useState(0)
  const [status, setStatus] = useState('idle')

  const pullRef = useRef(0)
  const statusRef = useRef('idle')
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const pullingRef = useRef(false)
  const armedRef = useRef(false)
  const onRefreshRef = useRef(onRefresh)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  const sync = useCallback((nextPull, nextStatus) => {
    pullRef.current = nextPull
    statusRef.current = nextStatus
    setPull(nextPull)
    setStatus(nextStatus)
  }, [])

  const reset = useCallback(() => {
    pullingRef.current = false
    armedRef.current = false
    sync(0, 'idle')
  }, [sync])

  useEffect(() => {
    const el = containerRef.current
    if (!el || disabled) return undefined

    const onTouchStart = (event) => {
      if (statusRef.current === 'refreshing') return
      if (event.touches.length !== 1) return
      // Only while scrolled to the top — mid-page start is fine.
      if (!isAtScrollTop(el, includeGlobalScroll)) return

      const touch = event.touches[0]
      if (typeof startZonePx === 'number') {
        const { top } = el.getBoundingClientRect()
        if (touch.clientY - Math.max(0, top) > startZonePx) return
      }

      pullingRef.current = true
      armedRef.current = false
      startXRef.current = touch.clientX
      startYRef.current = touch.clientY
    }

    const onTouchMove = (event) => {
      if (!pullingRef.current || statusRef.current === 'refreshing') return
      if (!isAtScrollTop(el, includeGlobalScroll)) {
        reset()
        return
      }

      const touch = event.touches[0]
      const dx = touch.clientX - startXRef.current
      const dy = touch.clientY - startYRef.current

      // Let horizontal swipes (e.g. edge back) through undisturbed.
      if (!armedRef.current && Math.abs(dx) > 10 && Math.abs(dx) >= Math.abs(dy)) {
        reset()
        return
      }

      // Only pull-down. Finger moving up = normal scroll into content.
      if (dy <= 0) {
        if (armedRef.current) sync(0, 'idle')
        return
      }

      // Claim only after a clear downward pull — leave horizontal edge-back alone.
      // See .cursor/rules/mobile-ux-invariants.mdc
      if (!armedRef.current) {
        if (dy < 10) return
        armedRef.current = true
      }

      event.preventDefault()
      const nextPull = Math.min(MAX_PULL, dy * 0.55)
      sync(nextPull, nextPull >= PULL_THRESHOLD ? 'ready' : 'pulling')
    }

    const onTouchEnd = () => {
      if (!pullingRef.current) return
      pullingRef.current = false

      if (
        armedRef.current &&
        statusRef.current === 'ready' &&
        pullRef.current >= PULL_THRESHOLD
      ) {
        armedRef.current = false
        sync(PULL_THRESHOLD * 0.5, 'refreshing')
        Promise.resolve(onRefreshRef.current?.()).finally(() => {
          reset()
        })
        return
      }

      reset()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
    el.addEventListener('touchend', onTouchEnd, { capture: true })
    el.addEventListener('touchcancel', onTouchEnd, { capture: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart, { capture: true })
      el.removeEventListener('touchmove', onTouchMove, { capture: true })
      el.removeEventListener('touchend', onTouchEnd, { capture: true })
      el.removeEventListener('touchcancel', onTouchEnd, { capture: true })
    }
  }, [containerRef, disabled, includeGlobalScroll, reset, startZonePx, sync])

  return { pull, status, threshold: PULL_THRESHOLD }
}

export function PullToRefreshIndicator({ pull, status, threshold = PULL_THRESHOLD }) {
  if (pull <= 0 && status !== 'refreshing') return null

  const progress = Math.min(1, pull / threshold)
  const ready = status === 'ready' || status === 'refreshing'

  return (
    <div className="pull-to-refresh-indicator" role="status" aria-live="polite">
      <div
        className={`pull-to-refresh-indicator__badge${ready ? ' pull-to-refresh-indicator__badge--ready' : ''}${
          status === 'refreshing' ? ' pull-to-refresh-indicator__badge--refreshing' : ''
        }`}
        style={{ opacity: status === 'refreshing' ? 1 : Math.max(0.4, progress) }}
      >
        <FiRefreshCw
          className="pull-to-refresh-indicator__icon"
          style={{ transform: `rotate(${progress * 180}deg)` }}
          aria-hidden
        />
        <span className="pull-to-refresh-indicator__label">
          {status === 'refreshing' ? 'Refreshing…' : ready ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>
    </div>
  )
}

export function PullToRefreshHost({
  children,
  containerRef,
  disabled = false,
  startZonePx = null,
  includeGlobalScroll = true,
}) {
  const { refreshAppData, refreshing } = useRefresh()
  const handleRefresh = useCallback(async () => {
    await refreshAppData()
  }, [refreshAppData])

  const { pull, status, threshold } = usePullToRefresh(containerRef, handleRefresh, {
    disabled: disabled || refreshing,
    startZonePx,
    includeGlobalScroll,
  })

  return (
    <>
      <PullToRefreshIndicator pull={pull} status={status} threshold={threshold} />
      {children}
    </>
  )
}
