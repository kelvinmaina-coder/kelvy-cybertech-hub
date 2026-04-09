@echo off
title Kelvy CyberTech Hub - All Services

echo ========================================
echo    Kelvy CyberTech Hub - Starting...
echo ========================================
echo.

REM Check if Ollama is running
echo [1/4] Checking Ollama...
curl -s http://localhost:11434/api/tags > nul
if %errorlevel% neq 0 (
    echo Starting Ollama...
    start "Ollama" cmd /c "ollama serve"
    timeout /t 3 /nobreak > nul
) else (
    echo Ollama is already running.
)
echo.

REM Start Backend Server
echo [2/4] Starting Backend Server...
start "Kelvy Backend" cmd /c "cd /d C:\Users\USER\Desktop\kelvy-cybertech-hub\kelvy-ai-hub-0308d451 && python backend/main.py"
timeout /t 2 /nobreak > nul
echo.

REM Start WebSocket Server
echo [3/4] Starting WebSocket Server...
start "Kelvy WebSocket" cmd /c "cd /d C:\Users\USER\Desktop\kelvy-cybertech-hub\kelvy-ai-hub-0308d451 && python backend/websocket/signaling.py"
timeout /t 2 /nobreak > nul
echo.

REM Start Frontend
echo [4/4] Starting Frontend...
start "Kelvy Frontend" cmd /c "cd /d C:\Users\USER\Desktop\kelvy-cybertech-hub\kelvy-ai-hub-0308d451 && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo    All services started!
echo ========================================
echo.
echo Access the application at:
echo    http://localhost:8080
echo.
echo Press any key to open browser...
pause > nul

start http://localhost:8080
