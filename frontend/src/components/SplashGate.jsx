import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AppSplash from './AppSplash'

const MIN_SPLASH_MS = 2200
const EXIT_MS = 500

function shouldShowSplashOnLoad() {
  if (typeof window === 'undefined') return true
  const navEntry = performance.getEntriesByType('navigation')?.[0]
  return navEntry?.type !== 'reload'
}

export default function SplashGate({ children }) {
  const { bootstrapping } = useAuth()
  const initialShow = shouldShowSplashOnLoad()
  const [minElapsed, setMinElapsed] = useState(false)
  const [exiting, setExiting] = useState(!initialShow)
  const [done, setDone] = useState(!initialShow)

  useEffect(() => {
    if (!initialShow) return undefined
    const id = window.setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS)
    return () => clearTimeout(id)
  }, [initialShow])

  useEffect(() => {
    if (!initialShow) return undefined
    if (!minElapsed || bootstrapping) return undefined

    setExiting(true)
    const id = window.setTimeout(() => setDone(true), EXIT_MS)
    return () => clearTimeout(id)
  }, [initialShow, minElapsed, bootstrapping])

  return (
    <>
      {!done && <AppSplash exiting={exiting} />}
      <div className={done ? undefined : 'app-splash-content-pending'} aria-hidden={!done}>
        {children}
      </div>
    </>
  )
}
