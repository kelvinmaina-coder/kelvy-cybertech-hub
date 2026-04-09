import { Code, Terminal, Brain, Bug, Search, TestTube, ShieldCheck, Zap, Sparkles, ShoppingBag } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";
import IDEPage from "@/pages/IDEPage";
import AIAssistant from "@/pages/AIAssistant";
import DebuggerHub from "@/pages/DebuggerHub";
import CodeReviewHub from "@/pages/CodeReviewHub";
import TestingHub from "@/pages/TestingHub";
import RegressionTesting from "./software/RegressionTesting";
import LoadTesting from "./software/LoadTesting";
import AITestGen from "./software/AITestGen";
import AppMarketplace from "./software/AppMarketplace";

export default function SoftwareDevDomain() {
  const tabs: DomainTab[] = [
    {
      id: "ide",
      label: "📝 IDE",
      icon: Terminal,
      component: <IDEPage />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "debug",
      label: "🐛 Debug",
      icon: Bug,
      component: <DebuggerHub />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "code-review",
      label: "🔍 Code Review",
      icon: Search,
      component: <CodeReviewHub />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "testing",
      label: "🧪 Testing",
      icon: TestTube,
      component: <TestingHub />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "regression",
      label: "🛡️ Regression",
      icon: ShieldCheck,
      component: <RegressionTesting />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "load-test",
      label: "⚡ Load Test",
      icon: Zap,
      component: <LoadTesting />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "test-gen",
      label: "✨ AI Test Gen",
      icon: Sparkles,
      component: <AITestGen />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "marketplace",
      label: "🏪 Marketplace",
      icon: ShoppingBag,
      component: <AppMarketplace />,
      roles: ["super_admin", "manager", "technician", "client", "guest"]
    },
    {
      id: "kaca",
      label: "🤖 KACA AI",
      icon: Brain,
      component: <AIAssistant title="KACA (Kelvy AI Code Assistant)" />,
      roles: ["super_admin", "technician"]
    }
  ];

  return (
    <DomainLayout
      title="Software Development"
      description="Integrated polyglot IDE and intelligent code analysis."
      icon={Code}
      tabs={tabs}
      defaultTab="ide"
      basePath="/software-dev"
    />
  );
}
