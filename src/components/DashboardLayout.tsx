import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Shield, Bot, Users, Briefcase, Ticket,
  BarChart3, Network, Code, Settings, Terminal, ChevronLeft,
  ChevronRight, Zap, Globe, Menu, X
} from "lucide-react";
import kelvyLogo from "@/assets/kelvy-logo.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Shield, label: "Security Hub", path: "/security" },
  { icon: Bot, label: "AI Assistant", path: "/ai" },
  { icon: Terminal, label: "Linux Tools", path: "/tools" },
  { icon: Users, label: "CRM", path: "/crm" },
  { icon: Briefcase, label: "ERP", path: "/erp" },
  { icon: Ticket, label: "ITSM", path: "/itsm" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Network, label: "Network", path: "/network" },
  { icon: Code, label: "IDE", path: "/ide" },
  { icon: Zap, label: "Automation", path: "/automation" },
  { icon: Globe, label: "Client Portal", path: "/portal" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <img src={kelvyLogo} alt="Kelvy CyberTech Hub" className="w-10 h-10 rounded-lg" />
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-display text-sm font-bold text-primary truncate text-glow-green">
              KELVY CYBERTECH
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-widest">HUB v1.0</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 group
                ${active
                  ? "bg-primary/10 text-primary border-glow-green"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center p-3 border-t border-border text-muted-foreground hover:text-foreground transition"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-300 lg:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-sidebar border-r border-border shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card/50">
          <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-muted-foreground font-mono">SYSTEM ONLINE</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 cyber-grid">
          <div className="scanline fixed inset-0 pointer-events-none z-50" />
          {children}
        </main>
      </div>
    </div>
  );
}
