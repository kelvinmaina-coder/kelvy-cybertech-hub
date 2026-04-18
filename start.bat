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

:: Step 1: Ensure Python dependencies are installed
echo [1/4] Installing Python dependencies...
python -m pip install fastapi uvicorn httpx python-dotenv pydantic apscheduler psutil python-nmap ping3 pandas websockets python-multipart --user --quiet 2>nul
echo [✓] Dependencies ready
echo.

:: Step 2: Start Ollama
echo [2/4] Starting Ollama AI Server...
tasklist | findstr /i "ollama.exe" >nul
if %errorlevel% equ 0 (
    echo [✓] Ollama already running
) else (
    start "Ollama AI Server" cmd /k "ollama serve"
    timeout /t 5 /nobreak >nul
    echo [✓] Ollama started (port 11434)
)
echo.

:: Step 3: Start FastAPI Backend
echo [3/4] Starting FastAPI Backend...
cd /d "%BACKEND_DIR%"
start "Backend API" cmd /k "python main.py"
timeout /t 4 /nobreak >nul
echo [✓] Backend started (port 8000)
echo.

:: Step 4: Start React Frontend
echo [4/4] Starting React Frontend...
cd /d "%SCRIPT_DIR%"
start "Frontend UI" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo [✓] Frontend started (port 5173)
echo.

echo ====================================================
echo  ✓ All services launched successfully!
echo ====================================================
echo.
echo Available Services:
echo   • Ollama AI Server (port 11434)
echo   • FastAPI Backend (port 8000)
echo   • React Frontend (port 5173)
echo.
echo Access the app: http://localhost:5173
echo.
echo IMPORTANT: Make sure you have executed supabase_migrations.sql 
echo in YOUR Supabase SQL editor (not local).
echo.
echo Press any key to close this window...
pause >nul