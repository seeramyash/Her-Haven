@echo off
REM Start both backend and frontend servers on Windows

echo Starting Women's Wellness Tracker...
echo.

REM Start backend in a new window
start "Flask Backend" cmd /k "python start_backend.py"

REM Wait a bit
timeout /t 3 /nobreak > nul

REM Start frontend
cd frontend
start "React Frontend" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul

