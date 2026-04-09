import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Users, Plus, Search, Filter, Phone, Mail, Calendar,
  Star, MessageSquare, TrendingUp, TrendingDown,
  Brain, Sparkles, Clock, CheckCircle, XCircle,
  BarChart3, PieChart, Activity, Target, AlertTriangle,
  Building2, Briefcase, Tag, DollarSign, FileText,
  Send, Edit, Trash2, Eye, MoreVertical, Loader2, CreditCard
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  mpesa_number?: string;
  address?: string;
  contract_value?: number;
  company: string;
  industry: string;
  status: string;
  priority: string;
  ai_summary: string;
  sentiment_score: number;
  risk_level: string;
  predicted_value: number;
  tags: string[];
  last_contact: string;
  next_follow_up: string;
  recent_interactions: any[];
  interaction_count: number;
  open_tasks: number;
  active_deals: number;
  total_deal_value: number;
}

interface Interaction {
  id: number;
  client_id: number;
  interaction_type: string;
  subject: string;
  content: string;
  sentiment: string;
  ai_summary: string;
  key_points: string[];
  action_items: string[];
  created_at: string;
}

interface Task {
  id: number;
  client_id: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  ai_suggested: boolean;
}

interface Deal {
  id: number;
  client_id: number;
  name: string;
  value: number;
  stage: string;
  probability: number;
  ai_prediction: number;
  status: string;
}

const priorityColors = {
  high: "text-red-500 bg-red-500/10",
  medium: "text-yellow-500 bg-yellow-500/10",
  low: "text-green-500 bg-green-500/10"
};

