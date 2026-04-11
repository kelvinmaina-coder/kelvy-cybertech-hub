"""Registry of all 70+ whitelisted security tools across 10 categories."""
TOOL_REGISTRY = {
    "information_gathering": {
        "label": "Information Gathering",
        "tools": ["nmap", "whois", "dig", "nslookup", "theHarvester", "maltego", "recon-ng", "shodan-cli", "amass", "subfinder", "dnsx"],
    },
    "network_analysis": {
        "label": "Network Analysis",
        "tools": ["wireshark", "tshark", "tcpdump", "netdiscover", "arp-scan", "masscan", "hping3", "ettercap", "bettercap", "ss", "netstat"],
    },
    "vulnerability_scanning": {
        "label": "Vulnerability Scanning",
        "tools": ["nikto", "openvas", "sqlmap", "wpscan", "nessus-cli", "nuclei", "gobuster", "ffuf", "dirb", "wfuzz"],
    },
    "password_auth": {
        "label": "Password & Authentication",
        "tools": ["hydra", "john", "hashcat", "crunch", "medusa", "patator", "cewl"],
    },
    "exploitation": {
        "label": "Exploitation",
        "tools": ["metasploit", "msfvenom", "beef", "exploit-db", "searchsploit"],
    },
    "digital_forensics": {
        "label": "Digital Forensics",
        "tools": ["autopsy", "volatility", "binwalk", "foremost", "strings", "hexdump", "exiftool", "steghide", "stegcracker"],
    },
    "web_testing": {
        "label": "Web Testing",
        "tools": ["burpsuite", "zaproxy", "arjun", "dalfox", "commix"],
    },
    "wireless_testing": {
        "label": "Wireless Testing",
        "tools": ["aircrack-ng", "airmon-ng", "airodump-ng", "reaver", "wifite"],
    },
    "cryptography": {
        "label": "Cryptography",
        "tools": ["openssl", "gpg", "base64", "xxd"],
    },
    "system_admin": {
        "label": "System Administration",
        "tools": ["htop", "btop", "iptables", "fail2ban", "lynis", "rkhunter", "chkrootkit", "ping", "curl", "smbclient", "enum4linux", "dnsrecon"],
    },
}
def get_all_tools() -> set[str]:
    """Return a flat set of all tool names."""
    tools = set()
    for cat in TOOL_REGISTRY.values():
        tools.update(cat["tools"])
    return tools
