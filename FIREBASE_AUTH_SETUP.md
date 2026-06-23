# Firebase Authentication — Gmail & Mobile (PGXplore)

Enable **Google (Gmail)** and **Phone (SMS OTP)** sign-in using Firebase Authentication.

## 1. Firebase Console setup

Open [Firebase Console](https://console.firebase.google.com/) → project **pgxplore**.

### Enable sign-in providers

1. **Authentication** → **Sign-in method**
2. Enable **Google** — set support email, save
3. Enable **Phone** — save (uses Firebase reCAPTCHA for SMS)

### Authorized domains

**Authentication** → **Settings** → **Authorized domains** — ensure these are listed:

- `localhost`
- Your production domain (when deployed)

### App Check (recommended before production)

1. **App Check** → register your **Web** app if not already done
2. Choose **reCAPTCHA v3** as the provider
3. Copy the **reCAPTCHA site key** into `frontend/.env`:

```env
VITE_FIREBASE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

4. For **local development**, add a debug token:
   - **App Check** → **Manage debug tokens** → **Add debug token**
   - Copy the token into `frontend/.env`:

```env
VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN=your-debug-token
```

> Debug tokens expire after **7 days**. Generate a new one when local phone/Google sign-in stops working.

### Phone numbers for testing (optional)

**Authentication** → **Sign-in method** → **Phone** → **Phone numbers for testing**

Add test numbers (e.g. `+91 9876543210` / code `123456`) to verify OTP flow without sending real SMS.

## 2. Backend — Firebase Admin SDK

The backend verifies Firebase ID tokens and issues JWTs.

1. **Project settings** → **Service accounts** → **Generate new private key**
2. Save the JSON file as:

```
backend/src/main/resources/firebase-service-account.json
```

This file is gitignored. Without it, `/api/auth/firebase` returns an error.

## 3. Frontend environment

Copy the example and fill in values from **Project settings** → **Your apps** → Web app config:

```powershell
cd frontend
copy .env.example .env
```

Required variables:

| Variable | Source |
|----------|--------|
| `VITE_FIREBASE_API_KEY` | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web app config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web app config |
| `VITE_FIREBASE_APP_ID` | Firebase web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config |
| `VITE_FIREBASE_APP_CHECK_DEBUG_TOKEN` | App Check → debug token (local dev) |
| `VITE_FIREBASE_RECAPTCHA_SITE_KEY` | App Check → reCAPTCHA site key |

The backend also exposes config at `GET /api/auth/firebase/config` — frontend falls back to `.env` if the API is unavailable.

## 4. Run the app

```powershell
# Terminal 1 — backend (requires MySQL)
cd backend
.\mvnw.cmd spring-boot:run

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173/login

## 5. Test sign-in

| Method | Steps |
|--------|--------|
| **Gmail** | Click **Sign in with Google** → choose Google account |
| **Mobile** | Enter 10-digit number → **Continue with mobile** → enter SMS code |

Both flows call `POST /api/auth/firebase` with the Firebase ID token and receive a PGXplore JWT.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “Google sign-in is unavailable” | Start backend; check Firebase config in `.env` or `/api/auth/firebase/config` |
| “Firebase is not configured on the server” | Add `firebase-service-account.json` to backend resources |
| Phone OTP not sent | Enable Phone provider in Firebase; **upgrade to Blaze plan** (billing required for SMS); use test phone numbers |
| `auth/billing-not-enabled` | Upgrade Firebase project to **Blaze (pay-as-you-go)** in Firebase Console → Upgrade. Phone auth does not work on the free Spark plan. |
| `auth/too-many-requests` | Wait a few minutes or use Firebase test phone numbers |
| App Check errors in dev | Add/regenerate debug token in Firebase Console and `.env` |
| Invalid Firebase token | Token expired — sign in again; ensure frontend and backend use the same Firebase project |

## Auth flow

```
User → Firebase (Google popup or Phone OTP)
     → Firebase ID token
     → POST /api/auth/firebase
     → Backend verifies token (Admin SDK)
     → Creates/finds user (GOOGLE or PHONE provider)
     → Returns PGXplore JWT
```
