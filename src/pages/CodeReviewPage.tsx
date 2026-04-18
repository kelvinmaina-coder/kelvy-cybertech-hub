import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Code, Loader2, AlertTriangle, CheckCircle, AlertCircle,
  Copy, Download, Eye, Zap, Bug, Shield
} from "lucide-react";
import { toast } from "sonner";

type Language = "python" | "javascript" | "typescript" | "go" |"rust" | "java" | "php" | "sql" | "html" | "css";
type Severity = "Critical" | "High" | "Medium" | "Low";

interface ReviewIssue {
  line: number;
  message: string;
  severity: Severity;
  type: "bug" | "security" | "performance" | "style";
}

export default function CodeReviewPage() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<ReviewIssue[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const languages: Language[] = ["python", "javascript", "typescript", "go", "rust", "java", "php", "sql", "html", "css"];

  const reviewCode = async () => {
    if (!code.trim()) {
      toast.error("Please paste some code first");
      return;
    }

    setLoading(true);
    try {
      // Mock code review
      const mockIssues: ReviewIssue[] = [
        { line: 5, message: "Potential null pointer exception", severity: "High", type: "bug" },
        { line: 12, message: "SQL injection vulnerability", severity: "Critical", type: "security" },
        { line: 8, message: "Unused variable 'temp'", severity: "Low", type: "style" },
        { line: 15, message: "N+1 query problem", severity: "Medium", type: "performance" },
      ];

      const mockImprovements = [
        "Add input validation before processing",
        "Use parameterized queries instead of string concatenation",
        "Add error handling for network requests",
        "Consider caching results for better performance"
      ];

      setIssues(mockIssues);
      setImprovements(mockImprovements);
      toast.success("Code review complete!");
    } catch (error) {
      toast.error("Failed to review code");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-700";
      case "High": return "bg-orange-100 text-orange-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Low": return "bg-blue-100 text-blue-700";
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case "Critical": return <Bug className="w-4 h-4" />;
      case "High": return <AlertTriangle className="w-4 h-4" />;
      case "Medium": return <AlertCircle className="w-4 h-4" />;
      case "Low": return <CheckCircle className="w-4 h-4" />;
    }
  };

  const codeLines = code.split("\n");
  const totalIssues = issues.length;
  const criticalIssues = issues.filter(i => i.severity === "Critical").length;

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Code className="w-8 h-8" />
            AI Code Review
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze your code for bugs, security issues, and performance improvements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Select Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-card border rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Paste Your Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`Paste ${language} code here...`}
                rows={12}
                className="w-full px-3 py-2 border rounded-lg bg-background font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {code.length} characters • {codeLines.length} lines
              </div>
            </div>

            <button
              onClick={reviewCode}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Review Code
                </>
              )}
            </button>
          </div>

          {/* Issues Summary */}
          <div className="space-y-4">
            {issues.length > 0 && (
              <>
                <div className="bg-card border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Review Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Issues</span>
                      <span className="font-bold">{totalIssues}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Critical</span>
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-medium">
                        {criticalIssues}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">High</span>
                      <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                        {issues.filter(i => i.severity === "High").length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Good Practices Found</h4>
                  <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <li>✓ Has error handling</li>
                    <li>✓ Uses constants</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Issues Found</h2>
            <div className="space-y-3">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedLine(issue.line)}
                  className={`bg-card border rounded-lg p-4 cursor-pointer transition hover:border-primary ${
                    selectedLine === issue.line ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${getSeverityColor(issue.severity)}`}>
                      {getSeverityIcon(issue.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Line {issue.line}</p>
                        <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{issue.message}</p>
                      {selectedLine === issue.line && (
                        <div className="mt-2 p-2 bg-muted rounded font-mono text-xs">
                          {codeLines[issue.line - 1]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Suggested Improvements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {improvements.map((improvement, i) => (
                <div key={i} className="bg-card border rounded-lg p-4">
                  <div className="flex gap-3">
                    <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{improvement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
