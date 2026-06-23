import { useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { useFirebaseAuthConfig } from '../contexts/FirebaseAuthConfigContext'
import { signInWithGooglePopup } from '../lib/firebase'

export default function FirebaseGoogleButton({ onToken, onError, disabled = false, label = 'Sign in with Google' }) {
  const { enabled, loading } = useFirebaseAuthConfig()
  const [busy, setBusy] = useState(false)

  if (loading) {
    return <p className="text-center text-xs text-muted">Loading Google sign-in…</p>
  }

  if (!enabled) {
    return (
      <p className="rounded-xl border border-dashed border-app bg-card-muted/40 p-3 text-center text-xs text-muted">
        Google sign-in is unavailable. Add Firebase config to frontend/.env and enable Google in Firebase Console.
      </p>
    )
  }

  const handleClick = async () => {
    setBusy(true)
    try {
      const credentials = await signInWithGooglePopup()
      await onToken?.(credentials)
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        onError?.('Google sign-in was cancelled.')
      } else if (err?.code === 'auth/operation-not-allowed') {
        onError?.('Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.')
      } else if (err?.code === 'auth/unauthorized-domain') {
        onError?.('This domain is not authorized. Add localhost to Firebase → Authentication → Authorized domains.')
      } else if (err?.message?.includes('valid email')) {
        onError?.(err.message)
      } else if (err?.message?.includes('email or phone')) {
        onError?.('Google sign-in did not return an email. Try another Google account or grant email permission.')
      } else {
        onError?.(err?.message || 'Google sign-in failed.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || busy}
      className="inline-flex w-full max-w-[320px] items-center justify-center gap-3 rounded-full border border-app bg-card px-4 py-2.5 text-sm font-medium text-main shadow-sm transition hover:bg-card-muted disabled:opacity-60"
    >
      <FcGoogle className="text-xl" aria-hidden />
      {busy ? 'Signing in…' : label}
    </button>
  )
}
