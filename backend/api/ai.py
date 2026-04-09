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
    """Chat with qwen2.5:7b — streaming response."""
    try:
        stream = gw.chat_stream(req.messages, req.model or "qwen2.5:7b", req.system_prompt)
        return StreamingResponse(stream, media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(500, str(e))


class VisionRequest(BaseModel):
    prompt: str
    image: str  # Base64
    model: Optional[str] = "qwen3-vl:8b"


@router.post("/vision")
async def vision(req: VisionRequest):
    """Analyze image with qwen3-vl:8b."""
    try:
        result = await gw.vision(req.prompt, req.image, req.model or "qwen3-vl:8b")
        return {"response": result}
    except Exception as e:
        raise HTTPException(500, str(e))


class EmbedRequest(BaseModel):
    text: str
    model: Optional[str] = "nomic-embed-text"


@router.post("/embed")
async def embed(req: EmbedRequest):
    """Generate embeddings with nomic-embed-text."""
    try:
        result = await gw.embed(req.text, req.model or "nomic-embed-text")
        return {"embedding": result}
    except Exception as e:
        raise HTTPException(500, str(e))


class AnalyzeSecurityRequest(BaseModel):
    tool: str
    output: str


@router.post("/analyze-security")
async def analyze_security(req: AnalyzeSecurityRequest):
    """Deep security analysis using qwen2.5:7b."""
    try:
        result = await gw.analyze_security(req.tool, req.output)
        return result
    except Exception as e:
        raise HTTPException(500, str(e))
