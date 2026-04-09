import httpx
import json
import base64
from typing import AsyncIterator, Optional, List, Dict

OLLAMA_URL = "http://localhost:11434"

class OllamaService:
    """Complete Ollama AI Service for all AI features"""
    
    def __init__(self, base_url: str = OLLAMA_URL):
        self.base_url = base_url
    
    async def check_connection(self) -> bool:
        """Check if Ollama is running"""
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                r = await client.get(f"{self.base_url}/api/tags")
                return r.status_code == 200
        except:
            return False
    
    async def list_models(self) -> List[dict]:
        """List available Ollama models"""
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{self.base_url}/api/tags")
            r.raise_for_status()
            data = r.json()
            return data.get("models", [])
    
    async def chat(self, messages: List[dict], model: str = "qwen2.5:7b") -> str:
        """Send chat messages to Ollama"""
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(
                f"{self.base_url}/api/chat",
                json={"model": model, "messages": messages, "stream": False}
            )
            r.raise_for_status()
            return r.json().get("message", {}).get("content", "")
    
    async def analyze_security_output(self, tool: str, output: str) -> dict:
        """Analyze security tool output"""
        prompt = f"""Analyze this security tool output from '{tool}'. 
        Provide:
        1) What was found (summary)
        2) Severity (Critical/High/Medium/Low/Info)
        3) Recommended actions
        
        Tool output:
        {output[:4000]}
        
        Respond in JSON format:
        {{"analysis": "...", "severity": "...", "recommendations": ["..."]}}"""
        
        response = await self.chat([{"role": "user", "content": prompt}])
        try:
            return json.loads(response)
        except:
            return {"analysis": response, "severity": "Info", "recommendations": []}
    
    async def analyze_image(self, image_base64: str) -> str:
        """Analyze image using vision model"""
        async with httpx.AsyncClient(timeout=120) as client:
            r = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": "qwen3-vl:8b",
                    "prompt": "Describe this image in detail. What do you see?",
                    "images": [image_base64],
                    "stream": False
                }
            )
            r.raise_for_status()
            return r.json().get("response", "No description available")
    
    async def summarize_interaction(self, content: str) -> str:
        """Summarize CRM interaction"""
        prompt = f"Summarize this client interaction in one sentence:\n\n{content}"
        return await self.chat([{"role": "user", "content": prompt}])
    
    async def suggest_solution(self, ticket_description: str) -> str:
        """Suggest solution for support ticket"""
        prompt = f"""Suggest a solution for this support ticket:
        
        Ticket: {ticket_description}
        
        Provide a clear, actionable solution."""
        return await self.chat([{"role": "user", "content": prompt}])
    
    async def smart_reply(self, message: str) -> List[str]:
        """Generate smart reply suggestions"""
        prompt = f"""Generate 3 short reply suggestions for this message. 
        Return only the 3 suggestions, one per line, no numbering.
        
        Message: {message}"""
        
        response = await self.chat([{"role": "user", "content": prompt}])
        suggestions = response.strip().split('\n')[:3]
        return [s.strip() for s in suggestions if s.strip()]
