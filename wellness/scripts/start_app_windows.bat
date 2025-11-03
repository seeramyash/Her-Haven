@echo off
echo ========================================
echo Women's Wellness Report
echo Starting Application...
echo ========================================
echo.

REM Check if Python dependencies are installed
python -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python dependencies not installed!
    echo Please run setup_windows.bat first
    pause
    exit /b 1
)

REM Check if Node dependencies are installed
if not exist "..\frontend\node_modules" (
    echo [ERROR] Node.js dependencies not installed!
    echo Please run setup_windows.bat first
    pause
    exit /b 1
)

echo Starting backend server...
cd ..
start "Women's Wellness - Backend" cmd /k python scripts\start_backend.py

timeout /t 3 /nobreak >nul

echo Starting frontend server...
cd ..\frontend
start "Women's Wellness - Frontend" cmd /k npm start
cd ..

echo.
echo ========================================
echo Application Started! ✓
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo The app will open in your browser shortly...
echo.
echo To stop the application, close both terminal windows.
echo.
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul

