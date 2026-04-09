import { Shield, Activity, Terminal, Brain, Target, Search, Zap, ShieldCheck, Eye, Lock, Database } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";
import SecurityHub from "@/pages/SecurityHub";
import LinuxToolsHub from "@/pages/LinuxToolsHub";
import AIAssistant from "@/pages/AIAssistant";
import PentestingHub from "@/pages/PentestingHub";
import ThreatIntel from "@/pages/ThreatIntel";
import AutoRemediation from "./cybersecurity/AutoRemediation";
import SecurityPatching from "./cybersecurity/SecurityPatching";
import InsiderThreat from "./cybersecurity/InsiderThreat";
import PhishingCampaigns from "./cybersecurity/PhishingCampaigns";
import ZeroTrust from "./cybersecurity/ZeroTrust";
import DisasterRecovery from "./cybersecurity/DisasterRecovery";
import NeuralAttackDetector from "./cybersecurity/NeuralAttackDetector";

export default function CybersecurityDomain() {
  const tabs: DomainTab[] = [
    {
      id: "soc",
      label: "🛡️ SOC Dashboard",
      icon: Activity,
      component: <SecurityHub />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "linux-tools",
      label: "🔧 Linux Tools",
      icon: Terminal,
      component: <LinuxToolsHub />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "pentesting",
      label: "🎯 Pentesting",
      icon: Target,
      component: <PentestingHub />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "threat-intel",
      label: "📡 Threat Intel",
      icon: Search,
      component: <ThreatIntel />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "auto-remediation",
      label: "⚡ Remediation",
      icon: Zap,
      component: <AutoRemediation />,
      roles: ["super_admin", "manager", "security_analyst"]
    },
    {
      id: "patching",
      label: "🩹 Patching",
      icon: ShieldCheck,
      component: <SecurityPatching />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "insider-threat",
      label: "👁️ Insider Threat",
      icon: Eye,
      component: <InsiderThreat />,
      roles: ["super_admin", "manager", "security_analyst"]
    },
    {
      id: "phishing",
      label: "🎣 Phishing",
      icon: Target,
      component: <PhishingCampaigns />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "zero-trust",
      label: "🔐 Zero Trust",
      icon: Lock,
      component: <ZeroTrust />,
      roles: ["super_admin", "manager", "security_analyst"]
    },
    {
      id: "disaster-recovery",
      label: "💾 Recovery",
      icon: Database,
      component: <DisasterRecovery />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "neural-detector",
      label: "🧠 Neural Detector",
      icon: Brain,
      component: <NeuralAttackDetector />,
      roles: ["super_admin", "manager", "security_analyst"]
    },
    {
      id: "kasa",
      label: "🤖 KASA AI",
      icon: Brain,
      component: <AIAssistant title="KASA (Kelvy AI Security Analyst)" />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    }
  ];

  return (
    <DomainLayout
      title="Cybersecurity"
      description="Advanced SIEM capabilities, threat intelligence, and vulnerability scanning powered by AI."
      icon={Shield}
      tabs={tabs}
      defaultTab="soc"
      basePath="/cybersecurity"
    />
  );
}
