import { useState } from 'react'

export default function ImageGallery({ images, name }) {
  const [active, setActive] = useState(0)
  const total = images.length

  const goPrev = () => setActive((i) => (i <= 0 ? total - 1 : i - 1))
  const goNext = () => setActive((i) => (i >= total - 1 ? 0 : i + 1))

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl bg-card-muted">
        <img src={images[active]} alt={`${name} - photo ${active + 1}`} className="aspect-[16/10] w-full object-cover" />
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
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={`h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg border-2 md:h-16 md:w-20 ${
                active === index ? 'border-brand-600 dark:border-brand-400' : 'border-transparent opacity-80'
              }`}
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
