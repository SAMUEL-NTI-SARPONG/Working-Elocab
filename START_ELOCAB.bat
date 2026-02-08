@echo off
echo ========================================
echo     ELOCAB - Starting Application
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "ELOCAB Backend" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "ELOCAB Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo     ELOCAB Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Two command windows will open.
echo Press Ctrl+C in each window to stop.
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul

start http://localhost:5173

echo.
echo ✅ ELOCAB is now running!
echo.
pause
