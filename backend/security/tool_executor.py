import subprocess
import json
import asyncio
import httpx
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
router = APIRouter()
# Tool definitions with real commands
TOOLS = {
    # CATEGORY 1: Information Gathering (11 tools)
    "nmap": {"command": "nmap", "category": "Information Gathering", "description": "Network discovery and security scanning", "options": ["-sV", "-sS", "-A", "-p-", "-T4"]},
    "whois": {"command": "whois", "category": "Information Gathering", "description": "Domain registration lookup", "options": ["-h"]},
    "dig": {"command": "dig", "category": "Information Gathering", "description": "DNS lookup utility", "options": ["+short", "ANY", "MX", "NS"]},
    "nslookup": {"command": "nslookup", "category": "Information Gathering", "description": "DNS query tool", "options": ["-type=MX", "-type=NS", "-type=TXT"]},
    "theHarvester": {"command": "theHarvester", "category": "Information Gathering", "description": "Email, domain, and subdomain reconnaissance", "options": ["-d", "-l", "-b all"]},
    "maltego": {"command": "maltego", "category": "Information Gathering", "description": "Visual link analysis and OSINT", "options": ["--help"]},
    "recon-ng": {"command": "recon-ng", "category": "Information Gathering", "description": "Web reconnaissance framework", "options": ["-r"]},
    "shodan-cli": {"command": "shodan", "category": "Information Gathering", "description": "Search internet-connected devices", "options": ["host", "search", "stats"]},
    "amass": {"command": "amass", "category": "Information Gathering", "description": "Subdomain enumeration", "options": ["enum", "-d"]},
    "subfinder": {"command": "subfinder", "category": "Information Gathering", "description": "Fast subdomain discovery", "options": ["-d", "-v"]},
    "dnsx": {"command": "dnsx", "category": "Information Gathering", "description": "DNS toolkit for bulk queries", "options": ["-d", "-resp"]},
    "dnsrecon": {"command": "dnsrecon", "category": "Information Gathering", "description": "DNS enumeration", "options": ["-d", "-t std"]},
    # CATEGORY 2: Network Analysis (11 tools)
    "wireshark": {"command": "wireshark", "category": "Network Analysis", "description": "Packet capture and analysis", "options": ["-h"]},
    "tshark": {"command": "tshark", "category": "Network Analysis", "description": "Command-line packet analyzer", "options": ["-i", "-f", "-w"]},
    "tcpdump": {"command": "tcpdump", "category": "Network Analysis", "description": "Command-line packet analyzer", "options": ["-i", "-n", "-c 10"]},
    "netdiscover": {"command": "netdiscover", "category": "Network Analysis", "description": "ARP reconnaissance tool", "options": ["-r", "-i"]},
    "arp-scan": {"command": "arp-scan", "category": "Network Analysis", "description": "ARP scanner for LAN hosts", "options": ["-l", "--interface"]},
    "masscan": {"command": "masscan", "category": "Network Analysis", "description": "Fast port scanner", "options": ["-p", "--rate=1000"]},
    "hping3": {"command": "hping3", "category": "Network Analysis", "description": "TCP/IP packet generator", "options": ["-S", "-p", "-c 4"]},
    "ettercap": {"command": "ettercap", "category": "Network Analysis", "description": "Comprehensive network sniffer", "options": ["-T", "-M arp"]},
    "bettercap": {"command": "bettercap", "category": "Network Analysis", "description": "Network, web and BLE attacks", "options": ["-iface", "-eval"]},
    "ss": {"command": "ss", "category": "Network Analysis", "description": "Socket statistics", "options": ["-tuln", "-pan"]},
    "netstat": {"command": "netstat", "category": "Network Analysis", "description": "Network statistics and connections", "options": ["-an", "-tuln"]},
    "smbclient": {"command": "smbclient", "category": "Network Analysis", "description": "SMB/CIFS client", "options": ["-L", "-U"]},
    "enum4linux": {"command": "enum4linux", "category": "Network Analysis", "description": "Linux enumeration of Windows systems", "options": ["-a", "-u"]},
    # CATEGORY 3: Vulnerability Scanning (11 tools)
    "nikto": {"command": "nikto", "category": "Vulnerability Scanning", "description": "Web server vulnerability scanner", "options": ["-h"]},
    "openvas": {"command": "openvas", "category": "Vulnerability Scanning", "description": "Vulnerability assessment", "options": ["-V"]},
    "sqlmap": {"command": "sqlmap", "category": "Vulnerability Scanning", "description": "Automatic SQL injection detection", "options": ["-u", "--batch", "--dbs"]},
    "wpscan": {"command": "wpscan", "category": "Vulnerability Scanning", "description": "WordPress security scanner", "options": ["--url", "--enumerate p"]},
    "nessus-cli": {"command": "nessus", "category": "Vulnerability Scanning", "description": "Vulnerability scanner", "options": ["--help"]},
    "nuclei": {"command": "nuclei", "category": "Vulnerability Scanning", "description": "Fast vulnerability scanner", "options": ["-u", "-t"]},
    "gobuster": {"command": "gobuster", "category": "Vulnerability Scanning", "description": "Directory and file brute-force", "options": ["dir -u", "dns -d"]},
    "ffuf": {"command": "ffuf", "category": "Vulnerability Scanning", "description": "Fast web fuzzer", "options": ["-u", "-w"]},
    "dirb": {"command": "dirb", "category": "Vulnerability Scanning", "description": "Web content scanner", "options": ["-h"]},
    "wfuzz": {"command": "wfuzz", "category": "Vulnerability Scanning", "description": "Web fuzzer", "options": ["-u", "-z"]},
    "commix": {"command": "commix", "category": "Vulnerability Scanning", "description": "Command injection exploiter", "options": ["--url", "--batch"]},
    # CATEGORY 4: Password & Authentication (7 tools)
    "hydra": {"command": "hydra", "category": "Password Attacks", "description": "Fast login cracker", "options": ["-l", "-P", "-t 4"]},
    "john": {"command": "john", "category": "Password Attacks", "description": "John the Ripper password cracker", "options": ["--wordlist="]},
    "hashcat": {"command": "hashcat", "category": "Password Attacks", "description": "GPU-accelerated password cracker", "options": ["-m", "-a"]},
    "crunch": {"command": "crunch", "category": "Password Attacks", "description": "Password list generator", "options": ["-h"]},
    "medusa": {"command": "medusa", "category": "Password Attacks", "description": "Parallel password cracker", "options": ["-h", "-u", "-P"]},
    "patator": {"command": "patator", "category": "Password Attacks", "description": "Multi-purpose brute-forcer", "options": ["--help"]},
    "cewl": {"command": "cewl", "category": "Password Attacks", "description": "Custom wordlist generator", "options": ["-w", "-d"]},
    # CATEGORY 5: Exploitation & Post-Exploitation (5 tools)
    "metasploit": {"command": "msfconsole", "category": "Exploitation", "description": "Exploit framework", "options": ["-q", "-x"]},
    "msfvenom": {"command": "msfvenom", "category": "Exploitation", "description": "Payload generator", "options": ["-p", "-f"]},
    "beef": {"command": "beef", "category": "Exploitation", "description": "Browser exploitation framework", "options": ["--help"]},
    "exploit-db": {"command": "searchsploit", "category": "Exploitation", "description": "Exploit database search", "options": ["-w"]},
    "searchsploit": {"command": "searchsploit", "category": "Exploitation", "description": "Local exploit-db search", "options": ["-t"]},
    # CATEGORY 6: Digital Forensics & Analysis (8 tools)
    "autopsy": {"command": "autopsy", "category": "Forensics", "description": "Digital forensics platform", "options": ["--help"]},
    "volatility": {"command": "volatility", "category": "Forensics", "description": "Memory forensics framework", "options": ["-f", "--profile"]},
    "binwalk": {"command": "binwalk", "category": "Forensics", "description": "Firmware analysis tool", "options": ["-e", "-B"]},
    "foremost": {"command": "foremost", "category": "Forensics", "description": "File carving tool", "options": ["-i", "-o"]},
    "strings": {"command": "strings", "category": "Forensics", "description": "Extract text from binary files", "options": ["-n 6"]},
    "hexdump": {"command": "hexdump", "category": "Forensics", "description": "Binary file viewer", "options": ["-C"]},
    "exiftool": {"command": "exiftool", "category": "Forensics", "description": "Metadata extractor", "options": ["-h"]},
    "steghide": {"command": "steghide", "category": "Forensics", "description": "Steganography tool", "options": ["extract", "-sf"]},
    "stegcracker": {"command": "stegcracker", "category": "Forensics", "description": "Steganography brute-force", "options": ["--help"]},
    # CATEGORY 7: Web Application Testing (6 tools)
    "burpsuite": {"command": "burpsuite", "category": "Web Application", "description": "Web security testing", "options": ["--help"]},
    "zaproxy": {"command": "zaproxy", "category": "Web Application", "description": "OWASP ZAP web scanner", "options": ["-cmd"]},
    "arjun": {"command": "arjun", "category": "Web Application", "description": "HTTP parameter discovery", "options": ["-u"]},
    "dalfox": {"command": "dalfox", "category": "Web Application", "description": "XSS scanner", "options": ["url"]},
    # CATEGORY 8: Wireless Testing (5 tools)
    "aircrack-ng": {"command": "aircrack-ng", "category": "Wireless", "description": "WiFi security auditing", "options": ["-a"]},
    "airmon-ng": {"command": "airmon-ng", "category": "Wireless", "description": "Monitor mode manager", "options": ["start", "stop"]},
    "airodump-ng": {"command": "airodump-ng", "category": "Wireless", "description": "Wireless packet capture", "options": ["--interface"]},
    "reaver": {"command": "reaver", "category": "Wireless", "description": "WPS brute force attack", "options": ["-i", "-b"]},
    "wifite": {"command": "wifite", "category": "Wireless", "description": "Automated wireless auditor", "options": ["--kill"]},
    # CATEGORY 9: Cryptography & Encoding (6 tools)
    "openssl": {"command": "openssl", "category": "Cryptography", "description": "Cryptography toolkit", "options": ["genrsa", "aes-256-cbc"]},
    "gpg": {"command": "gpg", "category": "Cryptography", "description": "GNU Privacy Guard", "options": ["--encrypt", "--decrypt"]},
    "base64": {"command": "base64", "category": "Cryptography", "description": "Encoding/decoding", "options": ["-d"]},
    "xxd": {"command": "xxd", "category": "Cryptography", "description": "Hex dump creator", "options": ["-p", "-r"]},
    # CATEGORY 10: System & Network Administration (7 tools)
    "htop": {"command": "htop", "category": "System Security", "description": "System resource monitor", "options": ["--help"]},
    "btop": {"command": "btop", "category": "System Security", "description": "System resource monitor", "options": ["--help"]},
    "fail2ban": {"command": "fail2ban-client", "category": "System Security", "description": "Intrusion prevention", "options": ["status"]},
    "lynis": {"command": "lynis", "category": "System Security", "description": "System security auditing", "options": ["audit system"]},
    "rkhunter": {"command": "rkhunter", "category": "System Security", "description": "Rootkit detection", "options": ["--check"]},
    "chkrootkit": {"command": "chkrootkit", "category": "System Security", "description": "Rootkit checker", "options": ["-h"]},
    "ping": {"command": "ping", "category": "Network Analysis", "description": "Connectivity test", "options": ["-c 4"]},
    "curl": {"command": "curl", "category": "Network Analysis", "description": "Data transfer tool", "options": ["-I", "-v"]}
}
class ToolRequest(BaseModel):
    tool: str
    target: str
    options: Optional[str] = None
