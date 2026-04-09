import asyncio
import subprocess
import json
import os
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import psutil
import socket
import nmap
from ping3 import ping
import requests

router = APIRouter()

# Store active network data
network_devices: Dict[str, Dict] = {}
bandwidth_history: List[Dict] = []
alerts: List[Dict] = []

class DeviceScan(BaseModel):
    subnet: str = "192.168.1.0/24"

class BandwidthData(BaseModel):
    timestamp: str
    upload: float
    download: float
    total: float

@router.get("/devices")
async def get_devices():
    """Get all discovered network devices"""
    return {"success": True, "data": list(network_devices.values())}

@router.post("/scan")
async def scan_network(scan: DeviceScan):
    """Scan network for devices"""
    devices = await perform_network_scan(scan.subnet)
    return {"success": True, "data": devices}

@router.get("/bandwidth")
async def get_bandwidth():
    """Get current bandwidth usage"""
    stats = await get_network_stats()
    return {"success": True, "data": stats}

@router.get("/bandwidth/history")
async def get_bandwidth_history(hours: int = 24):
    """Get bandwidth history"""
    cutoff = datetime.now() - timedelta(hours=hours)
    history = [h for h in bandwidth_history if datetime.fromisoformat(h["timestamp"]) > cutoff]
    return {"success": True, "data": history}

@router.get("/alerts")
async def get_alerts():
    """Get network alerts"""
    return {"success": True, "data": alerts}

@router.get("/topology")
async def get_topology():
    """Get network topology data"""
    topology = await build_network_topology()
    return {"success": True, "data": topology}

@router.get("/interfaces")
async def get_interfaces():
    """Get network interfaces"""
    interfaces = []
    for iface, addrs in psutil.net_if_addrs().items():
        for addr in addrs:
            if addr.family == socket.AF_INET:
                interfaces.append({
                    "name": iface,
                    "ip": addr.address,
                    "netmask": addr.netmask,
                    "is_up": iface in psutil.net_if_stats() and psutil.net_if_stats()[iface].isup
                })
                break
    return {"success": True, "data": interfaces}

@router.get("/connections")
async def get_connections():
    """Get active network connections"""
    connections = []
    for conn in psutil.net_connections(kind='inet'):
        if conn.status == 'ESTABLISHED':
            connections.append({
                "local_ip": conn.laddr.ip if conn.laddr else None,
                "local_port": conn.laddr.port if conn.laddr else None,
                "remote_ip": conn.raddr.ip if conn.raddr else None,
                "remote_port": conn.raddr.port if conn.raddr else None,
                "status": conn.status,
                "pid": conn.pid
            })
    return {"success": True, "data": connections[:100]}

async def perform_network_scan(subnet: str) -> List[Dict]:
    """Perform network scan using nmap"""
    devices = []
    
    try:
        # Use nmap for network discovery
        nm = nmap.PortScanner()
        nm.scan(hosts=subnet, arguments='-sn -T4')
        
        for host in nm.all_hosts():
            device = {
                "ip": host,
                "hostname": nm[host].hostname() if nm[host].hostname() else "",
                "mac": nm[host]['addresses'].get('mac', 'Unknown'),
                "status": nm[host].state(),
                "vendor": nm[host]['vendor'].get(nm[host]['addresses'].get('mac', ''), 'Unknown') if 'vendor' in nm[host] else 'Unknown',
                "last_seen": datetime.now().isoformat(),
                "is_rogue": False
            }
            
            # Try to ping for latency
            try:
                latency = ping(host, timeout=1)
                device["latency"] = round(latency * 1000, 2) if latency else None
            except:
                device["latency"] = None
            
            devices.append(device)
            
            # Update global devices dict
            if host in network_devices:
                network_devices[host].update(device)
                network_devices[host]["last_seen"] = datetime.now().isoformat()
            else:
                network_devices[host] = device
                # Check if this is a rogue device
                await check_rogue_device(device)
                
    except Exception as e:
        # Fallback to ARP scan if nmap fails
        devices = await arp_scan(subnet)
    
    return devices

