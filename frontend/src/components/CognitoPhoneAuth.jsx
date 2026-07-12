import { useEffect, useState } from 'react'
import {
  confirmSignIn,
  confirmSignUp,
  fetchAuthSession,
  resendSignUpCode,
  signIn,
  signUp,
} from 'aws-amplify/auth'
import { apiRequest } from '../api/client'
import {
  configureCognito,
  formatAuthError,
  generateCognitoPassword,
  toE164Phone,
} from '../lib/cognito'

const RESEND_COOLDOWN_SECONDS = 4 * 60

function formatCooldown(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/**
 * Phone OTP sign-in / sign-up via Amazon Cognito.
 * mode: 'login' | 'register'
 * phoneDigits: optional 10-digit phone from parent (register page)
 */
export default function CognitoPhoneAuth({
  mode = 'login',
  name = '',
  role = 'USER',
  phoneDigits = '',
  disabled = false,
  onSuccess,
  onError,
  submitLabel,
}) {
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState(phoneDigits)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [e164Phone, setE164Phone] = useState('')
  const [otpFlow, setOtpFlow] = useState('signIn')
  const [resendIn, setResendIn] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')

  const usesExternalPhone = mode === 'register' && Boolean(phoneDigits)

  const startResendCooldown = () => setResendIn(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (resendIn <= 0) return undefined
    const id = window.setInterval(() => {
      setResendIn((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [resendIn])

  useEffect(() => {
    if (phoneDigits) {
      setPhone(phoneDigits)
    }
  }, [phoneDigits])

  useEffect(() => {
    let cancelled = false
    apiRequest('/api/auth/cognito/config', { auth: false })
      .then((cfg) => {
        if (cancelled) return
        if (cfg?.enabled && configureCognito(cfg)) {
          setReady(true)
        } else {
          onError?.('Phone sign-in is not configured. Add Cognito settings to the backend.')
        }
      })
      .catch(() => {
        if (!cancelled) {
          onError?.('Could not load Cognito configuration from the backend.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [onError])

  const completeWithIdToken = async () => {
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken?.toString()
    if (!idToken) {
      throw new Error('Signed in but no ID token was returned.')
    }
    onSuccess?.({
      idToken,
      name: mode === 'register' ? name.trim() : undefined,
      role: mode === 'register' ? role : undefined,
    })
  }

  const resolveDigits = () => (usesExternalPhone ? phoneDigits : phone).replace(/\D/g, '')

  const selectSmsOtpChallenge = async (output) => {
    if (output.nextStep?.signInStep !== 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION') {
      return output
    }

    const available = output.nextStep.availableChallenges || []
    if (!available.includes('SMS_OTP')) {
      throw new Error(
        available.length
          ? `SMS OTP is not enabled for this Cognito user pool. Available: ${available.join(', ')}. In AWS Cognito → Sign-in → Options for choice-based sign-in, enable "SMS message one-time password".`
          : 'SMS OTP is not enabled for this Cognito user pool. In AWS Cognito → Sign-in → Options for choice-based sign-in, enable "SMS message one-time password".',
      )
    }

    return confirmSignIn({ challengeResponse: 'SMS_OTP' })
  }

  const startSignInChallenge = async (username) => {
    let output = await signIn({
      username,
      options: {
        authFlowType: 'USER_AUTH',
        preferredChallenge: 'SMS_OTP',
      },
    })

    // Cognito may ask the client to pick a first factor before sending SMS OTP.
    output = await selectSmsOtpChallenge(output)

    if (output.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
      setOtpFlow('signIn')
      setStep('otp')
      startResendCooldown()
      return false
    }

    if (output.isSignedIn || output.nextStep?.signInStep === 'DONE') {
      await completeWithIdToken()
      return true
    }

    throw new Error(
      `Unexpected sign-in step (${output.nextStep?.signInStep || 'unknown'}). Check Cognito phone OTP settings.`,
    )
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    onError?.('')

    const digits = resolveDigits()
    if (digits.length !== 10) {
      onError?.('Enter a valid 10-digit mobile number.')
      return
    }

    const username = toE164Phone(digits)
    setE164Phone(username)
    setStatusMessage('')
    setLoading(true)

    try {
      if (mode === 'register') {
        try {
          const signUpResult = await signUp({
            username,
            password: generateCognitoPassword(),
            options: {
              userAttributes: {
                phone_number: username,
                ...(name?.trim() ? { name: name.trim() } : {}),
              },
            },
          })

          if (signUpResult.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
            setOtpFlow('signUp')
            setStep('otp')
            startResendCooldown()
            return
          }

          if (signUpResult.isSignUpComplete) {
            await startSignInChallenge(username)
            return
          }
        } catch (err) {
          const exists =
            err?.name === 'UsernameExistsException' ||
            err?.name === 'AliasExistsException'
          if (!exists) {
            throw err
          }
        }
      }

      await startSignInChallenge(username)
    } catch (err) {
      onError?.(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    onError?.('')

    if (!otp.trim()) {
      onError?.('Enter the OTP sent to your phone.')
      return
    }

    setLoading(true)
    try {
      if (otpFlow === 'signUp') {
        await confirmSignUp({
          username: e164Phone,
          confirmationCode: otp.trim(),
        })

        let output = await signIn({
          username: e164Phone,
          options: {
            authFlowType: 'USER_AUTH',
            preferredChallenge: 'SMS_OTP',
          },
        })

        output = await selectSmsOtpChallenge(output)

        if (output.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
          setOtpFlow('signIn')
          setOtp('')
          setStep('otp')
          startResendCooldown()
          onError?.('Account verified. Enter the sign-in OTP sent to your phone.')
          return
        }

        if (output.isSignedIn || output.nextStep?.signInStep === 'DONE') {
          await completeWithIdToken()
          return
        }

        throw new Error('Sign-in did not complete after registration.')
      }

      const result = await confirmSignIn({ challengeResponse: otp.trim() })
      if (!result.isSignedIn) {
        throw new Error('OTP verification did not complete sign-in.')
      }

      await completeWithIdToken()
    } catch (err) {
      onError?.(formatAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendIn > 0 || resending || loading || !e164Phone) return

    onError?.('')
    setStatusMessage('')
    setResending(true)
    try {
      if (otpFlow === 'signUp') {
        await resendSignUpCode({ username: e164Phone })
      } else {
        await startSignInChallenge(e164Phone)
      }
      setOtp('')
      startResendCooldown()
      setStatusMessage('A new OTP has been sent to your phone.')
    } catch (err) {
      onError?.(formatAuthError(err))
    } finally {
      setResending(false)
    }
  }

  if (!ready) {
    return <p className="text-center text-sm text-muted">Loading phone sign-in…</p>
  }

  if (step === 'otp') {
    const canResend = resendIn === 0 && !loading && !resending && !disabled
    return (
      <form onSubmit={handleVerifyOtp} className="auth-login-form space-y-4">
        <p className="text-sm text-muted">
          Enter the 6-digit code sent to <span className="font-medium text-main">{e164Phone}</span>
        </p>
        <label className="auth-login-field block text-sm">
          <span className="auth-login-label font-medium text-main">OTP</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            required
            value={otp}
            onChange={(ev) => setOtp(ev.target.value.replace(/\D/g, ''))}
            className="input-app auth-login-input mt-1 w-full tracking-widest"
            placeholder="123456"
          />
        </label>
        <button type="submit" className="btn-primary auth-login-submit w-full" disabled={disabled || loading}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
        <p className="text-center text-sm text-muted">
          {resendIn > 0 ? (
            <>Resend OTP in <span className="font-medium text-main">{formatCooldown(resendIn)}</span></>
          ) : (
            <button
              type="button"
              className="text-brand-emphasis hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
              disabled={!canResend}
              onClick={handleResendOtp}
            >
              {resending ? 'Resending…' : 'Resend OTP'}
            </button>
          )}
        </p>
        {statusMessage ? (
          <p className="text-center text-sm text-brand-emphasis">{statusMessage}</p>
        ) : null}
        <button
          type="button"
          className="w-full text-sm text-brand-emphasis hover:underline"
          disabled={loading || resending}
          onClick={() => {
            setStep('phone')
            setOtp('')
            setResendIn(0)
            setStatusMessage('')
            onError?.('')
          }}
        >
          Change phone number
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSendOtp} className="auth-login-form space-y-4">
      {!usesExternalPhone && (
        <label className="auth-login-field block text-sm">
          <span className="auth-login-label font-medium text-main">Mobile number</span>
          <div className="mt-1 flex gap-2">
            <span className="input-app flex w-16 items-center justify-center text-muted">+91</span>
            <input
              type="tel"
              required
              value={phone}
              onChange={(ev) => setPhone(ev.target.value.replace(/\D/g, '').slice(0, 10))}
              className="input-app auth-login-input flex-1"
              placeholder="9876543210"
              autoComplete="tel"
            />
          </div>
        </label>
      )}
      <button type="submit" className="btn-primary auth-login-submit w-full" disabled={disabled || loading}>
        {loading ? 'Sending OTP…' : submitLabel || (mode === 'register' ? 'Send OTP to register' : 'Send OTP to sign in')}
      </button>
    </form>
  )
}
