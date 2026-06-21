import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchFirebaseConfigApi } from '../api/auth'
import { initFirebase } from '../lib/firebase'

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || '',
}

const FirebaseAuthConfigContext = createContext({ enabled: false, loading: true })

function isUsable(config) {
  return Boolean(config.apiKey && config.authDomain && config.projectId)
}

function mergeConfig(apiData = {}) {
  return {
    apiKey: apiData.apiKey?.trim() || envConfig.apiKey,
    authDomain: apiData.authDomain?.trim() || envConfig.authDomain,
    projectId: apiData.projectId?.trim() || envConfig.projectId,
    storageBucket: apiData.storageBucket?.trim() || envConfig.storageBucket,
    messagingSenderId: apiData.messagingSenderId?.trim() || envConfig.messagingSenderId,
    appId: apiData.appId?.trim() || envConfig.appId,
    measurementId: apiData.measurementId?.trim() || envConfig.measurementId,
  }
}

export function FirebaseAuthConfigProvider({ children }) {
  const [state, setState] = useState(() => ({
    enabled: isUsable(envConfig),
    loading: !isUsable(envConfig),
  }))

  useEffect(() => {
    let active = true

    if (isUsable(envConfig)) {
      initFirebase(envConfig)
      setState({ enabled: true, loading: true })
    }

    fetchFirebaseConfigApi()
      .then((data) => {
        if (!active) return
        const config = mergeConfig(data)
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

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => state, [state])
  return <FirebaseAuthConfigContext.Provider value={value}>{children}</FirebaseAuthConfigContext.Provider>
}

export function useFirebaseAuthConfig() {
  return useContext(FirebaseAuthConfigContext)
}