const sentimentColors = {
  positive: "text-green-500 bg-green-500/10",
  neutral: "text-yellow-500 bg-yellow-500/10",
  negative: "text-red-500 bg-red-500/10"
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CRMPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    mpesa_number: "",
    address: "",
    contract_value: 0,
    company: "",
    industry: "",
    priority: "medium",
    notes: ""
  });
  const [newInteraction, setNewInteraction] = useState({
    interaction_type: "call",
    subject: "",
    content: "",
    duration_minutes: 30
  });
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"clients" | "dashboard" | "deals" | "analytics">("dashboard");
  const [emailDraft, setEmailDraft] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const generateEmailDraft = async (clientId: number) => {
    const response = await fetch(`http://localhost:8000/api/crm/ai/draft-email/${clientId}`);
    const result = await response.json();
    if (result.success) setEmailDraft(result.draft);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsRes, dashboardRes] = await Promise.all([
        fetch("http://localhost:8000/api/crm/clients"),
        fetch("http://localhost:8000/api/crm/dashboard")
      ]);
      
      const clientsResult = await clientsRes.json();
      const dashboardResult = await dashboardRes.json();
      
      if (clientsResult.success) setClients(clientsResult.data);
      if (dashboardResult.success) setDashboard(dashboardResult.data);
      
    } catch (error) {
      console.error("Error loading CRM data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetails = async (clientId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/crm/clients/${clientId}`);
      const result = await response.json();
      if (result.success) {
        setSelectedClient(result.data.client);
        setInteractions(result.data.interactions);
        setTasks(result.data.tasks);
        setDeals(result.data.deals);
        
        // Get AI task suggestion
        const suggestionRes = await fetch(`http://localhost:8000/api/crm/ai/suggest-task/${clientId}`);
        const suggestionResult = await suggestionRes.json();
        if (suggestionResult.success) setAiSuggestion(suggestionResult.data);
      }
    } catch (error) {
      console.error("Error loading client details:", error);
    }
  };

  const createClient = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/crm/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient)
      });
      const result = await response.json();
      if (result.success) {
        setShowCreateModal(false);
        loadData();
        setNewClient({
          name: "", email: "", phone: "", mpesa_number: "", address: "", contract_value: 0, company: "", industry: "", priority: "medium", notes: ""
        });
      }
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  const createInteraction = async () => {
    if (!selectedClient) return;
    try {
      const response = await fetch("http://localhost:8000/api/crm/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClient.id,
          ...newInteraction
        })
      });
      const result = await response.json();
      if (result.success) {
        setShowInteractionModal(false);
        loadClientDetails(selectedClient.id);
        loadData();
        setNewInteraction({
          interaction_type: "call", subject: "", content: "", duration_minutes: 30
        });
        
        // Show AI analysis alert
        alert(`AI Analysis:\n${result.ai_analysis?.summary || "Interaction recorded"}`);
      }
    } catch (error) {
      console.error("Error creating interaction:", error);
    }
  };

  const completeTask = async (taskId: number) => {
    try {
      await fetch(`http://localhost:8000/api/crm/tasks/${taskId}/complete`, {
        method: "PUT"
      });
      if (selectedClient) loadClientDetails(selectedClient.id);
      loadData();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              AI-Powered CRM
            </h1>
            <p className="text-sm text-muted-foreground">Intelligent client relationship management</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm w-64"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex px-4">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "dashboard" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("clients")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "clients" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Clients
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "analytics" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <PieChart className="w-4 h-4" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("deals")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "deals" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <Target className="w-4 h-4" />
          Deals Pipeline
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && dashboard && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Total Clients</span>
              </div>
              <div className="text-2xl font-bold">{dashboard.total_clients}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Deal Value</span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                KES {dashboard.total_deal_value?.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Active Deals</span>
              </div>
              <div className="text-2xl font-bold">{dashboard.active_deals || 0}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Pending Tasks</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500">{dashboard.pending_tasks || 0}</div>
            </div>
          </div>

          {/* Sentiment Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Client Sentiment
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie
                    data={[
                      { name: "Positive", value: dashboard.sentiment_distribution?.positive || 0 },
                      { name: "Neutral", value: dashboard.sentiment_distribution?.neutral || 0 },
                      { name: "Negative", value: dashboard.sentiment_distribution?.negative || 0 }
                    ]}
                    cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80} fill="#8884d8" dataKey="value"
                  >
                    <Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                AI Insight
              </h3>
              <p className="text-sm whitespace-pre-wrap">{dashboard.ai_insight || "Loading AI insights..."}</p>
            </div>
          </div>

          {/* Recent Interactions */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Recent Interactions</h3>
            <div className="space-y-3">
              {dashboard.recent_interactions?.slice(0, 5).map((interaction: any) => (
                <div key={interaction.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`p-2 rounded-lg ${sentimentColors[interaction.sentiment] || "bg-gray-500/10"}`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap">
                      <span className="font-medium">{interaction.subject}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(interaction.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{interaction.ai_summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === "clients" && (
        <div className="flex-1 overflow-hidden flex">
          {/* Client List */}
          <div className="w-96 border-r border-border overflow-y-auto">
            <div className="p-3 space-y-2">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  onClick={() => loadClientDetails(client.id)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedClient?.id === client.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{client.name}</h3>
                      <p className="text-xs text-muted-foreground">{client.company || "Individual"}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[client.priority]}`}>
                          {client.priority}
                        </span>
                        {client.risk_level === "high" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">High Risk</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono">KES {client.total_deal_value?.toLocaleString() || 0}</div>
                      <div className="text-xs text-muted-foreground">{client.interaction_count} interactions</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedClient ? (
              <div className="p-4 space-y-4">
                {/* Client Header */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        {selectedClient.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedClient.email}</span>}
                        {selectedClient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedClient.phone}</span>}
                        {selectedClient.mpesa_number && <span className="flex items-center gap-1 text-green-500 font-mono"><CreditCard className="w-3 h-3" /> {selectedClient.mpesa_number}</span>}
                        {selectedClient.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {selectedClient.company}</span>}
                        {selectedClient.address && <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {selectedClient.address}</span>}
                      </div>
                      <div className="mt-2">
                        <span className="text-lg font-bold text-primary">KES {selectedClient.contract_value?.toLocaleString() || 0}</span>
                        <span className="text-xs text-muted-foreground ml-2">Contract Value</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowInteractionModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Interaction
                    </button>
                  </div>
                  
                  {/* AI Summary */}
                  {selectedClient.ai_summary && (
                    <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-500 text-sm mb-1">
                        <Brain className="w-4 h-4" />
                        AI Summary
                      </div>
                      <p className="text-sm">{selectedClient.ai_summary}</p>
                    </div>
                  )}
                  
                  {/* AI Task Suggestion */}
                  {aiSuggestion && (
                    <div className="mt-3 p-3 bg-blue-500/10 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-500 text-sm mb-1">
                        <Sparkles className="w-4 h-4" />
                        AI Suggested Task
                      </div>
                      <p className="text-sm font-medium">{aiSuggestion.task_title}</p>
                      <p className="text-xs text-blue-500 mt-1">{aiSuggestion.reason}</p>
                    </div>
                  )}
                  
                  {/* AI Follow-up Draft */}
                  <div className="mt-3 p-3 bg-green-500/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-green-500 text-sm">
                        <Send className="w-4 h-4" />
                        AI Follow-up Draft
                      </div>
                      <button 
                        onClick={() => generateEmailDraft(selectedClient.id)}
                        className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full hover:bg-green-500/30 transition flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        Generate
                      </button>
                    </div>
                    {emailDraft ? (
                      <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground bg-black/20 p-2 rounded">
                        {emailDraft}
                      </pre>
                    ) : (
                      <p className="text-[10px] text-muted-foreground italic">No draft generated yet.</p>
                    )}
                  </div>
                </div>

                {/* Tabs for client details */}
                <div className="border-b border-border flex">
                  <button className="px-4 py-2 text-sm border-b-2 border-primary text-primary">Interactions</button>
                  <button className="px-4 py-2 text-sm text-muted-foreground">Tasks</button>
                  <button className="px-4 py-2 text-sm text-muted-foreground">Deals</button>
                </div>

                {/* Interactions List */}
                <div className="space-y-3">
                  {interactions.map(interaction => (
                    <div key={interaction.id} className="bg-card border border-border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${sentimentColors[interaction.sentiment]}`}>
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap">
                            <span className="font-medium">{interaction.subject}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(interaction.created_at)}</span>
                          </div>
                          <p className="text-sm mt-1">{interaction.content}</p>
                          {interaction.ai_summary && (
                            <div className="mt-2 text-xs text-purple-400 bg-purple-500/5 p-2 rounded">
                              🤖 {interaction.ai_summary}
                            </div>
                          )}
                          {interaction.action_items?.length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {interaction.action_items.map((item, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">
                                  📋 {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a client to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deals Tab */}
      {activeTab === "deals" && (
        <div className="flex-1 overflow-x-auto p-4 flex gap-4 bg-muted/20">
          {["lead", "prospect", "quote", "deal", "closed"].map(stage => (
            <div key={stage} className="w-80 shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold uppercase text-xs tracking-wider text-muted-foreground">{stage}</h3>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{deals.filter(d => d.stage === stage).length}</span>
              </div>
              <div className="flex-1 space-y-3">
                {deals.filter(d => d.stage === stage).map(deal => (
                  <div key={deal.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 transition cursor-move">
                    <div className="font-semibold text-sm mb-1">{deal.name}</div>
                    <div className="text-xl font-bold text-primary mb-3">KES {deal.value?.toLocaleString() || 0}</div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Prob: {deal.probability}%</span>
                      <span className={deal.ai_prediction > 70 ? "text-green-500" : "text-yellow-500"}>AI: {deal.ai_prediction}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Tab (Existing) */}
      {activeTab === "analytics" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Client Distribution by Industry</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(clients.reduce((acc, c) => {
                acc[c.industry || "Other"] = (acc[c.industry || "Other"] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Deal Pipeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deals.map(d => ({ name: d.name, value: d.value, stage: d.stage }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Create Client Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCreateModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl z-50 p-6">
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Name *" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="email" placeholder="Email" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="text" placeholder="Phone" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="text" placeholder="M-Pesa Number" value={newClient.mpesa_number} onChange={(e) => setNewClient({...newClient, mpesa_number: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="text" placeholder="Company" value={newClient.company} onChange={(e) => setNewClient({...newClient, company: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="text" placeholder="Industry" value={newClient.industry} onChange={(e) => setNewClient({...newClient, industry: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="number" placeholder="Contract Value (KES)" value={newClient.contract_value} onChange={(e) => setNewClient({...newClient, contract_value: Number(e.target.value)})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <select value={newClient.priority} onChange={(e) => setNewClient({...newClient, priority: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <input type="text" placeholder="Address" value={newClient.address} onChange={(e) => setNewClient({...newClient, address: e.target.value})} className="w-full px-3 py-2 mt-4 rounded border border-border bg-background" />
            <textarea placeholder="Notes (AI will analyze)" rows={3} value={newClient.notes} onChange={(e) => setNewClient({...newClient, notes: e.target.value})} className="w-full px-3 py-2 mt-4 rounded border border-border bg-background" />
            <div className="flex gap-3 mt-6">
              <button onClick={createClient} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Create Client</button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* Add Interaction Modal */}
      {showInteractionModal && selectedClient && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowInteractionModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl z-50 p-6">
            <h2 className="text-xl font-bold mb-4">Add Interaction for {selectedClient.name}</h2>
            <div className="space-y-4">
              <select value={newInteraction.interaction_type} onChange={(e) => setNewInteraction({...newInteraction, interaction_type: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background">
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="chat">Chat</option>
                <option value="note">Note</option>
              </select>
              <input type="text" placeholder="Subject *" value={newInteraction.subject} onChange={(e) => setNewInteraction({...newInteraction, subject: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <textarea placeholder="Content / Notes" rows={5} value={newInteraction.content} onChange={(e) => setNewInteraction({...newInteraction, content: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="number" placeholder="Duration (minutes)" value={newInteraction.duration_minutes} onChange={(e) => setNewInteraction({...newInteraction, duration_minutes: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded border border-border bg-background" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={createInteraction} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Save & Analyze</button>
              <button onClick={() => setShowInteractionModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">AI will analyze sentiment, extract key points, and suggest action items</p>
          </div>
        </>
      )}
    </div>
  );
}
