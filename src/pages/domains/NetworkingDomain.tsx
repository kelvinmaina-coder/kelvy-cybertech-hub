import { Network, Globe, Server, Brain, BarChart3, Search, Activity, Target, Terminal, Bell } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";
import NetworkHubPage from "@/pages/NetworkHubPage";
import AIAssistant from "@/pages/AIAssistant";
import UptimeMonitoring from "./networking/UptimeMonitoring";
import SyntheticProbing from "./networking/SyntheticProbing";
import LogStreaming from "./networking/LogStreaming";
import NetworkAlerts from "./networking/NetworkAlerts";

export default function NetworkingDomain() {
  const tabs: DomainTab[] = [
    {
      id: "topology",
      label: "🗺️ Network Map",
      icon: Globe,
      component: <NetworkHubPage defaultTab="topology" />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "devices",
      label: "📡 Devices",
      icon: Server,
      component: <NetworkHubPage defaultTab="devices" />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "bandwidth",
      label: "📊 Bandwidth",
      icon: BarChart3,
      component: <NetworkHubPage defaultTab="bandwidth" />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "packets",
      label: "🔍 Packet Analysis",
      icon: Search,
      component: <NetworkHubPage defaultTab="connections" />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "uptime",
      label: "📈 Uptime",
      icon: Activity,
      component: <UptimeMonitoring />,
      roles: ["super_admin", "manager", "technician", "client", "guest"]
    },
    {
      id: "probing",
      label: "🎯 Probing",
      icon: Target,
      component: <SyntheticProbing />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "logs",
      label: "📋 Logs",
      icon: Terminal,
      component: <LogStreaming />,
      roles: ["super_admin", "manager", "security_analyst", "technician"]
    },
    {
      id: "alerts",
      label: "🔔 Alerts",
      icon: Bell,
      component: <NetworkAlerts />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "kana",
      label: "🤖 KANA AI",
      icon: Brain,
      component: <AIAssistant title="KANA (Kelvy AI Network Analyst)" />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    }
  ];

  return (
    <DomainLayout
      title="Networking"
      description="Real-time topology, rogue device detection, and traffic analysis."
      icon={Network}
      tabs={tabs}
      defaultTab="topology"
      basePath="/networking"
    />
  );
}
