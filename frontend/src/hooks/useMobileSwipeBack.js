import { useEffect, useRef } from 'react'

const MOBILE_MQ = '(max-width: 1023px)'

function isMobileLike() {
  return (
    window.matchMedia(MOBILE_MQ).matches || window.matchMedia('(pointer: coarse)').matches
  )
}

/** Left-edge swipe on mobile that triggers the same action as the page back button. */
export function useMobileSwipeBack(onBack, { enabled = true, edgeWidth = 28, threshold = 72 } = {}) {
  const onBackRef = useRef(onBack)

  useEffect(() => {
    onBackRef.current = onBack
  }, [onBack])

  useEffect(() => {
    if (!enabled) return undefined

    let tracking = false
    let startX = 0
    let startY = 0

    const onTouchStart = (event) => {
      if (!isMobileLike()) return
      if (event.touches.length !== 1) return

      const touch = event.touches[0]
      if (touch.clientX > edgeWidth) return

      tracking = true
      startX = touch.clientX
      startY = touch.clientY
    }

    const onTouchMove = (event) => {
      if (!tracking || event.touches.length !== 1) return
      const touch = event.touches[0]
      if (Math.abs(touch.clientY - startY) > 48) tracking = false
    }

    const onTouchEnd = (event) => {
      if (!tracking) return
      tracking = false

      const touch = event.changedTouches[0]
      if (touch.clientX - startX >= threshold) {
        onBackRef.current?.()
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, edgeWidth, threshold])
}
