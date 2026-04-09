import { Bot, MessageSquare, Eye, Mic, Brain, Database, Cpu } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";
import AIAssistant from "@/pages/AIAssistant";
import ModelHub from "@/pages/ModelHub";
import AgentBuilder from "./aiml/AgentBuilder";
import TrainingPlatform from "./aiml/TrainingPlatform";

export default function AIMLDomain() {
  const tabs: DomainTab[] = [
    {
      id: "chat",
      label: "💬 Chat",
      icon: MessageSquare,
      component: <AIAssistant title="Kelvy AI Chat Box" />,
      roles: ["super_admin", "manager", "technician", "client"]
    },
    {
      id: "vision",
      label: "🎨 Vision",
      icon: Eye,
      component: <AIAssistant title="Vision Analysis" />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "voice",
      label: "🎤 Voice",
      icon: Mic,
      component: <ModelHub />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "models",
      label: "🧠 Models",
      icon: Brain,
      component: <ModelHub />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "agent-builder",
      label: "🤖 Agent Builder",
      icon: Cpu,
      component: <AgentBuilder />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "training",
      label: "🎓 Training",
      icon: Brain,
      component: <TrainingPlatform />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "embeddings",
      label: "📚 Embeddings",
      icon: Database,
      component: <ModelHub />,
      roles: ["super_admin", "manager"]
    }
  ];

  return (
    <DomainLayout
      title="AI & Machine Learning"
      description="Next-gen AI assistants, computer vision, and predictive modeling."
      icon={Bot}
      tabs={tabs}
      defaultTab="chat"
      basePath="/ai-ml"
    />
  );
}
