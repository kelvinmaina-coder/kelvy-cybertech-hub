import asyncio
import json
import os
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from supabase_client import supabase
import httpx
router = APIRouter()
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ykecpdzmuebogwxwpafl.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZWNwZHptdWVib2d3eHdwYWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzQxNzMsImV4cCI6MjA5MDcxMDE3M30.0byw_PNsNMwUUBwrOKp5E-msoPh9dZl0iREGGydnzAI")
OLLAMA_URL = "http://localhost:11434"
# Pydantic models
class TicketCreate(BaseModel):
    title: str
    description: str
    category: str = "incident"
    priority: str = "medium"
    urgency: str = "medium"
    impact: str = "single"
    requester_name: str
    requester_email: str
    requester_phone: Optional[str] = None
class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution: Optional[str] = None
class CommentCreate(BaseModel):
    ticket_id: int
    content: str
    is_internal: bool = False
class KnowledgeBaseCreate(BaseModel):
    title: str
    content: str
    category: str
    tags: List[str]
    resolution_steps: List[str]
# AI Functions
async def analyze_with_ollama(prompt: str, system_prompt: str = None) -> str:
    """Send prompt to Ollama and get response"""
    try:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        async with httpx.AsyncClient(timeout=90) as client:
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
async def analyze_ticket_with_ai(title: str, description: str) -> Dict:
    """Analyze ticket with AI to determine category, priority, and suggested solution"""
    prompt = f"""
    Analyze this IT support ticket and provide:
    Ticket Title: {title}
    Ticket Description: {description}
    Return as JSON:
    {{
        "category": "incident/problem/change/service_request/security",
        "priority": "critical/high/medium/low",
        "summary": "Brief 1-sentence summary",
        "suggested_solution": "Step-by-step solution",
        "tags": ["tag1", "tag2"],
        "estimated_resolution_minutes": 30
    }}
    """
    response = await analyze_with_ollama(prompt)
    try:
        result = json.loads(response)
        return result
    except:
        return {
            "category": "incident",
            "priority": "medium",
            "summary": description[:200],
            "suggested_solution": "Review the issue and investigate further",
            "tags": ["general"],
            "estimated_resolution_minutes": 60
        }
async def find_similar_tickets(description: str) -> List[Dict]:
    """Find similar tickets from knowledge base using AI"""
    prompt = f"""
    Based on this ticket description, suggest relevant solution categories:
    {description}
    Return as JSON: {{"categories": ["category1", "category2"], "keywords": ["keyword1", "keyword2"]}}
    """
    response = await analyze_with_ollama(prompt)
    try:
        result = json.loads(response)
        categories = result.get("categories", [])
    except:
        categories = ["general"]
    # Search knowledge base for matching categories
    similar = []
    for category in categories:
        kb_response = supabase.table("knowledge_base").select("*").ilike("category", f"%{category}%").limit(3).execute()
        similar.extend(kb_response.data)
    return similar[:5]
