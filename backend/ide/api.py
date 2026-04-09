import os
import json
import subprocess
import asyncio
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from pathlib import Path
import shutil
from datetime import datetime

router = APIRouter()

# Base directory for IDE workspace (project root)
WORKSPACE_ROOT = os.getenv("IDE_WORKSPACE", os.getcwd())
ALLOWED_EXTENSIONS = [
    '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.scss', '.json',
    '.md', '.txt', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
    '.sh', '.bash', '.zsh', '.ps1', '.go', '.rs', '.java', '.c', '.cpp',
    '.h', '.hpp', '.php', '.sql', '.vue', '.svelte', '.xml', '.svg'
]

class FileOperation(BaseModel):
    path: str
    content: Optional[str] = None
    new_name: Optional[str] = None

class CreateFile(BaseModel):
    path: str
    content: str = ""
    is_directory: bool = False

@router.get("/files")
async def list_files(path: str = ""):
    """List files and directories in the workspace"""
    try:
        full_path = Path(WORKSPACE_ROOT) / path
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="Path not found")
        
        items = []
        for item in full_path.iterdir():
            # Skip hidden files and node_modules, .git
            if item.name.startswith('.') and item.name not in ['.env', '.gitignore']:
                continue
            if item.name in ['node_modules', '__pycache__', '.git', 'venv', 'env']:
                continue
            
            items.append({
                "name": item.name,
                "path": str(item.relative_to(WORKSPACE_ROOT)),
                "is_directory": item.is_dir(),
                "size": item.stat().st_size if item.is_file() else 0,
                "modified": datetime.fromtimestamp(item.stat().st_mtime).isoformat(),
                "extension": item.suffix if item.is_file() else None
            })
        
        # Sort: directories first, then files
        items.sort(key=lambda x: (not x["is_directory"], x["name"].lower()))
        return {"success": True, "data": items, "current_path": path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/file")
async def read_file(path: str):
    """Read a file's content"""
    try:
        full_path = Path(WORKSPACE_ROOT) / path
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        if full_path.is_dir():
            raise HTTPException(status_code=400, detail="Cannot read directory")
        
        # Check if file is text-based
        if full_path.suffix not in ALLOWED_EXTENSIONS:
            return {"success": True, "data": {"content": "[Binary file - cannot display]", "is_binary": True}}
        
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {
            "success": True,
            "data": {
                "content": content,
                "path": path,
                "size": full_path.stat().st_size,
                "modified": datetime.fromtimestamp(full_path.stat().st_mtime).isoformat(),
                "language": get_language_from_extension(full_path.suffix)
            }
        }
    except UnicodeDecodeError:
        return {"success": True, "data": {"content": "[Binary file - cannot display]", "is_binary": True}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/file")
async def write_file(operation: FileOperation):
    """Create or update a file"""
    try:
        full_path = Path(WORKSPACE_ROOT) / operation.path
        
        # Create parent directories if needed
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(operation.content or "")
        
        return {
            "success": True,
            "message": f"File saved: {operation.path}",
            "data": {
                "path": operation.path,
                "size": full_path.stat().st_size,
                "modified": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/file")
async def delete_file(path: str):
    """Delete a file or directory"""
    try:
        full_path = Path(WORKSPACE_ROOT) / path
        if not full_path.exists():
            raise HTTPException(status_code=404, detail="Path not found")
        
        if full_path.is_dir():
            shutil.rmtree(full_path)
        else:
            full_path.unlink()
        
        return {"success": True, "message": f"Deleted: {path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mkdir")
async def create_directory(operation: CreateFile):
    """Create a new directory"""
    try:
        full_path = Path(WORKSPACE_ROOT) / operation.path
        full_path.mkdir(parents=True, exist_ok=True)
        return {"success": True, "message": f"Directory created: {operation.path}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rename")
async def rename_file(operation: FileOperation):
    """Rename a file or directory"""
    try:
        old_path = Path(WORKSPACE_ROOT) / operation.path
        new_path = Path(WORKSPACE_ROOT) / operation.new_name
        
        if not old_path.exists():
            raise HTTPException(status_code=404, detail="Source not found")
        
        old_path.rename(new_path)
        return {"success": True, "message": f"Renamed to: {operation.new_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run-command")
async def run_command(command: str, working_dir: str = "."):
    """Execute a terminal command and return output"""
    try:
        full_working_dir = Path(WORKSPACE_ROOT) / working_dir
        
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=60,
            cwd=str(full_working_dir),
            executable="/bin/bash" if os.name != "nt" else None
        )
        
        return {
            "success": True,
            "output": result.stdout if result.stdout else result.stderr,
            "exit_code": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "Command timed out after 60 seconds",
            "exit_code": -1
        }
    except Exception as e:
        return {
            "success": False,
            "output": str(e),
            "exit_code": -1
        }

@router.get("/languages")
async def get_languages():
    """Get supported languages and their configurations"""
    return {
        "success": True,
        "data": LANGUAGES
    }

def get_language_from_extension(ext: str) -> str:
    """Get language ID from file extension"""
    ext = ext.lower()
    for lang_id, config in LANGUAGES.items():
        if ext in config.get("extensions", []):
            return lang_id
    return "plaintext"

LANGUAGES = {
    "python": {
        "name": "Python",
        "extensions": [".py", ".pyw"],
        "comment": "#",
        "run_command": "python {file}"
    },
    "javascript": {
        "name": "JavaScript",
        "extensions": [".js", ".mjs", ".cjs"],
        "comment": "//",
        "run_command": "node {file}"
    },
    "typescript": {
        "name": "TypeScript",
        "extensions": [".ts", ".tsx"],
        "comment": "//",
        "run_command": "ts-node {file}"
    },
    "jsx": {
        "name": "React JSX",
        "extensions": [".jsx"],
        "comment": "//",
        "run_command": "node {file}"
    },
    "tsx": {
        "name": "React TSX",
        "extensions": [".tsx"],
        "comment": "//",
        "run_command": "ts-node {file}"
    },
    "html": {
        "name": "HTML",
        "extensions": [".html", ".htm"],
        "comment": "<!-- -->",
        "run_command": None
    },
    "css": {
        "name": "CSS",
        "extensions": [".css", ".scss", ".sass", ".less"],
        "comment": "/* */",
        "run_command": None
    },
    "json": {
        "name": "JSON",
        "extensions": [".json"],
        "comment": None,
        "run_command": None
    },
    "markdown": {
        "name": "Markdown",
        "extensions": [".md", ".markdown"],
        "comment": None,
        "run_command": None
    },
    "go": {
        "name": "Go",
        "extensions": [".go"],
        "comment": "//",
        "run_command": "go run {file}"
    },
    "rust": {
        "name": "Rust",
        "extensions": [".rs"],
        "comment": "//",
        "run_command": "rustc {file} && ./{output}"
    },
    "java": {
        "name": "Java",
        "extensions": [".java"],
        "comment": "//",
        "run_command": "javac {file} && java {classname}"
    },
    "php": {
        "name": "PHP",
        "extensions": [".php"],
        "comment": "//",
        "run_command": "php {file}"
    },
    "sql": {
        "name": "SQL",
        "extensions": [".sql"],
        "comment": "--",
        "run_command": None
    },
    "bash": {
        "name": "Bash",
        "extensions": [".sh", ".bash", ".zsh"],
        "comment": "#",
        "run_command": "bash {file}"
    },
    "powershell": {
        "name": "PowerShell",
        "extensions": [".ps1"],
        "comment": "#",
        "run_command": "powershell -File {file}"
    },
    "yaml": {
        "name": "YAML",
        "extensions": [".yaml", ".yml"],
        "comment": "#",
        "run_command": None
    },
    "dockerfile": {
        "name": "Dockerfile",
        "extensions": [".dockerfile"],
        "comment": "#",
        "run_command": None
    },
    "plaintext": {
        "name": "Plain Text",
        "extensions": [".txt", ".log", ".cfg", ".conf", ".ini"],
        "comment": None,
        "run_command": None
    }
}
import asyncio
import subprocess
import os
import signal
import threading
import queue
from fastapi import WebSocket, WebSocketDisconnect
import logging

logger = logging.getLogger(__name__)

class TerminalSession:
    def __init__(self, websocket: WebSocket, working_dir: str = "."):
        self.websocket = websocket
        self.working_dir = working_dir
        self.process = None
        self.read_thread = None
        self.is_running = False
    
    async def start(self):
        """Start a new terminal process"""
        self.is_running = True
        
        # Use appropriate shell based on OS
        if os.name == "nt":  # Windows
            shell_cmd = ["cmd.exe"]
        else:  # Linux/Mac
            shell_cmd = ["/bin/bash"]
        
        try:
            self.process = subprocess.Popen(
                shell_cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                cwd=self.working_dir,
                bufsize=1,
                universal_newlines=True
            )
            
            # Start reading output in background
            self.read_thread = threading.Thread(target=self.read_output, daemon=True)
            self.read_thread.start()
            
            await self.websocket.send_json({"type": "ready", "message": "Terminal ready"})
            
        except Exception as e:
            await self.websocket.send_json({"type": "error", "message": str(e)})
    
    def read_output(self):
        """Read terminal output and send to websocket"""
        while self.is_running and self.process and self.process.stdout:
            try:
                output = self.process.stdout.readline()
                if output:
                    asyncio.run(self.send_output(output))
                elif self.process.poll() is not None:
                    break
            except Exception as e:
                asyncio.run(self.send_output(f"\r\nError: {e}\r\n"))
                break
    
    async def send_output(self, output: str):
        """Send output to websocket"""
        try:
            await self.websocket.send_json({"type": "output", "data": output})
        except:
            pass
    
    async def write(self, data: str):
        """Write to terminal input"""
        if self.process and self.process.stdin:
            try:
                self.process.stdin.write(data)
                self.process.stdin.flush()
            except Exception as e:
                await self.websocket.send_json({"type": "error", "message": str(e)})
    
    async def resize(self, rows: int, cols: int):
        """Resize terminal (optional)"""
        if os.name != "nt" and self.process:
            try:
                import fcntl
                import termios
                import struct
                fcntl.ioctl(self.process.stdin.fileno(), termios.TIOCSWINSZ,
                           struct.pack("HHHH", rows, cols, 0, 0))
            except:
                pass
    
    async def stop(self):
        """Stop the terminal process"""
        self.is_running = False
        if self.process:
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()

# Store active terminal sessions
active_terminals = {}

@router.websocket("/ws/terminal/{session_id}")
async def terminal_websocket(websocket: WebSocket, session_id: str):
    """WebSocket endpoint for terminal sessions"""
    await websocket.accept()
    
    # Get working directory from query params
    query_params = websocket.query_params
    working_dir = query_params.get("working_dir", ".")
    
    terminal = TerminalSession(websocket, working_dir)
    active_terminals[session_id] = terminal
    
    await terminal.start()
    
    try:
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "input":
                await terminal.write(data.get("data", ""))
            elif data.get("type") == "resize":
                await terminal.resize(data.get("rows", 24), data.get("cols", 80))
            elif data.get("type") == "stop":
                break
                
    except WebSocketDisconnect:
        pass
    finally:
        await terminal.stop()
        if session_id in active_terminals:
            del active_terminals[session_id]
