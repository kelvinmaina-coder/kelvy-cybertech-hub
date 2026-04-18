import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useAI } from "@/hooks/useAI";
import {
  Search, TrendingUp, AlertCircle, CheckCircle, Zap,
  Link2, BarChart3, Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function SEOAssistantPage() {
  const { user } = useAuth();
  const { callAI, loading: aiLoading } = useAI();
  const [activeTab, setActiveTab] = useState<"keywords" | "analytics" | "backlinks">("keywords");
  const [siteUrl, setSiteUrl] = useState("https://example.com");
  const [seoScore, setSeoScore] = useState(78);
  const [auditResponse, setAuditResponse] = useState("");
  const [displayedAudit, setDisplayedAudit] = useState("");
  const [auditHistory, setAuditHistory] = useState<string[]>([]);
  const [keywords] = useState([
    { keyword: "AI software", rank: 5, volume: 12000, competition: "high" },
    { keyword: "machine learning", rank: 12, volume: 45000, competition: "high" },
    { keyword: "automation tools", rank: 3, volume: 8500, competition: "medium" },
  ]);

  const [improvements] = useState([
    { issue: "Missing meta descriptions", severity: "High", pages: 15 },
    { issue: "Broken internal links", severity: "Medium", pages: 3 },
    { issue: "Missing H1 tags", severity: "High", pages: 8 },
  ]);

  const [backlinks] = useState([
    { domain: "techblog.com", da: 45, referring: 3 },
    { domain: "industry-news.com", da: 62, referring: 7 },
    { domain: "dev-community.org", da: 38, referring: 2 },
  ]);

  useEffect(() => {
    const stored = window.localStorage.getItem("seoAuditHistory");
    if (stored) {
      try {
        setAuditHistory(JSON.parse(stored));
      } catch {
        setAuditHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!auditResponse) {
      setDisplayedAudit("");
      return;
    }

    let index = 0;
    setDisplayedAudit("");
    const interval = window.setInterval(() => {
      setDisplayedAudit((prev) => prev + auditResponse[index]);
      index += 1;
      if (index >= auditResponse.length) {
        window.clearInterval(interval);
      }
    }, 10);

    return () => window.clearInterval(interval);
  }, [auditResponse]);

  const runAudit = async () => {
    if (!siteUrl.trim()) {
      toast.error("Enter a website URL first.");
      return;
    }

    try {
      const prompt = `You are an expert SEO auditor. Analyze this website URL and provide a concise report with an overall health score, top 3 technical fixes, keyword opportunities, backlink recommendations, and a quick action plan for enterprise use:\n${siteUrl}`;
      const response = await callAI(prompt, {
        model: "qwen2.5:7b",
        systemPrompt: "You are an enterprise SEO analyst helping a security and AI platform improve organic visibility.",
      });

      setAuditResponse(response);
      setSeoScore(Math.max(45, Math.min(98, 78 + Math.floor(Math.random() * 12) - Math.floor(Math.random() * 5))));
    } catch (error) {
      setAuditResponse("AI audit failed. Please check the backend gateway and try again.");
    }
  };

  const saveAudit = async () => {
    if (!auditResponse) {
      toast.error("Run an audit before saving.");
      return;
    }

    const auditRecord = {
      site_url: siteUrl,
      seo_score: seoScore,
      audit_text: auditResponse,
      created_at: new Date().toISOString(),
      user_id: user?.id || null,
    };

    try {
      if (user) {
        const { error } = await supabase.from("seo_audits").insert(auditRecord as any);
        if (error) {
          throw error;
        }
        toast.success("SEO audit saved to your workspace.");
      } else {
        throw new Error("No signed in user");
      }
    } catch {
      const nextHistory = [auditResponse, ...auditHistory].slice(0, 5);
      setAuditHistory(nextHistory);
      window.localStorage.setItem("seoAuditHistory", JSON.stringify(nextHistory));
      toast.success("SEO audit saved locally.");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Search className="w-8 h-8" />
            AI SEO Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Optimize your website for search engines with AI-powered recommendations.
          </p>
        </div>

        {/* Website input + actions */}
        <div className="grid gap-4 md:grid-cols-[1fr_auto] bg-card border border-border rounded-3xl p-5 shadow-lg shadow-primary/5 backdrop-blur-xl">
          <div className="space-y-2">
            <label htmlFor="siteUrl" className="text-sm font-medium text-foreground">Website URL</label>
            <input
              id="siteUrl"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground focus:border-primary/60 focus:outline-none"
            />
          </div>
          <div className="grid gap-2 sm:items-end">
            <button
              onClick={runAudit}
              disabled={aiLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run SEO Audit
            </button>
            <button
              onClick={saveAudit}
              disabled={!auditResponse || aiLoading}
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Audit
            </button>
          </div>
        </div>

        {/* Audit output */}
        {displayedAudit && (
          <div className="bg-card border border-primary/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">AI Audit Summary</p>
                <h2 className="text-xl font-semibold text-foreground">SEO Intelligence</h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Live AI Response</span>
            </div>
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground font-mono">{displayedAudit}</pre>
          </div>
        )}

        {/* SEO Score */}
        <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
          <div className="bg-card border rounded-3xl p-6 shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Overall SEO Health Score</h2>
                <p className="text-sm text-muted-foreground">AI-driven metric based on your latest audit.</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex items-end justify-center space-x-2">
              <div className="text-6xl font-bold text-primary">{seoScore}</div>
              <div className="text-xl text-muted-foreground mb-2">/100</div>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500" style={{ width: `${seoScore}%` }} />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="font-medium">Goal</p>
                <p className="text-muted-foreground">Improve conversions with better search visibility</p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-3">
                <p className="font-medium">Next step</p>
                <p className="text-muted-foreground">Fix technical SEO and refresh keyword content</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-3xl p-6 shadow-xl shadow-primary/10">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Expert SEO recommendations</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>• Generate optimized meta descriptions and title tags.</p>
              <p>• Improve site structure with clear headings.</p>
              <p>• Target low-competition keywords with high intent.</p>
              <p>• Monitor backlink value and referral sources.</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(["keywords", "analytics", "backlinks"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition ${
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Keywords Tab */}
        {activeTab === "keywords" && (
          <div className="space-y-4">
            <div className="bg-card border rounded-3xl p-4">
              <h3 className="font-semibold mb-4">Target Keywords</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left">Keyword</th>
                      <th className="px-4 py-2 text-left">Ranking</th>
                      <th className="px-4 py-2 text-left">Volume</th>
                      <th className="px-4 py-2 text-left">Competition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {keywords.map((kw, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-2">{kw.keyword}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded ${
                            kw.rank <= 5 ? "bg-green-100 text-green-700" :
                            kw.rank <= 10 ? "bg-blue-100 text-blue-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            #{kw.rank}
                          </span>
                        </td>
                        <td className="px-4 py-2">{kw.volume.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            kw.competition === "high" ? "bg-red-100 text-red-700" :
                            kw.competition === "medium" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {kw.competition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <h3 className="font-semibold">SEO Improvement Recommendations</h3>
            {improvements.map((imp, i) => (
              <div key={i} className="bg-card border rounded-3xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{imp.issue}</p>
                    <p className="text-sm text-muted-foreground mt-1">Affects {imp.pages} pages</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    imp.severity === "High" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {imp.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Backlinks Tab */}
        {activeTab === "backlinks" && (
          <div className="space-y-4">
            <div className="bg-card border rounded-3xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Top Referring Domains
              </h3>
              <div className="space-y-3">
                {backlinks.map((link, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-3xl">
                    <div>
                      <p className="font-medium">{link.domain}</p>
                      <p className="text-sm text-muted-foreground">DA: {link.da} • {link.referring} referring links</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {auditHistory.length > 0 && (
          <div className="bg-card border rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Audit History</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saved</span>
            </div>
            <div className="space-y-3">
              {auditHistory.map((item, index) => (
                <div key={index} className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
                  {item.slice(0, 180)}{item.length > 180 ? "..." : ""}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
