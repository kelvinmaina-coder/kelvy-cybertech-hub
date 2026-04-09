import { BarChart3, Activity, Brain, FileText, Search, PieChart, TrendingUp, Shield, ShieldCheck } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";
import DataAnalyticsRebuild from "@/pages/DataAnalyticsRebuild";
import PredictiveScaling from "./analytics/PredictiveScaling";
import SecurityScorecard from "./analytics/SecurityScorecard";
import GDPRCenter from "./analytics/GDPRCenter";

export default function DataAnalyticsDomain() {
  const tabs: DomainTab[] = [
    {
      id: "analytics-rebuild",
      label: "📈 Analytics",
      icon: Activity,
      component: <DataAnalyticsRebuild />,
      roles: ["super_admin", "manager", "client"]
    },
    {
      id: "scaling",
      label: "⚖️ Auto-Scale",
      icon: TrendingUp,
      component: <PredictiveScaling />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "scorecard",
      label: "🛡️ Scorecard",
      icon: Shield,
      component: <SecurityScorecard />,
      roles: ["super_admin", "manager", "client", "guest"]
    },
    {
      id: "gdpr",
      label: "⚖️ GDPR",
      icon: ShieldCheck,
      component: <GDPRCenter />,
      roles: ["super_admin", "manager"]
    }
  ];

  return (
    <DomainLayout
      title="Data Analytics"
      description="Business intelligence, scanning metrics, and revenue tracking."
      icon={BarChart3}
      tabs={tabs}
      defaultTab="analytics"
      basePath="/data-analytics"
    />
  );
}
