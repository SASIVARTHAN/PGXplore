import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAdmin } from './AdminContext'
import { useAuth } from './AuthContext'

const RefreshContext = createContext(null)

export function RefreshProvider({ children }) {
  const { refreshSession } = useAuth()
  const { refreshListings, refreshAdminStats } = useAdmin()
  const pageHandlersRef = useRef(new Set())
  const refreshingRef = useRef(false)
  const [refreshing, setRefreshing] = useState(false)

  const registerPageRefresh = useCallback((handler) => {
    pageHandlersRef.current.add(handler)
    return () => {
      pageHandlersRef.current.delete(handler)
    }
  }, [])

  const refreshAppData = useCallback(async () => {
    if (refreshingRef.current) return

    refreshingRef.current = true
    setRefreshing(true)
    try {
      await refreshSession()
      const pageTasks = Array.from(pageHandlersRef.current).map((handler) =>
        Promise.resolve(handler()),
      )
      await Promise.all([refreshListings(), refreshAdminStats(), ...pageTasks])
    } finally {
      refreshingRef.current = false
      setRefreshing(false)
    }
  }, [refreshAdminStats, refreshListings, refreshSession])

  const value = useMemo(
    () => ({
      refreshAppData,
      registerPageRefresh,
      refreshing,
    }),
    [refreshAppData, registerPageRefresh, refreshing],
  )

  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
}

export function useRefresh() {
  const ctx = useContext(RefreshContext)
  if (!ctx) throw new Error('useRefresh must be used within RefreshProvider')
  return ctx
}

export function usePageRefresh(callback) {
  const { registerPageRefresh } = useRefresh()

  useEffect(() => {
    if (!callback) return undefined
    return registerPageRefresh(callback)
  }, [callback, registerPageRefresh])
}
