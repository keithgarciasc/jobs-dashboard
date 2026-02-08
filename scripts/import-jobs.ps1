# PowerShell script to import jobs from JSON to the Jobs Dashboard
# Usage: .\import-jobs.ps1 -JsonFile "C:\path\to\Jobs_Report.json"

param(
    [Parameter(Mandatory=$true)]
    [string]$JsonFile,

    [string]$ApiUrl = "https://jobs-dashboard-backend-wgqx.onrender.com/api/admin/recommend"
)

Write-Host "🚀 Importing jobs from: $JsonFile" -ForegroundColor Cyan
Write-Host "📡 API endpoint: $ApiUrl" -ForegroundColor Cyan
Write-Host ""

# Check if file exists
if (-not (Test-Path $JsonFile)) {
    Write-Host "❌ File not found: $JsonFile" -ForegroundColor Red
    exit 1
}

# Read and parse JSON
try {
    $data = Get-Content $JsonFile -Raw | ConvertFrom-Json
} catch {
    Write-Host "❌ Error parsing JSON: $_" -ForegroundColor Red
    exit 1
}

# Prepare jobs for import
$jobsToImport = @()

foreach ($section in @('local_charleston', 'remote_other', 'side_gigs')) {
    if ($data.$section) {
        foreach ($job in $data.$section) {
            if ($job.url) {
                $jobWithSource = $job | ConvertTo-Json -Depth 10 | ConvertFrom-Json
                $jobWithSource | Add-Member -NotePropertyName 'source' -NotePropertyValue $section -Force

                $jobsToImport += @{
                    jobId = $job.url
                    jobData = $jobWithSource
                }
            }
        }
    }
}

if ($jobsToImport.Count -eq 0) {
    Write-Host "❌ No jobs found in JSON file" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Found $($jobsToImport.Count) jobs to import..." -ForegroundColor Yellow

# Send to API
try {
    $body = @{ jobs = $jobsToImport } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $body -ContentType "application/json"

    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "   Added: $($response.added)" -ForegroundColor Green
    Write-Host "   Skipped: $($response.skipped)" -ForegroundColor Yellow
    Write-Host "   Message: $($response.message)" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Make sure the backend is running!" -ForegroundColor Yellow
    exit 1
}
