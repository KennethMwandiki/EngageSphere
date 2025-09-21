<#
Sets a set of recommended GitHub Actions secrets for the repository using `gh`.

Usage:
  .\gh-set-secrets.ps1 -RepoOwner "KennethMwandiki" -RepoName "EngageSphere" -SecretsFile ".\\scripts\\secrets.json"

Requires: GitHub CLI (`gh`) installed and authenticated (`gh auth login`).
#>

param(
  [Parameter(Mandatory=$true)] [string] $RepoOwner,
  [Parameter(Mandatory=$true)] [string] $RepoName,
  [Parameter(Mandatory=$false)] [string] $SecretsFile = ".\secrets.json"
)

function Set-Secret($name, $value) {
  if (-not $value) {
    Write-Host "Skipping $name — no value provided"
    return
  }
  gh secret set $name --repo "$RepoOwner/$RepoName" --body "$value" | Out-Null
  if ($?) { Write-Host "Set secret: $name" } else { Write-Host "Failed to set: $name" }
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "gh CLI not found. Install from https://cli.github.com/ and run 'gh auth login' first."
  exit 1
}

$secrets = @{
  VERCEL_TOKEN = $env:VERCEL_TOKEN
  VERCEL_ORG_ID = $env:VERCEL_ORG_ID
  VERCEL_PROJECT_ID = $env:VERCEL_PROJECT_ID
  GOOGLE_PLAY_SERVICE_ACCOUNT = $env:GOOGLE_PLAY_SERVICE_ACCOUNT
  ANDROID_PACKAGE_NAME = $env:ANDROID_PACKAGE_NAME
  ANDROID_KEYSTORE_BASE64 = $env:ANDROID_KEYSTORE_BASE64
  ANDROID_KEYSTORE_PASSWORD = $env:ANDROID_KEYSTORE_PASSWORD
  ANDROID_KEY_ALIAS = $env:ANDROID_KEY_ALIAS
  ANDROID_KEY_PASSWORD = $env:ANDROID_KEY_PASSWORD
  APPLE_API_KEY = $env:APPLE_API_KEY
  APPLE_API_ISSUER_ID = $env:APPLE_API_ISSUER_ID
  SLACK_WEBHOOK = $env:SLACK_WEBHOOK
}

foreach ($k in $secrets.Keys) {
  Set-Secret -name $k -value $secrets[$k]
}

if (Test-Path $SecretsFile) {
  try {
    $json = Get-Content $SecretsFile -Raw | ConvertFrom-Json
    foreach ($p in $json.PSObject.Properties) { Set-Secret -name $p.Name -value $p.Value }
  } catch {
    Write-Host "No secrets.json found or invalid JSON. Skipping file-based secrets."
  }
}

Write-Host "Done. Verify secrets in repository Settings → Secrets and variables → Actions."
