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

        async with httpx.AsyncClient(timeout=120) as client:
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

    async def generate(self, prompt: str, model: str = "qwen2.5:7b") -> str:
        """Non-streaming generation."""
        async with httpx.AsyncClient(timeout=120) as client:
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

    async def analyze_output(self, tool: str, output: str) -> dict:
        """Analyze security tool output and return structured analysis."""
        prompt = f"""Analyze this security tool output from '{tool}'. Explain:
1) What was found
2) Severity (Critical/High/Medium/Low/Info)
3) Recommended actions

Tool output:
{output[:4000]}

Respond in JSON format:
{{"analysis": "...", "severity": "...", "recommendations": ["..."]}}"""

        response = await self.generate(prompt)
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"analysis": response, "severity": "Info", "recommendations": []}
