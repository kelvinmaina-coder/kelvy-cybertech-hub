@echo off
echo Stopping all Kelvy services...
echo.

taskkill /F /IM python.exe /FI "WINDOWTITLE eq Kelvy Backend*" 2>nul
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Kelvy WebSocket*" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Kelvy Frontend*" 2>nul

echo All services stopped.
pause
