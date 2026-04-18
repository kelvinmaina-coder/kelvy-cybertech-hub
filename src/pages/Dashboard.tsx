import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, Network, Code, BarChart3, Bot, Cloud, 
  Briefcase, MessageSquare, Zap, Activity, Users,
  ArrowRight, ShieldAlert, Cpu, Database, Server,
  Bell, Globe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    threats: 0, critical: 0, 
    devices: 47, rogue: 0,
    commits: 23, deployments: 4,
    revenue: 0, clients: 0,
    queries: "2.4K", activeModels: 3,
    cloudServices: 3, containers: 12,
    openTickets: 0, totalInvoiced: 0,
    teamMembers: 8, onlineNow: 3
  });

  useEffect(() => {
    const loadStats = async () => {
      const [eventsRes, clientsRes, ticketsRes, chatRes, invoicesRes] = await Promise.all([
        supabase.from("security_events").select("severity"),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("tickets").select("id", { count: "exact", head: true }).neq("status", "closed"),
        supabase.from("chat_history").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("amount, status")
      ]);

      setStats(prev => ({
        ...prev,
        threats: eventsRes.data?.length || 0,
        critical: eventsRes.data?.filter(e => e.severity === 'critical').length || 0,
        clients: clientsRes.count || 0,
        openTickets: ticketsRes.count || 0,
        queries: chatRes.count ? `${(chatRes.count / 1000).toFixed(1)}K` : "0K",
        revenue: invoicesRes.data?.filter(i => i.status === 'paid').reduce((a, b) => a + Number(b.amount), 0) || 0,
        totalInvoiced: invoicesRes.data?.reduce((a, b) => a + Number(b.amount), 0) || 0,
      }));
    };
    loadStats();
  }, []);

  const cards = [
    { 
      title: "CYBERSECURITY", 
      icon: Shield, 
      path: "/security", 
      color: "border-red-500/50 hover:bg-red-500/10",
      iconColor: "text-red-500",
      metrics: [
        { label: "Threats", value: stats.threats },
        { label: "Critical", value: stats.critical, subColor: "text-red-500" }
      ],
      btnText: "VIEW SECURITY"
    },
    { 
      title: "NETWORKING", 
      icon: Network, 
      path: "/network", 
      color: "border-cyan-500/50 hover:bg-cyan-500/10",
      iconColor: "text-cyan-500",
      metrics: [
        { label: "Active Devices", value: stats.devices },
        { label: "Rogue Detected", value: stats.rogue, subColor: "text-green-500" }
      ],
      btnText: "VIEW NETWORK"
    },
    { 
      title: "SOFTWARE DEV", 
      icon: Code, 
      path: "/ide", 
      color: "border-purple-500/50 hover:bg-purple-500/10",
      iconColor: "text-purple-500",
      metrics: [
        { label: "Commits Today", value: stats.commits },
        { label: "Deployments", value: stats.deployments }
      ],
      btnText: "OPEN IDE"
    },
    { 
      title: "DATA ANALYTICS", 
      icon: BarChart3, 
      path: "/analytics", 
      color: "border-blue-500/50 hover:bg-blue-500/10",
      iconColor: "text-blue-500",
      metrics: [
        { label: "Revenue", value: `KES ${stats.revenue}` },
        { label: "Active Clients", value: stats.clients }
      ],
      btnText: "VIEW ANALYTICS"
    },
    { 
      title: "AI / ML", 
      icon: Bot, 
      path: "/ai-ml", 
      color: "border-green-500/50 hover:bg-green-500/10",
      iconColor: "text-green-500",
      metrics: [
        { label: "AI Queries", value: stats.queries },
        { label: "Models Active", value: stats.activeModels }
      ],
      btnText: "OPEN AI"
    },
    { 
      title: "CLOUD & DEVOPS", 
      icon: Cloud, 
      path: "/automation", 
      color: "border-sky-500/50 hover:bg-sky-500/10",
      iconColor: "text-sky-500",
      metrics: [
        { label: "Cloud Services", value: stats.cloudServices },
        { label: "Containers", value: stats.containers }
      ],
      btnText: "MANAGE CLOUD"
    },
    { 
      title: "BUSINESS", 
      icon: Briefcase, 
      path: "/business/crm", 
      color: "border-amber-500/50 hover:bg-amber-500/10",
      iconColor: "text-amber-500",
      metrics: [
        { label: "Open Tickets", value: stats.openTickets },
        { label: "Invoiced", value: `KES ${stats.totalInvoiced}` }
      ],
      btnText: "OPEN BUSINESS"
    },
    { 
      title: "COMMUNICATION", 
      icon: MessageSquare, 
      path: "/communication/chat", 
      color: "border-indigo-500/50 hover:bg-indigo-500/10",
      iconColor: "text-indigo-500",
      metrics: [
        { label: "Team Members", value: stats.teamMembers },
        { label: "Online Now", value: stats.onlineNow }
      ],
      btnText: "TEAM CHAT"
    }
  ];

  const quickLinks = [
    { name: "Security Hub", path: "/security", icon: Shield },
    { name: "Threat Radar", path: "/cybersecurity/threat-radar", icon: Zap },
    { name: "Dark Web", path: "/cybersecurity/darkweb", icon: Globe },
    { name: "AI Assistant", path: "/ai", icon: Bot },
    { name: "Executive", path: "/analytics", icon: BarChart3 },
    { name: "Client Portal", path: "/portal", icon: Users },
    { name: "Notifications", path: "/notifications", icon: Bell },
    { name: "Tools", path: "/tools", icon: Terminal },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary tracking-tight text-glow-green">COMMAND CENTER</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">
            System Operations & Domain Overview
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500 animate-pulse" />
            <div className="text-[10px] font-mono">
              <span className="text-muted-foreground">LATENCY:</span>
              <span className="text-foreground ml-1">12ms</span>
            </div>
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <div className="text-[10px] font-mono">
              <span className="text-muted-foreground">UPTIME:</span>
              <span className="text-foreground ml-1">99.9%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-3 py-3 text-sm text-foreground transition hover:bg-accent/10 hover:border-accent"
          >
            <link.icon className="w-4 h-4 text-primary" />
            <span className="truncate">{link.name}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className={`flex flex-col min-h-[150px] glass-card border rounded-2xl p-4 transition-all duration-200 group ${card.color} relative overflow-hidden hover:shadow-lg`}
          >
            {/* Background Decoration */}
            <card.icon className={`absolute -right-2 -bottom-2 w-16 h-16 opacity-[0.02] rotate-12 transition-transform duration-500`} />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-background border border-border group-hover:border-current transition-colors`}>
                  <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                <h2 className="text-sm font-display font-bold tracking-wide uppercase">{card.title}</h2>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {card.metrics.map((metric, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{metric.label}</span>
                    <span className={`text-lg font-bold font-mono mt-0.5 ${metric.subColor || 'text-foreground'}`}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <div className={`inline-flex items-center gap-2 text-[10px] font-bold py-1.5 px-3 rounded-full bg-background border border-border group-hover:border-current transition-all uppercase tracking-widest`}>
                {card.btnText}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* System Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="glass-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Threat Level</span>
          </div>
          <div className="text-lg font-mono font-bold text-red-500">LOW (0 CRITICAL)</div>
        </div>
        <div className="glass-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">AI Load</span>
          </div>
          <div className="text-lg font-mono font-bold">14% UTILIZATION</div>
        </div>
        <div className="glass-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-4 h-4 text-cyan-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">DB Status</span>
          </div>
          <div className="text-lg font-mono font-bold">SYNCED (REGION: AF)</div>
        </div>
        <div className="glass-card p-4 border border-border rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Nodes</span>
          </div>
          <div className="text-lg font-mono font-bold">12 ACTIVE UNITS</div>
        </div>
      </div>
    </div>
  );
}
