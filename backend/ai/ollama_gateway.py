"""Ollama AI Gateway — connects to local Ollama instance with intelligent model routing."""
import json
from typing import AsyncIterator, Optional
import httpx
OLLAMA_URL = "http://localhost:11434"
# Model identifiers - all 4 specialized models
MODEL_OCR = "glm-ocr:bf16"          # Text extraction from documents, receipts, IDs
MODEL_VISION = "qwen3-vl:8b"        # Visual analysis for non-text images
MODEL_CHAT = "qwen2.5:7b"           # All text chat and analysis
MODEL_EMBED = "nomic-embed-text"    # Semantic search and embeddings
class OllamaGateway:
    """Interface to local Ollama for chat, generation, vision, OCR, and embeddings."""
    def __init__(self, base_url: str = OLLAMA_URL):
        self.base_url = base_url
    async def list_models(self) -> list[dict]:
        """Fetch installed models from Ollama."""
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{self.base_url}/api/tags")
            r.raise_for_status()
            data = r.json()
            return [
                {
                    "name": m["name"],
                    "size": m.get("size", 0),
                    "modified_at": m.get("modified_at", ""),
                }
                for m in data.get("models", [])
            ]
    async def get_available_models(self) -> dict:
        """Check which specialized models are available."""
        try:
            models = await self.list_models()
            model_names = {m["name"].split(":")[0]: m["name"] for m in models}
            return {
                "ocr": model_names.get("glm-ocr", None),
                "vision": model_names.get("qwen3-vl", MODEL_VISION),
                "chat": model_names.get("qwen2.5", MODEL_CHAT),
                "embed": model_names.get("nomic-embed-text", MODEL_EMBED),
                "all_models": model_names
            }
        except Exception:
            return {
                "ocr": None,
                "vision": MODEL_VISION,
                "chat": MODEL_CHAT,
                "embed": MODEL_EMBED,
                "all_models": {}
            }
    async def chat_stream(
        self, messages: list[dict], model: str = MODEL_CHAT, system_prompt: Optional[str] = None
    ) -> AsyncIterator[str]:
        """Stream chat responses as SSE."""
        payload = {"model": model, "messages": [], "stream": True}
        if system_prompt:
            payload["messages"].append({"role": "system", "content": system_prompt})
        payload["messages"].extend(messages)
        async with httpx.AsyncClient(timeout=180) as client:
            async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as r:
                async for line in r.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            content = data.get("message", {}).get("content", "")
                            if content:
                                yield f"data: {json.dumps({'content': content})}\n\n"
                            if data.get("done"):
                                yield "data: [DONE]\n\n"
                        except json.JSONDecodeError:
                            continue
    async def ocr_extract(
        self, image_base64: str, model: Optional[str] = None
    ) -> str:
        """Extract text from image using OCR model (glm-ocr:bf16)."""
        if not model:
            model = MODEL_OCR
        prompt = "Extract all text from this image. Include text, numbers, dates, and field labels. Preserve structure and formatting."
        payload = {
            "model": model,
            "prompt": prompt,
            "images": [image_base64],
            "stream": False
        }
        async with httpx.AsyncClient(timeout=180) as client:
            r = await client.post(f"{self.base_url}/api/generate", json=payload)
            r.raise_for_status()
            return r.json().get("response", "")
    async def vision(self, prompt: str, image_base64: str, model: Optional[str] = None) -> str:
        """Analyze an image using a vision-language model (qwen3-vl:8b)."""
        if not model:
            model = MODEL_VISION
        payload = {
            "model": model,
            "prompt": prompt,
            "images": [image_base64],
            "stream": False
        }
        async with httpx.AsyncClient(timeout=180) as client:
            r = await client.post(f"{self.base_url}/api/generate", json=payload)
            r.raise_for_status()
            return r.json().get("response", "")
    async def process_document(
        self, image_base64: str, analysis_prompt: Optional[str] = None
    ) -> dict:
        """Process document: OCR text extraction → analysis.
        Flow:
        1. Use glm-ocr:bf16 to extract text from document image
        2. Use qwen2.5:7b to analyze extracted text
        """
        # Step 1: Extract text using OCR
        extracted_text = await self.ocr_extract(image_base64)
        if not analysis_prompt:
            analysis_prompt = "Summarize the key information in this document."
        # Step 2: Analyze extracted text
        analysis_payload = f"""Analyze the following extracted document text:
{extracted_text}
{analysis_prompt}"""
        analysis = await self.generate(analysis_payload, model=MODEL_CHAT)
        return {
            "extracted_text": extracted_text,
            "analysis": analysis,
            "source_model_ocr": MODEL_OCR,
            "source_model_analysis": MODEL_CHAT
        }
    async def generate(self, prompt: str, model: Optional[str] = None) -> str:
        """Non-streaming generation using qwen2.5:7b."""
        if not model:
            model = MODEL_CHAT
        async with httpx.AsyncClient(timeout=180) as client:
            r = await client.post(
                f"{self.base_url}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
            )
            r.raise_for_status()
            return r.json().get("response", "")
    async def embed(self, text: str, model: Optional[str] = None) -> list[float]:
        """Generate embeddings using nomic-embed-text."""
        if not model:
            model = MODEL_EMBED
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{self.base_url}/api/embeddings",
                json={"model": model, "prompt": text},
            )
            r.raise_for_status()
            return r.json().get("embedding", [])
    async def analyze_security(self, tool: str, output: str) -> dict:
        """Use qwen2.5:7b for detailed attack analysis and recommendations."""
        prompt = f"""[SECURITY ANALYST MODE]
Analyze this security tool output from '{tool}'. Identify threats, assign a severity score, and suggest mitigation steps.
Tool output:
{output[:5000]}
Respond ONLY in strict JSON format:
{{"analysis": "...", "severity": "Critical|High|Medium|Low", "recommendations": ["...", "..."]}}"""
        response = await self.generate(prompt, model=MODEL_CHAT)
        try:
            # Attempt to extract JSON if encapsulated in markdown
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].strip()
            return json.loads(response)
        except Exception:
            return {"analysis": response, "severity": "Info", "recommendations": []}
