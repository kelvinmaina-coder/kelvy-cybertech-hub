@echo off
setlocal enabledelayedexpansion
color 0A
echo.
echo ========================================
echo  Kelvy CyberTech Hub - Full Stack Startup
echo ========================================
echo.

:: Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "WEBSOCKET_DIR=%BACKEND_DIR%\websocket"

:: Step 1: Check and install Python dependencies
echo [1/5] Checking Python dependencies...
c:/python314/python.exe -m pip install fastapi uvicorn httpx python-dotenv pydantic apscheduler psutil python-nmap ping3 pandas websockets python-multipart supabase --user --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo [✓] Python dependencies ready
) else (
    echo [!] Some dependencies may be missing, continuing anyway...
)
echo.

:: Step 2: Check if Supabase CLI is installed and start database
echo [2/5] Checking Supabase...
where supabase >nul 2>nul
if %errorlevel% equ 0 (
    echo Starting Supabase Local Database...
    start "Supabase Local" cmd /k "cd /d "%SCRIPT_DIR%" && supabase start"
    timeout /t 12 /nobreak >nul
    echo [✓] Supabase started
) else (
    echo [○] Supabase CLI not installed (optional)
)
echo.

:: Step 3: Start Ollama
echo [3/5] Starting Ollama AI Server...
tasklist | findstr /i "ollama" >nul
if %errorlevel% equ 0 (
    echo [✓] Ollama already running
) else (
    start "Ollama AI Server" cmd /k "ollama serve"
    timeout /t 5 /nobreak >nul
    echo [✓] Ollama started
)
echo.

:: Step 4: Start FastAPI Backend
echo [4/5] Starting FastAPI Backend...
cd /d "%BACKEND_DIR%"
start "Backend API" cmd /k "c:/python314/python.exe main.py"
timeout /t 4 /nobreak >nul
echo [✓] Backend started (port 8000)
echo.

:: Step 5: Start WebRTC Signaling Server
echo [5/5] Starting WebRTC Signaling Server...
cd /d "%WEBSOCKET_DIR%"
start "Signaling Server" cmd /k "c:/python314/python.exe signaling.py"
timeout /t 2 /nobreak >nul
echo [✓] Signaling server started (port 8001)
echo.

echo ========================================
echo  All services started! Frontend loading...
echo ========================================
echo.

chmod +x "%SCRIPT_DIR%\start-services.bat" 2>nul

endlocal