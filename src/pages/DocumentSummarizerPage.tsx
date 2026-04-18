import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText, Upload, Loader2, Copy, Download, Globe,
  AlertCircle, CheckCircle, Zap, BookOpen, List
} from "lucide-react";
import { toast } from "sonner";

type SummaryLength = "short" | "medium" | "detailed";
type Language = "english" | "swahili" | "french" | "spanish" | "german" | "chinese";

export default function DocumentSummarizerPage() {
  const { user } = useAuth();
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [textContent, setTextContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("medium");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("english");
  
  const [summary, setSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [translations, setTranslations] = useState<Record<Language, string>>({} as any);

  const languages: Language[] = ["english", "swahili", "french", "spanish", "german", "chinese"];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextContent(content.substring(0, 10000)); // Limit to 10MB
    };
    reader.readAsText(file);
  };

  const generateSummary = async () => {
    if (!textContent.trim()) {
      toast.error("Please enter or upload text first");
      return;
    }

    setLoading(true);
    try {
      // Mock AI summary generation
      const mockSummary = textContent.split(".").slice(0, 2).join(". ");
      setSummary(mockSummary || "Document has been analyzed successfully.");
      
      const mockKeyPoints = [
        "Main point from the document",
        "Secondary important finding",
        "Key insight or conclusion"
      ];
      setKeyPoints(mockKeyPoints);

      const mockActions = [
        "Review the recommendations section",
        "Discuss with team members",
        "Schedule follow-up meeting"
      ];
      setActionItems(mockActions);

      toast.success("Summary generated successfully!");
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const translateSummary = async (lang: Language) => {
    if (!summary) {
      toast.error("Generate a summary first");
      return;
    }

    try {
      // Mock translation
      const translations: Record<Language, string> = {
        english: summary,
        swahili: `[Swahili] ${summary}`,
        french: `[French] ${summary}`,
        spanish: `[Spanish] ${summary}`,
        german: `[German] ${summary}`,
        chinese: `[Chinese] ${summary}`
      };

      setTranslations(translations);
      setSelectedLanguage(lang);
      toast.success(`Summary translated to ${lang}`);
    } catch (error) {
      toast.error("Translation failed");
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <FileText className="w-8 h-8" />
            AI Document Summarizer
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload documents and get AI-powered summaries and key points
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-card border rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              {(["text", "file"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setInputType(type)}
                  className={` px-4 py-2 rounded-lg capitalize font-medium transition ${
                    inputType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {type === "text" ? "Paste Text" : "Upload File"}
                </button>
              ))}
            </div>

            {inputType === "text" ? (
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your document text here... (max 10,000 characters)"
                rows={8}
                maxLength={10000}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="block cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="font-medium">Drop your file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, DOCX, TXT (max 10MB)
                  </p>
                  {fileName && (
                    <p className="text-sm text-primary mt-2">Selected: {fileName}</p>
                  )}
                </label>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium mb-2">Summary Length</label>
                <select
                  value={summaryLength}
                  onChange={(e) => setSummaryLength(e.target.value as SummaryLength)}
                  className="px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="short">Short (1-2 sentences)</option>
                  <option value="medium">Medium (3-5 sentences)</option>
                  <option value="detailed">Detailed (full analysis)</option>
                </select>
              </div>
            </div>

            <button
              onClick={generateSummary}
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
                  <Zap className="w-4 h-4" />
                  Generate Summary
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {summary && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Summary
                </h3>
                <button
                  onClick={() => copyText(summary)}
                  className="text-xs px-2 py-1 rounded hover:bg-muted"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed">{summary}</p>
            </div>

            {/* Key Points */}
            {keyPoints.length > 0 && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  Key Points
                </h3>
                <ul className="space-y-2">
                  {keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {actionItems.length > 0 && (
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Action Items</h3>
                <ul className="space-y-2">
                  {actionItems.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Translation */}
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Translate to Other Languages
              </h3>
              <div className="flex gap-2 flex-wrap">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => translateSummary(lang)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedLanguage === lang
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
              
              {translations[selectedLanguage] && (
                <div className="mt-3 p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground mb-1">
                    {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}:
                  </p>
                  <p className="text-sm">{translations[selectedLanguage]}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
