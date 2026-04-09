import asyncio
import subprocess
import json
import smtplib
import requests
import os
import logging
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, Any, Optional, List
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.date import DateTrigger
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://nelcuoiygfydfokxvjss.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_1pNxe4keLc7fksoIW87fRg_7pw2xY-6")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class AutomationScheduler:
    """Production-ready automation scheduler with real task execution"""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.running_tasks = {}
        self.task_history = []
        
    async def load_tasks(self) -> List[Dict[str, Any]]:
        """Load all enabled tasks from Supabase database"""
        try:
            response = supabase.table("automation_tasks").select("*").eq("enabled", True).execute()
            tasks = response.data
            logger.info(f"Loaded {len(tasks)} automation tasks from database")
            return tasks
        except Exception as e:
            logger.error(f"Failed to load tasks from database: {e}")
            return []
    
    async def execute_scan_task(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute real security scan using installed tools"""
        tool = config.get("tool", "nmap")
        target = config.get("target", "localhost")
        options = config.get("options", "")
        
        # Build the full command
        if tool == "nmap":
            command = f"nmap {options} {target}"
        elif tool == "nikto":
            command = f"nikto -h {target} {options}"
        elif tool == "sqlmap":
            command = f"sqlmap -u {target} {options}"
        elif tool == "gobuster":
            command = f"gobuster dir -u {target} -w /usr/share/wordlists/dirb/common.txt {options}"
        elif tool == "hydra":
            command = f"hydra {target} {options}"
        else:
            command = f"{tool} {options} {target}"
        
        start_time = datetime.datetime.now()
        
        try:
            # Execute the command with timeout
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=config.get("timeout", 300)
            )
            
            output = result.stdout if result.stdout else result.stderr
            success = result.returncode == 0
            
            return {
                "success": success,
                "output": output[:10000],  # Limit output size
                "command": command,
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "exit_code": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": f"Command timed out after {config.get('timeout', 300)} seconds",
                "command": command,
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "error": "Timeout"
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Command failed: {str(e)}",
                "command": command,
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "error": str(e)
            }
    
    async def execute_backup_task(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Create real database backup"""
        backup_type = config.get("backup_type", "full")
        retention_days = config.get("retention_days", 30)
        
        # Create backup directory
        backup_dir = f"backups/{datetime.datetime.now().strftime('%Y-%m-%d')}"
        os.makedirs(backup_dir, exist_ok=True)
        
        backup_file = f"{backup_dir}/backup_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
        
        start_time = datetime.datetime.now()
        
        try:
            # For Supabase, we'll export data via API
            tables = ["profiles", "messages", "calls", "automation_tasks", "automation_logs", "scans"]
            backup_data = {}
            
            for table in tables:
                response = supabase.table(table).select("*").execute()
                backup_data[table] = response.data
            
            # Save to file
            with open(backup_file, 'w') as f:
                json.dump(backup_data, f, indent=2, default=str)
            
            # Clean old backups
            if retention_days > 0:
                cutoff = datetime.datetime.now() - datetime.timedelta(days=retention_days)
                for root, dirs, files in os.walk("backups"):
                    for file in files:
                        file_path = os.path.join(root, file)
                        file_time = datetime.datetime.fromtimestamp(os.path.getctime(file_path))
                        if file_time < cutoff:
                            os.remove(file_path)
                            logger.info(f"Removed old backup: {file_path}")
            
            return {
                "success": True,
                "output": f"Backup created: {backup_file}\nSize: {os.path.getsize(backup_file)} bytes\nTables backed up: {', '.join(tables)}",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "backup_file": backup_file
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Backup failed: {str(e)}",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "error": str(e)
            }
    
    async def execute_email_task(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Send real email notifications"""
        to_emails = config.get("to", [])
        if isinstance(to_emails, str):
            to_emails = [to_emails]
        
        subject = config.get("subject", "Automation Task Report")
        body = config.get("body", "Task completed successfully")
        
        start_time = datetime.datetime.now()
        
        # For production, configure SMTP settings
        smtp_server = config.get("smtp_server", "smtp.gmail.com")
        smtp_port = config.get("smtp_port", 587)
        smtp_user = config.get("smtp_user", "")
        smtp_password = config.get("smtp_password", "")
        
        try:
            if smtp_user and smtp_password:
                # Send real email via SMTP
                msg = MIMEMultipart()
                msg['From'] = smtp_user
                msg['To'] = ', '.join(to_emails)
                msg['Subject'] = subject
                msg.attach(MIMEText(body, 'plain'))
                
                server = smtplib.SMTP(smtp_server, smtp_port)
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
                server.quit()
                
                result = f"Email sent to {len(to_emails)} recipients"
            else:
                # Log email (for development)
                result = f"[DEV MODE] Email would be sent to: {', '.join(to_emails)}\nSubject: {subject}\nBody: {body}"
                logger.info(result)
            
            return {
                "success": True,
                "output": result,
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000)
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Email failed: {str(e)}",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "error": str(e)
            }
    
    async def execute_report_task(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Generate and send real reports"""
        report_type = config.get("report_type", "security")
        recipients = config.get("recipients", [])
        format_type = config.get("format", "json")
        
        start_time = datetime.datetime.now()
        
        try:
            # Gather real data from database
            report_data = {
                "report_type": report_type,
                "generated_at": datetime.datetime.now().isoformat(),
                "data": {}
            }
            
            if report_type == "security":
                # Get scan statistics
                scans = supabase.table("scans").select("*").execute()
                report_data["data"]["total_scans"] = len(scans.data)
                report_data["data"]["recent_scans"] = scans.data[-10:] if scans.data else []
                
                # Get tool usage
                tools_used = {}
                for scan in scans.data:
                    tool = scan.get("tool", "unknown")
                    tools_used[tool] = tools_used.get(tool, 0) + 1
                report_data["data"]["tools_used"] = tools_used
            
            elif report_type == "system":
                # Get user statistics
                users = supabase.table("profiles").select("*").execute()
                report_data["data"]["total_users"] = len(users.data)
                
                # Get automation statistics
                tasks = supabase.table("automation_tasks").select("*").execute()
                logs = supabase.table("automation_logs").select("*").execute()
                report_data["data"]["total_tasks"] = len(tasks.data)
                report_data["data"]["total_executions"] = len(logs.data)
                
                success_count = len([l for l in logs.data if l.get("status") == "success"])
                report_data["data"]["success_rate"] = (success_count / len(logs.data) * 100) if logs.data else 0
            
            # Generate report file
            report_dir = f"reports/{datetime.datetime.now().strftime('%Y-%m-%d')}"
            os.makedirs(report_dir, exist_ok=True)
            
            report_file = f"{report_dir}/report_{report_type}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.{format_type}"
            
            if format_type == "json":
                with open(report_file, 'w') as f:
                    json.dump(report_data, f, indent=2, default=str)
            elif format_type == "html":
                html_content = f"""
                <html>
                <head><title>{report_type.upper()} Report</title></head>
                <body>
                    <h1>{report_type.upper()} Report</h1>
                    <p>Generated: {report_data['generated_at']}</p>
                    <pre>{json.dumps(report_data['data'], indent=2, default=str)}</pre>
                </body>
                </html>
                """
                with open(report_file, 'w') as f:
                    f.write(html_content)
            
            # Send to recipients if specified
            if recipients:
                await self.execute_email_task({
                    "to": recipients,
                    "subject": f"{report_type.upper()} Report - {datetime.datetime.now().strftime('%Y-%m-%d')}",
                    "body": f"Report attached.\n\nReport file: {report_file}\n\nSummary:\n{json.dumps(report_data['data'], indent=2, default=str)[:1000]}"
                })
            
            return {
                "success": True,
                "output": f"Report generated: {report_file}\nReport type: {report_type}\nFormat: {format_type}",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "report_file": report_file,
                "report_data": report_data
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Report generation failed: {str(e)}",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "error": str(e)
            }
    
    async def execute_script_task(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute custom scripts"""
        script_path = config.get("script", "")
        args = config.get("args", "")
        working_dir = config.get("working_dir", ".")
        
        if not script_path:
            return {
                "success": False,
                "output": "No script path specified",
                "error": "Missing script path"
            }
        
        start_time = datetime.datetime.now()
        
        try:
            # Execute the script
            result = subprocess.run(
                f"cd {working_dir} && {script_path} {args}",
                shell=True,
                capture_output=True,
                text=True,
                timeout=config.get("timeout", 300),
                executable="/bin/bash" if os.name != "nt" else None
            )
            
            output = result.stdout if result.stdout else result.stderr
            success = result.returncode == 0
            
            return {
                "success": success,
                "output": output[:10000],
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "exit_code": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": f"Script timed out after {config.get('timeout', 300)} seconds",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "error": "Timeout"
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Script execution failed: {str(e)}",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "error": str(e)
            }
    
    async def execute_webhook_task(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Call external webhook APIs"""
        webhook_url = config.get("url", "")
        payload = config.get("payload", {})
        method = config.get("method", "POST")
        headers = config.get("headers", {"Content-Type": "application/json"})
        
        if not webhook_url:
            return {
                "success": False,
                "output": "No webhook URL specified",
                "error": "Missing URL"
            }
        
        start_time = datetime.datetime.now()
        
        try:
            if method.upper() == "POST":
                response = requests.post(webhook_url, json=payload, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(webhook_url, json=payload, headers=headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(webhook_url, timeout=30)
            else:
                response = requests.get(webhook_url, params=payload, timeout=30)
            
            success = response.status_code in [200, 201, 202, 204]
            
            return {
                "success": success,
                "output": f"Webhook called: {response.status_code} - {response.text[:500]}",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "status_code": response.status_code
            }
        except Exception as e:
            return {
                "success": False,
                "output": f"Webhook failed: {str(e)}",
                "duration_ms": int((datetime.datetime.now() - start_time).total_seconds() * 1000),
                "error": str(e)
            }
    
    async def execute_task(self, task: Dict[str, Any]):
        """Execute a single automation task with proper logging"""
        task_id = task["id"]
        task_name = task["name"]
        task_type = task["task_type"]
        config = task.get("config", {})
        
        logger.info(f"Starting task: {task_name} (Type: {task_type})")
        
        # Create log entry in database
        log_entry = {
            "task_id": task_id,
            "task_name": task_name,
            "status": "running",
            "started_at": datetime.datetime.now().isoformat()
        }
        
        try:
            log_response = supabase.table("automation_logs").insert(log_entry).execute()
            log_id = log_response.data[0]["id"] if log_response.data else None
            
            start_time = datetime.datetime.now()
            
            # Execute based on task type
            if task_type == "run_scan":
                result = await self.execute_scan_task(config)
            elif task_type == "send_report":
                result = await self.execute_report_task(config)
            elif task_type == "backup_database":
                result = await self.execute_backup_task(config)
            elif task_type == "send_email":
                result = await self.execute_email_task(config)
            elif task_type == "run_script":
                result = await self.execute_script_task(config)
            elif task_type == "webhook":
                result = await self.execute_webhook_task(config)
            else:
                result = {
                    "success": False,
                    "output": f"Unknown task type: {task_type}",
                    "duration_ms": 0
                }
            
            end_time = datetime.datetime.now()
            duration_ms = result.get("duration_ms", int((end_time - start_time).total_seconds() * 1000))
            
            # Update log with result
            if log_id:
                supabase.table("automation_logs").update({
                    "status": "success" if result.get("success") else "failed",
                    "completed_at": end_time.isoformat(),
                    "duration_ms": duration_ms,
                    "output": result.get("output", "")[:5000],
                    "error_message": result.get("error", "")
                }).eq("id", log_id).execute()
            
            # Update task last_run
            supabase.table("automation_tasks").update({
                "last_run": end_time.isoformat()
            }).eq("id", task_id).execute()
            
            if result.get("success"):
                logger.info(f"Task {task_name} completed successfully in {duration_ms}ms")
            else:
                logger.warning(f"Task {task_name} failed: {result.get('error', 'Unknown error')}")
            
        except Exception as e:
            logger.error(f"Task {task_name} crashed: {e}")
            if 'log_id' in locals() and log_id:
                supabase.table("automation_logs").update({
                    "status": "failed",
                    "completed_at": datetime.datetime.now().isoformat(),
                    "error_message": str(e)
                }).eq("id", log_id).execute()
    
    def get_trigger(self, task: Dict[str, Any]):
        """Get APScheduler trigger for task"""
        schedule_type = task["schedule_type"]
        schedule_value = task["schedule_value"]
        
        try:
            if schedule_type == "cron":
                parts = schedule_value.split()
                if len(parts) == 5:
                    minute, hour, day, month, day_of_week = parts
                    return CronTrigger(
                        minute=minute, hour=hour, day=day,
                        month=month, day_of_week=day_of_week
                    )
                elif len(parts) == 6:
                    second, minute, hour, day, month, day_of_week = parts
                    return CronTrigger(
                        second=second, minute=minute, hour=hour,
                        day=day, month=month, day_of_week=day_of_week
                    )
            elif schedule_type == "interval":
                seconds = int(schedule_value)
                return IntervalTrigger(seconds=seconds)
            elif schedule_type == "once":
                run_date = datetime.datetime.fromisoformat(schedule_value)
                return DateTrigger(run_date=run_date)
        except Exception as e:
            logger.error(f"Failed to create trigger for task {task['name']}: {e}")
        
        return None
    
    async def start(self):
        """Start the scheduler with all enabled tasks"""
        tasks = await self.load_tasks()
        
        scheduled_count = 0
        for task in tasks:
            trigger = self.get_trigger(task)
            if trigger:
                self.scheduler.add_job(
                    self.execute_task,
                    trigger=trigger,
                    args=[task],
                    id=f"task_{task['id']}",
                    replace_existing=True,
                    misfire_grace_time=300
                )
                scheduled_count += 1
                logger.info(f"Scheduled task: {task['name']} (ID: {task['id']})")
            else:
                logger.warning(f"Could not schedule task: {task['name']} - invalid schedule")
        
        self.scheduler.start()
        logger.info(f"Automation scheduler started with {scheduled_count} tasks")
    
    async def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown(wait=False)
        logger.info("Automation scheduler stopped")

# Create global scheduler instance
scheduler = AutomationScheduler()

# Functions for FastAPI integration
async def start_scheduler():
    await scheduler.start()

async def stop_scheduler():
    await scheduler.stop()
