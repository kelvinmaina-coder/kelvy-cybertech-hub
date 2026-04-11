@echo off
setlocal enabledelayedexpansion
color 0A
echo.
echo ====================================================
echo  Kelvy CyberTech Hub - Full Ecosystem Startup
echo ====================================================
echo.

:: Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "WEBSOCKET_DIR=%BACKEND_DIR%\websocket"

:: Step 1: Ensure Python dependencies are installed
echo [1/6] Installing Python dependencies...
c:/python314/python.exe -m pip install fastapi uvicorn httpx python-dotenv pydantic apscheduler psutil python-nmap ping3 pandas websockets python-multipart supabase --user --quiet >nul 2>&1
echo [✓] Dependencies ready
echo.

:: Step 2: Check if Supabase CLI is installed
echo [2/6] Checking Supabase...
where supabase >nul 2>nul
if %errorlevel% equ 0 (
    echo [✓] Starting Supabase Local Database...
    start "Supabase Local" cmd /k "cd /d "%SCRIPT_DIR%" && supabase start"
    timeout /t 12 /nobreak >nul
) else (
    echo [○] Supabase CLI not installed (optional database)
)
echo.

:: Step 3: Start Ollama
echo [3/6] Starting Ollama AI Server...
tasklist | findstr /i "ollama" >nul
if %errorlevel% equ 0 (
    echo [✓] Ollama already running
) else (
    start "Ollama AI Server" cmd /k "ollama serve"
    timeout /t 5 /nobreak >nul
    echo [✓] Ollama started (port 11434)
)
echo.

:: Step 4: Start FastAPI Backend
echo [4/6] Starting FastAPI Backend...
cd /d "%BACKEND_DIR%"
start "Backend API" cmd /k "c:/python314/python.exe main.py"
timeout /t 4 /nobreak >nul
echo [✓] Backend started (port 8000)
echo.

:: Step 5: Start WebRTC Signaling Server
echo [5/6] Starting WebRTC Signaling Server...
cd /d "%WEBSOCKET_DIR%"
start "Signaling Server" cmd /k "c:/python314/python.exe signaling.py"
timeout /t 2 /nobreak >nul
echo [✓] Signaling server started (port 8001)
echo.

:: Step 6: Start React Frontend
echo [6/6] Starting React Frontend...
cd /d "%SCRIPT_DIR%"
start "Frontend UI" cmd /k "npm run dev:frontend-only"
timeout /t 2 /nobreak >nul
echo [✓] Frontend started (port 8080)
echo.

echo ====================================================
echo  ✓ All services launched successfully!
echo ====================================================
echo.
echo Available Services:
echo   • Supabase Database (if installed)
echo   • Ollama AI Server (port 11434)
echo   • FastAPI Backend (port 8000)
echo   • WebRTC Signaling (port 8001)
echo   • React Frontend (port 8080)
echo.
echo Access the app: http://localhost:8080
echo.
pause
echo ✓ React Frontend (port 5173)
echo.
echo Make sure you have executed supabase_migrations.sql in your Supabase SQL editor if you haven't yet.
echo.
echo Press any key to close this window...
pause >nul
