import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
# Import routers
from api.tools import router as tools_router
from api.ai import router as ai_router
from api.calls import router as calls_router
from security.tool_executor import router as security_router
from automation.api import router as automation_router
from ide.api import router as ide_router
from network.api import router as network_router
from analytics.api import router as analytics_router
from crm.api import router as crm_router
from itsm.api import router as itsm_router
from auth.api import router as auth_router
from business.api import router as business_router
# Import scheduler
from automation.scheduler import scheduler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting automation scheduler...")
    await scheduler.start()
    print("Automation scheduler started")
    yield
    # Shutdown
    print("Stopping automation scheduler...")
    await scheduler.stop()
    print("Automation scheduler stopped")
app = FastAPI(
    title="Kelvy CyberTech Hub API",
    description="AI-Powered Enterprise Computing Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Mount routers
app.include_router(tools_router, prefix="/api/security", tags=["Security Tools"])
app.include_router(ai_router, prefix="/api/ollama", tags=["Ollama AI"])
app.include_router(calls_router, prefix="/api", tags=["Calls & Meetings"])
app.include_router(security_router, prefix="/api/security", tags=["Linux Tools"])
app.include_router(automation_router, prefix="/api/automation", tags=["Automation"])
app.include_router(ide_router, prefix="/api/ide", tags=["IDE"])
app.include_router(network_router, prefix="/api/network", tags=["Network"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(crm_router, prefix="/api/crm", tags=["CRM"])
app.include_router(itsm_router, prefix="/api/itsm", tags=["ITSM"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(business_router, prefix="/api/business", tags=["Business"])
@app.get("/health")
async def health():
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
        "status": "running",
        "endpoints": [
            "/health",
            "/api/security/tools",
            "/api/ollama/chat",
            "/api/automation/tasks",
            "/api/ide/files",
            "/api/network/devices",
            "/api/analytics/dashboard",
            "/api/crm/clients",
            "/api/itsm/tickets",
            "/api/auth/security-status"
        ]
    }
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
