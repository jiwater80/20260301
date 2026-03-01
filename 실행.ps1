# Han-CN Budget App - PowerShell launcher (encoding-safe)
Set-Location $PSScriptRoot

Write-Host "========================================"
Write-Host "  Han-CN Budget App"
Write-Host "========================================"
Write-Host ""

if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Run this script from han-cn-budget-app folder."
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Install from https://nodejs.org (LTS)"
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "First run. Installing packages..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: npm install failed"
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host "Starting server... Open http://localhost:5173 in browser"
Write-Host "Press Ctrl+C to stop"
Write-Host ""

Start-Process "http://localhost:5173"
npm run dev

Read-Host "Press Enter to exit"
