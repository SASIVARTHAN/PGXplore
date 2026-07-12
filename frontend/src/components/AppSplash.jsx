export default function AppSplash({ exiting = false }) {
  return (
    <div
      className={`app-splash${exiting ? ' app-splash--exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading PGXplore"
    >
      <div className="app-splash__glow app-splash__glow--left" aria-hidden />
      <div className="app-splash__glow app-splash__glow--right" aria-hidden />

      <div className="app-splash__inner">
        {/* Same framed logo treatment as Sign In (EntryBrandPanel). */}
        <div className="app-splash__logo entry-float entry-logo-wrap">
          <img
            src="/pgxplore-logo.png"
            alt="PGXplore — Find PGs near you"
            className="h-auto w-full"
            width="1024"
            height="683"
            fetchPriority="high"
          />
        </div>

        <div className="app-splash__loader" aria-hidden>
          <span className="app-splash__loader-dot" />
          <span className="app-splash__loader-dot" />
          <span className="app-splash__loader-dot" />
        </div>

        <p className="app-splash__tagline">Find trusted PGs in Chennai</p>
      </div>
    </div>
  )
}
