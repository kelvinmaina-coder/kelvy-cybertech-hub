"""Ollama AI gateway API."""
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ai.ollama_gateway import OllamaGateway

router = APIRouter()
gw = OllamaGateway()


@router.get("/models")
async def list_models():
    """Auto-detect installed Ollama models."""
    try:
        models = await gw.list_models()
        return {"models": models}
    except Exception as e:
        raise HTTPException(503, f"Ollama not reachable: {str(e)}")


class ChatRequest(BaseModel):
    messages: list[dict]
    model: Optional[str] = "qwen2.5:7b"
    system_prompt: Optional[str] = None


@router.post("/chat")
async def chat(req: ChatRequest):
    """Chat with Ollama — streaming response."""
    try:
        stream = gw.chat_stream(req.messages, req.model or "qwen2.5:7b", req.system_prompt)
        return StreamingResponse(stream, media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(500, str(e))


class AnalyzeRequest(BaseModel):
    tool: str
    output: str


@router.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """Analyze security tool output with AI."""
    try:
        result = await gw.analyze_output(req.tool, req.output)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))
