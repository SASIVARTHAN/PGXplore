# Deploy PGXplore (Cognito auth) to EC2 from Windows.
# Usage:
#   .\scripts\deploy-ec2.ps1 -KeyPath "C:\path\to\your-key.pem"
#
# Prerequisites: OpenSSH (scp/ssh), Node.js, EC2 security group allows SSH from your IP.

param(
  [Parameter(Mandatory = $true)]
  [string]$KeyPath,

  [string]$Ec2Host = "3.105.160.225",
  [string]$User = "ubuntu",
  [string]$RemoteDir = "/home/ubuntu/pgxplore"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RepoRoot "backend"
$FrontendDir = Join-Path $RepoRoot "frontend"
$DistDir = Join-Path $FrontendDir "dist"

if (-not (Test-Path $KeyPath)) {
  throw "SSH key not found: $KeyPath"
}

Write-Host "==> Building frontend (API same-origin via nginx)"
Push-Location $FrontendDir
$env:VITE_API_BASE_URL = "http://$Ec2Host"
npm run build
Pop-Location

if (-not (Test-Path $DistDir)) {
  throw "Frontend dist not found after build: $DistDir"
}

Write-Host "==> Syncing backend + scripts to ${User}@${Ec2Host}:${RemoteDir}"
$sshTarget = "${User}@${Ec2Host}"
$sshArgs = @("-i", $KeyPath, "-o", "StrictHostKeyChecking=accept-new")

ssh @sshArgs $sshTarget "mkdir -p $RemoteDir ~/pgxplore-upload"
scp @sshArgs -r $BackendDir "${sshTarget}:~/pgxplore-upload/"
scp @sshArgs -r (Join-Path $RepoRoot "scripts") "${sshTarget}:~/pgxplore-upload/"
scp @sshArgs -r $DistDir "${sshTarget}:~/pgxplore-upload/frontend-dist"

Write-Host "==> Running remote deploy (backend Docker + frontend static)"
$remote = @"
set -euo pipefail
rm -rf $RemoteDir/backend $RemoteDir/scripts
mkdir -p $RemoteDir
cp -a ~/pgxplore-upload/backend $RemoteDir/
cp -a ~/pgxplore-upload/scripts $RemoteDir/
sudo mkdir -p /var/www/pgxplore
sudo rm -rf /var/www/pgxplore/*
sudo cp -a ~/pgxplore-upload/frontend-dist/. /var/www/pgxplore/
chmod +x $RemoteDir/scripts/deploy-ec2.sh
APP_DIR=$RemoteDir/backend bash $RemoteDir/scripts/deploy-ec2.sh
"@
ssh @sshArgs $sshTarget $remote

Write-Host "==> Public smoke test (Cognito config)"
curl.exe -fsS "http://${Ec2Host}/api/auth/cognito/config"
Write-Host ""
Write-Host "Done. Open http://${Ec2Host} and sign in with Cognito phone OTP."
