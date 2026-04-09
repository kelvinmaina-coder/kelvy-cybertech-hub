from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from supabase import create_client
import os
import json

router = APIRouter()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://nelcuoiygfydfokxvjss.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_1pNxe4keLc7fksoIW87fRg_7pw2xY-6")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    task_type: str
    schedule_type: str
    schedule_value: str
    config: Optional[Dict] = None

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    enabled: Optional[bool] = None
    config: Optional[Dict] = None
    schedule_value: Optional[str] = None

@router.get("/tasks")
async def get_tasks():
    """Get all automation tasks"""
    try:
        response = supabase.table("automation_tasks").select("*").order("created_at", desc=True).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}")
async def get_task(task_id: int):
    """Get a specific task"""
    try:
        response = supabase.table("automation_tasks").select("*").eq("id", task_id).single().execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Task not found")

@router.post("/tasks")
async def create_task(task: TaskCreate):
    """Create a new automation task"""
    try:
        response = supabase.table("automation_tasks").insert(task.dict()).execute()
        return {"success": True, "data": response.data[0] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tasks/{task_id}")
async def update_task(task_id: int, task: TaskUpdate):
    """Update an automation task"""
    try:
        update_data = {k: v for k, v in task.dict().items() if v is not None}
        response = supabase.table("automation_tasks").update(update_data).eq("id", task_id).execute()
        return {"success": True, "data": response.data[0] if response.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    """Delete an automation task"""
    try:
        supabase.table("automation_tasks").delete().eq("id", task_id).execute()
        return {"success": True, "message": "Task deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/{task_id}/run")
async def run_task_now(task_id: int):
    """Run a task immediately"""
    try:
        from automation.scheduler import scheduler
        task_response = supabase.table("automation_tasks").select("*").eq("id", task_id).single().execute()
        if task_response.data:
            # Run in background
            import asyncio
            asyncio.create_task(scheduler.execute_task(task_response.data))
            return {"success": True, "message": "Task triggered successfully"}
        raise HTTPException(status_code=404, detail="Task not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_logs(limit: int = 100, offset: int = 0, task_id: Optional[int] = None, status: Optional[str] = None):
    """Get automation logs with filtering"""
    try:
        query = supabase.table("automation_logs").select("*").order("created_at", desc=True)
        
        if task_id:
            query = query.eq("task_id", task_id)
        if status:
            query = query.eq("status", status)
        
        response = query.range(offset, offset + limit - 1).execute()
        return {"success": True, "data": response.data, "total": len(response.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/{log_id}")
async def get_log(log_id: int):
    """Get a specific log entry"""
    try:
        response = supabase.table("automation_logs").select("*").eq("id", log_id).single().execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Log not found")

@router.get("/stats")
async def get_stats():
    """Get automation statistics"""
    try:
        # Get tasks
        tasks_response = supabase.table("automation_tasks").select("*").execute()
        tasks = tasks_response.data
        
        # Get logs
        logs_response = supabase.table("automation_logs").select("*").execute()
        logs = logs_response.data
        
        # Calculate statistics
        total_tasks = len(tasks)
        enabled_tasks = len([t for t in tasks if t.get("enabled")])
        
        total_executions = len(logs)
        success_count = len([l for l in logs if l.get("status") == "success"])
        failed_count = len([l for l in logs if l.get("status") == "failed"])
        running_count = len([l for l in logs if l.get("status") == "running"])
        
        # Calculate success rate
        completed = success_count + failed_count
        success_rate = (success_count / completed * 100) if completed > 0 else 0
        
        # Calculate average duration
        durations = [l.get("duration_ms", 0) for l in logs if l.get("duration_ms")]
        avg_duration_ms = sum(durations) / len(durations) if durations else 0
        
        # Task type distribution
        task_distribution = {}
        for task in tasks:
            task_type = task.get("task_type", "unknown")
            task_distribution[task_type] = task_distribution.get(task_type, 0) + 1
        
        # Last 7 days execution trend
        last_7_days = []
        for i in range(7):
            day = datetime.now() - timedelta(days=i)
            day_str = day.strftime("%Y-%m-%d")
            day_logs = [l for l in logs if l.get("created_at", "").startswith(day_str)]
            last_7_days.append({
                "date": day_str,
                "count": len(day_logs),
                "success": len([l for l in day_logs if l.get("status") == "success"]),
                "failed": len([l for l in day_logs if l.get("status") == "failed"])
            })
        
        return {
            "success": True,
            "data": {
                "total_tasks": total_tasks,
                "enabled_tasks": enabled_tasks,
                "total_executions": total_executions,
                "success_count": success_count,
                "failed_count": failed_count,
                "running_count": running_count,
                "success_rate": round(success_rate, 2),
                "avg_duration_ms": round(avg_duration_ms, 2),
                "task_distribution": task_distribution,
                "trends": last_7_days
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/task-types")
async def get_task_types():
    """Get available task types and their schemas"""
    return {
        "success": True,
        "data": {
            "task_types": [
                {
                    "value": "run_scan",
                    "label": "Run Security Scan",
                    "description": "Execute a security tool scan (nmap, nikto, sqlmap, etc.)",
                    "config_schema": {
                        "tool": {"type": "string", "required": True, "description": "Security tool name"},
                        "target": {"type": "string", "required": True, "description": "Target IP, domain, or URL"},
                        "options": {"type": "string", "required": False, "description": "Additional tool options"},
                        "timeout": {"type": "integer", "required": False, "default": 300, "description": "Timeout in seconds"}
                    }
                },
                {
                    "value": "send_report",
                    "label": "Send Report",
                    "description": "Generate and email a system report",
                    "config_schema": {
                        "report_type": {"type": "string", "required": True, "enum": ["security", "system", "usage"], "description": "Type of report"},
                        "recipients": {"type": "array", "required": True, "description": "Email recipients"},
                        "format": {"type": "string", "required": False, "default": "json", "enum": ["json", "html"], "description": "Report format"}
                    }
                },
                {
                    "value": "backup_database",
                    "label": "Backup Database",
                    "description": "Create database backup",
                    "config_schema": {
                        "backup_type": {"type": "string", "required": False, "default": "full", "description": "Backup type"},
                        "retention_days": {"type": "integer", "required": False, "default": 30, "description": "Days to keep backups"}
                    }
                },
                {
                    "value": "send_email",
                    "label": "Send Email",
                    "description": "Send email notification",
                    "config_schema": {
                        "to": {"type": "array", "required": True, "description": "Recipient emails"},
                        "subject": {"type": "string", "required": True, "description": "Email subject"},
                        "body": {"type": "string", "required": True, "description": "Email body"},
                        "smtp_server": {"type": "string", "required": False, "description": "SMTP server"},
                        "smtp_user": {"type": "string", "required": False, "description": "SMTP username"},
                        "smtp_password": {"type": "string", "required": False, "description": "SMTP password"}
                    }
                },
                {
                    "value": "run_script",
                    "label": "Run Script",
                    "description": "Execute custom script",
                    "config_schema": {
                        "script": {"type": "string", "required": True, "description": "Script path"},
                        "args": {"type": "string", "required": False, "description": "Script arguments"},
                        "working_dir": {"type": "string", "required": False, "description": "Working directory"},
                        "timeout": {"type": "integer", "required": False, "default": 300, "description": "Timeout in seconds"}
                    }
                },
                {
                    "value": "webhook",
                    "label": "Webhook",
                    "description": "Call external webhook API",
                    "config_schema": {
                        "url": {"type": "string", "required": True, "description": "Webhook URL"},
                        "method": {"type": "string", "required": False, "default": "POST", "enum": ["GET", "POST", "PUT", "DELETE"], "description": "HTTP method"},
                        "payload": {"type": "object", "required": False, "description": "Request payload"},
                        "headers": {"type": "object", "required": False, "description": "Request headers"}
                    }
                }
            ],
            "schedule_types": [
                {"value": "cron", "label": "Cron Expression", "example": "0 2 * * *", "description": "Run at specific times using cron syntax"},
                {"value": "interval", "label": "Interval (seconds)", "example": "3600", "description": "Run every N seconds"},
                {"value": "once", "label": "One Time", "example": "2024-12-31T23:59:59", "description": "Run once at specified time"}
            ]
        }
    }

@router.post("/validate-cron")
async def validate_cron(cron_expression: str):
    """Validate a cron expression"""
    try:
        from apscheduler.triggers.cron import CronTrigger
        trigger = CronTrigger.from_crontab(cron_expression)
        next_run = trigger.get_next_fire_time(None, datetime.now())
        return {
            "success": True,
            "valid": True,
            "next_run": next_run.isoformat() if next_run else None
        }
    except Exception as e:
        return {
            "success": True,
            "valid": False,
            "error": str(e)
        }
