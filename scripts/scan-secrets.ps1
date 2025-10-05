<#
Scans the repository for common secret-like keywords and writes a JSON report to secrets-scan.json
Usage: pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/scan-secrets.ps1
#>

Param()

$patterns = @(
  'API_KEY','APIKEY','TOKEN','ACCESS_TOKEN','SECRET','PASSWORD',
  'AWS_ACCESS_KEY','AWS_SECRET','PRIVATE_KEY','BEGIN RSA PRIVATE KEY','BEGIN PRIVATE KEY',
  'ssh-rsa','supersecretkey','adminpass','userpass','a41.chat.agora.io','FASTLANE','VERCEL',
  'APP_STORE','APP_STORE_CONNECT','GOOGLE_PLAY','SLACK_WEBHOOK'
)
$exclude = @('.git', 'node_modules', 'dist', 'build', 'docs', '.vs')
$results = @()

Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
  $path = $_.FullName
  $skip = $false
  foreach ($e in $exclude) {
    if ($path -like "*${e}*") { $skip = $true; break }
  }
  if ($skip) { return }

  try {
    $content = Get-Content -Raw -Encoding UTF8 -ErrorAction Stop -Path $path
  } catch {
    return
  }

  $lines = $content -split "`n"
  for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    foreach ($p in $patterns) {
      if ($line -match [regex]::Escape($p)) {
        $results += [pscustomobject]@{
          path = $path
          line = $i + 1
          match = $p
          excerpt = $line.Trim()
        }
        break
      }
    }
  }
}

$reportPath = Join-Path -Path (Get-Location) -ChildPath 'secrets-scan.json'
$results | ConvertTo-Json -Depth 6 | Set-Content -Path $reportPath -Encoding utf8
Write-Host "WROTE: $reportPath - found $($results.Count) matches"
if ($results.Count -gt 0) { $results | Select-Object -First 50 | Format-Table -AutoSize }
