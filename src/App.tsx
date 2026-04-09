import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";

// Lazy-loaded pages
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));
const SecuritySettingsPage = lazy(() => import("@/pages/SecuritySettingsPage"));
const CallPage = lazy(() => import("@/pages/call/[userId]"));
const GroupCallPage = lazy(() => import("@/pages/GroupCallPage"));
const EnhancedChatWithAI = lazy(() => import("@/pages/EnhancedChatWithAI"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Domain pages (Lazy)
const CybersecurityDomain = lazy(() => import("@/pages/domains/CybersecurityDomain"));
const NetworkingDomain = lazy(() => import("@/pages/domains/NetworkingDomain"));
const SoftwareDevDomain = lazy(() => import("@/pages/domains/SoftwareDevDomain"));
const DataAnalyticsDomain = lazy(() => import("@/pages/domains/DataAnalyticsDomain"));
const AIMLDomain = lazy(() => import("@/pages/domains/AIMLDomain"));
const CloudDevOpsDomain = lazy(() => import("@/pages/domains/CloudDevOpsDomain"));
const MobileDomain = lazy(() => import("@/pages/domains/MobileDomain"));
const BusinessDomain = lazy(() => import("@/pages/domains/BusinessDomain"));
const CommunicationDomain = lazy(() => import("@/pages/domains/CommunicationDomain"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="font-mono text-sm text-muted-foreground animate-pulse">Initializing Neural Interface...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<LoadingFallback />}>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Main App Routes with DashboardLayout */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
                <Route path="/cybersecurity" element={<ProtectedRoute><DashboardLayout><CybersecurityDomain /></DashboardLayout></ProtectedRoute>} />
                <Route path="/networking" element={<ProtectedRoute><DashboardLayout><NetworkingDomain /></DashboardLayout></ProtectedRoute>} />
                <Route path="/software-dev" element={<ProtectedRoute><DashboardLayout><SoftwareDevDomain /></DashboardLayout></ProtectedRoute>} />
                <Route path="/data-analytics" element={<ProtectedRoute><DashboardLayout><DataAnalyticsDomain /></DashboardLayout></ProtectedRoute>} />
                <Route path="/ai-ml" element={<ProtectedRoute><DashboardLayout><AIMLDomain /></DashboardLayout></ProtectedRoute>} />
                <Route path="/cloud-devops" element={<ProtectedRoute><DashboardLayout><CloudDevOpsDomain /></DashboardLayout></ProtectedRoute>} />
                <Route path="/mobile" element={<ProtectedRoute><DashboardLayout><MobileDomain /></DashboardLayout></ProtectedRoute>} />
                <Route path="/business" element={<ProtectedRoute><DashboardLayout><BusinessDomain /></DashboardLayout></ProtectedRoute>} />
                <Route path="/communication" element={<ProtectedRoute><DashboardLayout><CommunicationDomain /></DashboardLayout></ProtectedRoute>} />
                
                {/* Other settings / extras */}
                <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SecuritySettingsPage /></DashboardLayout></ProtectedRoute>} />
                <Route path="/enhanced-chat" element={<ProtectedRoute><DashboardLayout><EnhancedChatWithAI /></DashboardLayout></ProtectedRoute>} />
                
                {/* Call Routes - without DashboardLayout (full screen) */}
                <Route path="/call/:userId" element={<ProtectedRoute><CallPage /></ProtectedRoute>} />
                <Route path="/group-call/:roomId" element={<ProtectedRoute><GroupCallPage /></ProtectedRoute>} />
                
                {/* 404 Not Found */}
                <Route path="*" element={<LandingPage />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </Suspense>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;





