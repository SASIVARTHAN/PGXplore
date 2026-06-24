# Railway + local frontend testing

## 1. Railway project setup

1. Create a project at https://railway.app
2. **New → GitHub Repo** → select `SASIVARTHAN/PGXplore`
3. **New → Database → MySQL** (in the same project)

## 2. Backend service settings

The repo includes a root `railway.toml` so Railway builds from `backend/` automatically.

Optional (cleaner): **Settings → Root Directory** → `backend`

## 3. Backend environment variables

In the backend service → **Variables**, add:

| Variable | Value |
|----------|--------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | `jdbc:mysql://HOST:PORT/railway?useSSL=true&serverTimezone=UTC` |
| `DB_USERNAME` | from MySQL service |
| `DB_PASSWORD` | from MySQL service |
| `JWT_SECRET` | long random string (32+ chars) |
| `SERVER_PORT` | `${{PORT}}` or `8080` |
| `FRONTEND_URL` | `http://localhost:5173` |
| `FIREBASE_API_KEY` | Firebase web app config |
| `FIREBASE_AUTH_DOMAIN` | `pgxplore.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `pgxplore` |
| `FIREBASE_APP_ID` | Firebase web app config |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config |
| `FIREBASE_STORAGE_BUCKET` | `pgxplore.firebasestorage.app` |
| `FIREBASE_BUCKET_NAME` | `pgxplore.firebasestorage.app` |

**Tip:** Railway MySQL often exposes `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` — use those in `DB_URL`.

For Google login + image upload, add Firebase service account JSON as a secret file or set `FIREBASE_CREDENTIALS_PATH`.

## 4. Deploy

Click **Deploy** / push to `main`. Build should run:

```
cd backend && ./mvnw clean package -DskipTests
java -jar backend/target/pgxplore-backend-1.0.0.jar
```

## 5. Test the API

Replace with your Railway URL:

```
https://YOUR-SERVICE.up.railway.app/api/auth/firebase/config
https://YOUR-SERVICE.up.railway.app/swagger-ui.html
https://YOUR-SERVICE.up.railway.app/api/pg/all
```

## 6. Connect local frontend

Create `frontend/.env.local`:

```env
VITE_API_BASE_URL=https://YOUR-SERVICE.up.railway.app
```

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — it calls your deployed backend.

## Troubleshooting

| Error | Fix |
|-------|-----|
| Railpack can't detect Java | Redeploy after pulling latest `railway.toml` |
| DB connection failed | Check `DB_URL`, username, password |
| CORS error | Set `FRONTEND_URL=http://localhost:5173` |
| Google login fails | Add Firebase env vars + service account JSON |
