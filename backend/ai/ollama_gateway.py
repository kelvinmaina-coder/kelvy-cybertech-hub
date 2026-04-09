"""Ollama AI Gateway — connects to local Ollama instance."""
import json
from typing import AsyncIterator, Optional
import httpx

OLLAMA_URL = "http://localhost:11434"


class OllamaGateway:
    """Interface to local Ollama for chat, generation, and embeddings."""

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

    async def chat_stream(
        self, messages: list[dict], model: str = "qwen2.5:7b", system_prompt: Optional[str] = None
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

    async def vision(self, prompt: str, image_base64: str, model: str = "qwen3-vl:8b") -> str:
        """Analyze an image using a vision-language model."""
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

    async def generate(self, prompt: str, model: str = "qwen2.5:7b") -> str:
        """Non-streaming generation."""
        async with httpx.AsyncClient(timeout=180) as client:
            r = await client.post(
                f"{self.base_url}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
            )
            r.raise_for_status()
            return r.json().get("response", "")

    async def embed(self, text: str, model: str = "nomic-embed-text") -> list[float]:
        """Generate embeddings."""
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

        response = await self.generate(prompt, model="qwen2.5:7b")
        try:
            # Attempt to extract JSON if encapsulated in markdown
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].strip()
            return json.loads(response)
        except Exception:
            return {"analysis": response, "severity": "Info", "recommendations": []}
