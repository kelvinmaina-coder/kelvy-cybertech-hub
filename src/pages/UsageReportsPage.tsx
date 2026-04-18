import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Download, TrendingUp, Clock, Target, Award, Calendar,
  Loader2, AlertCircle, CheckCircle, BarChart3, LineChart,
  Activity, Zap, Coffee,
} from "lucide-react";
import { toast } from "sonner";

interface AppUsageData {
  app_name: string;
  duration_minutes: number;
  category: string;
}

interface UsageReport {
  daily: AppUsageData[];
  weekly: AppUsageData[];
  monthly: AppUsageData[];
  productivity_score: number;
  total_hours: number;
}

export default function UsageReportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [productivityScore, setProductivityScore] = useState(75);

  useEffect(() => {
    loadReport();
  }, [user, period]);

  const loadReport = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Get app usage data
      const { data: appData } = await supabase
        .from("app_usage")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      // Group by period and calculate stats
      const grouped = groupByPeriod(appData || [], period);
      setReport({
        daily: grouped,
        weekly: grouped,
        monthly: grouped,
        productivity_score: productivityScore,
        total_hours: (appData || []).reduce((sum, app) => sum + (app.duration_minutes / 60), 0),
      });
    } catch (error) {
      toast.error("Failed to load usage report");
    } finally {
      setLoading(false);
    }
  };

  const groupByPeriod = (data: any[], period: string) => {
    const grouped: Record<string, number> = {};
    data.forEach(item => {
      const key = item.app_name;
      grouped[key] = (grouped[key] || 0) + item.duration_minutes;
    });

    return Object.entries(grouped)
      .map(([app_name, duration_minutes]) => ({
        app_name,
        duration_minutes: Math.round(duration_minutes as number),
        category: "work"
      }))
      .sort((a, b) => b.duration_minutes - a.duration_minutes)
      .slice(0, 10);
  };

  const exportReport = async (format: "pdf" | "csv") => {
    try {
      if (format === "csv") {
        const csv = [
          ["App/Website", "Duration (minutes)", "Category"],
          ...(report?.[period] || []).map(item => [
            item.app_name,
            item.duration_minutes,
            item.category
          ])
        ]
          .map(row => row.join(","))
          .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `usage-report-${period}.csv`;
        a.click();
        toast.success("Report exported as CSV");
      } else {
        // PDF export would require a library like jsPDF
        toast.success("PDF export coming soon");
      }
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const topApps = report?.[period] || [];
  const totalMinutes = topApps.reduce((sum, app) => sum + app.duration_minutes, 0);

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              App & Website Usage Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Track how you spend your time across applications and websites
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportReport("csv")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Period Selection */}
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{(totalMinutes / 60).toFixed(1)}h</p>
              </div>
              <Clock className="w-8 h-8 text-primary/50" />
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Productivity Score</p>
                <p className="text-2xl font-bold">{productivityScore}/100</p>
              </div>
              <Target className="w-8 h-8 text-green-500/50" />
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top App</p>
                <p className="text-lg font-bold">{topApps[0]?.app_name || "—"}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500/50" />
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Apps Tracked</p>
                <p className="text-2xl font-bold">{topApps.length}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500/50" />
            </div>
          </div>
        </div>

        {/* Top Apps Usage */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Top Apps & Websites
          </h2>

          <div className="space-y-3">
            {topApps.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No usage data yet</p>
            ) : (
              topApps.map((app, index) => {
                const percentage = (app.duration_minutes / totalMinutes) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{app.app_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {app.duration_minutes} min ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["work", "social", "entertainment"].map((category) => {
            const duration = topApps
              .filter(app => app.category === category)
              .reduce((sum, app) => sum + app.duration_minutes, 0);
            return (
              <div key={category} className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold capitalize mb-2">{category}</h3>
                <p className="text-2xl font-bold">{(duration / 60).toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((duration / totalMinutes) * 100).toFixed(0)}% of time
                </p>
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Productivity Insights</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Your productivity score is {productivityScore}/100. Consider taking breaks every 60 minutes
                to maintain focus. Your most productive hours are typically 9-11 AM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
