import { Smartphone, Download, Target } from "lucide-react";
import DomainLayout, { DomainTab } from "@/components/DomainLayout";

export default function MobileDomain() {
  const tabs: DomainTab[] = [
    {
      id: "overview",
      label: "App Overview",
      icon: Target,
      component: <div className="p-8 text-center glass-card rounded-lg flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold">Mobile App Ready</h2>
        <p className="text-muted-foreground mt-2 mb-6">Scan to test push notifications on your device</p>
        <div className="w-48 h-48 bg-white p-2 rounded-xl mb-4 flex items-center justify-center">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=kelvy-cybertech-hub://app" alt="QR Code" className="w-full h-full" />
        </div>
      </div>,
      roles: ["super_admin", "technician", "manager"]
    },
    {
      id: "build",
      label: "Build App",
      icon: Download,
      component: <div className="p-8 text-center glass-card rounded-lg"><h2 className="text-xl font-bold">APK Generator</h2><p className="text-muted-foreground mt-2">Triggering Expo builds...</p></div>,
      roles: ["super_admin", "technician", "manager"]
    }
  ];

  return (
    <DomainLayout
      title="Mobile OS"
      description="Kelvy CyberTech Hub Native Android & iOS Application Management."
      icon={Smartphone}
      tabs={tabs}
      defaultTab="overview"
      basePath="/mobile"
    />
  );
}
