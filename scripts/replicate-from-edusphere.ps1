# Re-sync C:\nwuchas from C:\edusphere without touching secrets, git history, or local databases.
# Run only when you intentionally refresh the NWUCHAS working copy from the EduSphere baseline.

param(
  [string]$Source = 'C:\edusphere',
  [string]$Target = 'C:\nwuchas'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Source)) { throw "Source not found: $Source" }
if (-not (Test-Path $Target)) { throw "Target not found: $Target" }

Write-Host "Replicating $Source -> $Target (excluding .git, node_modules, .next, .env*)"

robocopy $Source $Target /MIR /XD .git node_modules .next android .agents infrastructure /XF .env .env.local .env.production .env.development /NFL /NDL /NJH /NJS /nc /ns /np

if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

Write-Host "Done. Re-apply NWUCHAS-specific changes from version control or docs/10-delivery-queue.md before running seed or deploy."
