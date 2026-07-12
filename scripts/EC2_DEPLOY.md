# EC2 deployment (fix auth / phone OTP)

## Problem on `3.105.160.225`

The server is running an **old backend JAR**. Symptoms:

- `GET /api/pg/all` works
- **Every** `POST /api/auth/*` returns **500** (login, register, OTP)
- OpenAPI still shows Google auth / email-only register (no phone OTP)
- Health is **DOWN** because SMTP mail probe fails

**Fix:** deploy the latest code from this repo and restart Docker. Flyway runs migrations on startup (`V5+` adds phone verification).

---

## Option A — one command from Windows

```powershell
cd C:\Users\USER\Downloads\pgnew\pgnew
.\scripts\deploy-ec2.ps1 -KeyPath "C:\path\to\your-ec2-key.pem"
```

This will:

1. Build `backend/target/pgxplore-backend-1.0.0.jar`
2. Copy `backend/` + `scripts/` to EC2
3. Run `scripts/deploy-ec2.sh` on the server (rebuild Docker, restart, smoke-test OTP)

---

## Option B — manual SSH

```bash
# 1. SSH in
ssh -i your-key.pem ubuntu@3.105.160.225

# 2. Clone or pull repo
cd ~
git clone https://github.com/salman630543/PGXplore.git pgxplore || (cd pgxplore && git pull)

# 3. Firebase credentials (if not already on server)
# Copy backend/firebase-service-account.json to ~/pgxplore/backend/

# 4. Deploy
cd ~/pgxplore
chmod +x scripts/deploy-ec2.sh
bash scripts/deploy-ec2.sh
```

---

## Verify after deploy

```bash
curl -X POST http://3.105.160.225/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543213"}'

curl -X POST http://3.105.160.225/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543213","otp":"123456","portal":"user"}'
```

Expected: **200** with `demoOtp: "123456"` on send, JWT tokens on verify.

```bash
curl http://3.105.160.225/actuator/health
```

Expected: `"status":"UP"` (mail health disabled in new build).

---

## Demo accounts (seed data)

| Phone | Role | OTP |
|-------|------|-----|
| `9876543213` | User | `123456` |
| `9876543211` | PG Owner | `123456` |
| `admin@pgxplore.com` | Admin (privileged login) | `Password@123` |

---

## If deploy fails

```bash
docker compose -f ~/pgxplore/backend/docker-compose.yml logs --tail=100 app
docker compose -f ~/pgxplore/backend/docker-compose.yml logs --tail=50 mysql
```

Common issues:

- **MySQL not running** — `docker compose up -d mysql`, wait for healthy, then `docker compose up -d app`
- **Missing firebase JSON** — auth still works; only image upload needs it
- **Port 8080 in use** — `sudo lsof -i :8080` and stop conflicting process
