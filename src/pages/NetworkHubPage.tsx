import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity, Wifi, Server, Shield, AlertTriangle, CheckCircle,
  Clock, Download, Upload, TrendingUp, TrendingDown,
  Eye, EyeOff, RefreshCw, Zap, Radio, Signal, BarChart3,
  Cpu, HardDrive, Database, Globe, Lock, Unlock, Bell, BellOff
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface Device {
  ip: string;
  hostname: string;
  mac: string;
  vendor: string;
  status: string;
  latency: number | null;
  last_seen: string;
  is_rogue: boolean;
}

interface BandwidthData {
  timestamp: string;
  bytes_sent: number;
  bytes_recv: number;
  packets_sent: number;
  packets_recv: number;
}

interface Alert {
  id: number;
  type: string;
  severity: string;
  device_ip: string;
  device_mac: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

const severityColors = {
  high: "text-red-500 bg-red-500/10",
  medium: "text-yellow-500 bg-yellow-500/10",
  low: "text-blue-500 bg-blue-500/10"
};

export default function NetworkHubPage({ defaultTab }: { defaultTab?: "devices" | "topology" | "bandwidth" | "alerts" | "connections" }) {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [bandwidth, setBandwidth] = useState<BandwidthData | null>(null);
  const [bandwidthHistory, setBandwidthHistory] = useState<BandwidthData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [topology, setTopology] = useState<any>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [interfaces, setInterfaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"devices" | "topology" | "bandwidth" | "alerts" | "connections">(defaultTab || "devices");
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  useEffect(() => {
    if (defaultTab) setSelectedTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    loadData();
    if (autoRefresh) {
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);
  
  const loadData = async () => {
    try {
      const [devicesRes, bandwidthRes, alertsRes, connectionsRes, interfacesRes] = await Promise.all([
        fetch("http://localhost:8000/api/network/devices"),
        fetch("http://localhost:8000/api/network/bandwidth"),
        fetch("http://localhost:8000/api/network/alerts"),
        fetch("http://localhost:8000/api/network/connections"),
        fetch("http://localhost:8000/api/network/interfaces")
      ]);
      
      const devicesData = await devicesRes.json();
      const bandwidthData = await bandwidthRes.json();
      const alertsData = await alertsRes.json();
      const connectionsData = await connectionsRes.json();
      const interfacesData = await interfacesRes.json();
      
      if (devicesData.success) setDevices(devicesData.data);
      if (bandwidthData.success) setBandwidth(bandwidthData.data);
      if (alertsData.success) setAlerts(alertsData.data);
      if (connectionsData.success) setConnections(connectionsData.data);
      if (interfacesData.success) setInterfaces(interfacesData.data);
      
      // Load topology
      const topologyRes = await fetch("http://localhost:8000/api/network/topology");
      const topologyData = await topologyRes.json();
      if (topologyData.success) setTopology(topologyData.data);
      
    } catch (error) {
      console.error("Error loading network data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const scanNetwork = async () => {
    setScanning(true);
    try {
      const response = await fetch("http://localhost:8000/api/network/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subnet: "192.168.1.0/24" })
      });
      const result = await response.json();
      if (result.success) {
        setDevices(result.data);
        loadData();
      }
    } catch (error) {
      console.error("Error scanning network:", error);
    } finally {
      setScanning(false);
    }
  };
  
  const resolveAlert = async (alertId: number) => {
    try {
      await fetch(`http://localhost:8000/api/network/resolve-alert/${alertId}`, {
        method: "POST"
      });
      loadData();
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };
  
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };
  
  const onlineDevices = devices.filter(d => d.status === "up").length;
  const rogueDevices = devices.filter(d => d.is_rogue).length;
  
  // Prepare bandwidth chart data
  const chartData = bandwidthHistory.map(b => ({
    time: new Date(b.timestamp).toLocaleTimeString(),
    download: b.bytes_recv / (1024 * 1024),
    upload: b.bytes_sent / (1024 * 1024)
  }));
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading network data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header - ONLY if not defaultTab */}
      {!defaultTab && (
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Network Hub</h1>
              <p className="text-sm text-muted-foreground">Monitor network devices, bandwidth, and security</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2 ${
                  autoRefresh ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
                }`}
              >
                <Activity className="w-4 h-4" />
                {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              </button>
              <button
                onClick={scanNetwork}
                disabled={scanning}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
                {scanning ? "Scanning..." : "Scan Network"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Stats Cards - ONLY if not defaultTab or if explicitly needed */}
      {!defaultTab && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-border">
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Server className="w-4 h-4" />
              <span className="text-xs">Total Devices</span>
            </div>
            <div className="text-2xl font-bold">{devices.length}</div>
            <div className="text-xs text-green-500">{onlineDevices} online</div>
          </div>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Rogue Devices</span>
            </div>
            <div className="text-2xl font-bold text-red-500">{rogueDevices}</div>
            <div className="text-xs text-muted-foreground">Unauthorized devices</div>
          </div>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Download className="w-4 h-4" />
              <span className="text-xs">Download Speed</span>
            </div>
            <div className="text-2xl font-bold">
              {bandwidth ? formatBytes(bandwidth.bytes_recv / 5) + "/s" : "0 B/s"}
            </div>
            <div className="text-xs text-muted-foreground">Current rate</div>
          </div>
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Bell className="w-4 h-4" />
              <span className="text-xs">Active Alerts</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500">{alerts.filter(a => !a.resolved).length}</div>
            <div className="text-xs text-muted-foreground">Require attention</div>
          </div>
        </div>
      )}
      
      {/* Internal Tabs - ONLY if not defaultTab */}
      {!defaultTab && (
        <div className="border-b border-border flex px-4">
          {[
            { id: "devices", label: "📡 Devices", icon: Server },
            { id: "topology", label: "🗺️ Topology", icon: Globe },
            { id: "bandwidth", label: "📊 Bandwidth", icon: BarChart3 },
            { id: "alerts", label: "⚠️ Alerts", icon: AlertTriangle },
            { id: "connections", label: "🔌 Connections", icon: Wifi }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
                selectedTab === tab.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Devices Tab */}
        {selectedTab === "devices" && (
          <div className="space-y-3">
            {devices.map(device => (
              <div key={device.ip} className={`bg-card border rounded-lg p-4 ${device.is_rogue ? "border-red-500/50 bg-red-500/5" : "border-border"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${device.is_rogue ? "bg-red-500/20" : device.status === "up" ? "bg-green-500/20" : "bg-gray-500/20"}`}>
                      <Server className={`w-5 h-5 ${device.is_rogue ? "text-red-500" : device.status === "up" ? "text-green-500" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {device.hostname || device.ip}
                        {device.is_rogue && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500">ROGUE</span>}
                        {device.status === "up" && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">Online</span>}
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                        <div><span className="text-muted-foreground">IP:</span> {device.ip}</div>
                        <div><span className="text-muted-foreground">MAC:</span> {device.mac}</div>
                        <div><span className="text-muted-foreground">Vendor:</span> {device.vendor}</div>
                        <div><span className="text-muted-foreground">Latency:</span> {device.latency ? `${device.latency}ms` : "N/A"}</div>
                        <div><span className="text-muted-foreground">Last Seen:</span> {formatDate(device.last_seen)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {devices.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Wifi className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No devices found. Click "Scan Network" to discover devices.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Topology Tab */}
        {selectedTab === "topology" && topology && (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold">Network Topology Map</h3>
              <p className="text-xs text-muted-foreground">Visual representation of your network</p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  {/* Gateway */}
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                      <Globe className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-sm font-mono mt-2">Gateway/Router</p>
                  </div>
                  
                  {/* Connection lines to devices */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {topology.nodes?.filter((n: any) => n.type !== "router" && n.id !== "gateway").map((node: any) => (
                      <div key={node.id} className="text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 ${
                          node.is_rogue ? "bg-red-500/20 border-red-500" : "bg-primary/20 border-primary"
                        }`}>
                          {node.is_local ? <Cpu className="w-8 h-8 text-primary" /> : <Server className="w-8 h-8" />}
                        </div>
                        <p className="text-xs font-mono mt-1 break-all">{node.label}</p>
                        {node.vendor && <p className="text-[10px] text-muted-foreground">{node.vendor}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bandwidth Tab */}
        {selectedTab === "bandwidth" && (
          <div className="space-y-4">
            {/* Current Bandwidth */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Download</span>
                </div>
                <div className="text-3xl font-bold text-blue-500">
                  {bandwidth ? formatBytes(bandwidth.bytes_recv / 5) + "/s" : "0 B/s"}
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-blue-500 rounded-full h-2" style={{ width: `${Math.min(100, (bandwidth?.bytes_recv || 0) / 1024 / 1024 / 10)}%` }} />
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload</span>
                </div>
                <div className="text-3xl font-bold text-green-500">
                  {bandwidth ? formatBytes(bandwidth.bytes_sent / 5) + "/s" : "0 B/s"}
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-green-500 rounded-full h-2" style={{ width: `${Math.min(100, (bandwidth?.bytes_sent || 0) / 1024 / 1024 / 5)}%` }} />
                </div>
              </div>
            </div>
            
            {/* Network Interfaces */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Network Interfaces</h3>
              <div className="space-y-2">
                {interfaces.map(iface => (
                  <div key={iface.name} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      <span className="font-mono text-sm">{iface.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{iface.ip}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${iface.is_up ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                        {iface.is_up ? "UP" : "DOWN"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Network Statistics */}
            {bandwidth && (
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Network Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Downloaded</p>
                    <p className="text-lg font-mono">{formatBytes(bandwidth.bytes_recv)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Uploaded</p>
                    <p className="text-lg font-mono">{formatBytes(bandwidth.bytes_sent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Packets Sent</p>
                    <p className="text-lg font-mono">{bandwidth.packets_sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Packets Received</p>
                    <p className="text-lg font-mono">{bandwidth.packets_recv.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Alerts Tab */}
        {selectedTab === "alerts" && (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`border rounded-lg p-4 ${alert.resolved ? "bg-muted/30 border-border" : severityColors[alert.severity as keyof typeof severityColors]}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 ${alert.resolved ? "text-muted-foreground" : "text-yellow-500"}`} />
                    <div>
                      <h3 className="font-semibold">{alert.type === "rogue_device" ? "Rogue Device Detected" : alert.type}</h3>
                      <p className="text-sm">{alert.message}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Device: {alert.device_ip}</span>
                        <span>MAC: {alert.device_mac}</span>
                        <span>Time: {formatDate(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition text-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No network alerts. All devices are authorized.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Connections Tab */}
        {selectedTab === "connections" && (
          <div className="space-y-2">
            {connections.map((conn, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono">{conn.local_ip}:{conn.local_port}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono">{conn.remote_ip}:{conn.remote_port}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>Status: {conn.status}</span>
                    {conn.pid && <span>PID: {conn.pid}</span>}
                  </div>
                </div>
              </div>
            ))}
            {connections.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Wifi className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active connections found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
