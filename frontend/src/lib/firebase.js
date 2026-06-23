import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
} from 'firebase/auth'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

let firebaseApp = null
let firebaseAuth = null
let recaptchaVerifier = null
let appCheckInitialized = false

function getDebugToken() {
  return import.meta.env.VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN?.trim() || ''
}

function getRecaptchaSiteKey() {
  return import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY?.trim() || ''
}

function buildFirebaseOptions(config) {
  return {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket || undefined,
    messagingSenderId: config.messagingSenderId || undefined,
    appId: config.appId || undefined,
    measurementId: config.measurementId || undefined,
  }
}

async function initAnalytics(app, measurementId) {
  if (!measurementId || typeof window === 'undefined') return
  try {
    const supported = await isSupported()
    if (supported) {
      getAnalytics(app)
    }
  } catch {
    // Analytics is optional — auth still works without it.
  }
}

export function initFirebase(config) {
  if (!config?.apiKey || !config?.authDomain || !config?.projectId) {
    return null
  }
  if (!firebaseApp) {
    firebaseApp = initializeApp(buildFirebaseOptions(config))
    firebaseAuth = getAuth(firebaseApp)
    initAppCheckIfConfigured()
    void initAnalytics(firebaseApp, config.measurementId)
  }
  return firebaseAuth
}

function initAppCheckIfConfigured() {
  if (appCheckInitialized || !firebaseApp) return

  const debugToken = getDebugToken()
  const siteKey = getRecaptchaSiteKey()

  if (debugToken && import.meta.env.DEV) {
    // eslint-disable-next-line no-underscore-dangle
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken
  }

  if (!siteKey) return

  try {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    })
    appCheckInitialized = true
  } catch {
    // App Check is optional for local development.
  }
}

export function getFirebaseAuth() {
  return firebaseAuth
}

export function getFirebaseApp() {
  return firebaseApp
}

/** Resolve email from Firebase user profile or linked Google provider data. */
function resolveGoogleEmail(user) {
  if (user?.email?.trim()) {
    return user.email.trim()
  }
  const googleProfile = user?.providerData?.find((profile) => profile.providerId === 'google.com')
  return googleProfile?.email?.trim() || ''
}

/** Opens the Google sign-in popup and returns credentials for the backend. */
export async function signInWithGooglePopup() {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('Firebase is not initialized')
  }
  const provider = new GoogleAuthProvider()
  provider.addScope('email')
  provider.addScope('profile')
  provider.setCustomParameters({ prompt: 'select_account' })
  const result = await signInWithPopup(auth, provider)
  const user = result.user

  // Reload profile so Google email/name are available before token exchange.
  await user.reload()

  const email = resolveGoogleEmail(user)
  if (!email) {
    throw new Error(
      'Your Google account must include a valid email address. Use a Gmail account or grant email access when signing in.'
    )
  }

  // Google tokens often omit the email claim; send client profile email to the backend.
  return {
    idToken: await user.getIdToken(true),
    email,
    name: user.displayName?.trim() || '',
    profilePicture: user.photoURL?.trim() || '',
  }
}

/** Normalize a 10-digit Indian mobile number to E.164 (+91). */
export function formatIndianPhone(digits) {
  const cleaned = String(digits || '').replace(/\D/g, '')
  if (cleaned.length !== 10) {
    throw new Error('Enter a valid 10-digit mobile number.')
  }
  return `+91${cleaned}`
}

function getRecaptchaVerifier() {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('Firebase is not initialized')
  }
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'firebase-recaptcha', {
      size: 'normal',
    })
  }
  return recaptchaVerifier
}

/** Sends an OTP to the given 10-digit Indian mobile number. */
export async function sendPhoneOtp(phoneDigits) {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('Firebase is not initialized')
  }
  const phoneNumber = formatIndianPhone(phoneDigits)
  const verifier = getRecaptchaVerifier()
  return signInWithPhoneNumber(auth, phoneNumber, verifier)
}

/** Confirms the OTP and returns a Firebase ID token. */
export async function confirmPhoneOtp(confirmationResult, otp) {
  const code = String(otp || '').replace(/\D/g, '')
  if (code.length < 4) {
    throw new Error('Enter the verification code from SMS.')
  }
  const result = await confirmationResult.confirm(code)
  return result.user.getIdToken()
}

export function resetPhoneAuth() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
    recaptchaVerifier = null
  }
}
