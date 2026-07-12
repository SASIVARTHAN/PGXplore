import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { syncLandingViewportAfterRoute } from '../utils/viewport'

/** Landing-only viewport sync. Route scroll save/restore lives in AppShell. */
export default function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      syncLandingViewportAfterRoute()
    }
  }, [location.pathname, location.search])

  return null
}
