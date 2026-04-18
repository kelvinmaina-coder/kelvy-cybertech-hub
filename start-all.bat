@echo off
echo Starting Kelvy CyberTech Hub...

echo Starting Ollama...
start "Ollama" cmd /c "ollama serve"

timeout /t 5 /nobreak >nul

echo Starting Backend...
cd backend
start "Backend" cmd /c "python main.py"
cd ..

timeout /t 5 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /c "npm run dev"

echo All services started!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:8000
echo Ollama: http://localhost:11434
