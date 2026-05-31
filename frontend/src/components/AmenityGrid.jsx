export default function AmenityGrid({ amenities }) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold text-main">Amenities</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {amenities.map((item) => (
          <div key={item} className="rounded-lg border border-app bg-card-muted px-3 py-2 text-sm text-main">
            ✓ {item}
          </div>
        ))}
      </div>
    </div>
  )
}
