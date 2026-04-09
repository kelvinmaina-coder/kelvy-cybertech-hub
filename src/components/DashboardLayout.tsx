import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Shield, Bot, Users, Briefcase, Ticket,
  BarChart3, Network, Code, Settings, Terminal, ChevronLeft,
  ChevronRight, Zap, Globe, Menu, LogOut, MessageSquare, Bell,
  Phone, Calendar, Wifi, Server, Database, Brain, Fingerprint,
  Smartphone, FileText, BookOpen, Activity, Clock, AlertTriangle,
  CheckCircle, Video, Mic, Monitor, UserPlus, Mail, Lock, Unlock,
  Eye, Cloud, ChevronDown, ArrowLeft
} from "lucide-react";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import NotificationBell from "@/components/NotificationBell";
import IncomingCallModal from "@/components/IncomingCallModal";
import { usePresence } from "@/hooks/usePresence";
import kelvyLogo from "@/assets/kelvy-logo.png";

interface NavItem {
  icon: any;
  label: string;
  path: string;
  roles: AppRole[];
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
  { icon: Shield, label: "Cybersecurity", path: "/cybersecurity", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
  { icon: Network, label: "Networking", path: "/networking", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
  { icon: Code, label: "Software Dev", path: "/software-dev", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
  { icon: BarChart3, label: "Data Analytics", path: "/data-analytics", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
  { icon: Bot, label: "AI/ML", path: "/ai-ml", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
  { icon: Briefcase, label: "Business", path: "/business", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
  { icon: MessageSquare, label: "Communication", path: "/communication", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
  { icon: Settings, label: "Settings", path: "/settings", roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { roles, profile, signOut } = useAuth();
  const { scanlineEnabled } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedNav, setExpandedNav] = useState<Record<string, boolean>>({});
  usePresence(); // Keep presence updated globally

  const currentPath = location.pathname;
  const currentNav = navItems.find(item => item.path === currentPath);
  const showBackButton = currentPath !== "/dashboard" && currentPath !== "/";

  const visibleNav = navItems.filter(item => item.roles.some(r => roles.includes(r)));

  const toggleNav = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedNav(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="font-display text-sm font-bold text-primary truncate text-glow-green">KELVY CYBERTECH</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest">HUB v2.0</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {visibleNav.map((item) => {
          const active = location.pathname.startsWith(item.path);
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 group
                ${active ? "bg-primary/10 text-primary border-glow-green" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              <item.icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-1">
        <ThemeSwitcher collapsed={collapsed} />
      </div>

      {!collapsed && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {(profile?.full_name || "U")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground truncate">{profile?.full_name || "User"}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{roles[0] || "client"}</p>
            </div>
          </div>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition font-mono">
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      )}

      <button onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center p-3 border-t border-border text-muted-foreground hover:text-foreground transition">
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>
      <aside className={`hidden lg:flex flex-col bg-sidebar border-r border-border shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
        <SidebarContent />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 glass-strong">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-muted-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-medium">Back</span>
              </button>
            )}

            {currentNav && (
              <div className="flex items-center gap-2">
                <currentNav.icon className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-display font-bold uppercase tracking-wider">{currentNav.label}</h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-glow" />
              <span className="text-[10px] text-muted-foreground font-mono">NODE_ONLINE</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 cyber-grid relative">
          {scanlineEnabled && <div className="scanline fixed inset-0 pointer-events-none z-50" />}
          {children}
          <IncomingCallModal />
        </main>
      </div>
    </div>
  );
}
