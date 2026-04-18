import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Shield, Network, Code, BarChart3, Bot, 
  Briefcase, MessageSquare, User, LogOut, Terminal, Radar, Globe, 
  Database, ShoppingCart, FileText, PenTool, BookOpen, Calendar,
  Phone, Video, Activity, Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeSwitcher } from './ThemeSwitcher';
import { NotificationBell } from './NotificationBell';
import QuickActionsBar from './QuickActionsBar';
import NeuralNetworkBackground from './NeuralNetworkBackground';
import TerminalOverlay from './TerminalOverlay';

interface DomainLayoutProps {
  children: React.ReactNode;
  domain: string;
}

const domainNavItems: Record<string, { name: string; href: string; icon: React.ReactNode }[]> = {
  cybersecurity: [
    { name: 'SOC Dashboard', href: '/cybersecurity/soc-dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Linux Tools', href: '/cybersecurity/linux-tools', icon: <Terminal className="w-4 h-4" /> },
    { name: 'Threat Radar', href: '/cybersecurity/threat-radar', icon: <Radar className="w-4 h-4" /> },
    { name: 'Dark Web', href: '/cybersecurity/darkweb', icon: <Globe className="w-4 h-4" /> },
    { name: 'KASA AI', href: '/cybersecurity/kasa', icon: <Bot className="w-4 h-4" /> },
  ],
  networking: [
    { name: 'Network Map', href: '/networking/map', icon: <Network className="w-4 h-4" /> },
    { name: 'Bandwidth Monitor', href: '/networking/monitor', icon: <Activity className="w-4 h-4" /> },
    { name: 'KANA AI', href: '/networking/kana', icon: <Bot className="w-4 h-4" /> },
  ],
  software: [
    { name: 'IDE', href: '/software/ide', icon: <Code className="w-4 h-4" /> },
    { name: 'Code Review', href: '/software/code-review', icon: <FileText className="w-4 h-4" /> },
    { name: 'KACA AI', href: '/software/kaca', icon: <Bot className="w-4 h-4" /> },
  ],
  analytics: [
    { name: 'Executive Dashboard', href: '/data-analytics/executive', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Usage Reports', href: '/data-analytics/reports', icon: <Database className="w-4 h-4" /> },
    { name: 'KADA AI', href: '/data-analytics/kada', icon: <Bot className="w-4 h-4" /> },
  ],
  aiml: [
    { name: 'AI Chat', href: '/ai-ml/chat', icon: <Bot className="w-4 h-4" /> },
    { name: 'Vision', href: '/ai-ml/vision', icon: <PenTool className="w-4 h-4" /> },
    { name: 'Voice', href: '/ai-ml/voice', icon: <MessageSquare className="w-4 h-4" /> },
  ],
  business: [
    { name: 'CRM', href: '/business/crm', icon: <Briefcase className="w-4 h-4" /> },
    { name: 'ERP', href: '/business/erp', icon: <Database className="w-4 h-4" /> },
    { name: 'ITSM', href: '/business/itsm', icon: <FileText className="w-4 h-4" /> },
    { name: 'KABA AI', href: '/business/kaba', icon: <Bot className="w-4 h-4" /> },
  ],
  communication: [
    { name: 'Chat', href: '/communication/chat', icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'Video Calls', href: '/communication/calls', icon: <Video className="w-4 h-4" /> },
    { name: 'Contacts', href: '/communication/contacts', icon: <User className="w-4 h-4" /> },
    { name: 'Meetings', href: '/communication/meetings', icon: <Calendar className="w-4 h-4" /> },
  ],
  personal: [
    { name: 'Journal', href: '/personal/journal', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Summarize', href: '/personal/summarize', icon: <FileText className="w-4 h-4" /> },
  ],
  dashboard: [],
};

const DomainLayout: React.FC<DomainLayoutProps> = ({ children, domain }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  
  const navItems = domainNavItems[domain] || [];

  return (
    <div className="min-h-screen bg-gray-950">
      <QuickActionsBar />
      <NeuralNetworkBackground />
      <TerminalOverlay />
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Kelvy CyberTech Hub
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ThemeSwitcher />
            <button onClick={signOut} className="p-2 hover:bg-gray-800 rounded-md">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-12 bottom-0 z-30 bg-gray-900/80 backdrop-blur-md border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-4 w-6 h-6 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center text-xs">
          {collapsed ? '→' : '←'}
        </button>
        <nav className="flex flex-col h-full py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-md transition-colors ${
                location.pathname === item.href
                  ? 'bg-green-500/20 text-green-400'
                  : 'hover:bg-gray-800'
              }`}
            >
              {item.icon}
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6">
          {children}
          <div className="mt-8 rounded-3xl border border-gray-800 bg-gray-900/80 p-4 text-sm text-gray-300 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-green-300">
                <Terminal className="w-4 h-4" />
                <span>Terminal Mode: Ctrl+`</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {navItems.slice(0, 4).map((item) => (
                  <Link key={item.href} to={item.href} className="rounded-full border border-gray-700 px-3 py-1 text-xs hover:bg-gray-800">
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DomainLayout;
