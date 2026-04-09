import { Bell, Shield, Info, AlertTriangle, CheckCircle, Zap } from "lucide-react";

export default function NotificationsHub() {
  const notifications = [
    { id: 1, type: "security", title: "New Login Detected", detail: "Authorized login from 192.168.1.45 (Windows PC)", time: "2m ago" },
    { id: 2, type: "warning", title: "Disk Usage High", detail: "Node-4 /var/log is at 85% capacity", time: "15m ago" },
    { id: 3, type: "info", title: "System Update", detail: "Kernel update 6.1.0-kb patch scheduled for 02:00 UTC", time: "1h ago" },
    { id: 4, type: "success", title: "Backup Complete", detail: "Full system state snapshot saved to S3-Kelvy-Alpha", time: "2h ago" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-accent">NOTIFICATIONS FEED</h1>
          <p className="text-xs text-muted-foreground font-mono">System-wide event logging & security alerts</p>
        </div>
        <button className="text-[10px] uppercase font-bold text-muted-foreground hover:text-accent transition-colors">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {notifications.map((note) => (
          <div key={note.id} className="glass-card p-4 border border-border flex gap-4 hover:border-accent/40 transition-all group">
            <div className={`p-2 rounded-lg shrink-0 h-10 w-10 flex items-center justify-center ${
              note.type === 'security' ? 'bg-red-500/10 text-red-500' :
              note.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
              note.type === 'success' ? 'bg-green-500/10 text-green-500' :
              'bg-blue-500/10 text-blue-500'
            }`}>
              {note.type === 'security' && <Shield className="w-5 h-5" />}
              {note.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {note.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {note.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-sm font-bold">{note.title}</h3>
                <span className="text-[10px] font-mono text-muted-foreground">{note.time}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{note.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 border border-accent/20 bg-accent/5">
        <h3 className="text-xs font-bold text-accent mb-2 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> AI ALERT PRIORITIZATION
        </h3>
        <p className="text-[11px] text-foreground/80 leading-relaxed italic">
          "I have suppressed 142 repetitive 'Connection Refused' logs from the internal scanner. The 'New Login' alert has been elevated to high priority based on your historical patterns."
        </p>
      </div>
    </div>
  );
}
