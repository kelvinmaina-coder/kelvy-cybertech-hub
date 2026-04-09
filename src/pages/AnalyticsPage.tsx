import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  TrendingUp, TrendingDown, Users, MessageSquare, PhoneCall,
  Shield, Calendar, Download, FileText, Mail, Printer,
  BarChart3, PieChart, LineChart, Activity, Zap, Brain,
  ChevronLeft, ChevronRight, Loader2, FileSpreadsheet
} from "lucide-react";
import {
  LineChart as ReLineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface DashboardStats {
  total_users: number;
  total_messages: number;
  total_calls: number;
  total_scans: number;
  automation_success: number;
  automation_failed: number;
  trends: any;
}

interface ChartData {
  date: string;
  messages?: number;
  calls?: number;
  scans?: number;
  success?: number;
  failed?: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [messagesData, setMessagesData] = useState<ChartData[]>([]);
  const [callsData, setCallsData] = useState<any>(null);
  const [scansData, setScansData] = useState<any>(null);
  const [automationData, setAutomationData] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  
  useEffect(() => {
    loadAllData();
  }, [startDate, endDate]);
  
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, messagesRes, callsRes, scansRes, automationRes, insightsRes] = await Promise.all([
        fetch(`http://localhost:8000/api/analytics/dashboard?start_date=${startDate}&end_date=${endDate}`),
        fetch(`http://localhost:8000/api/analytics/charts/messages?start_date=${startDate}&end_date=${endDate}`),
        fetch(`http://localhost:8000/api/analytics/charts/calls?start_date=${startDate}&end_date=${endDate}`),
        fetch(`http://localhost:8000/api/analytics/charts/scans?start_date=${startDate}&end_date=${endDate}`),
        fetch(`http://localhost:8000/api/analytics/charts/automation?start_date=${startDate}&end_date=${endDate}`),
        fetch(`http://localhost:8000/api/analytics/ai-insights?start_date=${startDate}&end_date=${endDate}`)
      ]);
      
      const statsResult = await statsRes.json();
      const messagesResult = await messagesRes.json();
      const callsResult = await callsRes.json();
      const scansResult = await scansRes.json();
      const automationResult = await automationRes.json();
      const insightsResult = await insightsRes.json();
      
      if (statsResult.success) setStats(statsResult.data);
      if (messagesResult.success) setMessagesData(messagesResult.data);
      if (callsResult.success) setCallsData(callsResult.data);
      if (scansResult.success) setScansData(scansResult.data);
      if (automationResult.success) setAutomationData(automationResult.data);
      if (insightsResult.success) setAiInsights(insightsResult.data.insights);
      
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const exportToPDF = async () => {
    setExporting(true);
    const element = document.getElementById("analytics-content");
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(`analytics_report_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setExporting(false);
    }
  };
  
  const exportToCSV = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/analytics/export/csv?report_type=${type}&start_date=${startDate}&end_date=${endDate}`);
      const result = await response.json();
      if (result.success && result.data) {
        const csvContent = convertToCSV(result.data);
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_report_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };
  
  const convertToCSV = (data: any[]) => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => JSON.stringify(obj[header] || "")).join(","));
    return [headers.join(","), ...rows].join("\n");
  };
  
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold">{formatNumber(value)}</div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend)}% from previous period</span>
        </div>
      )}
    </div>
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
            <h1 className="text-2xl font-display font-bold">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor system performance and trends</p>
          </div>
          <div className="flex gap-3">
            {/* Date Range Picker */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm"
              />
            </div>
            
            {/* Export Buttons */}
            <button
              onClick={exportToPDF}
              disabled={exporting}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition flex items-center gap-2"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              PDF Report
            </button>
            <button
              onClick={() => exportToCSV("messages")}
              className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
      
      {/* Content for PDF Export */}
      <div id="analytics-content" className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard title="Total Users" value={stats?.total_users || 0} icon={Users} color="bg-blue-500/20" trend={stats?.trends?.users} />
          <StatCard title="Messages" value={stats?.total_messages || 0} icon={MessageSquare} color="bg-green-500/20" trend={stats?.trends?.messages} />
          <StatCard title="Calls" value={stats?.total_calls || 0} icon={PhoneCall} color="bg-purple-500/20" />
          <StatCard title="Security Scans" value={stats?.total_scans || 0} icon={Shield} color="bg-red-500/20" />
          <StatCard title="Automation Success" value={stats?.automation_success || 0} icon={Zap} color="bg-yellow-500/20" />
        </div>
        
        {/* Messages Chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={messagesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
              <Area type="monotone" dataKey="messages" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Calls Chart */}
        {callsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                Calls Timeline
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={callsData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                  <Bar dataKey="calls" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Calls by Type
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={callsData.by_type}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {callsData.by_type?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Scans Chart */}
        {scansData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Scans Timeline
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={scansData.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                  <Line type="monotone" dataKey="scans" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Top Tools Used
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scansData.by_tool} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" />
                  <YAxis dataKey="name" type="category" stroke="#888" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                  <Bar dataKey="value" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Automation Chart */}
        {automationData && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Automation Performance
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-500">
                  {automationData.total_executions > 0 
                    ? Math.round((stats?.automation_success || 0) / automationData.total_executions * 100) 
                    : 0}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold text-blue-500">{automationData.avg_duration_ms}ms</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={automationData.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none" }} />
                <Bar dataKey="success" fill="#10b981" />
                <Bar dataKey="failed" fill="#ef4444" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {/* AI Insights */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold">AI-Powered Insights</h3>
          </div>
          <p className="text-sm whitespace-pre-wrap">{aiInsights}</p>
          <p className="text-xs text-muted-foreground mt-3">
            Generated by Ollama (qwen2.5:7b) • {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
