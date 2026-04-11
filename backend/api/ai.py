"""Ollama AI gateway API with intelligent model routing."""
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ai.ollama_gateway import OllamaGateway
from ai.ollama_gateway import MODEL_OCR, MODEL_VISION, MODEL_CHAT, MODEL_EMBED
router = APIRouter()
gw = OllamaGateway()
@router.get("/models")
async def list_models():
    """Auto-detect installed Ollama models."""
    try:
        models = await gw.list_models()
        available = await gw.get_available_models()
        return {
            "models": models,
            "available": available,
            "status": "ok"
        }
    except Exception as e:
        raise HTTPException(503, f"Ollama not reachable: {str(e)}")
@router.get("/models/available")
async def available_models():
    """Get which specialized models are available."""
    try:
        available = await gw.get_available_models()
        return available
    except Exception as e:
        raise HTTPException(503, f"Ollama not reachable: {str(e)}")
class ChatRequest(BaseModel):
    messages: list[dict]
    model: Optional[str] = MODEL_CHAT
    system_prompt: Optional[str] = None
@router.post("/chat")
async def chat(req: ChatRequest):
    """Chat with qwen2.5:7b — streaming response."""
    try:
        stream = gw.chat_stream(req.messages, req.model or MODEL_CHAT, req.system_prompt)
        return StreamingResponse(stream, media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(500, str(e))
class VisionRequest(BaseModel):
    prompt: str
    image: str  # Base64
    model: Optional[str] = MODEL_VISION
@router.post("/vision")
async def vision(req: VisionRequest):
    """Analyze non-text image with qwen3-vl:8b."""
    try:
        result = await gw.vision(req.prompt, req.image, req.model or MODEL_VISION)
        return {"response": result, "model_used": req.model or MODEL_VISION}
    except Exception as e:
        raise HTTPException(500, str(e))
class OCRRequest(BaseModel):
    image: str  # Base64
    model: Optional[str] = MODEL_OCR
@router.post("/ocr")
async def ocr(req: OCRRequest):
    """Extract text from document/receipt/ID using glm-ocr:bf16."""
    try:
        result = await gw.ocr_extract(req.image, req.model or MODEL_OCR)
        return {
            "extracted_text": result,
            "model_used": req.model or MODEL_OCR,
            "type": "ocr"
        }
    except Exception as e:
        raise HTTPException(500, str(e))
class DocumentRequest(BaseModel):
    image: str  # Base64
    analysis_prompt: Optional[str] = None
    ocr_model: Optional[str] = MODEL_OCR
    analysis_model: Optional[str] = MODEL_CHAT
@router.post("/document-process")
async def process_document(req: DocumentRequest):
    """Process document: OCR extraction → analysis.
    1. Extract text from document using glm-ocr:bf16
    2. Analyze extracted text using qwen2.5:7b
    """
    try:
        result = await gw.process_document(
            req.image,
            req.analysis_prompt
        )
        return {
            **result,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(500, str(e))
class EmbedRequest(BaseModel):
    text: str
    model: Optional[str] = MODEL_EMBED
@router.post("/embed")
async def embed(req: EmbedRequest):
    """Generate embeddings with nomic-embed-text for semantic search."""
    try:
        result = await gw.embed(req.text, req.model or MODEL_EMBED)
        return {
            "embedding": result,
            "model_used": req.model or MODEL_EMBED,
            "dimension": len(result)
        }
    except Exception as e:
        raise HTTPException(500, str(e))
class SimilarIncidentsRequest(BaseModel):
    """Find similar tickets using semantic embeddings."""
    current_ticket_text: str
    candidate_tickets: list[dict]  # [{\"id\": \"...\", \"text\": \"...\"}, ...]
    top_k: Optional[int] = 5
@router.post("/similar-incidents")
async def similar_incidents(req: SimilarIncidentsRequest):
    """Find similar past incidents using nomic-embed-text embeddings."""
    try:
        # Embed current ticket
        current_embedding = await gw.embed(req.current_ticket_text, MODEL_EMBED)
        # Embed candidates
        similarities = []
        for ticket in req.candidate_tickets:
            candidate_embedding = await gw.embed(ticket["text"], MODEL_EMBED)
            # Compute cosine similarity
            similarity = sum(
                a * b for a, b in zip(current_embedding, candidate_embedding)
            ) / (
                (sum(a**2 for a in current_embedding) ** 0.5) *
                (sum(b**2 for b in candidate_embedding) ** 0.5) + 1e-10
            )
            similarities.append({
                "ticket_id": ticket.get("id"),
                "similarity": similarity,
                "text_preview": ticket["text"][:100] + "..."
            })
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        return {
            "similar_incidents": similarities[:req.top_k],
            "model_used": MODEL_EMBED
        }
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
        return {
            **result,
            "model_used": MODEL_CHAT
        }
    except Exception as e:
        raise HTTPException(500, str(e))
