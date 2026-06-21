import { GoogleLogin } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'
import { useGoogleAuthConfig } from '../contexts/GoogleAuthConfigContext'

function DevGoogleButton({ onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full max-w-[320px] items-center justify-center gap-3 rounded-full border border-app bg-card px-4 py-2.5 text-sm font-medium text-main shadow-sm transition hover:bg-card-muted disabled:opacity-60"
    >
      <FcGoogle className="text-xl" aria-hidden />
      {label}
    </button>
  )
}

export default function GoogleSignInButton({
  onSuccess,
  onDevSignIn,
  onError,
  disabled = false,
  text = 'signin_with',
}) {
  const { clientId, devMode, realAuth, enabled, loading } = useGoogleAuthConfig()

  if (loading) {
    return <p className="text-center text-xs text-muted">Loading Google sign-in…</p>
  }

  if (!enabled) {
    return (
      <p className="rounded-xl border border-dashed border-app bg-card-muted/40 p-3 text-center text-xs text-muted">
        Google sign-in is unavailable. Start the backend server and try again.
      </p>
    )
  }

  if (clientId && realAuth) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`google-signin-wrap flex justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            useOneTap={false}
            theme="outline"
            size="large"
            shape="pill"
            text={text}
            width="320"
          />
        </div>
        <p className="text-center text-[11px] text-muted">Secured with Google OAuth</p>
      </div>
    )
  }

  if (devMode && onDevSignIn) {
    return (
      <DevGoogleButton
        disabled={disabled}
        label={text === 'signup_with' ? 'Sign up with Google' : 'Sign in with Google'}
        onClick={onDevSignIn}
      />
    )
  }

  return null
}
