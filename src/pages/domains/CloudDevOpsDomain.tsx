import { Cloud, Server, Container, Activity, Zap, BarChart3, Heart, Key } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";
import CloudDevOpsHub from "@/pages/CloudDevOpsHub";
import SelfHealing from "./devops/SelfHealing";
import MultiCloud from "./devops/MultiCloud";
import APIGateway from "./devops/APIGateway";
import WebhookEngine from "./devops/WebhookEngine";

export default function CloudDevOpsDomain() {
  const tabs: DomainTab[] = [
    {
      id: "resources",
      label: "🛡️ Resources",
      icon: Server,
      component: <CloudDevOpsHub />,
      roles: ["super_admin", "technician", "manager"]
    },
    {
      id: "containers",
      label: "📦 Containers",
      icon: Container,
      component: <CloudDevOpsHub />,
      roles: ["super_admin", "technician"]
    },
    {
      id: "cicd",
      label: "🔄 CI/CD",
      icon: Activity,
      component: <CloudDevOpsHub />,
      roles: ["super_admin", "technician"]
    },
    {
      id: "monitoring",
      label: "📊 Monitoring",
      icon: BarChart3,
      component: <CloudDevOpsHub />,
      roles: ["super_admin", "technician"]
    },
    {
      id: "self-healing",
      label: "❤️ Self-Healing",
      icon: Heart,
      component: <SelfHealing />,
      roles: ["super_admin", "technician"]
    },
    {
      id: "multi-cloud",
      label: "☁️ Multi-Cloud",
      icon: Cloud,
      component: <MultiCloud />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "api-gateway",
      label: "🔑 API Gateway",
      icon: Key,
      component: <APIGateway />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "webhooks",
      label: "⚡ Webhooks",
      icon: Zap,
      component: <WebhookEngine />,
      roles: ["super_admin", "manager", "technician"]
    }
  ];

  return (
    <DomainLayout
      title="Cloud & DevOps"
      description="Infrastructure orchestration, container management, and deployment pipelines."
      icon={Cloud}
      tabs={tabs}
      defaultTab="resources"
      basePath="/cloud-devops"
    />
  );
}
