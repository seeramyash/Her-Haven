@echo off
echo ========================================
echo Women's Wellness Report - Installation
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo Install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing Python dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo Installing Node dependencies...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
pause

