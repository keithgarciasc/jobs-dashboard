# PowerShell script to start both backend and frontend servers

Write-Host "Starting Jobs Dashboard..." -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Start backend server in background
Write-Host "Starting backend server on port 3001..." -ForegroundColor Green
$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory ".\backend" -PassThru -NoNewWindow

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend server in background
Write-Host "Starting frontend server on port 3000..." -ForegroundColor Green
$frontend = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory ".\frontend" -PassThru -NoNewWindow

Write-Host ""
Write-Host "✓ Backend running on http://localhost:3001" -ForegroundColor Green
Write-Host "✓ Frontend running on http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

# Wait for Ctrl+C and cleanup
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`nStopping servers..." -ForegroundColor Yellow
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Servers stopped." -ForegroundColor Green
}
