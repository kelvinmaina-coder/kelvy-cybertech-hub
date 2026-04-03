#!/usr/bin/env python3
"""
Kelvy CyberTech Hub — Security Tools Backend
Run: pip install fastapi uvicorn httpx && python kelvy_backend.py
Requires: Ollama running at localhost:11434
"""

import asyncio
import subprocess
import json
import time
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="Kelvy CyberTech Hub API", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OLLAMA_URL = "http://localhost:11434"
TOOL_TIMEOUT = 60

ALLOWED_TOOLS = {
    # Recon
    "nmap", "whois", "dig", "nslookup", "theHarvester", "amass", "subfinder", "dnsx", "shodan-cli",
    # Network
    "tcpdump", "netdiscover", "arp-scan", "masscan", "hping3", "ettercap", "bettercap", "ping", "traceroute",
    # Vuln
    "nikto", "sqlmap", "wpscan", "nuclei", "gobuster", "ffuf", "dirb", "openvas",
    # Password
    "hydra", "john", "hashcat", "crunch", "medusa", "patator", "cewl",
    # Exploit
    "msfconsole", "msfvenom", "searchsploit",
    # Forensics
    "binwalk", "foremost", "strings", "exiftool", "hexdump", "volatility",
    # Web App
    "wfuzz", "arjun", "dalfox", "commix",
    # Wireless
    "aircrack-ng", "airmon-ng", "airodump-ng", "reaver", "wifite",
    # Crypto
    "openssl", "gpg", "steghide", "stegcracker", "base64", "xxd",
    # Sys Admin
    "htop", "ss", "netstat", "iptables", "fail2ban-client", "lynis", "rkhunter", "chkrootkit",
    "curl", "wget", "nbtscan", "smbclient", "enum4linux", "dnsrecon",
}

class ToolRequest(BaseModel):
    tool: str
    args: list[str] = []
    target: Optional[str] = None

class ToolResponse(BaseModel):
    raw_output: str
    ai_analysis: str
    severity: str
    duration_ms: int

@app.get("/health")
async def health():
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=3) as c:
            r = await c.get(f"{OLLAMA_URL}/api/tags")
            ollama_ok = r.status_code == 200
    except:
        pass
    return {"status": "online", "ollama": ollama_ok, "version": "1.0", "tools": len(ALLOWED_TOOLS)}

@app.get("/api/tools")
async def list_tools():
    return {"tools": sorted(ALLOWED_TOOLS)}

@app.post("/api/security/run-tool", response_model=ToolResponse)
async def run_tool(req: ToolRequest):
    if req.tool not in ALLOWED_TOOLS:
        raise HTTPException(400, f"Tool '{req.tool}' not in whitelist")

    cmd = [req.tool] + req.args
    if req.target:
        cmd.append(req.target)

    start = time.time()
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=TOOL_TIMEOUT)
        raw = stdout.decode(errors="replace") + stderr.decode(errors="replace")
    except asyncio.TimeoutError:
        raw = f"[TIMEOUT] Tool '{req.tool}' exceeded {TOOL_TIMEOUT}s limit"
    except FileNotFoundError:
        raw = f"[ERROR] Tool '{req.tool}' not found. Install it first:\n  sudo apt install {req.tool}"
    except Exception as e:
        raw = f"[ERROR] {str(e)}"

    duration = int((time.time() - start) * 1000)

    # AI analysis
    ai_analysis = "AI analysis unavailable"
    severity = "info"
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(f"{OLLAMA_URL}/api/generate", json={
                "model": "qwen2.5:7b",
                "prompt": f"I ran '{req.tool}' and got:\n{raw[:3000]}\n\nExplain:\n1. What was found\n2. Risk level (Critical/High/Medium/Low/Info)\n3. Actions to take\nBe concise.",
                "stream": False,
            })
            if r.status_code == 200:
                ai_analysis = r.json().get("response", "No analysis")
                lower = ai_analysis.lower()
                if "critical" in lower: severity = "critical"
                elif "high" in lower: severity = "high"
                elif "medium" in lower: severity = "medium"
                elif "low" in lower: severity = "low"
    except:
        pass

    return ToolResponse(raw_output=raw, ai_analysis=ai_analysis, severity=severity, duration_ms=duration)

if __name__ == "__main__":
    import uvicorn
    print("🔥 Kelvy CyberTech Hub Backend starting on http://0.0.0.0:8000")
    print("📡 Ollama: http://localhost:11434")
    print(f"🛡️  {len(ALLOWED_TOOLS)} security tools whitelisted")
    print("📖 Docs: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
