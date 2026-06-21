# PGXplore — Enable real Google OAuth sign-in
# Run from repo root: .\scripts\setup-google-auth.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backendProps = Join-Path $root "backend\google-oauth.local.properties"
$frontendEnv = Join-Path $root "frontend\.env"

Write-Host ""
Write-Host "=== PGXplore Google OAuth Setup ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Create a Web OAuth Client ID at:"
Write-Host "  https://console.cloud.google.com/apis/credentials"
Write-Host ""
Write-Host "Authorized JavaScript origin: http://localhost:5173"
Write-Host ""

$clientId = Read-Host "Enter GOOGLE_CLIENT_ID"
$clientSecret = Read-Host "Enter GOOGLE_CLIENT_SECRET"

if ([string]::IsNullOrWhiteSpace($clientId)) {
    Write-Host "Client ID is required." -ForegroundColor Red
    exit 1
}

@"
GOOGLE_CLIENT_ID=$clientId
GOOGLE_CLIENT_SECRET=$clientSecret
"@ | Set-Content -Path $backendProps -Encoding UTF8

Write-Host "Wrote $backendProps" -ForegroundColor Green

$frontendContent = @"
# Leave empty in dev (Vite proxies /api). Set full URL for production builds.
VITE_API_BASE_URL=

# Google OAuth Web Client ID (same value as GOOGLE_CLIENT_ID in backend)
VITE_GOOGLE_CLIENT_ID=$clientId
"@

Set-Content -Path $frontendEnv -Value $frontendContent -Encoding UTF8
Write-Host "Wrote $frontendEnv" -ForegroundColor Green

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd backend && mvn spring-boot:run"
Write-Host "  2. cd frontend && npm run dev"
Write-Host "  3. Open http://localhost:5173/login and use Sign in with Google"
Write-Host ""
