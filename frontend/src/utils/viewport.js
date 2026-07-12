/** Sync CSS --app-vh with visualViewport. Landing page only — do not use on app tabs. */
export function updateAppViewportHeight() {
  if (typeof window === 'undefined') return
  const height = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-vh', `${Math.round(height)}px`)
}

export function resetPageScroll(scrollContainer) {
  if (typeof window === 'undefined') return
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  if (scrollContainer) scrollContainer.scrollTop = 0
}

export function applyLandingViewportLock(scrollContainer) {
  updateAppViewportHeight()
  resetPageScroll(scrollContainer)
  document.documentElement.classList.add('landing-scroll-lock')
}

export function clearLandingViewportLock({ resetScroll = true } = {}) {
  document.documentElement.classList.remove('landing-scroll-lock')
  document.documentElement.style.removeProperty('--app-vh')
  if (resetScroll) resetPageScroll()
}

export function syncLandingViewportAfterRoute(scrollContainer) {
  updateAppViewportHeight()
  resetPageScroll(scrollContainer)
  requestAnimationFrame(() => {
    updateAppViewportHeight()
    resetPageScroll(scrollContainer)
  })
}
