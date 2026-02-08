@echo off
echo Starting Jobs Dashboard...
echo.

echo Starting backend server...
start "Backend" /D "%~dp0backend" cmd /k "npm start"

echo Starting frontend server...
start "Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Close the console windows to stop the servers.
