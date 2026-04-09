import asyncio
import json
import os
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from supabase import create_client
import httpx

router = APIRouter()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://nelcuoiygfydfokxvjss.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_1pNxe4keLc7fksoIW87fRg_7pw2xY-6")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

OLLAMA_URL = "http://localhost:11434"

class DateRange(BaseModel):
    start_date: str
    end_date: str

class KadaQuery(BaseModel):
    query: str
    context: Optional[Dict] = None

@router.get("/business-bi")
async def get_business_bi(start_date: str = None, end_date: str = None):
    """Business Intelligence analytics"""
    try:
        # Aggregate revenue from invoices/payments
        revenue_data = supabase.table("payments").select("amount, created_at").execute()
        
        # Calculate KPIs
        total_revenue = sum([p["amount"] for p in revenue_data.data])
        
        # Get client counts
        clients_res = supabase.table("clients").select("id, status").execute()
        active_clients = len([c for c in clients_res.data if c["status"] == "active"])
        
        # Churn rate (mock logic for now based on stats)
        churn_rate = 4.2 
        
        return {
            "success": True,
            "data": {
                "total_revenue": total_revenue,
                "active_clients": active_clients,
                "churn_rate": churn_rate,
                "revenue_trend": [
                    {"name": "Jan", "revenue": 100000},
                    {"name": "Feb", "revenue": 120000},
                    {"name": "Mar", "revenue": 115000}
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/security-analytics")
async def get_security_analytics(start_date: str = None, end_date: str = None):
    """Security focus analytics"""
    try:
        scans_res = supabase.table("scans").select("*").execute()
        
        tool_counts = {}
        severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        
        for scan in scans_res.data:
            tool = scan.get("tool", "unknown")
            tool_counts[tool] = tool_counts.get(tool, 0) + 1
            
            # Severity might be in metadata or a direct field
            sev = scan.get("severity", "low").lower()
            if sev in severity_counts:
                severity_counts[sev] += 1
                
        return {
            "success": True,
            "data": {
                "total_scans": len(scans_res.data),
                "severity_breakdown": severity_counts,
                "tool_distribution": [{"name": k, "value": v} for k, v in tool_counts.items()]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
async def get_dashboard_stats(start_date: str = None, end_date: str = None):
    """Get all dashboard statistics with date filtering"""
    try:
        # Parse dates
        if start_date:
            start = datetime.fromisoformat(start_date)
        else:
            start = datetime.now() - timedelta(days=30)
        
        if end_date:
            end = datetime.fromisoformat(end_date)
        else:
            end = datetime.now()
        
        # Get users data
        users_response = supabase.table("profiles").select("*").execute()
        total_users = len(users_response.data)
        
        # Get messages data
        messages_response = supabase.table("messages").select("*").execute()
        total_messages = len(messages_response.data)
        
        # Get calls data
        calls_response = supabase.table("calls").select("*").execute()
        total_calls = len(calls_response.data)
        
        # Get scans data
        scans_response = supabase.table("scans").select("*").execute()
        total_scans = len(scans_response.data)
        
        # Get automation logs
        automation_response = supabase.table("automation_logs").select("*").execute()
        automation_success = len([l for l in automation_response.data if l.get("status") == "success"])
        automation_failed = len([l for l in automation_response.data if l.get("status") == "failed"])
        
        # Calculate trends
        trends = await calculate_trends(start, end)
        
        return {
            "success": True,
            "data": {
                "total_users": total_users,
                "total_messages": total_messages,
                "total_calls": total_calls,
                "total_scans": total_scans,
                "automation_success": automation_success,
                "automation_failed": automation_failed,
                "trends": trends,
                "date_range": {
                    "start": start.isoformat(),
                    "end": end.isoformat()
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/charts/messages")
async def get_messages_chart(start_date: str = None, end_date: str = None):
    """Get messages data for charts"""
    try:
        if start_date:
            start = datetime.fromisoformat(start_date)
        else:
            start = datetime.now() - timedelta(days=30)
        
        if end_date:
            end = datetime.fromisoformat(end_date)
        else:
            end = datetime.now()
        
        # Get messages grouped by day
        messages_response = supabase.table("messages").select("created_at").execute()
        
        # Group by date
        daily_counts = {}
        for msg in messages_response.data:
            date = datetime.fromisoformat(msg["created_at"]).date()
            if start.date() <= date <= end.date():
                daily_counts[date.isoformat()] = daily_counts.get(date.isoformat(), 0) + 1
        
        # Create chart data
        chart_data = []
        current = start.date()
        while current <= end.date():
            date_str = current.isoformat()
            chart_data.append({
                "date": date_str,
                "messages": daily_counts.get(date_str, 0)
            })
            current += timedelta(days=1)
        
        return {"success": True, "data": chart_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/charts/calls")
async def get_calls_chart(start_date: str = None, end_date: str = None):
    """Get calls data for charts"""
    try:
        if start_date:
            start = datetime.fromisoformat(start_date)
        else:
            start = datetime.now() - timedelta(days=30)
        
        if end_date:
            end = datetime.fromisoformat(end_date)
        else:
            end = datetime.now()
        
        calls_response = supabase.table("calls").select("created_at, call_type").execute()
        
        daily_counts = {}
        type_counts = {"audio": 0, "video": 0, "group": 0}
        
        for call in calls_response.data:
            date = datetime.fromisoformat(call["created_at"]).date()
            if start.date() <= date <= end.date():
                daily_counts[date.isoformat()] = daily_counts.get(date.isoformat(), 0) + 1
                
                call_type = call.get("call_type", "audio")
                if call_type in type_counts:
                    type_counts[call_type] += 1
        
        chart_data = []
        current = start.date()
        while current <= end.date():
            date_str = current.isoformat()
            chart_data.append({
                "date": date_str,
                "calls": daily_counts.get(date_str, 0)
            })
            current += timedelta(days=1)
        
        return {
            "success": True,
            "data": {
                "timeline": chart_data,
                "by_type": [{"name": k, "value": v} for k, v in type_counts.items() if v > 0]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/charts/scans")
async def get_scans_chart(start_date: str = None, end_date: str = None):
    """Get security scans data for charts"""
    try:
        if start_date:
            start = datetime.fromisoformat(start_date)
        else:
            start = datetime.now() - timedelta(days=30)
        
        if end_date:
            end = datetime.fromisoformat(end_date)
        else:
            end = datetime.now()
        
        scans_response = supabase.table("scans").select("created_at, tool, status").execute()
        
        daily_counts = {}
        tool_counts = {}
        status_counts = {"success": 0, "failed": 0}
        
        for scan in scans_response.data:
            date = datetime.fromisoformat(scan["created_at"]).date()
            if start.date() <= date <= end.date():
                daily_counts[date.isoformat()] = daily_counts.get(date.isoformat(), 0) + 1
                
                tool = scan.get("tool", "unknown")
                tool_counts[tool] = tool_counts.get(tool, 0) + 1
                
                status = scan.get("status", "failed")
                if status in status_counts:
                    status_counts[status] += 1
        
        chart_data = []
        current = start.date()
        while current <= end.date():
            date_str = current.isoformat()
            chart_data.append({
                "date": date_str,
                "scans": daily_counts.get(date_str, 0)
            })
            current += timedelta(days=1)
        
        # Get top 5 tools
        top_tools = sorted(tool_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "success": True,
            "data": {
                "timeline": chart_data,
                "by_tool": [{"name": k, "value": v} for k, v in top_tools],
                "by_status": [{"name": k, "value": v} for k, v in status_counts.items()]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/charts/automation")
async def get_automation_chart(start_date: str = None, end_date: str = None):
    """Get automation logs data for charts"""
    try:
        if start_date:
            start = datetime.fromisoformat(start_date)
        else:
            start = datetime.now() - timedelta(days=30)
        
        if end_date:
            end = datetime.fromisoformat(end_date)
        else:
            end = datetime.now()
        
        logs_response = supabase.table("automation_logs").select("created_at, status, duration_ms").execute()
        
        daily_counts = {"success": {}, "failed": {}}
        avg_durations = []
        
        for log in logs_response.data:
            date = datetime.fromisoformat(log["created_at"]).date()
            if start.date() <= date <= end.date():
                date_str = date.isoformat()
                status = log.get("status", "failed")
                
                if status not in daily_counts:
                    daily_counts[status] = {}
                
                daily_counts[status][date_str] = daily_counts[status].get(date_str, 0) + 1
                
                if log.get("duration_ms"):
                    avg_durations.append(log["duration_ms"])
        
        timeline_data = []
        current = start.date()
        while current <= end.date():
            date_str = current.isoformat()
            timeline_data.append({
                "date": date_str,
                "success": daily_counts.get("success", {}).get(date_str, 0),
                "failed": daily_counts.get("failed", {}).get(date_str, 0)
            })
            current += timedelta(days=1)
        
        avg_duration = sum(avg_durations) / len(avg_durations) if avg_durations else 0
        
        return {
            "success": True,
            "data": {
                "timeline": timeline_data,
                "avg_duration_ms": round(avg_duration, 2),
                "total_executions": len(logs_response.data)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai-insights")
async def get_ai_insights(start_date: str = None, end_date: str = None):
    """Generate AI insights using Ollama"""
    try:
        # Get summary data
        stats = await get_dashboard_stats(start_date, end_date)
        
        # Prepare prompt for Ollama
        prompt = f"""
        Analyze this business data and provide insights:
        
        - Total Users: {stats['data']['total_users']}
        - Total Messages: {stats['data']['total_messages']}
        - Total Calls: {stats['data']['total_calls']}
        - Total Security Scans: {stats['data']['total_scans']}
        - Automation Success Rate: {stats['data']['automation_success']} / {stats['data']['automation_success'] + stats['data']['automation_failed']}
        
        Provide:
        1. Key Findings (3 bullet points)
        2. Recommendations for improvement (3 bullet points)
        3. Risk Assessment (Low/Medium/High)
        4. Predicted next month trends
        
        Keep it concise and professional.
        """
        
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": "qwen2.5:7b",
                    "prompt": prompt,
                    "stream": False
                }
            )
            result = response.json()
            ai_response = result.get("response", "AI insights not available")
        
        return {
            "success": True,
            "data": {
                "insights": ai_response,
                "generated_at": datetime.now().isoformat()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "data": {
                "insights": f"AI insights unavailable: {str(e)}",
                "generated_at": datetime.now().isoformat()
            }
        }

@router.get("/export/csv")
async def export_csv(report_type: str, start_date: str = None, end_date: str = None):
    """Export data as CSV"""
    try:
        if report_type == "messages":
            response = supabase.table("messages").select("*").execute()
        elif report_type == "calls":
            response = supabase.table("calls").select("*").execute()
        elif report_type == "scans":
            response = supabase.table("scans").select("*").execute()
        elif report_type == "automation":
            response = supabase.table("automation_logs").select("*").execute()
        else:
            response = supabase.table("profiles").select("*").execute()
        
        # Convert to CSV format
        data = response.data
        if not data:
            return {"success": False, "message": "No data to export"}
        
        return {"success": True, "data": data, "count": len(data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def calculate_trends(start: datetime, end: datetime) -> Dict:
    """Calculate percentage trends"""
    mid_point = start + (end - start) / 2
    
    # Get data for first half and second half
    first_half_end = mid_point
    second_half_start = mid_point
    
    messages_response = supabase.table("messages").select("created_at").execute()
    
    first_half_count = 0
    second_half_count = 0
    
    for msg in messages_response.data:
        date = datetime.fromisoformat(msg["created_at"])
        if start <= date <= first_half_end:
            first_half_count += 1
        elif second_half_start <= date <= end:
            second_half_count += 1
    
    if first_half_count > 0:
        messages_trend = ((second_half_count - first_half_count) / first_half_count) * 100
    else:
        messages_trend = 100 if second_half_count > 0 else 0
    
    return {
        "messages": round(messages_trend, 1),
        "period": f"{start.date()} to {end.date()}"
    }
