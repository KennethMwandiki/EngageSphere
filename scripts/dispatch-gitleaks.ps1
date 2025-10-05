$repo='KennethMwandiki/EngageSphere'
Write-Host "Dispatching gitleaks workflow for $repo (ref=main)"
$dispatch = gh api repos/$repo/actions/workflows/gitleaks.yml/dispatches -f ref=main 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host 'Dispatch failed:'; Write-Host $dispatch; exit 2 }
Write-Host 'Dispatched, waiting for run to appear...'
$runId = $null
for ($i=0; $i -lt 60; $i++) {
  try { $runsJson = gh api repos/$repo/actions/runs 2>$null } catch { $runsJson = $null }
  if ($runsJson) {
    $obj = $runsJson | ConvertFrom-Json
    if ($null -ne $obj.workflow_runs) {
      foreach ($r in $obj.workflow_runs) {
        if ($r.name -eq 'Secret scanning (gitleaks)' -and $r.head_branch -eq 'main') {
          $runId = $r.id; break
        }
      }
    }
  }
  if ($runId) { break }
  Start-Sleep -Seconds 3
}
if (-not $runId) { Write-Host 'Could not find a workflow run for gitleaks after waiting.'; exit 3 }
Write-Host "Found run id: $runId. Polling status..."
while ($true) {
  $runJson = gh api repos/$repo/actions/runs/$runId 2>$null
  $run = $runJson | ConvertFrom-Json
  $status = $run.status
  $conclusion = $run.conclusion
  Write-Host "Status: $status; Conclusion: $conclusion"
  if ($status -eq 'completed') { break }
  Start-Sleep -Seconds 5
}
# download artifact if present
$artDir = Join-Path -Path (Get-Location) -ChildPath 'artifacts'
if (-not (Test-Path $artDir)) { New-Item -ItemType Directory -Path $artDir | Out-Null }
Write-Host 'Downloading artifacts (gitleaks-report if present)...'
$dl = gh run download $runId --name gitleaks-report -D $artDir 2>&1
if ($LASTEXITCODE -ne 0) { Write-Host 'Download may have failed or artifact not found:'; Write-Host $dl } else { Write-Host 'Downloaded artifacts to:'; Get-ChildItem -Path $artDir | ForEach-Object { Write-Host $_.FullName } }
# print a short summary if report exists
$report = Join-Path $artDir 'gitleaks-report.json'
if (Test-Path $report) {
  $txt = Get-Content $report -Raw
  $j = $txt | ConvertFrom-Json
  if ($j -is [array]) { $count = $j.Count } elseif ($j.results) { $count = $j.results.Count } else { $count = 0 }
  Write-Host "gitleaks findings: $count (see $report)"
} else {
  Write-Host 'No gitleaks report file found in artifacts.'
}
