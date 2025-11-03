@echo off
echo ========================================
echo Women's Wellness Report
echo ========================================
echo.

echo Starting backend server...
start "Wellness Backend" cmd /k python scripts\start_backend.py

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend server...
cd frontend
start "Wellness Frontend" cmd /k npm start
cd ..

echo.
echo ========================================
echo App Started!
echo ========================================
echo.
echo Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Keep both terminal windows open!
echo Press any key to close this window...
pause >nul

