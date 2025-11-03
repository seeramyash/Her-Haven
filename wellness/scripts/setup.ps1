# Women's Wellness Report - Setup Script (PowerShell)
# For Windows 10/11 with PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Women's Wellness Report - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[✓] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed!" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[✓] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Upgrade pip
Write-Host "[1/4] Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

# Install Python dependencies
Write-Host "[2/4] Installing Python dependencies..." -ForegroundColor Yellow
python -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install Python dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[✓] Python dependencies installed!" -ForegroundColor Green
Write-Host ""

# Install Node.js dependencies
Write-Host "[3/4] Installing Node.js dependencies..." -ForegroundColor Yellow
Set-Location -Path "frontend"
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install Node.js dependencies" -ForegroundColor Red
    Set-Location -Path ".."
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location -Path ".."

Write-Host "[✓] Node.js dependencies installed!" -ForegroundColor Green
Write-Host ""

Write-Host "[4/4] Setup complete!" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor Yellow
Write-Host "  .\start_app_windows.bat" -ForegroundColor White
Write-Host ""
Write-Host "Or manually:" -ForegroundColor Yellow
Write-Host "  Terminal 1: python start_backend.py" -ForegroundColor White
Write-Host "  Terminal 2: cd frontend && npm start" -ForegroundColor White
Write-Host ""
Write-Host "Then open your browser to: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"

