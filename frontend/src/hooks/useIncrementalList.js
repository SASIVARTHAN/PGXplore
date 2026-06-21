import { useEffect, useRef, useState } from 'react'

/** Reveal more list items as the user scrolls (Intersection Observer). */
export function useIncrementalList(items, pageSize = 5, scrollRootRef = null) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const sentinelRef = useRef(null)

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [items, pageSize])

  const safeItems = items || []
  const visibleItems = safeItems.slice(0, visibleCount)
  const hasMore = visibleCount < safeItems.length

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore) return undefined

    const root = scrollRootRef?.current ?? document.querySelector('.admin-scroll-panel__body')

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + pageSize, safeItems.length))
        }
      },
      { root: root || null, rootMargin: '160px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, pageSize, safeItems.length, visibleCount, scrollRootRef])

  return {
    visibleItems,
    hasMore,
    sentinelRef,
    total: safeItems.length,
    loadedCount: visibleItems.length,
  }
}
