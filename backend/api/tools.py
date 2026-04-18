"""Security tool execution API."""
import asyncio
import time
import httpx
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from security.tool_runner import LinuxToolRunner
from security.tool_registry import TOOL_REGISTRY, get_all_tools

router = APIRouter()
runner = LinuxToolRunner()

class RunToolRequest(BaseModel):
    tool: str
    args: list[str] = []
    target: Optional[str] = None

class RunToolResponse(BaseModel):
    raw_output: str
    ai_analysis: Optional[str] = None
    severity: Optional[str] = None
    execution_time_ms: int

@router.post("/run-tool", response_model=RunToolResponse)
async def run_tool(req: RunToolRequest):
    """Execute a whitelisted Linux security tool."""
    all_tools = get_all_tools()
    if req.tool not in all_tools:
        raise HTTPException(400, f"Tool '{req.tool}' is not in the whitelist")
    
    start = time.time()
    try:
        result = await runner.run_tool(req.tool, req.args, req.target)
    except asyncio.TimeoutError:
        raise HTTPException(408, f"Tool '{req.tool}' timed out after 60 seconds")
    except Exception as e:
        raise HTTPException(500, f"Execution error: {str(e)}")
    
    elapsed_ms = int((time.time() - start) * 1000)
    
    # Try AI analysis
    ai_analysis = None
    severity = None
    try:
        ai_analysis, severity = await analyze_with_ollama(req.tool, result)
    except Exception:
        pass
    
    return RunToolResponse(
        raw_output=result,
        ai_analysis=ai_analysis,
        severity=severity,
        execution_time_ms=elapsed_ms,
    )

async def analyze_with_ollama(tool: str, output: str) -> tuple[Optional[str], Optional[str]]:
    """Send tool output to Ollama for AI analysis."""
    prompt = f"""Analyze this security tool output from '{tool}'. Provide:
1. SUMMARY: What was found (2-3 sentences)
2. SEVERITY: Critical/High/Medium/Low/Info
3. FINDINGS: List key findings (bullet points)
4. RECOMMENDATIONS: Actionable next steps

Tool Output:
{output[:3000]}

Respond in JSON format:
{{"summary": "...", "severity": "...", "findings": ["..."], "recommendations": ["..."]}}"""
    
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5:7b",
                    "prompt": prompt,
                    "stream": False
                },
                timeout=60
            )
            if response.status_code != 200:
                return None, "Info"
            
            result = response.json()
            response_text = result.get("response", "")
            
            # Try to parse JSON
            import json
            try:
                parsed = json.loads(response_text)
                analysis = f"📊 **{parsed.get('summary', 'Analysis complete')}**\n\n**Severity:** {parsed.get('severity', 'Info')}\n\n**Findings:**\n" + "\n".join(f"• {f}" for f in parsed.get('findings', []))
                return analysis, parsed.get('severity', 'Info')
            except:
                return response_text[:500], "Info"
    except Exception:
        return None, "Info"

@router.get("/tools")
async def list_tools():
    """List all available tools by category."""
    result = {}
    for category_key, category_data in TOOL_REGISTRY.items():
        label = category_data["label"]
        tools = category_data["tools"]
        result[label] = [
            {"name": tool, "description": f"{tool} security tool"}
            for tool in tools
        ]
    return result

@router.get("/tools/all")
async def list_all_tools():
    """Flat list of all tool names."""
    return sorted(list(get_all_tools()))

@router.get("/check-ollama")
async def check_ollama():
    """Check if Ollama is running and list models."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get("http://localhost:11434/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get("models", [])
                return {
                    "running": True,
                    "models": [m.get("name", "unknown") for m in models]
                }
    except Exception:
        pass
    return {"running": False, "models": []}
