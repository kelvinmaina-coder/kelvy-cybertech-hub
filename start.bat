@echo off
echo ====================================================
echo Starting Kelvy CyberTech Hub Ecosystem
echo ====================================================
echo.

:: Start Ollama Models in a new window
echo [1/3] Starting Ollama AI Server...
start "Ollama AI Server" cmd /k "ollama serve"

:: Start the Python Backend in a new window
echo [2/4] Starting FastAPI Backend...
start "Backend API" cmd /k "cd backend && python main.py"

:: Start the WebRTC Signaling Server in a new window
echo [3/4] Starting Signaling Server...
start "Signaling Server" cmd /k "cd backend\websocket && python signaling.py"

:: Start the React/Vite Frontend in a new window
echo [4/4] Starting React Frontend...
start "Frontend UI" cmd /k "npm run dev"

echo.
echo All services have been launched in separate windows!
echo Make sure you have executed supabase_migrations.sql in your Supabase SQL editor if you haven't yet.
echo.
pause