async def arp_scan(subnet: str) -> List[Dict]:
    """Fallback ARP scan using arp-scan command"""
    devices = []
    try:
        result = subprocess.run(
            f"arp-scan --localnet --interface=eth0",
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        for line in result.stdout.split('\n'):
            parts = line.split()
            if len(parts) >= 3 and '.' in parts[0]:
                device = {
                    "ip": parts[0],
                    "mac": parts[1],
                    "vendor": ' '.join(parts[2:]),
                    "hostname": "",
                    "status": "up",
                    "last_seen": datetime.now().isoformat(),
                    "is_rogue": False
                }
                devices.append(device)
                
                if parts[0] in network_devices:
                    network_devices[parts[0]].update(device)
                else:
                    network_devices[parts[0]] = device
    except:
        pass
    
    return devices

async def get_network_stats() -> Dict:
    """Get real-time network statistics"""
    # Get current network I/O
    net_io = psutil.net_io_counters()
    
    # Get per-interface stats
    interfaces = {}
    for iface, stats in psutil.net_if_stats().items():
        if stats.isup:
            interfaces[iface] = {
                "is_up": stats.isup,
                "speed": stats.speed,
                "mtu": stats.mtu
            }
    
    # Calculate bandwidth (bytes per second)
    # For real monitoring, we'd track over time
    current_time = datetime.now().isoformat()
    
    stats = {
        "timestamp": current_time,
        "bytes_sent": net_io.bytes_sent,
        "bytes_recv": net_io.bytes_recv,
        "packets_sent": net_io.packets_sent,
        "packets_recv": net_io.packets_recv,
        "errin": net_io.errin,
        "errout": net_io.errout,
        "dropin": net_io.dropin,
        "dropout": net_io.dropout,
        "interfaces": interfaces
    }
    
    # Add to history
    bandwidth_history.append(stats)
    
    # Keep last 7 days of history
    cutoff = datetime.now() - timedelta(days=7)
    global bandwidth_history
    bandwidth_history = [h for h in bandwidth_history if datetime.fromisoformat(h["timestamp"]) > cutoff]
    
    return stats

async def build_network_topology() -> Dict:
    """Build network topology graph"""
    nodes = []
    edges = []
    
    # Get local machine info
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    # Add main router/gateway node
    nodes.append({
        "id": "gateway",
        "label": "Gateway/Router",
        "type": "router",
        "ip": "gateway"
    })
    
    # Add local machine
    nodes.append({
        "id": local_ip,
        "label": f"{hostname}\n{local_ip}",
        "type": "host",
        "ip": local_ip,
        "is_local": True
    })
    
    # Add edge between gateway and local machine
    edges.append({
        "id": f"gateway-{local_ip}",
        "source": "gateway",
        "target": local_ip,
        "type": "connection"
    })
    
    # Add discovered devices
    for ip, device in network_devices.items():
        if ip != local_ip:
            nodes.append({
                "id": ip,
                "label": f"{device.get('hostname', ip)}\n{ip}",
                "type": "device",
                "ip": ip,
                "vendor": device.get('vendor', 'Unknown'),
                "is_rogue": device.get('is_rogue', False)
            })
            edges.append({
                "id": f"gateway-{ip}",
                "source": "gateway",
                "target": ip,
                "type": "connection"
            })
    
    return {
        "nodes": nodes,
        "edges": edges
    }

async def check_rogue_device(device: Dict):
    """Check if a device is rogue (unauthorized)"""
    # List of authorized MAC addresses (configure these)
    authorized_macs = []  # Add your authorized MACs here
    authorized_ips = []   # Add your authorized IPs here
    
    is_rogue = False
    reason = ""
    
    mac = device.get("mac", "")
    ip = device.get("ip", "")
    
    if authorized_macs and mac not in authorized_macs:
        is_rogue = True
        reason = f"Unauthorized MAC address: {mac}"
    elif authorized_ips and ip not in authorized_ips:
        is_rogue = True
        reason = f"Unauthorized IP address: {ip}"
    
    if is_rogue:
        device["is_rogue"] = True
        
        # Create alert
        alert = {
            "id": len(alerts) + 1,
            "type": "rogue_device",
            "severity": "high",
            "device_ip": ip,
            "device_mac": mac,
            "message": f"Rogue device detected: {ip} ({mac}) - {reason}",
            "timestamp": datetime.now().isoformat(),
            "resolved": False
        }
        alerts.append(alert)
        
        # Keep only last 100 alerts
        while len(alerts) > 100:
            alerts.pop(0)

@router.websocket("/ws/network")
async def network_websocket(websocket: WebSocket):
    """WebSocket for real-time network updates"""
    await websocket.accept()
    
    try:
        while True:
            # Send real-time network stats
            stats = await get_network_stats()
            await websocket.send_json({
                "type": "stats",
                "data": stats
            })
            
            # Send devices update
            await websocket.send_json({
                "type": "devices",
                "data": list(network_devices.values())
            })
            
            await asyncio.sleep(5)  # Update every 5 seconds
    except WebSocketDisconnect:
        pass

@router.post("/resolve-alert/{alert_id}")
async def resolve_alert(alert_id: int):
    """Mark an alert as resolved"""
    for alert in alerts:
        if alert["id"] == alert_id:
            alert["resolved"] = True
            alert["resolved_at"] = datetime.now().isoformat()
            return {"success": True, "message": "Alert resolved"}
    return {"success": False, "message": "Alert not found"}

@router.post("/add-authorized-device")
async def add_authorized_device(mac: str = None, ip: str = None):
    """Add authorized device to whitelist"""
    # In production, save to database
    return {"success": True, "message": "Device added to whitelist"}

# Start background network monitoring
async def start_network_monitoring():
    """Background task to monitor network"""
    while True:
        await perform_network_scan("192.168.1.0/24")
        await asyncio.sleep(300)  # Scan every 5 minutes

# Background task
background_tasks = set()

@router.on_event("startup")
async def startup_event():
    task = asyncio.create_task(start_network_monitoring())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
