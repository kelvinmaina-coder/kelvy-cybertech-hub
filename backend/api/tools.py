"""Security tool execution API."""
import asyncio
import time
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
    scan_id: Optional[str] = None
    raw_output: str
    ai_analysis: Optional[str] = None
    severity: Optional[str] = None
    execution_time_ms: int


@router.post("/run-tool", response_model=RunToolResponse)
async def run_tool(req: RunToolRequest):
    """Execute a whitelisted Linux security tool."""
    all_tools = get_all_tools()
    if req.tool not in all_tools:
        raise HTTPException(400, f"Tool '{req.tool}' is not in the whitelist. Allowed: {', '.join(sorted(all_tools))}")

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
        from ai.ollama_gateway import OllamaGateway
        gw = OllamaGateway()
        analysis = await gw.analyze_output(req.tool, result)
        ai_analysis = analysis.get("analysis", "")
        severity = analysis.get("severity", "Info")
    except Exception:
        pass

    return RunToolResponse(
        raw_output=result,
        ai_analysis=ai_analysis,
        severity=severity,
        execution_time_ms=elapsed_ms,
    )


@router.get("/tools")
async def list_tools():
    """List all available tools by category."""
    return TOOL_REGISTRY


@router.get("/tools/all")
async def list_all_tools():
    """Flat list of all tool names."""
    return sorted(get_all_tools())
