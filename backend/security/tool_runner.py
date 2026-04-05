"""Linux security tool runner — executes whitelisted commands via subprocess."""
import asyncio
import platform
import shutil
from security.tool_registry import get_all_tools


class LinuxToolRunner:
    """Runs whitelisted Linux security tools with timeout and safety."""

    TIMEOUT = 60  # seconds

    async def run_tool(self, tool: str, args: list[str] = None, target: str = None) -> str:
        """Execute a tool and return stdout+stderr."""
        all_tools = get_all_tools()
        if tool not in all_tools:
            raise ValueError(f"Tool '{tool}' not whitelisted")

        cmd_parts = [tool]
        if args:
            cmd_parts.extend(args)
        if target:
            cmd_parts.append(target)

        # Check if tool exists on system
        tool_path = shutil.which(tool)
        if not tool_path:
            # Try Docker Kali if on non-Linux
            if platform.system() != "Linux":
                return await self._run_in_docker(cmd_parts)
            raise FileNotFoundError(f"Tool '{tool}' not found on this system. Install it first.")

        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd_parts,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=self.TIMEOUT)
            output = stdout.decode("utf-8", errors="replace")
            if stderr:
                err_text = stderr.decode("utf-8", errors="replace")
                if err_text.strip():
                    output += f"\n--- STDERR ---\n{err_text}"
            return output or "(no output)"
        except asyncio.TimeoutError:
            proc.kill()
            raise asyncio.TimeoutError(f"Tool '{tool}' timed out after {self.TIMEOUT}s")

    async def _run_in_docker(self, cmd_parts: list[str]) -> str:
        """Fallback: run tool inside Docker Kali container."""
        docker_cmd = [
            "docker", "run", "--rm", "--network=host",
            "kalilinux/kali-rolling",
            *cmd_parts,
        ]
        try:
            proc = await asyncio.create_subprocess_exec(
                *docker_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=self.TIMEOUT)
            output = stdout.decode("utf-8", errors="replace")
            if stderr:
                output += f"\n{stderr.decode('utf-8', errors='replace')}"
            return output or "(no output from Docker)"
        except FileNotFoundError:
            return f"Error: Neither '{cmd_parts[0]}' nor Docker is available. Install the tool or Docker."
        except asyncio.TimeoutError:
            return f"Docker execution timed out after {self.TIMEOUT}s"
