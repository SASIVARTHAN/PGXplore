# Enable Real Google Authentication — PGXplore

## 1. Create Google OAuth credentials

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. **Authorized JavaScript origins:** `http://localhost:5173`
5. Copy **Client ID** and **Client Secret**

> Use the same Google Cloud project as Firebase if you already have one.

## 2. Configure PGXplore (choose one method)

### Method A — Setup script (recommended)

```powershell
cd PGXplore
.\scripts\setup-google-auth.ps1
```

### Method B — Manual

**Backend** — copy and edit:

```
backend/google-oauth.local.properties.example  →  backend/google-oauth.local.properties
```

```properties
GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
```

**Frontend** — edit `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
```

## 3. Start the app

```powershell
cd backend
mvn spring-boot:run
```

```powershell
cd frontend
npm run dev
```

## 4. Test

1. Open http://localhost:5173/login
2. Click **Sign in with Google** (real Google popup)
3. After sign-in you receive a JWT — saved PGs, reviews, and account pages work with that token

## Authorization flow

| Step | What happens |
|------|----------------|
| Google sign-in | Frontend gets ID token from Google |
| `POST /api/auth/google` | Backend verifies token, creates/loads user |
| JWT issued | Contains `email`, `userId`, `role` (24h expiry) |
| Protected APIs | Send `Authorization: Bearer <token>` |

## Verify backend is configured

```bash
curl http://localhost:8080/api/auth/google/config
```

Expected when enabled:

```json
{
  "success": true,
  "data": {
    "clientId": "your-id.apps.googleusercontent.com",
    "devMode": false,
    "enabled": true,
    "realAuth": true
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dev button instead of Google popup | Add `GOOGLE_CLIENT_ID` and restart backend + frontend |
| Invalid token | Frontend and backend must use the **same** Client ID |
| Google popup blocked | Allow popups for localhost:5173 |
| 403 from Google | Add `http://localhost:5173` to authorized origins |
