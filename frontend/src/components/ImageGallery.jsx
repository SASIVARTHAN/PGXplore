import { useEffect, useState } from 'react'
import { listingImageSrc } from '../utils/pgImages'

export default function ImageGallery({ images, name, imageVersion }) {
  const [active, setActive] = useState(0)
  const safeImages = (images || []).filter(Boolean)
  const total = safeImages.length

  useEffect(() => {
    setActive(0)
  }, [imageVersion, total, safeImages.join('|')])

  useEffect(() => {
    if (active >= total && total > 0) setActive(0)
  }, [active, total])

  if (total === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-dashed border-app bg-card-muted text-sm text-muted">
        No photos available for this PG.
      </div>
    )
  }

  const goPrev = () => setActive((i) => (i <= 0 ? total - 1 : i - 1))
  const goNext = () => setActive((i) => (i >= total - 1 ? 0 : i + 1))
  const mainSrc = listingImageSrc(safeImages[active], imageVersion)

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl bg-card-muted">
        <img
          key={mainSrc}
          src={mainSrc}
          alt={`${name} - photo ${active + 1}`}
          className="aspect-[16/10] w-full object-cover"
        />
        {total > 1 && (
          <>
            <button type="button" onClick={goPrev} aria-label="Previous image" className="gallery-nav-btn left-3">
              ‹
            </button>
            <button type="button" onClick={goNext} aria-label="Next image" className="gallery-nav-btn right-3">
              ›
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
    </div>
  )
}
