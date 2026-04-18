import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import DomainLayout from "@/components/DomainLayout";
import { lazy, Suspense } from "react";

// Lazy load all pages
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Cybersecurity Domain
const LinuxToolsHub = lazy(() => import("@/pages/security/LinuxToolsHub"));
const SOCDashboard = lazy(() => import("@/pages/security/SOCDashboard"));
const ThreatRadar = lazy(() => import("@/pages/security/ThreatRadar"));
const HackerGlobe = lazy(() => import("@/pages/security/HackerGlobe"));
const DarkWebMonitor = lazy(() => import("@/pages/security/DarkWebMonitor"));
const KASA = lazy(() => import("@/pages/security/KASA"));

// Networking Domain
const NetworkMap = lazy(() => import("@/pages/networking/NetworkMap"));
const DeviceDiscovery = lazy(() => import("@/pages/networking/DeviceDiscovery"));
const KANA = lazy(() => import("@/pages/networking/KANA"));

// Software Dev Domain
const IDE = lazy(() => import("@/pages/software/IDE"));
const CodeReview = lazy(() => import("@/pages/software/CodeReview"));
const KACA = lazy(() => import("@/pages/software/KACA"));

// Data Analytics Domain
const BusinessBI = lazy(() => import("@/pages/analytics/BusinessBI"));
const ExecutiveDashboard = lazy(() => import("@/pages/analytics/ExecutiveDashboard"));
const KADA = lazy(() => import("@/pages/analytics/KADA"));

// AI/ML Domain
const AIChat = lazy(() => import("@/pages/aiml/AIChat"));
const VisionAnalysis = lazy(() => import("@/pages/aiml/VisionAnalysis"));
const VoiceAssistant = lazy(() => import("@/pages/aiml/VoiceAssistant"));

// Business Domain
const CRM = lazy(() => import("@/pages/business/CRM"));
const ERP = lazy(() => import("@/pages/business/ERP"));
const ITSM = lazy(() => import("@/pages/business/ITSM"));
const EcommerceDashboard = lazy(() => import("@/pages/business/EcommerceDashboard"));
const KABA = lazy(() => import("@/pages/business/KABA"));

// Communication Domain
const TeamChat = lazy(() => import("@/pages/communication/TeamChat"));
const VideoCalls = lazy(() => import("@/pages/communication/VideoCalls"));
const Contacts = lazy(() => import("@/pages/communication/Contacts"));
const Meetings = lazy(() => import("@/pages/communication/Meetings"));
const MeetingNotes = lazy(() => import("@/pages/communication/MeetingNotes"));
const EmailComposer = lazy(() => import("@/pages/communication/EmailComposer"));

