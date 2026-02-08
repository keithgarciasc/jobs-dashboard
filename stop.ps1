# PowerShell script to stop all Node.js processes (backend and frontend)

Write-Host "Stopping Jobs Dashboard servers..." -ForegroundColor Cyan

# Find all node processes
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es)" -ForegroundColor Yellow

    # Stop all node processes
    $nodeProcesses | Stop-Process -Force

    Write-Host "✓ All servers stopped successfully" -ForegroundColor Green
} else {
    Write-Host "No Node.js processes found running" -ForegroundColor Yellow
}

Write-Host ""
