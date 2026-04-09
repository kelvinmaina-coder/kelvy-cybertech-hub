import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Ticket, Plus, Search, Filter, Clock, AlertCircle, CheckCircle,
  Brain, Sparkles, TrendingUp, TrendingDown, Users, BarChart3,
  PieChart, Activity, Target, Zap, Shield, Server, Mail, Phone,
  MessageSquare, Send, Edit, Trash2, Eye, MoreVertical, Loader2,
  Calendar, Flag, Star, Award, Timer, FileText, BookOpen, RefreshCw
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  urgency: string;
  impact: string;
  assigned_to: string;
  requester_name: string;
  requester_email: string;
  ai_suggested_solution: string;
  ai_summary: string;
  ai_tags: string[];
  sla_deadline: string;
  sla_status: string;
  created_at: string;
  resolved_at: string;
}

interface Comment {
  id: number;
  ticket_id: number;
  content: string;
  is_internal: boolean;
  ai_analysis: string;
  created_at: string;
}

interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  resolution_steps: string[];
  times_used: number;
}

const priorityColors = {
  critical: "text-red-500 bg-red-500/10 border-red-500/30",
  high: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
  low: "text-green-500 bg-green-500/10 border-green-500/30"
};

const statusColors = {
  new: "text-blue-500 bg-blue-500/10",
  assigned: "text-purple-500 bg-purple-500/10",
  in_progress: "text-yellow-500 bg-yellow-500/10",
  pending: "text-orange-500 bg-orange-500/10",
  resolved: "text-green-500 bg-green-500/10",
  closed: "text-gray-500 bg-gray-500/10"
};

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

