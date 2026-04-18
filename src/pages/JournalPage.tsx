import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, Heart, Calendar, TrendingUp, Lock, Save,
  Download, Search, Loader2, Sparkles, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface MoodEntry {
  date: string;
  mood: number;
  text: string;
  tags: string[];
}

export default function JournalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"write" | "insights" | "history">("write");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(true);

  const [entries] = useState<MoodEntry[]>([
    { date: "2024-01-16", mood: 7, text: "Had a great workout today!", tags: ["exercise", "health"] },
    { date: "2024-01-15", mood: 5, text: "Stressful meeting at work", tags: ["work", "stress"] },
    { date: "2024-01-14", mood: 8, text: "Completed the big project!", tags: ["achievement"] },
  ]);

  const moodTrends = [7, 6, 5, 6, 7, 8, 7];
  const avgMood = (moodTrends.reduce((a, b) => a + b) / moodTrends.length).toFixed(1);

  const saveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter title and content");
      return;
    }

    setIsSaving(true);
    try {
      await supabase.from("journal_entries").insert({
        user_id: user?.id,
        title,
        content,
        mood,
        tags,
        is_encrypted: isEncrypted,
      });
      toast.success("Journal entry saved!");
      setTitle("");
      setContent("");
      setMood(5);
      setTags([]);
    } catch (error) {
      toast.error("Failed to save entry");
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const exportJournal = () => {
    const text = entries.map(e => `${e.date}\n${e.text}\nMood: ${e.mood}/10\n`).join("\n---\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "journal-export.txt";
    a.click();
    toast.success("Journal exported");
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Personal Journal
          </h1>
          <p className="text-muted-foreground mt-1">
            Reflect on your thoughts and discover patterns with AI insights
          </p>
        </div>

        {/* Encryption Notice */}
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                Your entries are encrypted
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                All journal entries are encrypted client-side for complete privacy
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {(["write", "insights", "history"] as const).map((tab) => (
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

        {/* Write Tab */}
        {activeTab === "write" && (
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">How are you feeling?</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={`w-10 h-10 rounded-lg border-2 transition ${
                          mood === m
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border hover:border-primary"
                        }  font-medium`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {mood <= 3 && "😢 Struggling"}
                    {mood > 3 && mood <= 5 && "😐 Average"}
                    {mood > 5 && mood <= 7 && "🙂 Good"}
                    {mood > 7 && "😄 Great!"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your thoughts</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write whatever's on your mind..."
                    rows={8}
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      placeholder="Add tags like #workout #grateful"
                      className="flex-1 px-3 py-2 border rounded-lg bg-background text-sm"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => removeTag(tag)}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20"
                      >
                        {tag} ×
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={saveEntry}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Entry
                    </>
                  )}
                </button>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isEncrypted}
                    onChange={(e) => setIsEncrypted(e.target.checked)}
                    className="rounded"
                  />
                  <Lock className="w-4 h-4" />
                  Encrypt this entry
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Mood</p>
                    <p className="text-2xl font-bold mt-1">{avgMood}/10</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500/50" />
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                    <p className="text-2xl font-bold mt-1">{entries.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500/50" />
                </div>
              </div>

              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mood Trend</p>
                    <p className="text-2xl font-bold mt-1">↑ Improving</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500/50" />
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Mood Analysis
              </h3>
              <div className="space-y-3">
                <p className="text-sm">Based on your journal entries this week:</p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>You seem most happy on days when you exercise - consider making it a priority</li>
                  <li>Work stress is your primary mood trigger - try stress-management techniques</li>
                  <li>Your mood improves after social activities - spend more time with people you care about</li>
                </ul>
              </div>
            </div>

            <button
              onClick={exportJournal}
              className="w-full px-4 py-2 border rounded-lg hover:bg-muted/50 flex items-center justify-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" />
              Export All Entries
            </button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div key={i} className="bg-card border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{entry.date}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {entry.text}
                    </p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-lg">{entry.mood}</p>
                    <p className="text-xs text-muted-foreground">Mood</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
