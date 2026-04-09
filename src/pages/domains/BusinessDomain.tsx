import { Briefcase, Users, Database, Ticket, Brain, BarChart3, Receipt, RefreshCw, CreditCard, Calculator, FileSearch, FileEdit, PenTool, Gift } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";
import CRMPage from "@/pages/CRMPage";
import ERP from "@/pages/ERP";
import ITSMPage from "@/pages/ITSMPage";
import AIAssistant from "@/pages/AIAssistant";
import ClientBilling from "./business/ClientBilling";
import SubscriptionManagement from "./business/SubscriptionManagement";
import CryptoPayments from "./business/CryptoPayments";
import TaxAutomation from "./business/TaxAutomation";
import ContractAnalyzer from "./business/ContractAnalyzer";
import ProposalGenerator from "./business/ProposalGenerator";
import DigitalSignature from "./business/DigitalSignature";
import ClientReferral from "./business/ClientReferral";

export default function BusinessDomain() {
  const tabs: DomainTab[] = [
    {
      id: "crm",
      label: "👥 CRM",
      icon: Users,
      component: <CRMPage />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "erp",
      label: "💰 ERP",
      icon: Database,
      component: <ERP />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "itsm",
      label: "🎫 ITSM",
      icon: Ticket,
      component: <ITSMPage />,
      roles: ["super_admin", "manager", "technician"]
    },
    {
      id: "analytics",
      label: "📈 Analytics",
      icon: BarChart3,
      component: <div className="p-8 text-center text-muted-foreground">Business Intelligence Analytics (Placeholder)</div>,
      roles: ["super_admin", "manager"]
    },
    {
      id: "billing",
      label: "🧾 Billing",
      icon: Receipt,
      component: <ClientBilling />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "subscriptions",
      label: "🔄 Subscriptions",
      icon: RefreshCw,
      component: <SubscriptionManagement />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "payments",
      label: "💳 Payments",
      icon: CreditCard,
      component: <CryptoPayments />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "tax",
      label: "⚖️ Tax (KRA)",
      icon: Calculator,
      component: <TaxAutomation />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "contracts",
      label: "📄 Contracts",
      icon: FileSearch,
      component: <ContractAnalyzer />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "proposals",
      label: "📝 Proposals",
      icon: FileEdit,
      component: <ProposalGenerator />,
      roles: ["super_admin", "manager"]
    },
    {
      id: "e-sign",
      label: "🖊️ E-Sign",
      icon: PenTool,
      component: <DigitalSignature />,
      roles: ["super_admin", "manager", "client"]
    },
    {
      id: "referral",
      label: "🎁 Referral",
      icon: Gift,
      component: <ClientReferral />,
      roles: ["super_admin", "manager", "client", "guest"]
    },
    {
      id: "kaba",
      label: "🤖 KABA AI",
      icon: Brain,
      component: <AIAssistant title="KABA (Kelvy AI Business Analyst)" />,
      roles: ["super_admin", "manager"]
    }
  ];

  return (
    <DomainLayout
      title="Business Operations"
      description="Enterprise resource planning, customer relations and ticketing."
      icon={Briefcase}
      tabs={tabs}
      defaultTab="crm"
      basePath="/business"
    />
  );
}
