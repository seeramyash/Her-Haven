@echo off
echo ========================================
echo Women's Wellness Report - Setup Script
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [✓] Python found!
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Node.js found!
echo.

REM Upgrade pip
echo [1/4] Upgrading pip...
python -m pip install --upgrade pip --quiet

REM Install Python dependencies
echo [2/4] Installing Python dependencies...
python -m pip install -r ..\requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    pause
    exit /b 1
)

echo [✓] Python dependencies installed!
echo.

REM Install Node.js dependencies
echo [3/4] Installing Node.js dependencies...
cd ..\frontend
call npm install --silent
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo [✓] Node.js dependencies installed!
echo.

echo [4/4] Creating start scripts...
echo.

echo ========================================
echo Setup Complete! ✓
echo ========================================
echo.
echo To start the application, run:
echo   start_app_windows.bat
echo.
echo Or manually:
echo   Terminal 1: python start_backend.py
echo   Terminal 2: cd frontend ^&^& npm start
echo.
echo Then open your browser to: http://localhost:3000
echo.
pause

