"""Linux security tool runner — executes whitelisted commands via subprocess with cross-platform support."""
import asyncio
import os
import subprocess
import platform
import shutil
from security.tool_registry import get_all_tools

class LinuxToolRunner:
    """Runs whitelisted Linux security tools with timeout and safety."""
    TIMEOUT = 60  # seconds
    
    # Docker image mappings for common tools
    DOCKER_IMAGES = {
        "nmap": "instrumentisto/nmap",
        "nikto": "sullo/nikto",
        "sqlmap": "paoloo/sqlmap",
        "nuclei": "projectdiscovery/nuclei",
        "gobuster": "ojasookert/gobuster",
        "ffuf": "ffuf/ffuf",
        "amass": "caffix/amass",
        "subfinder": "projectdiscovery/subfinder",
        "dnsx": "projectdiscovery/dnsx",
        "masscan": "uzyexe/masscan",
        "wpscan": "wpscanteam/wpscan",
        "dirb": "hackingyseguridad/dirb",
        "hydra": "vanhauser/hydra",
        "john": "openwall/john",
        "hashcat": "hashcat/hashcat",
        "volatility": "sk4la/volatility",
        "binwalk": "craff/binwalk",
        "exiftool": "beevelop/exiftool",
        "dalfox": "hahwul/dalfox",
        "openssl": "frapsoft/openssl",
        "curl": "curlimages/curl",
        "ping": "alpine",
    }

    async def run_tool(self, tool: str, args: list[str] = None, target: str = None) -> str:
        """Execute a tool and return stdout+stderr with cross-platform support."""
        all_tools = get_all_tools()
        if tool not in all_tools:
            raise ValueError(f"Tool '{tool}' not whitelisted")

        # Build command
        cmd_parts = [tool]
        if args:
            cmd_parts.extend(args)
        if target and target != "default":
            cmd_parts.append(target)

        # Try different execution strategies
        strategies = self._get_execution_strategies(tool, cmd_parts)
        
        last_error = None
        for strategy_name, strategy_cmd in strategies:
            try:
                return await self._execute_strategy(strategy_name, strategy_cmd, cmd_parts)
            except Exception as e:
                last_error = str(e)
                continue

        # If all strategies fail
        raise Exception(f"Tool execution failed. Last error: {last_error or 'Unknown'}")

    def _get_execution_strategies(self, tool: str, cmd_parts: list[str]) -> list[tuple[str, any]]:
        """Get execution strategies based on platform."""
        strategies = []
        
        if platform.system() == "Windows":
            # Strategy 1: Direct Windows command (for Windows-native tools like ping, curl)
            strategies.append(("direct", cmd_parts))
            
            # Strategy 2: WSL (Windows Subsystem for Linux) 
            strategies.append(("wsl", ["wsl"] + cmd_parts))
            
            # Strategy 3: Git Bash
            git_bash_paths = [
                r"C:\Program Files\Git\bin\bash.exe",
                r"C:\Program Files (x86)\Git\bin\bash.exe",
                r"C:\Git\bin\bash.exe"
            ]
            for bash_path in git_bash_paths:
                if os.path.exists(bash_path):
                    bash_cmd = ' '.join(cmd_parts)
                    strategies.append(("gitbash", [bash_path, "-c", bash_cmd]))
                    break
            
            # Strategy 4: Docker
            if tool in self.DOCKER_IMAGES:
                docker_image = self.DOCKER_IMAGES[tool]
                docker_cmd = ["docker", "run", "--rm", docker_image] + cmd_parts
                strategies.append(("docker", docker_cmd))
        else:
            # Linux/Unix: Direct execution
            strategies.append(("direct", cmd_parts))

        return strategies

    async def _execute_strategy(self, strategy_name: str, cmd: list[str], original_cmd: list[str]) -> str:
        """Execute a single strategy."""
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=self.TIMEOUT)
            
            output = stdout.decode("utf-8", errors="replace")
            if stderr:
                err_text = stderr.decode("utf-8", errors="replace")
                if err_text.strip():
                    output += f"\n--- STDERR ---\n{err_text}"
            
            # Check for "command not found" errors
            if "not found" in output.lower() and proc.returncode != 0:
                raise Exception(f"Tool not found via {strategy_name}")
            
            return output or "(no output)"
        except asyncio.TimeoutError:
            raise asyncio.TimeoutError(f"Tool timed out after {self.TIMEOUT}s")
        except Exception as e:
            raise Exception(f"Strategy '{strategy_name}' failed: {str(e)}")
