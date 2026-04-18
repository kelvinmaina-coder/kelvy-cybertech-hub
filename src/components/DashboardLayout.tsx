import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NeuralNetworkBackground from "@/components/NeuralNetworkBackground";
import QuickActionsBar from "./QuickActionsBar";
import {
  LayoutDashboard,
  Shield,
  Bot,
  Users,
  Briefcase,
  Ticket,
  BarChart3,
  Network,
  Code,
  Settings,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  Phone,
  Video,
  Calendar,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Database,
  Cloud,
  ShoppingCart,
  TrendingUp,
  FileText,
  PenTool,
  Search,
  Mail,
  Mic,
  BookOpen,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { NotificationBell } from "./NotificationBell";
import TerminalOverlay from "./TerminalOverlay";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const DashboardLayout = memo(({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Security", href: "/security", icon: <Shield className="w-5 h-5" />, roles: ["super_admin", "security_analyst"] },
    { name: "Network", href: "/network", icon: <Network className="w-5 h-5" />, roles: ["super_admin", "security_analyst"] },
    { name: "Tools", href: "/tools", icon: <Terminal className="w-5 h-5" />, roles: ["super_admin", "security_analyst", "technician"] },
    { name: "AI Assistant", href: "/ai", icon: <Bot className="w-5 h-5" /> },
    { name: "CRM", href: "/crm", icon: <Users className="w-5 h-5" />, roles: ["super_admin", "manager"] },
    { name: "ERP", href: "/erp", icon: <Briefcase className="w-5 h-5" />, roles: ["super_admin", "manager"] },
    { name: "ITSM", href: "/itsm", icon: <Ticket className="w-5 h-5" />, roles: ["super_admin", "technician"] },
    { name: "Analytics", href: "/analytics", icon: <BarChart3 className="w-5 h-5" />, roles: ["super_admin", "manager"] },
    { name: "IDE", href: "/ide", icon: <Code className="w-5 h-5" />, roles: ["super_admin", "technician"] },
    { name: "Automation", href: "/automation", icon: <Settings className="w-5 h-5" />, roles: ["super_admin", "technician"] },
    { name: "Chat", href: "/chat", icon: <MessageSquare className="w-5 h-5" /> },
    { name: "Calls", href: "/calls", icon: <Phone className="w-5 h-5" /> },
    { name: "Meetings", href: "/meetings", icon: <Calendar className="w-5 h-5" /> },
    { name: "Journal", href: "/personal/journal", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Summarize", href: "/personal/summarize", icon: <FileText className="w-5 h-5" /> },
    { name: "Code Review", href: "/personal/code-review", icon: <Code className="w-5 h-5" /> },
    { name: "Email", href: "/communication/email-composer", icon: <Mail className="w-5 h-5" /> },
    { name: "Meeting Notes", href: "/communication/meeting-notes", icon: <Mic className="w-5 h-5" /> },
    { name: "Social Media", href: "/business/social-media", icon: <TrendingUp className="w-5 h-5" /> },
    { name: "E-commerce", href: "/business/ecommerce", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "SEO", href: "/seo", icon: <Search className="w-5 h-5" /> },
    { name: "Usage Reports", href: "/data-analytics/reports", icon: <Database className="w-5 h-5" /> },
    { name: "Client Portal", href: "/portal", icon: <Users className="w-5 h-5" />, roles: ["client"] },
    { name: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> }
  ];

  const visibleNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (!profile?.role) return false;
    return item.roles.includes(profile.role);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === 'd') return navigate('/dashboard');
      if (key === 's') return navigate('/security');
      if (key === 'n') return navigate('/network');
      if (key === 'a') return navigate('/ai');
      if (key === 'c') return navigate('/chat');
      if (key === 'm') return navigate('/meetings');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-background">
      <NeuralNetworkBackground />
      <QuickActionsBar />
      <TerminalOverlay />
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col bg-sidebar border-r border-border transition-all duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && <span className="font-bold text-lg text-foreground">Kelvy Hub</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded-md hover:bg-accent">
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-colors"
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <ThemeSwitcher />
          <button onClick={signOut} className="flex items-center gap-3 mt-2 px-4 py-2 w-full rounded-md hover:bg-accent">
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
      
      {/* Mobile menu button */}
      <button onClick={() => setMobileMenuOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-sidebar">
        <Menu className="w-5 h-5" />
      </button>
      
      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border">
            <div className="flex justify-end p-4">
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 mx-2 rounded-md"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
      
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-6">
          <div className="flex justify-end items-center gap-2 mb-4">
            <NotificationBell />
            <ThemeSwitcher />
          </div>
          {children}
          <div className="mt-8 rounded-3xl border border-border bg-card/80 p-4 text-sm text-muted-foreground shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-foreground">Quick Portal</p>
                <p className="text-xs text-muted-foreground">Use <span className="font-medium">Ctrl+`</span> to open Terminal Mode and access AI-powered commands instantly.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to="/dashboard" className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent/90">Dashboard</Link>
                <Link to="/security" className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent/90">Security</Link>
                <Link to="/cybersecurity/darkweb" className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent/90">Dark Web</Link>
                <Link to="/data-analytics/executive" className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent/90">Executive</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
});

export default DashboardLayout;