// Personal Domain
const PersonalJournal = lazy(() => import("@/pages/personal/PersonalJournal"));
const DocumentSummarizer = lazy(() => import("@/pages/personal/DocumentSummarizer"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><DomainLayout domain="dashboard"><Dashboard /></DomainLayout></ProtectedRoute>} />
                
                {/* Cybersecurity Domain */}
                <Route path="/security/linux-tools" element={<ProtectedRoute><DomainLayout domain="cybersecurity"><LinuxToolsHub /></DomainLayout></ProtectedRoute>} />
                <Route path="/security/soc" element={<ProtectedRoute><DomainLayout domain="cybersecurity"><SOCDashboard /></DomainLayout></ProtectedRoute>} />
                <Route path="/security/radar" element={<ProtectedRoute><DomainLayout domain="cybersecurity"><ThreatRadar /></DomainLayout></ProtectedRoute>} />
                <Route path="/security/globe" element={<ProtectedRoute><DomainLayout domain="cybersecurity"><HackerGlobe /></DomainLayout></ProtectedRoute>} />
                <Route path="/security/darkweb" element={<ProtectedRoute><DomainLayout domain="cybersecurity"><DarkWebMonitor /></DomainLayout></ProtectedRoute>} />
                <Route path="/security/kasa" element={<ProtectedRoute><DomainLayout domain="cybersecurity"><KASA /></DomainLayout></ProtectedRoute>} />
                
                {/* Networking Domain */}
                <Route path="/network/map" element={<ProtectedRoute><DomainLayout domain="networking"><NetworkMap /></DomainLayout></ProtectedRoute>} />
                <Route path="/network/devices" element={<ProtectedRoute><DomainLayout domain="networking"><DeviceDiscovery /></DomainLayout></ProtectedRoute>} />
                <Route path="/network/kana" element={<ProtectedRoute><DomainLayout domain="networking"><KANA /></DomainLayout></ProtectedRoute>} />
                
                {/* Software Dev Domain */}
                <Route path="/software/ide" element={<ProtectedRoute><DomainLayout domain="software"><IDE /></DomainLayout></ProtectedRoute>} />
                <Route path="/software/code-review" element={<ProtectedRoute><DomainLayout domain="software"><CodeReview /></DomainLayout></ProtectedRoute>} />
                <Route path="/software/kaca" element={<ProtectedRoute><DomainLayout domain="software"><KACA /></DomainLayout></ProtectedRoute>} />
                
                {/* Data Analytics Domain */}
                <Route path="/analytics/bi" element={<ProtectedRoute><DomainLayout domain="analytics"><BusinessBI /></DomainLayout></ProtectedRoute>} />
                <Route path="/analytics/executive" element={<ProtectedRoute><DomainLayout domain="analytics"><ExecutiveDashboard /></DomainLayout></ProtectedRoute>} />
                <Route path="/analytics/kada" element={<ProtectedRoute><DomainLayout domain="analytics"><KADA /></DomainLayout></ProtectedRoute>} />
                
                {/* AI/ML Domain */}
                <Route path="/aiml/chat" element={<ProtectedRoute><DomainLayout domain="aiml"><AIChat /></DomainLayout></ProtectedRoute>} />
                <Route path="/aiml/vision" element={<ProtectedRoute><DomainLayout domain="aiml"><VisionAnalysis /></DomainLayout></ProtectedRoute>} />
                <Route path="/aiml/voice" element={<ProtectedRoute><DomainLayout domain="aiml"><VoiceAssistant /></DomainLayout></ProtectedRoute>} />
                
                {/* Business Domain */}
                <Route path="/business/crm" element={<ProtectedRoute><DomainLayout domain="business"><CRM /></DomainLayout></ProtectedRoute>} />
                <Route path="/business/erp" element={<ProtectedRoute><DomainLayout domain="business"><ERP /></DomainLayout></ProtectedRoute>} />
                <Route path="/business/itsm" element={<ProtectedRoute><DomainLayout domain="business"><ITSM /></DomainLayout></ProtectedRoute>} />
                <Route path="/business/ecommerce" element={<ProtectedRoute><DomainLayout domain="business"><EcommerceDashboard /></DomainLayout></ProtectedRoute>} />
                <Route path="/business/kaba" element={<ProtectedRoute><DomainLayout domain="business"><KABA /></DomainLayout></ProtectedRoute>} />
                
                {/* Communication Domain */}
                <Route path="/communication/chat" element={<ProtectedRoute><DomainLayout domain="communication"><TeamChat /></DomainLayout></ProtectedRoute>} />
                <Route path="/communication/calls" element={<ProtectedRoute><DomainLayout domain="communication"><VideoCalls /></DomainLayout></ProtectedRoute>} />
                <Route path="/communication/contacts" element={<ProtectedRoute><DomainLayout domain="communication"><Contacts /></DomainLayout></ProtectedRoute>} />
                <Route path="/communication/meetings" element={<ProtectedRoute><DomainLayout domain="communication"><Meetings /></DomainLayout></ProtectedRoute>} />
                <Route path="/communication/meeting-notes" element={<ProtectedRoute><DomainLayout domain="communication"><MeetingNotes /></DomainLayout></ProtectedRoute>} />
                <Route path="/communication/email-composer" element={<ProtectedRoute><DomainLayout domain="communication"><EmailComposer /></DomainLayout></ProtectedRoute>} />
                
                {/* Personal Domain */}
                <Route path="/personal/journal" element={<ProtectedRoute><DomainLayout domain="personal"><PersonalJournal /></DomainLayout></ProtectedRoute>} />
                <Route path="/personal/summarize" element={<ProtectedRoute><DomainLayout domain="personal"><DocumentSummarizer /></DomainLayout></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