export default function ITSMPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeArticle[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [aiSolution, setAiSolution] = useState("");
  const [generatingSolution, setGeneratingSolution] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "incident",
    priority: "medium",
    urgency: "medium",
    impact: "single",
    requester_name: "",
    requester_email: "",
    requester_phone: ""
  });
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"tickets" | "dashboard" | "knowledge">("dashboard");

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8000/api/itsm/tickets";
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (params.toString()) url += `?${params.toString()}`;
      
      const [ticketsRes, dashboardRes, kbRes] = await Promise.all([
        fetch(url),
        fetch("http://localhost:8000/api/itsm/dashboard"),
        fetch("http://localhost:8000/api/itsm/knowledge-base")
      ]);
      
      const ticketsResult = await ticketsRes.json();
      const dashboardResult = await dashboardRes.json();
      const kbResult = await kbRes.json();
      
      if (ticketsResult.success) setTickets(ticketsResult.data);
      if (dashboardResult.success) setDashboard(dashboardResult.data);
      if (kbResult.success) setKnowledgeBase(kbResult.data);
      
    } catch (error) {
      console.error("Error loading ITSM data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/itsm/tickets/${ticketId}`);
      const result = await response.json();
      if (result.success) {
        setSelectedTicket(result.data.ticket);
        setComments(result.data.comments);
      }
    } catch (error) {
      console.error("Error loading ticket details:", error);
    }
  };

  const generateAISolution = async (ticketId: number) => {
    setGeneratingSolution(true);
    setShowSolutionModal(true);
    try {
      const response = await fetch(`http://localhost:8000/api/itsm/tickets/${ticketId}/ai-solution`, {
        method: "POST"
      });
      const result = await response.json();
      if (result.success) {
        setAiSolution(result.solution);
      }
    } catch (error) {
      console.error("Error generating AI solution:", error);
      setAiSolution("Unable to generate AI solution at this time.");
    } finally {
      setGeneratingSolution(false);
    }
  };

  const createTicket = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/itsm/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket)
      });
      const result = await response.json();
      if (result.success) {
        setShowCreateModal(false);
        loadData();
        setNewTicket({
          title: "", description: "", category: "incident", priority: "medium",
          urgency: "medium", impact: "single", requester_name: "", requester_email: "", requester_phone: ""
        });
        alert(`Ticket created! AI Analysis: ${result.ai_analysis?.summary || "Ticket analyzed"}`);
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;
    try {
      const response = await fetch("http://localhost:8000/api/itsm/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          content: newComment,
          is_internal: false
        })
      });
      const result = await response.json();
      if (result.success) {
        setNewComment("");
        loadTicketDetails(selectedTicket.id);
        loadData();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      await fetch(`http://localhost:8000/api/itsm/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      loadData();
      if (selectedTicket?.id === ticketId) loadTicketDetails(ticketId);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  const getTimeRemaining = (deadlineStr: string) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h remaining`;
    return `${Math.floor(hours / 24)}d remaining`;
  };

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.requester_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Ticket className="w-6 h-6 text-blue-500" />
              AI-Powered ITSM
            </h1>
            <p className="text-sm text-muted-foreground">Intelligent IT service management with AI solutions</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tickets..."
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
              New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border p-3 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">All Priority</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button onClick={() => loadData()} className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition">
          <RefreshCw className="w-4 h-4" />
        </button>
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
          onClick={() => setActiveTab("tickets")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "tickets" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <Ticket className="w-4 h-4" />
          Tickets
        </button>
        <button
          onClick={() => setActiveTab("knowledge")}
          className={`px-4 py-2 text-sm transition flex items-center gap-2 ${
            activeTab === "knowledge" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Base
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && dashboard && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Ticket className="w-4 h-4" />
                <span className="text-xs">Total Tickets</span>
              </div>
              <div className="text-2xl font-bold">{dashboard.total_tickets}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Open Tickets</span>
              </div>
              <div className="text-2xl font-bold text-yellow-500">{dashboard.open_tickets}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Resolved Today</span>
              </div>
              <div className="text-2xl font-bold text-green-500">{dashboard.resolved_today}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Timer className="w-4 h-4" />
                <span className="text-xs">Avg Resolution</span>
              </div>
              <div className="text-2xl font-bold">{dashboard.avg_resolution_minutes}m</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">SLA Breaches</span>
              </div>
              <div className="text-2xl font-bold text-red-500">{dashboard.sla_breached}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Open Tickets by Priority
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <RePieChart>
                  <Pie
                    data={Object.entries(dashboard.priority_breakdown || {}).map(([name, value]) => ({ name, value }))}
                    cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80} fill="#8884d8" dataKey="value"
                  >
                    {Object.entries(dashboard.priority_breakdown || {}).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
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

          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Tickets by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(dashboard.category_breakdown || {}).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <div className="flex-1 overflow-hidden flex">
          <div className="w-96 border-r border-border overflow-y-auto">
            <div className="p-3 space-y-2">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => loadTicketDetails(ticket.id)}
                  className={`p-3 rounded-lg cursor-pointer transition border ${
                    selectedTicket?.id === ticket.id ? "bg-primary/10 border-primary/30" : "hover:bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[ticket.status]}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h3 className="font-semibold mt-1 text-sm">{ticket.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{ticket.ticket_number}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{ticket.requester_name}</span>
                        {ticket.sla_status === "breached" && (
                          <span className="text-red-500">⚠️ SLA Breached</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedTicket ? (
              <div className="p-4 space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedTicket.title}</h2>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[selectedTicket.priority]}`}>
                          {selectedTicket.priority}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedTicket.status]}`}>
                          {selectedTicket.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{selectedTicket.description}</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                        <>
                          <button
                            onClick={() => generateAISolution(selectedTicket.id)}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-500 hover:bg-purple-500/30 transition flex items-center gap-2 text-sm"
                          >
                            <Brain className="w-4 h-4" />
                            AI Solution
                          </button>
                          <button
                            onClick={() => updateTicketStatus(selectedTicket.id, "resolved")}
                            className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition text-sm"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {selectedTicket.ai_suggested_solution && (
                    <div className="mt-3 p-3 bg-purple-500/10 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-500 text-sm mb-1">
                        <Sparkles className="w-4 h-4" />
                        AI Suggested Solution
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{selectedTicket.ai_suggested_solution}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border text-sm">
                    <div><span className="text-muted-foreground">Ticket #:</span> {selectedTicket.ticket_number}</div>
                    <div><span className="text-muted-foreground">Created:</span> {formatDate(selectedTicket.created_at)}</div>
                    <div><span className="text-muted-foreground">Requester:</span> {selectedTicket.requester_name}</div>
                    <div><span className="text-muted-foreground">Email:</span> {selectedTicket.requester_email}</div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments & Activity
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                      onKeyPress={(e) => e.key === "Enter" && addComment()}
                    />
                    <button onClick={addComment} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a ticket to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === "knowledge" && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeBase.map(article => (
              <div key={article.id} className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold">{article.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{article.content.substring(0, 150)}...</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {article.tags?.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  <span>Category: {article.category}</span>
                  <span>Used {article.times_used} times</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCreateModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl z-50 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Ticket</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Title *" value={newTicket.title} onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <textarea placeholder="Description *" rows={4} value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newTicket.category} onChange={(e) => setNewTicket({...newTicket, category: e.target.value})} className="px-3 py-2 rounded border border-border bg-background">
                  <option value="incident">Incident</option>
                  <option value="problem">Problem</option>
                  <option value="change">Change</option>
                  <option value="service_request">Service Request</option>
                  <option value="security">Security</option>
                </select>
                <select value={newTicket.priority} onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})} className="px-3 py-2 rounded border border-border bg-background">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <input type="text" placeholder="Requester Name *" value={newTicket.requester_name} onChange={(e) => setNewTicket({...newTicket, requester_name: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="email" placeholder="Requester Email *" value={newTicket.requester_email} onChange={(e) => setNewTicket({...newTicket, requester_email: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
              <input type="text" placeholder="Requester Phone" value={newTicket.requester_phone} onChange={(e) => setNewTicket({...newTicket, requester_phone: e.target.value})} className="w-full px-3 py-2 rounded border border-border bg-background" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={createTicket} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">Create Ticket</button>
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 rounded-lg border border-border hover:bg-muted">Cancel</button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">AI will analyze and suggest solutions automatically</p>
          </div>
        </>
      )}

      {/* AI Solution Modal */}
      {showSolutionModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowSolutionModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl z-50 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI-Generated Solution
              </h2>
              <button onClick={() => setShowSolutionModal(false)} className="p-1 hover:bg-muted rounded">✕</button>
            </div>
            {generatingSolution ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="ml-2">Generating AI solution...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">{aiSolution}</pre>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSolutionModal(false)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground">Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
