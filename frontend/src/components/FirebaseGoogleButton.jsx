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
        Google sign-in is unavailable. Start the backend and configure Firebase.
      </p>
    )
  }

  const handleClick = async () => {
    setBusy(true)
    try {
      const idToken = await signInWithGooglePopup()
      await onToken?.(idToken)
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        onError?.('Google sign-in was cancelled.')
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