# API Endpoints
@router.get("/tickets")
async def get_tickets(status: str = None, priority: str = None, category: str = None):
    """Get all tickets with filters"""
    try:
        query = supabase.table("tickets").select("*").order("created_at", desc=True)
        if status:
            query = query.eq("status", status)
        if priority:
            query = query.eq("priority", priority)
        if category:
            query = query.eq("category", category)
        response = query.execute()
        # Add SLA status to each ticket
        for ticket in response.data:
            if ticket.get("sla_deadline"):
                deadline = datetime.fromisoformat(ticket["sla_deadline"])
                ticket["sla_status"] = "breached" if deadline < datetime.now() and ticket["status"] not in ["resolved", "closed"] else "ok"
            else:
                ticket["sla_status"] = "no_sla"
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: int):
    """Get single ticket with AI insights"""
    try:
        ticket = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
        if not ticket.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        # Get comments
        comments = supabase.table("ticket_updates").select("*").eq("ticket_id", ticket_id).order("created_at", asc=True).execute()
        # Find similar resolved tickets
        similar_tickets = await find_similar_tickets(ticket.data.get("description", ""))
        # Get AI suggested solution if not already set
        if not ticket.data.get("ai_suggested_solution"):
            ai_analysis = await analyze_ticket_with_ai(
                ticket.data.get("title", ""),
                ticket.data.get("description", "")
            )
            supabase.table("tickets").update({
                "ai_suggested_solution": ai_analysis.get("suggested_solution"),
                "ai_category_confidence": 0.85,
                "ai_priority_confidence": 0.90,
                "ai_summary": ai_analysis.get("summary"),
                "ai_tags": ai_analysis.get("tags", [])
            }).eq("id", ticket_id).execute()
            ticket.data["ai_suggested_solution"] = ai_analysis.get("suggested_solution")
        return {
            "success": True,
            "data": {
                "ticket": ticket.data,
                "comments": comments.data,
                "similar_solutions": similar_tickets
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/tickets")
async def create_ticket(ticket: TicketCreate, background_tasks: BackgroundTasks):
    """Create new ticket with AI analysis"""
    try:
        # Generate ticket number
        ticket_number = f"INC-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
        # AI Analysis
        ai_analysis = await analyze_ticket_with_ai(ticket.title, ticket.description)
        # Calculate SLA deadline based on priority
        priority = ai_analysis.get("priority", ticket.priority)
        sla_policies = supabase.table("sla_policies").select("*").eq("priority", priority).eq("is_active", True).execute()
        sla_deadline = None
        if sla_policies.data:
            resolution_minutes = sla_policies.data[0].get("resolution_time_minutes", 1440)
            sla_deadline = (datetime.now() + timedelta(minutes=resolution_minutes)).isoformat()
        # Create ticket
        ticket_data = ticket.dict()
        ticket_data["ticket_number"] = ticket_number
        ticket_data["priority"] = priority
        ticket_data["category"] = ai_analysis.get("category", ticket.category)
        ticket_data["ai_suggested_solution"] = ai_analysis.get("suggested_solution")
        ticket_data["ai_summary"] = ai_analysis.get("summary")
        ticket_data["ai_tags"] = ai_analysis.get("tags", [])
        ticket_data["ai_predicted_resolution_minutes"] = ai_analysis.get("estimated_resolution_minutes", 60)
        ticket_data["sla_deadline"] = sla_deadline
        ticket_data["created_at"] = datetime.now().isoformat()
        result = supabase.table("tickets").insert(ticket_data).execute()
        return {
            "success": True,
            "data": result.data[0] if result.data else None,
            "ai_analysis": ai_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.put("/tickets/{ticket_id}")
async def update_ticket(ticket_id: int, ticket: TicketUpdate):
    """Update ticket status"""
    try:
        update_data = {k: v for k, v in ticket.dict().items() if v is not None}
        if ticket.status == "resolved":
            update_data["resolved_at"] = datetime.now().isoformat()
        elif ticket.status == "closed":
            update_data["closed_at"] = datetime.now().isoformat()
        update_data["updated_at"] = datetime.now().isoformat()
        result = supabase.table("tickets").update(update_data).eq("id", ticket_id).execute()
        return {"success": True, "data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/comments")
async def add_comment(comment: CommentCreate):
    """Add comment to ticket with AI analysis"""
    try:
        # Analyze comment with AI for sentiment and helpfulness
        prompt = f"Analyze this support comment: {comment.content}\nReturn as JSON: {{\"sentiment\": \"positive/neutral/negative\", \"is_helpful\": true/false, \"summary\": \"one sentence\"}}"
        ai_response = await analyze_with_ollama(prompt)
        try:
            ai_analysis = json.loads(ai_response)
        except:
            ai_analysis = {"sentiment": "neutral", "is_helpful": True, "summary": comment.content[:100]}
        comment_data = comment.dict()
        comment_data["ai_analysis"] = json.dumps(ai_analysis)
        comment_data["created_at"] = datetime.now().isoformat()
        result = supabase.table("ticket_updates").insert(comment_data).execute()
        # Update ticket status if needed
        supabase.table("itsm_tickets").update({
            "updated_at": datetime.now().isoformat(),
            "status": "in_progress"
        }).eq("id", comment.ticket_id).execute()
        return {"success": True, "data": result.data[0] if result.data else None, "ai_analysis": ai_analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/knowledge-base")
async def get_knowledge_base(category: str = None, search: str = None):
    """Get knowledge base articles"""
    try:
        query = supabase.table("knowledge_base").select("*").order("times_used", desc=True)
        if category:
            query = query.eq("category", category)
        if search:
            query = query.ilike("title", f"%{search}%")
        response = query.execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/knowledge-base")
async def create_knowledge_article(article: KnowledgeBaseCreate):
    """Create knowledge base article"""
    try:
        article_data = article.dict()
        article_data["created_at"] = datetime.now().isoformat()
        article_data["times_used"] = 0
        result = supabase.table("knowledge_base").insert(article_data).execute()
        return {"success": True, "data": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/dashboard")
async def get_itsm_dashboard():
    """Get ITSM dashboard statistics with AI insights"""
    try:
        # Get all tickets
        tickets = supabase.table("tickets").select("*").execute()
        # Statistics
        total_tickets = len(tickets.data)
        open_tickets = len([t for t in tickets.data if t.get("status") not in ["resolved", "closed"]])
        resolved_today = len([t for t in tickets.data if t.get("resolved_at", "").startswith(datetime.now().strftime("%Y-%m-%d"))])
        # By priority
        priority_counts = {}
        for priority in ["critical", "high", "medium", "low"]:
            priority_counts[priority] = len([t for t in tickets.data if t.get("priority") == priority and t.get("status") not in ["resolved", "closed"]])
        # By category
        category_counts = {}
        for ticket in tickets.data:
            cat = ticket.get("category", "other")
            category_counts[cat] = category_counts.get(cat, 0) + 1
        # SLA breaches
        sla_breached = len([t for t in tickets.data if t.get("sla_breached")])
        # Average resolution time
        resolved_tickets = [t for t in tickets.data if t.get("resolved_at")]
        avg_resolution_minutes = 0
        if resolved_tickets:
            total_minutes = 0
            for ticket in resolved_tickets:
                created = datetime.fromisoformat(ticket["created_at"])
                resolved = datetime.fromisoformat(ticket["resolved_at"])
                total_minutes += (resolved - created).total_seconds() / 60
            avg_resolution_minutes = total_minutes / len(resolved_tickets)
        # Generate AI insight
        insight_prompt = f"""
        Based on ITSM data:
        - {open_tickets} open tickets out of {total_tickets} total
        - {resolved_today} resolved today
        - {sla_breached} SLA breaches
        - Average resolution time: {avg_resolution_minutes:.0f} minutes
        Provide a 2-sentence operational insight and one recommendation.
        """
        ai_insight = await analyze_with_ollama(insight_prompt)
        return {
            "success": True,
            "data": {
                "total_tickets": total_tickets,
                "open_tickets": open_tickets,
                "resolved_today": resolved_today,
                "sla_breached": sla_breached,
                "avg_resolution_minutes": round(avg_resolution_minutes, 0),
                "priority_breakdown": priority_counts,
                "category_breakdown": category_counts,
                "ai_insight": ai_insight
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/tickets/{ticket_id}/ai-solution")
async def get_ai_solution(ticket_id: int):
    """Get AI-generated solution for a ticket"""
    try:
        ticket = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
        if not ticket.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        # Search knowledge base
        kb_results = await find_similar_tickets(ticket.data.get("description", ""))
        # Generate AI solution
        prompt = f"""
        Generate a solution for this IT ticket:
        Title: {ticket.data.get('title')}
        Description: {ticket.data.get('description')}
        Similar solutions found: {json.dumps(kb_results[:2], default=str)}
        Provide a step-by-step solution with:
        1. Root cause analysis
        2. Resolution steps (numbered)
        3. Prevention tips
        4. Estimated time to fix
        Keep it practical and actionable.
        """
        solution = await analyze_with_ollama(prompt)
        # Update ticket with solution
        supabase.table("tickets").update({
            "ai_suggested_solution": solution,
            "updated_at": datetime.now().isoformat()
        }).eq("id", ticket_id).execute()
        return {"success": True, "solution": solution}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
