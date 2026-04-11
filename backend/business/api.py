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
class InvoiceCreate(BaseModel):
    client_id: int
    amount: float
    due_date: str
    items: List[Dict]
    invoice_number: str
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    vendor: str
    description: str
    date: str
class KABAQuery(BaseModel):
    query: str
# AI Functions
async def analyze_with_ollama(prompt: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=90) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": "qwen2.5:7b",
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                }
            )
            result = response.json()
            return result.get("message", {}).get("content", "")
    except Exception as e:
        return f"AL Error: {str(e)}"
# ERP Endpoints
@router.get("/erp/dashboard")
async def get_erp_dashboard():
    try:
        invoices = supabase.table("invoices").select("*").execute()
        expenses = supabase.table("expenses").select("*").execute()
        total_revenue = sum(inv.get("amount", 0) for inv in invoices.data if inv.get("status") == "paid")
        pending_payments = sum(inv.get("amount", 0) for inv in invoices.data if inv.get("status") != "paid")
        total_expenses = sum(exp.get("amount", 0) for exp in expenses.data)
        # Simple AI cash flow prediction
        prompt = f"Predict cash flow for next 30 days in KES based on: Revenue KES {total_revenue:,.0f}, Pending Payments KES {pending_payments:,.0f}, Monthly Expenses KES {total_expenses:,.0f}. Return one sentence."
        prediction = await analyze_with_ollama(prompt)
        return {
            "success": True,
            "data": {
                "revenue": total_revenue,
                "pending": pending_payments,
                "expenses": total_expenses,
                "profit": total_revenue - total_expenses,
                "prediction": prediction
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/erp/invoices")
async def get_invoices():
    try:
        response = supabase.table("invoices").select("*, clients(name)").order("created_at", desc=True).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/erp/invoices")
async def create_invoice(invoice: InvoiceCreate):
    try:
        data = invoice.dict()
        data["created_at"] = datetime.now().isoformat()
        data["status"] = "pending"
        result = supabase.table("invoices").insert(data).execute()
        return {"success": True, "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# KABA AI Endpoint
@router.post("/kaba/query")
async def kaba_query(req: KABAQuery):
    try:
        # Context building
        clients = supabase.table("clients").select("count").execute()
        invoices = supabase.table("invoices").select("amount", "status").execute()
        tickets = supabase.table("tickets").select("status", "priority").execute()
        stats = {
            "total_clients": clients.count,
            "revenue": sum(i["amount"] for i in invoices.data if i["status"] == "paid"),
            "open_tickets": len([t for t in tickets.data if t["status"] != "closed"]),
            "critical_tickets": len([t for t in tickets.data if t["priority"] == "critical"])
        }
        prompt = f"""
        You are KABA (Kelvy AI Business Analyst). 
        Based on our system data: {json.dumps(stats)}
        User Question: {req.query}
        Respond with practical business insights and use KES for currency if applicable.
        """
        response = await analyze_with_ollama(prompt)
        return {"success": True, "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# Subscriptions Endpoints
@router.get("/subscriptions")
async def get_subscriptions():
    try:
        # Assuming subscriptions table or using clients with contract_value
        response = supabase.table("clients").select("id, name, contract_value, status").gt("contract_value", 0).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        return {"success": False, "error": str(e)}
# Tax Endpoints
@router.get("/tax/summary")
async def get_tax_summary():
    try:
        invoices = supabase.table("invoices").select("amount").eq("status", "paid").execute()
        total_paid = sum(i["amount"] for i in invoices.data)
        estimated_vat = total_paid * 0.16  # 16% VAT in Kenya
        return {
            "success": True, 
            "data": {
                "total_paid": total_paid,
                "estimated_vat": estimated_vat,
                "compliance_status": "Compliant"
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
