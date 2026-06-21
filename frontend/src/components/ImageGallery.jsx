import { useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { listingImageSrc } from '../utils/pgImages'

export default function ImageGallery({ images, name, imageVersion }) {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const safeImages = (images || []).filter(Boolean)
  const total = safeImages.length

  useEffect(() => {
    setActive(0)
  }, [imageVersion, total, safeImages.join('|')])

  useEffect(() => {
    if (active >= total && total > 0) setActive(0)
  }, [active, total])

  const goPrev = useCallback(() => setActive((i) => (i <= 0 ? total - 1 : i - 1)), [total])
  const goNext = useCallback(() => setActive((i) => (i >= total - 1 ? 0 : i + 1)), [total])

  useEffect(() => {
    if (!lightboxOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightboxOpen, goPrev, goNext])

  if (total === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-dashed border-app bg-card-muted text-sm text-muted">
        No photos available for this PG.
      </div>
    )
  }

  const mainSrc = listingImageSrc(safeImages[active], imageVersion)

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl bg-card-muted">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group block w-full cursor-zoom-in"
          aria-label={`Open photo ${active + 1} of ${name} in full view`}
        >
          <img
            key={mainSrc}
            src={mainSrc}
            alt={`${name} - photo ${active + 1}`}
            className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </button>
        {total > 1 && (
          <>
            <button type="button" onClick={goPrev} aria-label="Previous image" className="gallery-nav-btn left-3">
              <FiChevronLeft aria-hidden />
            </button>
            <button type="button" onClick={goNext} aria-label="Next image" className="gallery-nav-btn right-3">
              <FiChevronRight aria-hidden />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              {active + 1} / {total}
            </span>
          </>
        )}
      </div>
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto md:overflow-visible">
          {safeImages.map((image, index) => {
            const thumbSrc = listingImageSrc(image, imageVersion)
            return (
              <button
                key={`${index}-${thumbSrc.slice(0, 40)}`}
                type="button"
                onClick={() => setActive(index)}
                className={`h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border-2 md:h-16 md:w-20 ${
                  active === index ? 'border-brand-600 dark:border-brand-400' : 'border-transparent opacity-80'
                }`}
              >
                <img src={thumbSrc} alt="" className="h-full w-full object-cover" />
              </button>
            )
          })}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photo viewer`}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            <FiX aria-hidden />
          </button>

          <img
            key={mainSrc}
            src={mainSrc}
            alt={`${name} - photo ${active + 1}`}
            className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                aria-label="Previous image"
                className="absolute left-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
              >
                <FiChevronLeft aria-hidden />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                aria-label="Next image"
                className="absolute right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
              >
                <FiChevronRight aria-hidden />
              </button>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
                {active + 1} / {total}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
