from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import subprocess
import json
import httpx
import os
from datetime import datetime

router = APIRouter(prefix="/api/security", tags=["security"])

class ToolRunRequest(BaseModel):
    tool: str
    target: str
    args: List[str] = []

class ThreatResponse(BaseModel):
    id: int
    type: str
    severity: str
    source_ip: str
    timestamp: str

@router.post("/run-tool")
async def run_tool(request: ToolRunRequest):
    try:
        cmd = [request.tool]
        cmd.extend(request.args)
        if request.target:
            cmd.append(request.target)
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, shell=True)
        output = result.stdout + result.stderr
        
        analysis = await analyze_with_ollama(request.tool, output)
        
        return {"success": True, "raw_output": output, "ai_analysis": analysis, "tool": request.tool, "target": request.target, "timestamp": datetime.now().isoformat()}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Tool execution timed out (60 seconds)"}
    except Exception as e:
        return {"success": False, "error": str(e)}

async def analyze_with_ollama(tool: str, output: str):
    try:
        async with httpx.AsyncClient() as client:
            prompt = f"Analyze this {tool} output. Identify threats, assign severity (Critical/High/Medium/Low/Info), and suggest actions:\n\n{output[:2000]}"
            response = await client.post("http://localhost:11434/api/generate", json={"model": "qwen2.5:7b", "prompt": prompt, "stream": False}, timeout=30)
            if response.status_code == 200:
                return response.json().get("response", "Analysis completed")
    except: pass
    return "AI analysis unavailable"

@router.get("/threats")
async def get_threats():
    return [{"id": 1, "type": "SQL Injection Attempt", "severity": "critical", "source_ip": "45.33.22.1", "timestamp": datetime.now().isoformat()},
            {"id": 2, "type": "Port Scan Detected", "severity": "medium", "source_ip": "192.168.1.45", "timestamp": datetime.now().isoformat()},
            {"id": 3, "type": "Brute Force Attack", "severity": "high", "source_ip": "103.45.67.89", "timestamp": datetime.now().isoformat()}]

@router.get("/stats")
async def get_stats():
    return {"threats_today": 47, "critical_alerts": 3, "scans_run": 1250, "ai_confidence": 94}

@router.get("/scans")
async def get_scans(limit: int = 20):
    return {"scans": []}