class AIAnalysisRequest(BaseModel):
    tool: str
    output: str
async def analyze_with_ollama(tool: str, output: str) -> Dict[str, Any]:
    """Send tool output to Ollama for AI analysis"""
    prompt = f"""
Analyze this security tool output from '{tool}'. Provide:
1. SUMMARY: What was found (2-3 sentences)
2. SEVERITY: Critical/High/Medium/Low/Info
3. FINDINGS: List key findings (bullet points)
4. RECOMMENDATIONS: Actionable next steps
Tool Output:
{output[:3000]}
Respond in JSON format:
{{"summary": "...", "severity": "...", "findings": ["..."], "recommendations": ["..."]}}
"""
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen2.5:7b",
                    "prompt": prompt,
                    "stream": False
                }
            )
            result = response.json()
            # Try to parse JSON response
            try:
                return json.loads(result.get("response", "{}"))
            except:
                return {
                    "summary": result.get("response", "Analysis completed")[:500],
                    "severity": "Info",
                    "findings": ["See raw output for details"],
                    "recommendations": ["Review the output carefully"]
                }
    except Exception as e:
        return {
            "summary": f"AI analysis failed: {str(e)}",
            "severity": "Info",
            "findings": ["Ollama may not be running"],
            "recommendations": ["Start Ollama with: ollama serve", "Pull model: ollama pull qwen2.5:7b"]
        }
