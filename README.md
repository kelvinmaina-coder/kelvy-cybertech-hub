# Kelvy CyberTech Hub

A comprehensive enterprise security platform built with React, FastAPI, Ollama AI, and real-time WebRTC communication.

## 🚀 Quick Start (Everything Automatic!)

### One Command = Full Stack
Simply run this **ONE** command and everything starts automatically:

```bash
npm run dev
```

✅ **What starts automatically:**
1. Supabase Local Database (if CLI installed)
2. Ollama AI Server with 4 models
3. FastAPI Backend (port 8000)  
4. WebRTC Signaling Server (port 8001)
5. React Frontend (port 8080)

Done! Open http://localhost:8080 in your browser.

---

## 📋 Prerequisites

### Required
- **Node.js** (v16+) - Download from [nodejs.org](https://nodejs.org)
- **Python** (3.8+) - Download from [python.org](https://www.python.org)
- **Ollama** - Download from [ollama.ai](https://ollama.ai)
- **Git** - Download from [git-scm.com](https://git-scm.com)

### Optional
- **Supabase CLI** - For local database (recommended)
  ```bash
  npm install -g supabase
  ```

### Required Ollama Models
The app automatically uses all 4 models. Pull them before first run:

```bash
ollama pull glm-ocr:bf16        # OCR text extraction (2.2GB)
ollama pull qwen3-vl:8b         # Vision analysis (6.1GB)
ollama pull qwen2.5:7b          # Chat & security (4.7GB)
ollama pull nomic-embed-text    # Semantic search (274MB)
```

---

## 🎯 Usage

### Normal Development (Everything Automatic)
```bash
npm run dev
```
Starts all services + frontend in one go.

### Frontend Only
```bash
npm run dev:frontend-only
```
Start only the React frontend (for when backend is already running).

### Backend Services Only
```bash
npm run start:services
```
Opens a window that starts just the backend services.

### All Services in Separate Windows
```bash
./start.bat
```
Opens separate terminal windows for each service (useful for debugging).

---

## 🏗️ Project Structure

```
kelvy-ai-hub-0308d451/
├── src/                      # React frontend
│   ├── components/          # UI components
│   ├── pages/              # Page components
│   └── hooks/              # Custom React hooks
├── backend/                # FastAPI backend
│   ├── ai/                # Ollama AI integration
│   ├── api/               # API endpoints
│   ├── security/          # Security tools
│   ├── automation/        # Automation scheduler
│   └── websocket/         # WebRTC signaling
├── supabase/              # Database config
├── start.bat              # Full ecosystem startup
├── start-services.bat     # Backend services only
└── package.json           # Node.js scripts
```

---

## 🔌 API Endpoints

### AI/Ollama Endpoints
- `GET /api/ollama/models/available` - List available AI models
- `POST /api/ollama/ocr` - Extract text from images (glm-ocr)
- `POST /api/ollama/vision` - Analyze images (qwen3-vl)
- `POST /api/ollama/embed` - Generate embeddings (nomic)
- `POST /api/ollama/chat` - Chat with AI (qwen2.5)

### Backend API Docs
Visit http://localhost:8000/docs while backend is running

---

## 🧠 AI Model Features

| Model | Size | Purpose | Speed |
|-------|------|---------|-------|
| **glm-ocr:bf16** | 2.2GB | Extract text from scans, receipts, IDs | Fast |
| **qwen3-vl:8b** | 6.1GB | Analyze photos, screenshots, diagrams | Medium |
| **qwen2.5:7b** | 4.7GB | Answer questions, security analysis | Medium |
| **nomic-embed-text** | 274MB | Find similar documents/tickets | Very Fast |

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000
# Kill the process and restart
```

### Ollama models not found
```bash
# List installed models
ollama list

# Pull missing models
ollama pull glm-ocr:bf16
ollama pull qwen3-vl:8b
ollama pull qwen2.5:7b
ollama pull nomic-embed-text
```

### Permission denied errors
Run npm/Python commands with admin privileges or reinstall Node.js/Python.

### Supabase issues
Supabase is optional. The app works without it (local-only mode).

---

## 📚 Development

### Frontend Development
- Components in `src/components/`
- Pages in `src/pages/`
- Hooks in `src/hooks/`
- Tailwind CSS for styling
- Shadcn/UI for components

### Backend Development
- FastAPI endpoints in `backend/api/`
- Ollama integration in `backend/ai/`
- WebSocket in `backend/websocket/`
- Add new routers to `backend/main.py`

### Adding APIs
1. Create route file in `backend/api/`
2. Import router in `backend/main.py`
3. Add to app: `app.include_router(router)`

---

## 🚢 Production Build

```bash
npm run build
```

Build output in `dist/` folder. Deploy with any static hosting (Vercel, Netlify, etc.)

---

## 📝 License

MIT License - See LICENSE file

---

## 🤝 Support

Need help? Check the issues or contact the development team.
