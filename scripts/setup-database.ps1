# Run from project root: .\scripts\setup-database.ps1
# Paste your Supabase connection string when prompted (Dashboard > Connect > ORMs > Prisma > Session mode)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Paste your Supabase DATABASE_URL (Session pooler, port 5432):" -ForegroundColor Cyan
$databaseUrl = Read-Host

if (-not $databaseUrl) {
  Write-Host "No URL provided. Exiting." -ForegroundColor Red
  exit 1
}

$envPath = Join-Path (Get-Location) ".env"
$content = Get-Content $envPath -Raw

if ($content -match 'DATABASE_URL="[^"]*"') {
  $content = $content -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$databaseUrl`""
} else {
  $content = "DATABASE_URL=`"$databaseUrl`"`n" + $content
}

if ($content -match 'DIRECT_URL="[^"]*"') {
  $content = $content -replace '(?m)^#? ?DIRECT_URL="[^"]*"\r?\n', ''
}

Set-Content -Path $envPath -Value $content.TrimEnd() -NoNewline
Write-Host "Updated .env DATABASE_URL" -ForegroundColor Green

Write-Host "`nRunning prisma generate..." -ForegroundColor Cyan
npx prisma generate

Write-Host "`nRunning migrations..." -ForegroundColor Cyan
npx prisma migrate deploy

Write-Host "`nSeeding sample properties..." -ForegroundColor Cyan
node prisma/seed-rich-properties.js

Write-Host "`nDone. Start the app with: npm run dev" -ForegroundColor Green