def execute_tool(tool: str, target: str, options: str = "") -> Dict[str, Any]:
    """Execute a real system tool with cross-platform support"""
    tool_info = TOOLS.get(tool)
    if not tool_info:
        return {"error": f"Tool '{tool}' not found", "output": "", "success": False}

    # Build the command
    cmd_parts = [tool_info["command"]]
    if options:
        cmd_parts.extend(options.split())  # Split options properly
    if target and target != "default":
        cmd_parts.append(target)
    command = " ".join(cmd_parts)

    # Cross-platform execution strategies
    execution_strategies = []

    if os.name == "nt":  # Windows
        # Strategy 1: Direct Windows command (for Windows-native tools)
        execution_strategies.append({
            "method": "direct",
            "command": command,
            "shell": True
        })

        # Strategy 2: WSL (Windows Subsystem for Linux)
        execution_strategies.append({
            "method": "wsl",
            "command": f'wsl {command}',
            "shell": True
        })

        # Strategy 3: Git Bash
        git_bash_paths = [
            "C:\\Program Files\\Git\\bin\\bash.exe",
            "C:\\Program Files (x86)\\Git\\bin\\bash.exe",
            "C:\\Git\\bin\\bash.exe"
        ]
        for bash_path in git_bash_paths:
            if os.path.exists(bash_path):
                execution_strategies.append({
                    "method": "gitbash",
                    "command": f'"{bash_path}" -c "{command}"',
                    "shell": True
                })
                break

        # Strategy 4: Docker (for Linux tools)
        docker_commands = {
            "nmap": 'docker run --rm instrumentisto/nmap',
            "nikto": 'docker run --rm sullo/nikto',
            "sqlmap": 'docker run --rm paoloo/sqlmap',
            "nuclei": 'docker run --rm projectdiscovery/nuclei',
            "gobuster": 'docker run --rm ojasookert/gobuster',
            "ffuf": 'docker run --rm ffuf/ffuf',
            "amass": 'docker run --rm caffix/amass',
            "subfinder": 'docker run --rm projectdiscovery/subfinder',
            "dnsx": 'docker run --rm projectdiscovery/dnsx',
            "masscan": 'docker run --rm uzyexe/masscan',
            "wpscan": 'docker run --rm wpscanteam/wpscan',
            "dirb": 'docker run --rm hackingyseguridad/dirb',
            "hydra": 'docker run --rm vanhauser/hydra',
            "john": 'docker run --rm openwall/john',
            "hashcat": 'docker run --rm hashcat/hashcat',
            "metasploit": 'docker run --rm -it metasploitframework/metasploit-framework',
            "volatility": 'docker run --rm sk4la/volatility',
            "binwalk": 'docker run --rm craff/binwalk',
            "exiftool": 'docker run --rm beevelop/exiftool',
            "burpsuite": 'docker run --rm -p 8080:8080 portswigger/burpsuite-community',
            "zaproxy": 'docker run --rm -p 8080:8080 owasp/zap2docker-stable',
            "dalfox": 'docker run --rm hahwul/dalfox',
            "aircrack-ng": 'docker run --rm aircrack-ng',
            "openssl": 'docker run --rm -it frapsoft/openssl',
            "curl": 'docker run --rm curlimages/curl',
            "ping": 'docker run --rm alpine ping'
        }

        if tool in docker_commands:
            docker_cmd = docker_commands[tool]
            if options:
                docker_cmd += f" {options}"
            if target and target != "default":
                docker_cmd += f" {target}"
            execution_strategies.append({
                "method": "docker",
                "command": docker_cmd,
                "shell": True
            })

    else:  # Linux/Unix
        execution_strategies.append({
            "method": "direct",
            "command": command,
            "shell": True
        })

    # Try each execution strategy
    last_error = None
    for strategy in execution_strategies:
        try:
            result = subprocess.run(
                strategy["command"],
                shell=strategy["shell"],
                capture_output=True,
                text=True,
                timeout=60,  # Increased timeout for tools
                cwd=os.getcwd()
            )

            output = result.stdout if result.stdout else result.stderr
            if not output:
                output = "Command executed but produced no output"

            # Check if command actually ran (not just "command not found")
            if result.returncode == 0 or (result.returncode != 0 and output and "not found" not in output.lower()):
                return {
                    "success": True,
                    "output": output[:10000],  # Increased limit
                    "command": strategy["command"],
                    "method": strategy["method"],
                    "exit_code": result.returncode
                }
            else:
                last_error = output

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": f"Command timed out after 60 seconds using {strategy['method']}",
                "command": strategy["command"],
                "method": strategy["method"],
                "error": "Timeout"
            }
        except Exception as e:
            last_error = str(e)
            continue

    # If all strategies failed
    return {
        "success": False,
        "output": f"Tool execution failed. Last error: {last_error or 'Unknown error'}",
        "command": command,
        "error": "All execution methods failed"
    }
@router.post("/run-tool")
async def run_tool(request: ToolRequest):
    """Run a security tool and return output"""
    result = execute_tool(request.tool, request.target, request.options)
    return result
@router.post("/analyze")
async def analyze_output(request: AIAnalysisRequest):
    """Analyze tool output with Ollama AI"""
    analysis = await analyze_with_ollama(request.tool, request.output)
    return analysis
@router.get("/tools")
async def get_tools():
    """Get all available tools grouped by category"""
    categories = {}
    for tool, info in TOOLS.items():
        cat = info["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append({
            "name": tool,
            "description": info["description"],
            "options": info.get("options", [])
        })
    return categories
@router.get("/check-ollama")
async def check_ollama():
    """Check if Ollama is running"""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                models = response.json().get("models", [])
                return {
                    "running": True,
                    "models": [m["name"] for m in models]
                }
    except:
        pass
    return {"running": False, "models": []}
