import { useEffect, useState } from 'react'
import { useFirebaseAuthConfig } from '../contexts/FirebaseAuthConfigContext'
import { confirmPhoneOtp, resetPhoneAuth, sendPhoneOtp } from '../lib/firebase'

export default function FirebasePhoneButton({ onToken, onError, disabled = false }) {
  const { enabled, loading } = useFirebaseAuthConfig()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone')
  const [confirmation, setConfirmation] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => () => resetPhoneAuth(), [])

  if (loading) {
    return <p className="text-center text-xs text-muted">Loading phone sign-in…</p>
  }

  if (!enabled) {
    return null
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const digits = phone.replace(/\D/g, '')
      const result = await sendPhoneOtp(digits)
      setConfirmation(result)
      setStep('otp')
    } catch (err) {
      resetPhoneAuth()
      if (err?.code === 'auth/too-many-requests') {
        onError?.('Too many attempts. Please wait and try again.')
      } else if (err?.code === 'auth/invalid-phone-number') {
        onError?.('Invalid phone number. Use a 10-digit Indian mobile number.')
      } else if (err?.code === 'auth/captcha-check-failed') {
        onError?.('reCAPTCHA failed. Complete the checkbox below and try again.')
      } else if (err?.code === 'auth/quota-exceeded') {
        onError?.('SMS quota exceeded. Enable billing in Firebase or add a test phone number in Firebase Console.')
      } else if (err?.code === 'auth/operation-not-allowed') {
        onError?.('Phone sign-in is not enabled. Enable Phone in Firebase Console → Authentication → Sign-in method.')
      } else if (err?.code === 'auth/billing-not-enabled') {
        onError?.(
          'Phone sign-in requires Firebase billing (Blaze plan). Upgrade in Firebase Console → Upgrade, or use Sign in with Google instead.'
        )
      } else {
        onError?.(err?.message || 'Could not send verification code.')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!confirmation) return
    setBusy(true)
    try {
      const idToken = await confirmPhoneOtp(confirmation, otp)
      await onToken?.(idToken)
    } catch (err) {
      if (err?.code === 'auth/invalid-verification-code') {
        onError?.('Invalid verification code. Please try again.')
      } else if (err?.code === 'auth/code-expired') {
        onError?.('Code expired. Request a new one.')
        setStep('phone')
        setConfirmation(null)
        resetPhoneAuth()
      } else {
        onError?.(err?.message || 'Phone verification failed.')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleChangeNumber = () => {
    setStep('phone')
    setOtp('')
    setConfirmation(null)
    resetPhoneAuth()
  }

  return (
    <div className="w-full max-w-[320px] space-y-3">
      <div id="firebase-recaptcha" className="flex justify-center" />

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-3">
          <label className="block text-sm">
            <span className="font-medium text-main">Mobile number</span>
            <div className="mt-1 flex overflow-hidden rounded-xl border border-app bg-card">
              <span className="flex items-center border-r border-app bg-card-muted/50 px-3 text-sm text-muted">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="input-app w-full border-0 bg-transparent focus:ring-0"
                disabled={disabled || busy}
                required
              />
            </div>
          </label>
          <button
            type="submit"
            className="btn-secondary w-full"
            disabled={disabled || busy || phone.replace(/\D/g, '').length !== 10}
          >
            {busy ? 'Sending code…' : 'Continue with mobile'}
          </button>
          <p className="text-center text-[11px] leading-relaxed text-muted">
            Complete the reCAPTCHA below, then submit. For testing without SMS, add your number under
            Firebase Console → Authentication → Phone → Phone numbers for testing.
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-3">
          <p className="text-center text-xs text-muted">
            Enter the code sent to +91 {phone.replace(/\D/g, '')}
          </p>
          <label className="block text-sm">
            <span className="font-medium text-main">Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="input-app mt-1 w-full text-center tracking-widest"
              disabled={disabled || busy}
              required
            />
          </label>
          <button type="submit" className="btn-primary w-full" disabled={disabled || busy || otp.length < 4}>
            {busy ? 'Verifying…' : 'Verify & sign in'}
          </button>
          <button
            type="button"
            onClick={handleChangeNumber}
            className="w-full text-xs font-medium text-brand-emphasis hover:underline"
            disabled={busy}
          >
            Use a different number
          </button>
        </form>
      )}
    </div>
  )
}
