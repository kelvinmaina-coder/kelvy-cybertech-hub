import { Network, Wifi, Monitor, AlertTriangle, Globe } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const devices = [
  { name: "Main Server", ip: "192.168.1.1", type: "Server", status: "online", os: "Parrot OS" },
  { name: "Web Server", ip: "192.168.1.10", type: "VM", status: "online", os: "Ubuntu 22.04" },
  { name: "DB Server", ip: "192.168.1.11", type: "VM", status: "online", os: "Ubuntu 22.04" },
  { name: "Dev Laptop", ip: "192.168.1.50", type: "Laptop", status: "online", os: "Parrot OS" },
  { name: "Unknown Device", ip: "192.168.1.99", type: "Unknown", status: "suspicious", os: "N/A" },
  { name: "Printer", ip: "192.168.1.30", type: "IoT", status: "offline", os: "Embedded" },
];

const statusColors: Record<string, string> = {
  online: "text-primary bg-primary/10",
  offline: "text-muted-foreground bg-muted/30",
  suspicious: "text-destructive bg-destructive/10 animate-pulse",
};

export default function NetworkHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-secondary text-glow-cyan">NETWORK HUB</h1>
        <p className="text-sm text-muted-foreground font-mono">Topology • Monitoring • Device Management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Monitor} title="Devices" value="6" variant="cyan" />
        <MetricCard icon={Wifi} title="Bandwidth" value="142 Mbps" variant="green" />
        <MetricCard icon={Globe} title="Uptime" value="99.9%" variant="green" />
        <MetricCard icon={AlertTriangle} title="Rogue Devices" value="1" variant="red" />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-display text-sm text-secondary mb-3 text-glow-cyan">NETWORK DEVICES</h3>
        <div className="space-y-1">
          {devices.map((d, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted/20 text-sm">
              <span className={`w-2 h-2 rounded-full shrink-0 ${d.status === "online" ? "bg-primary" : d.status === "suspicious" ? "bg-destructive animate-pulse" : "bg-muted-foreground"}`} />
              <span className="text-foreground flex-1 font-medium">{d.name}</span>
              <span className="text-muted-foreground font-mono text-xs">{d.ip}</span>
              <span className="text-xs text-muted-foreground hidden sm:block">{d.os}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${statusColors[d.status]}`}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
