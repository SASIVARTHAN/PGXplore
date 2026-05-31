import { mapsDirectionsUrl, mapsEmbedUrl } from '../data/pgMeta'

export default function LocationMap({ location, pgName }) {
  if (!location) return null

  const embedUrl = mapsEmbedUrl(location)
  const directionsUrl = mapsDirectionsUrl(location)

  return (
    <section className="rounded-2xl border border-app bg-card p-4">
      <h3 className="text-base font-semibold text-main">Location</h3>
      <p className="mt-1 text-sm text-muted">{location.address}</p>
      {embedUrl && (
        <div className="mt-3 overflow-hidden rounded-lg border border-app">
          <iframe
            title={`Map — ${pgName}`}
            src={embedUrl}
            className="h-44 w-full border-0 md:h-48"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      )}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-3 inline-flex text-sm"
        >
          Open in Google Maps
        </a>
      )}
    </section>
  )
}
