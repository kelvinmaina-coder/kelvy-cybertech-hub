import { Users, MessageSquare, Phone, UserPlus, Calendar, Bell, Layout, FolderUp, Award, Trophy, Star } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";
import Chat from "@/pages/Chat";
import Calls from "@/pages/Calls";
import ContactsPage from "@/pages/contacts/index";
import Meetings from "@/pages/Meetings";
import NotificationsHub from "@/pages/NotificationsHub";
import ClientPortal from "./communication/ClientPortal";
import FileExchange from "./communication/FileExchange";
import CertManagement from "./communication/CertManagement";
import SecurityLeaderboard from "./communication/SecurityLeaderboard";
import TeamAchievements from "./communication/TeamAchievements";

export default function CommunicationDomain() {
  const tabs: DomainTab[] = [
    {
      id: "chat",
      label: "💬 Group Chat",
      icon: MessageSquare,
      component: <Chat />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "calls",
      label: "📞 Video Calls",
      icon: Phone,
      component: <Calls />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "contacts",
      label: "👥 Contacts",
      icon: UserPlus,
      component: <ContactsPage />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "meetings",
      label: "📅 Meetings",
      icon: Calendar,
      component: <Meetings />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "notifications",
      label: "🔔 Notifications",
      icon: Bell,
      component: <NotificationsHub />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client", "guest"]
    },
    {
      id: "portal",
      label: "🌐 Client Portal",
      icon: Layout,
      component: <ClientPortal />,
      roles: ["super_admin", "manager", "client"]
    },
    {
      id: "files",
      label: "📁 File Exchange",
      icon: FolderUp,
      component: <FileExchange />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client"]
    },
    {
      id: "certs",
      label: "📜 Certs & Compliance",
      icon: Award,
      component: <CertManagement />,
      roles: ["super_admin", "manager", "security_analyst", "technician"]
    },
    {
      id: "leaderboard",
      label: "🏆 Leaderboard",
      icon: Trophy,
      component: <SecurityLeaderboard />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client"]
    },
    {
      id: "achievements",
      label: "🥇 Achievements",
      icon: Star,
      component: <TeamAchievements />,
      roles: ["super_admin", "manager", "security_analyst", "technician", "client"]
    }
  ];

  return (
    <DomainLayout
      title="Communication Hub"
      description="Integrated communication protocol for calls, chat, and team coordination."
      icon={MessageSquare}
      tabs={tabs}
      defaultTab="chat"
      basePath="/communication"
    />
  );
}
