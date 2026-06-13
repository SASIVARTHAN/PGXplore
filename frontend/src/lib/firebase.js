import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

let firebaseApp = null
let firebaseAuth = null

export function initFirebase(config) {
  if (!config?.apiKey || !config?.authDomain || !config?.projectId) {
    return null
  }
  if (!firebaseApp) {
    firebaseApp = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId || undefined,
      messagingSenderId: config.messagingSenderId || undefined,
    })
    firebaseAuth = getAuth(firebaseApp)
  }
  return firebaseAuth
}

export function getFirebaseAuth() {
  return firebaseAuth
}

/** Opens the Google sign-in popup and returns the Firebase ID token. */
export async function signInWithGooglePopup() {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('Firebase is not initialized')
  }
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  provider.setCustomParameters({ prompt: 'consent select_account' })
  const result = await signInWithPopup(auth, provider)
  return result.user.getIdToken()
}
