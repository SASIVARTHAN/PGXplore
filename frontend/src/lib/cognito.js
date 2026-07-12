import { Amplify } from 'aws-amplify'

let configured = false

export function configureCognito(config) {
  if (!config?.userPoolId || !config?.clientId) {
    configured = false
    return false
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.userPoolId,
        userPoolClientId: config.clientId,
        loginWith: {
          phone: true,
        },
      },
    },
  })

  configured = true
  return true
}

export function isCognitoConfigured() {
  return configured
}

/** Indian mobile: 10 digits → E.164 (+91xxxxxxxxxx). */
export function toE164Phone(digits, countryCode = '+91') {
  const cleaned = String(digits).replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${countryCode}${cleaned}`
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`
  }
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  return `${countryCode}${cleaned}`
}

/** Cognito requires a password on sign-up even for phone-only pools. */
export function generateCognitoPassword() {
  // Avoid crypto.randomUUID() — unavailable on non-HTTPS origins (e.g. http://EC2-IP).
  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  const random = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
  return `PgX!${random.slice(0, 16)}9a`
}

export function formatAuthError(err) {
  if (!err) return 'Authentication failed.'
  if (typeof err === 'string') return err

  const message = err.message || err.name || 'Authentication failed.'
  if (/selected challenge is not available/i.test(message)) {
    return 'SMS OTP is not available in Cognito for this account. Enable "SMS message one-time password" under Cognito → Sign-in → Options for choice-based sign-in, ensure the app client allows USER_AUTH, then try Create an account first if this number is new.'
  }
  if (/UserNotFoundException|user does not exist/i.test(message) || err.name === 'UserNotFoundException') {
    return 'No account found for this number. Use Create an account first.'
  }
  return message
}
