import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import SecurityHub from "@/pages/SecurityHub";
import AIAssistant from "@/pages/AIAssistant";
import LinuxTools from "@/pages/LinuxTools";
import CRM from "@/pages/CRM";
import ERP from "@/pages/ERP";
import ITSM from "@/pages/ITSM";
import Analytics from "@/pages/Analytics";
import NetworkHub from "@/pages/NetworkHub";
import IDE from "@/pages/IDE";
import Automation from "@/pages/Automation";
import ClientPortal from "@/pages/ClientPortal";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="*" element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/security" element={<SecurityHub />} />
                <Route path="/ai" element={<AIAssistant />} />
                <Route path="/tools" element={<LinuxTools />} />
                <Route path="/crm" element={<CRM />} />
                <Route path="/erp" element={<ERP />} />
                <Route path="/itsm" element={<ITSM />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/network" element={<NetworkHub />} />
                <Route path="/ide" element={<IDE />} />
                <Route path="/automation" element={<Automation />} />
                <Route path="/portal" element={<ClientPortal />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DashboardLayout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
