import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchGoogleAuthConfigApi } from '../api/auth'

const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''

const GoogleAuthConfigContext = createContext({
  clientId: envClientId,
  devMode: false,
  realAuth: Boolean(envClientId),
  enabled: Boolean(envClientId),
  loading: true,
})

export function GoogleAuthConfigProvider({ children }) {
  const [config, setConfig] = useState({
    clientId: envClientId,
    devMode: false,
    realAuth: Boolean(envClientId),
    enabled: Boolean(envClientId),
    loading: true,
  })

  useEffect(() => {
    let active = true
    fetchGoogleAuthConfigApi()
      .then((data) => {
        if (!active) return
        const clientId = data?.clientId?.trim() || envClientId || ''
        const devMode = Boolean(data?.devMode)
        const realAuth = Boolean(data?.realAuth) || Boolean(clientId)
        setConfig({
          clientId,
          devMode,
          realAuth,
          enabled: realAuth || devMode || Boolean(data?.enabled),
          loading: false,
        })
      })
      .catch(() => {
        if (!active) return
        setConfig({
          clientId: envClientId,
          devMode: false,
          realAuth: Boolean(envClientId),
          enabled: Boolean(envClientId),
          loading: false,
        })
      })
    return () => { active = false }
  }, [])

  const value = useMemo(() => config, [config])
  return <GoogleAuthConfigContext.Provider value={value}>{children}</GoogleAuthConfigContext.Provider>
}

export function useGoogleAuthConfig() {
  return useContext(GoogleAuthConfigContext)
}
