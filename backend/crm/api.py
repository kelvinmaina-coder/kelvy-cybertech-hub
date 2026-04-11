import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase_client import supabase
import httpx
router = APIRouter()
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ykecpdzmuebogwxwpafl.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZWNwZHptdWVib2d3eHdwYWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzQxNzMsImV4cCI6MjA5MDcxMDE3M30.0byw_PNsNMwUUBwrOKp5E-msoPh9dZl0iREGGydnzAI")
OLLAMA_URL = "http://localhost:11434"
# Pydantic models
class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    priority: str = "medium"
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
class InteractionCreate(BaseModel):
    client_id: int
    interaction_type: str
    subject: str
    content: str
    duration_minutes: Optional[int] = None
class TaskCreate(BaseModel):
    client_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "medium"
class DealCreate(BaseModel):
    client_id: int
    name: str
    value: float
    stage: str = "lead"
    probability: int = 0
    expected_close_date: Optional[str] = None
# AI Functions
async def analyze_with_ollama(prompt: str, system_prompt: str = None) -> str:
    """Send prompt to Ollama and get response"""
    try:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": "qwen2.5:7b",
                    "messages": messages,
                    "stream": False
                }
            )
            result = response.json()
            return result.get("message", {}).get("content", "")
    except Exception as e:
        print(f"Ollama error: {e}")
        return ""
async def generate_ai_summary(content: str, interaction_type: str) -> Dict:
    """Generate AI summary and key points from interaction"""
    prompt = f"""
    Analyze this {interaction_type} interaction and provide:
    1. A one-sentence summary
    2. Key topics discussed (max 5)
    3. Action items (max 3)
    4. Sentiment (positive/neutral/negative)
    Interaction: {content}
    Return as JSON: {{"summary": "...", "key_topics": [...], "action_items": [...], "sentiment": "..."}}
    """
    response = await analyze_with_ollama(prompt)
    try:
        import json
        return json.loads(response)
    except:
        return {
            "summary": response[:200],
            "key_topics": [],
            "action_items": [],
            "sentiment": "neutral"
        }
async def predict_client_behavior(client_data: Dict) -> Dict:
    """Predict client behavior and risk level"""
    prompt = f"""
    Based on this client data, predict:
    1. Risk level (High/Medium/Low)
    2. Churn probability (0-100%)
    3. Potential value (estimated annual revenue)
    4. Recommended next action
    Client: {json.dumps(client_data)}
    Return as JSON: {{"risk_level": "...", "churn_probability": 0, "potential_value": 0, "recommended_action": "..."}}
    """
    response = await analyze_with_ollama(prompt)
    try:
        return json.loads(response)
    except:
        return {
            "risk_level": "Medium",
            "churn_probability": 50,
            "potential_value": 0,
            "recommended_action": "Schedule follow-up call"
        }
# API Endpoints
@router.get("/clients")
async def get_clients():
    """Get all clients with AI insights"""
    try:
        response = supabase.table("clients").select("*").order("created_at", desc=True).execute()
        clients = response.data
        # Add AI insights for each client
        for client in clients:
            # Get recent interactions
            interactions = supabase.table("interactions").select("*").eq("client_id", client["id"]).order("created_at", desc=True).limit(5).execute()
            client["recent_interactions"] = interactions.data
            client["interaction_count"] = len(interactions.data)
            # Get open tasks
            tasks = supabase.table("tasks").select("*").eq("client_id", client["id"]).eq("status", "pending").execute()
            client["open_tasks"] = len(tasks.data)
            # Get active deals
            deals = supabase.table("deals").select("*").eq("client_id", client["id"]).eq("status", "active").execute()
            client["active_deals"] = len(deals.data)
            client["total_deal_value"] = sum(d.get("value", 0) for d in deals.data)
        return {"success": True, "data": clients}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/clients/{client_id}")
