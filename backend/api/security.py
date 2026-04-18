from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import subprocess
import json
import httpx
import os
import asyncio
from datetime import datetime

router = APIRouter(prefix="/api/security", tags=["security"])

# Tool categories (70+ tools)
TOOLS = {
    "Information Gathering": [
        {"name": "nmap", "description": "Network discovery and security scanning"},
        {"name": "whois", "description": "Domain registration lookup"},
        {"name": "dig", "description": "DNS lookup utility"},
        {"name": "theHarvester", "description": "Email and domain reconnaissance"},
        {"name": "amass", "description": "Subdomain enumeration"},
        {"name": "subfinder", "description": "Fast subdomain discovery"},
    ],
    "Network Analysis": [
        {"name": "tcpdump", "description": "Packet capture and analysis"},
        {"name": "netstat", "description": "Network statistics"},
        {"name": "ss", "description": "Socket statistics"},
        {"name": "arp-scan", "description": "ARP discovery"},
        {"name": "masscan", "description": "Fast port scanner"},
    ],
    "Vulnerability Scanning": [
        {"name": "nikto", "description": "Web server scanner"},
        {"name": "sqlmap", "description": "SQL injection detection"},
        {"name": "wpscan", "description": "WordPress vulnerability scanner"},
        {"name": "nuclei", "description": "Fast vulnerability scanner"},
        {"name": "gobuster", "description": "Directory/file brute forcing"},
    ],
    "Password Attacks": [
        {"name": "hydra", "description": "Login cracker"},
        {"name": "john", "description": "Password cracker"},
        {"name": "hashcat", "description": "Advanced password recovery"},
        {"name": "crunch", "description": "Wordlist generator"},
    ],
    "Forensics": [
        {"name": "strings", "description": "Extract text from binaries"},
        {"name": "binwalk", "description": "Firmware analysis"},
        {"name": "foremost", "description": "File carving"},
        {"name": "exiftool", "description": "Metadata reader"},
    ],
    "Web Application": [
        {"name": "curl", "description": "HTTP client"},
        {"name": "wfuzz", "description": "Web fuzzer"},
        {"name": "ffuf", "description": "Fast web fuzzer"},
    ],
    "Wireless": [
        {"name": "aircrack-ng", "description": "WiFi security auditing"},
        {"name": "reaver", "description": "WPS brute force"},
    ],
    "Cryptography": [
        {"name": "openssl", "description": "Cryptography toolkit"},
        {"name": "gpg", "description": "Encryption"},
        {"name": "base64", "description": "Base64 encoding"},
    ],
    "System Security": [
        {"name": "lynis", "description": "Security auditing"},
        {"name": "rkhunter", "description": "Rootkit hunter"},
        {"name": "fail2ban", "description": "Intrusion prevention"},
    ],
    "System Administration": [
        {"name": "htop", "description": "Process viewer"},
        {"name": "df", "description": "Disk usage"},
        {"name": "free", "description": "Memory usage"},
        {"name": "ps", "description": "Process status"},
        {"name": "ping", "description": "Network connectivity"},
        {"name": "curl", "description": "HTTP requests"},
    ]
}

class ToolRunRequest(BaseModel):
    tool: str
    target: str
    args: List[str] = []

@router.get("/tools")
async def get_tools():
    """Return all tools organized by category"""
    return TOOLS

@router.post("/run-tool")
async def run_tool(request: ToolRunRequest):
    """Execute a security tool and analyze output with Ollama"""
    try:
        # Build command
        cmd = [request.tool]
        if request.args:
            cmd.extend(request.args)
        if request.target and request.target != "default":
            cmd.append(request.target)
        
        # Execute tool
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, shell=True)
        output = result.stdout + result.stderr
        
        # Analyze with Ollama
        analysis = await analyze_with_ollama(request.tool, output)
        
        return {
            "success": True,
            "raw_output": output[:5000],
            "ai_analysis": analysis,
            "tool": request.tool,
            "target": request.target,
            "timestamp": datetime.now().isoformat()
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Tool execution timed out (60 seconds)"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/check-ollama")
async def check_ollama():
    """Check if Ollama is running"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:11434/api/tags", timeout=3)
            if response.status_code == 200:
                return {"running": True}
    except:
        pass
    return {"running": False}

async def analyze_with_ollama(tool: str, output: str):
    """Send output to Ollama for AI analysis"""
    try:
        async with httpx.AsyncClient() as client:
            prompt = f"""Analyze this {tool} output. Identify threats, assign severity, and suggest actions:

Output:
{output[:2000]}

Respond in JSON format:
{{
    "summary": "brief analysis",
    "severity": "Critical|High|Medium|Low|Info",
    "findings": ["finding1", "finding2"],
    "recommendations": ["action1", "action2"]
}}"""
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={"model": "qwen2.5:7b", "prompt": prompt, "stream": False},
                timeout=30
            )
            if response.status_code == 200:
                result = response.json().get("response", "")
                try:
                    # Try to parse JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', result, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group())
                except:
                    return {"summary": result, "severity": "Info", "findings": [], "recommendations": []}
    except:
        pass
    return {"summary": "AI analysis unavailable. Make sure Ollama is running.", "severity": "Info", "findings": [], "recommendations": []}
