"""
Kelvy CyberTech Hub — FastAPI Backend Server
Runs on port 8000. Provides:
  - Security tool execution (70+ Linux tools)
  - Ollama AI gateway
  - Call/meeting management
  - WebSocket signaling for WebRTC
"""
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.tools import router as tools_router
from api.ai import router as ai_router
from api.calls import router as calls_router

app = FastAPI(
    title="Kelvy CyberTech Hub API",
    description="AI-Powered Enterprise Computing Platform Backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://*.lovable.app",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(tools_router, prefix="/api/security", tags=["Security Tools"])
app.include_router(ai_router, prefix="/api/ollama", tags=["Ollama AI"])
app.include_router(calls_router, prefix="/api", tags=["Calls & Meetings"])


@app.get("/health")
async def health():
    """Health check endpoint."""
    import httpx
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=3) as c:
            r = await c.get("http://localhost:11434/api/tags")
            ollama_ok = r.status_code == 200
    except Exception:
        pass
    return {"status": "online", "ollama": ollama_ok, "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "name": "Kelvy CyberTech Hub API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "/health",
            "/api/security/run-tool",
            "/api/ollama/models",
            "/api/ollama/chat",
            "/api/ollama/analyze",
            "/api/calls/history",
            "/api/meetings",
        ],
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