async def get_client(client_id: int):
    """Get single client with full details"""
    try:
        client = supabase.table("crm_clients").select("*").eq("id", client_id).single().execute()
        if not client.data:
            raise HTTPException(status_code=404, detail="Client not found")
        # Get all interactions
        interactions = supabase.table("interactions").select("*").eq("client_id", client_id).order("created_at", desc=True).execute()
        # Get tasks
        tasks = supabase.table("tasks").select("*").eq("client_id", client_id).order("due_date", nulls_last=True).execute()
        # Get deals
        deals = supabase.table("deals").select("*").eq("client_id", client_id).order("value", desc=True).execute()
        # Get AI prediction
        prediction = await predict_client_behavior(client.data)
        return {
            "success": True,
            "data": {
                "client": client.data,
                "interactions": interactions.data,
                "tasks": tasks.data,
                "deals": deals.data,
                "ai_prediction": prediction
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/clients")
async def create_client(client: ClientCreate):
    """Create new client with AI analysis"""
    try:
        # Generate AI summary from notes if provided
        ai_summary = None
        sentiment_score = None
        risk_level = "medium"
        if client.notes:
            prompt = f"Analyze this client description and provide a one-sentence summary and risk level (high/medium/low): {client.notes}"
            response = await analyze_with_ollama(prompt)
            ai_summary = response[:500]
            if "high" in response.lower():
                risk_level = "high"
            elif "low" in response.lower():
                risk_level = "low"
        # Create client
        client_data = client.dict()
        client_data["ai_summary"] = ai_summary
        client_data["risk_level"] = risk_level
        client_data["created_at"] = datetime.now().isoformat()
        result = supabase.table("clients").insert(client_data).execute()
        return {"success": True, "data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.put("/clients/{client_id}")
async def update_client(client_id: int, client: ClientCreate):
    """Update client"""
    try:
        result = supabase.table("clients").update(client.dict()).eq("id", client_id).execute()
        return {"success": True, "data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.delete("/clients/{client_id}")
async def delete_client(client_id: int):
    """Delete client"""
    try:
        supabase.table("clients").delete().eq("id", client_id).execute()
        return {"success": True, "message": "Client deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/interactions")
async def create_interaction(interaction: InteractionCreate):
    """Create interaction with AI summary"""
    try:
        # Generate AI summary
        ai_result = await generate_ai_summary(interaction.content, interaction.interaction_type)
        interaction_data = interaction.dict()
        interaction_data["ai_summary"] = ai_result.get("summary", "")
        interaction_data["key_points"] = ai_result.get("key_topics", [])
        interaction_data["action_items"] = ai_result.get("action_items", [])
        interaction_data["sentiment"] = ai_result.get("sentiment", "neutral")
        interaction_data["created_at"] = datetime.now().isoformat()
        result = supabase.table("interactions").insert(interaction_data).execute()
        # Update client's last_contact and sentiment_score
        supabase.table("clients").update({
            "last_contact": datetime.now().isoformat(),
            "sentiment_score": 1 if ai_result.get("sentiment") == "positive" else (-1 if ai_result.get("sentiment") == "negative" else 0)
        }).eq("id", interaction.client_id).execute()
        # Create AI-suggested tasks from action items
        for action in ai_result.get("action_items", [])[:3]:
            supabase.table("tasks").insert({
                "client_id": interaction.client_id,
                "title": action,
                "description": f"AI-suggested action from {interaction.interaction_type}",
                "priority": "medium",
                "ai_suggested": True,
                "due_date": (datetime.now() + timedelta(days=7)).isoformat()
            }).execute()
        return {"success": True, "data": result.data[0] if result.data else None, "ai_analysis": ai_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/interactions/{client_id}")
async def get_interactions(client_id: int):
    """Get all interactions for a client"""
    try:
        response = supabase.table("interactions").select("*").eq("client_id", client_id).order("created_at", desc=True).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/tasks")
async def create_task(task: TaskCreate):
    """Create task"""
    try:
        task_data = task.dict()
        task_data["created_at"] = datetime.now().isoformat()
        if task.due_date:
            task_data["due_date"] = datetime.fromisoformat(task.due_date).isoformat()
        result = supabase.table("tasks").insert(task_data).execute()
        return {"success": True, "data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: int):
    """Mark task as complete"""
    try:
        result = supabase.table("tasks").update({
            "status": "completed",
            "completed_at": datetime.now().isoformat()
        }).eq("id", task_id).execute()
        return {"success": True, "data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/deals")
async def create_deal(deal: DealCreate):
    """Create deal/opportunity"""
    try:
        deal_data = deal.dict()
        deal_data["created_at"] = datetime.now().isoformat()
        if deal.expected_close_date:
            deal_data["expected_close_date"] = datetime.fromisoformat(deal.expected_close_date).isoformat()
        # AI prediction for deal success probability
        prompt = f"Based on deal value KES {deal.value} and stage '{deal.stage}', predict success probability (0-100%):"
        response = await analyze_with_ollama(prompt)
        try:
            deal_data["ai_prediction"] = float(response.strip())
        except:
            deal_data["ai_prediction"] = deal.probability
        result = supabase.table("deals").insert(deal_data).execute()
        return {"success": True, "data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/dashboard")
async def get_crm_dashboard():
    """Get CRM dashboard statistics with AI insights"""
    try:
        # Get counts
        clients = supabase.table("clients").select("*").execute()
        total_clients = len(clients.data)
        active_deals = supabase.table("deals").select("*").eq("status", "active").execute()
        total_deal_value = sum(d.get("value", 0) for d in active_deals.data)
        pending_tasks = supabase.table("tasks").select("*").eq("status", "pending").execute()
        recent_interactions = supabase.table("interactions").select("*").order("created_at", desc=True).limit(10).execute()
        # Calculate sentiment distribution
        sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
        for client in clients.data:
            sentiment = client.get("sentiment_score", 0)
            if sentiment > 0:
                sentiment_counts["positive"] += 1
            elif sentiment < 0:
                sentiment_counts["negative"] += 1
            else:
                sentiment_counts["neutral"] += 1
        # Generate AI dashboard insight
        insight_prompt = f"""
        Based on CRM data:
        - {total_clients} total clients
        - {len(active_deals.data)} active deals worth KES {total_deal_value:,.0f}
        - {len(pending_tasks.data)} pending tasks
        - Sentiment: {sentiment_counts['positive']} positive, {sentiment_counts['negative']} negative
        Provide a one-paragraph executive summary and top 3 recommendations.
        """
        ai_insight = await analyze_with_ollama(insight_prompt)
        return {
            "success": True,
            "data": {
                "total_clients": total_clients,
                "active_deals": len(active_deals.data),
                "total_deal_value": total_deal_value,
                "pending_tasks": len(pending_tasks.data),
                "recent_interactions": recent_interactions.data,
                "sentiment_distribution": sentiment_counts,
                "ai_insight": ai_insight
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/knowledge-base")
async def get_knowledge_base():
    """Get knowledge base articles"""
    try:
        response = supabase.table("knowledge_base").select("*").order("use_count", desc=True).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/ai/suggest-task/{client_id}")
async def suggest_task(client_id: int):
    """AI suggests next task for client"""
    try:
        client = supabase.table("clients").select("*").eq("id", client_id).single().execute()
        interactions = supabase.table("interactions").select("*").eq("client_id", client_id).order("created_at", desc=True).limit(5).execute()
        prompt = f"""
        Based on this client and recent interactions, suggest the next best action:
        Client: {json.dumps(client.data, default=str)}
        Recent interactions: {json.dumps(interactions.data, default=str)}
        Return as JSON: {{"task_title": "...", "description": "...", "priority": "high/medium/low", "reason": "..."}}
        """
        response = await analyze_with_ollama(prompt)
        try:
            suggestion = json.loads(response)
            return {"success": True, "data": suggestion}
        except:
            return {
                "success": True,
                "data": {
                    "task_title": "Follow up with client",
                    "description": "Schedule a follow-up call to check in",
                    "priority": "medium",
                    "reason": "Regular client maintenance"
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
