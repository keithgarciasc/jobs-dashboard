# PowerShell script to migrate SQLite data to PostgreSQL
# Usage: .\migrate-sqlite-to-postgres.ps1 -DatabaseUrl "postgres://..."

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

Write-Host "🚀 SQLite to PostgreSQL Migration" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variable
$env:DATABASE_URL = $DatabaseUrl

# Check if backend dependencies are installed
if (-not (Test-Path ".\backend\node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
}

# Run migration script
Write-Host "🔄 Running migration..." -ForegroundColor Yellow
Write-Host ""

Push-Location backend
node ..\scripts\migrate-sqlite-to-postgres.js
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration successful!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit $exitCode
}
