import { useState, useEffect } from "react";
import { 
  BarChart3, Activity, Brain, FileText, Search, PieChart, 
  TrendingUp, TrendingDown, Users, Shield, Zap, MessageSquare, 
  Phone, Ticket, Calendar, Download, Share2, Filter, 
  ArrowUpRight, ArrowDownRight, Clock, Target, AlertTriangle
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from "recharts";
import MetricCard from "@/components/MetricCard";
import { toast } from "sonner";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DataAnalyticsRebuild() {
  const [activeTab, setActiveTab] = useState("business");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  // Load data based on active tab and date range
  useEffect(() => {
    // fetchData();
  }, [activeTab, dateRange]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "business":
        return <BusinessBITab />;
      case "security":
        return <SecurityAnalyticsTab />;
      case "dev":
        return <DevAnalyticsTab />;
      case "team":
        return <TeamAnalyticsTab />;
      case "kada":
        return <KADAAssistantTab />;
      default:
        return <BusinessBITab />;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold gradient-text">DATA ANALYTICS ECOSYSTEM</h1>
          <p className="text-sm text-muted-foreground font-mono">Real-time intelligence • AI-Powered Insights • Predictive Analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border">
            <input 
              type="date" 
              className="bg-transparent border-none text-xs font-mono focus:ring-0 p-1"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <span className="text-muted-foreground">-</span>
            <input 
              type="date" 
              className="bg-transparent border-none text-xs font-mono focus:ring-0 p-1"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-muted/20 rounded-xl border border-border sticky top-0 z-10 backdrop-blur-md">
        <TabButton id="business" label="Business BI" icon={TrendingUp} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="security" label="Security" icon={Shield} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="dev" label="Dev Analytics" icon={Zap} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="team" label="Team Performance" icon={Users} activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="kada" label="KADA AI" icon={Brain} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
}

function TabButton({ id, label, icon: Icon, activeTab, setActiveTab }: any) {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        isActive 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
      {label}
    </button>
  );
}

// Tab Components (Shells)
function BusinessBITab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={TrendingUp} title="Monthly Revenue" value="KES 1.2M" variant="green" change="+12.5%" />
        <MetricCard icon={Users} title="Active Clients" value="48" variant="cyan" change="+3 new" />
        <MetricCard icon={Target} title="Churn Risk" value="4.2%" variant="orange" change="-1.2%" />
        <MetricCard icon={Activity} title="Avg Deal Value" value="KES 250K" variant="cyan" />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Revenue Growth" description="Monthly revenue trends with AI forecasting">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
              <Area type="monotone" dataKey="forecast" strokeDasharray="5 5" stroke="var(--secondary)" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Revenue by Client" description="Top contributors to total revenue">
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie data={[]} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <AIInsightSection 
        title="Predictive Business Intelligence" 
        insights={[
          "Revenue is projected to grow by 15% next quarter based on current contract trends.",
          "High churn risk detected for 2 clients in the manufacturing sector due to low system engagement.",
          "Upsell opportunity: 5 clients on the 'Basic' security plan exceed their scan quota regularly."
        ]}
      />
    </div>
  );
}

function SecurityAnalyticsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={Shield} title="Total Scans" value="1,248" variant="cyan" change="+15% wk" />
        <MetricCard icon={AlertTriangle} title="Critical Vulns" value="12" variant="red" change="-5 since yesterday" />
        <MetricCard icon={Clock} title="Avg Fix Time" value="4.2h" variant="cyan" change="-10%" />
        <MetricCard icon={Zap} title="Threats Blocked" value="8.4K" variant="green" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Scan Tool Distribution" description="Usage breakdown of security tools">
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        
        <ChartCard title="Vuln Severity Trend" description="New vulnerabilities detected over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      <AIInsightSection 
        title="Security Posture Analytics" 
        insights={[
          "SQL Injection attempts have increased by 200% against Client X's staging environment.",
          "Nmap scans show 3 unmapped public-facing ports on the main internal network.",
          "Recommendation: Run immediate Nuclei scans on the WordPress fleet to mitigate recent CVE-2024-XXXX."
        ]}
      />
    </div>
  );
}

function DevAnalyticsTab() {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={Zap} title="Commits" value="452" variant="cyan" change="+20" />
        <MetricCard icon={Target} title="PR Success" value="94%" variant="green" />
        <MetricCard icon={Brain} title="AI Assistants" value="1.2K" variant="purple" change="queries" />
        <MetricCard icon={FileText} title="Lines Added" value="45K" variant="cyan" />
      </div>

      <ChartCard title="AI Usage vs Productivity" description="Correlation between AI interactions and code output">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={[]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="commits" fill="var(--primary)" fillOpacity={0.6} />
            <Line yAxisId="right" type="monotone" dataKey="ai_queries" stroke="var(--secondary)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
      
      <AIInsightSection 
        title="Developer Productivity AI" 
        insights={[
          "Unit test coverage is lagging behind new feature development in the 'auth-service' repository.",
          "AI code generation is most frequently used for 'Refactoring' and 'API Boilerplate'.",
          "Potential bottleneck: PR review times have increased to 12 hours on average."
        ]}
      />
    </div>
  );
}

function TeamAnalyticsTab() {
  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={MessageSquare} title="Messages" value="2.8K" variant="cyan" />
        <MetricCard icon={Phone} title="Meeting Time" value="12h" variant="orange" />
        <MetricCard icon={Ticket} title="Tickets Resolved" value="142" variant="green" />
        <MetricCard icon={Clock} title="Resp. Time" value="1.2h" variant="cyan" />
      </div>

      <AIInsightSection 
        title="Team Dynamics & Health" 
        insights={[
          "Team member 'Alex' is currently handling 40% of all critical security tickets. High risk of burnout.",
          "Communication volume peaks at 10 AM, suggesting this is the optimal time for quick syncs.",
          "Support resolution time has improved by 22% since the implementation of AI Suggester."
        ]}
      />
    </div>
  );
}

function KADAAssistantTab() {
  const [messages, setMessages] = useState<any[]>([
    { role: "assistant", content: "Hello! I'm KADA, your Kelvy AI Data Analyst. Ask me anything about our business, security, dev, or team metrics." }
  ]);
  const [query, setQuery] = useState("");

  const handleQuery = () => {
    if (!query) return;
    setMessages([...messages, { role: "user", content: query }]);
    setQuery("");
    // TODO: Connect to backend
  };

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-[600px] overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-bold">KADA AI ANALYST</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Ollama Online
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 border border-border"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            placeholder="Ask a question (e.g., 'What is our MRR trend?')"
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <button 
            onClick={handleQuery}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
          >
            Ask KADA
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          KADA queries live Supabase data and uses Ollama qwen2.5:7b for analysis.
        </p>
      </div>
    </div>
  );
}

// UI Components
function ChartCard({ title, description, children }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function AIInsightSection({ title, insights }: { title: string, insights: string[] }) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 border-glow-green">
      <div className="flex items-center gap-2 text-primary mb-3">
        <Brain className="w-5 h-5" />
        <h3 className="font-display font-bold text-sm uppercase tracking-wider">{title}</h3>
      </div>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-foreground/90">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <p>{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
