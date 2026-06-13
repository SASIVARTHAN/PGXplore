import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchFirebaseConfigApi } from '../api/auth'
import { initFirebase } from '../lib/firebase'

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
}

const FirebaseAuthConfigContext = createContext({ enabled: false, loading: true })

function isUsable(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId)
}

export function FirebaseAuthConfigProvider({ children }) {
  const [state, setState] = useState({ enabled: false, loading: true })

  useEffect(() => {
    let active = true
    fetchFirebaseConfigApi()
      .then((data) => {
        if (!active) return
        const config = {
          apiKey: data?.apiKey?.trim() || envConfig.apiKey,
          authDomain: data?.authDomain?.trim() || envConfig.authDomain,
          projectId: data?.projectId?.trim() || envConfig.projectId,
          appId: data?.appId?.trim() || envConfig.appId,
          messagingSenderId: data?.messagingSenderId?.trim() || envConfig.messagingSenderId,
        }
        const enabled = isUsable(config)
        if (enabled) initFirebase(config)
        setState({ enabled, loading: false })
      })
      .catch(() => {
        if (!active) return
        const enabled = isUsable(envConfig)
        if (enabled) initFirebase(envConfig)
        setState({ enabled, loading: false })
      })
    return () => { active = false }
  }, [])

  const value = useMemo(() => state, [state])
  return <FirebaseAuthConfigContext.Provider value={value}>{children}</FirebaseAuthConfigContext.Provider>
}

export function useFirebaseAuthConfig() {
  return useContext(FirebaseAuthConfigContext)
}
