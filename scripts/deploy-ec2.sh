#!/usr/bin/env bash
# Run ON the EC2 instance (Ubuntu) from the repo backend/ folder.
# Fixes auth 500s by rebuilding the API image and applying Flyway migrations on startup.
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/../backend" && pwd)}"
cd "$APP_DIR"

echo "==> PGXplore EC2 deploy in $APP_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker first." >&2
  exit 1
fi

if [ ! -f firebase-service-account.json ]; then
  echo "WARN: backend/firebase-service-account.json missing — image upload may fail, but auth should work."
fi

echo "==> Pull latest code (skip if you copied files manually)"
if [ -d ../.git ]; then
  git -C .. pull --ff-only || true
fi

echo "==> Rebuild and restart containers"
docker compose down
docker compose build --no-cache app
docker compose up -d

echo "==> Wait for API (Cognito config endpoint)"
for i in $(seq 1 36); do
  if curl -fsS "http://127.0.0.1:8080/api/auth/cognito/config" >/dev/null 2>&1; then
    echo "API is up."
    break
  fi
  sleep 5
  if [ "$i" -eq 36 ]; then
    echo "API did not become ready in time. Logs:" >&2
    docker compose logs --tail=80 app >&2 || true
    exit 1
  fi
done

echo "==> Smoke tests"
curl -fsS "http://127.0.0.1:8080/api/auth/cognito/config" | head -c 400
echo ""
echo "Deploy complete."
