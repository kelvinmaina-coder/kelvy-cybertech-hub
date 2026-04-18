import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Mail, Loader2, Copy, Send, RefreshCw, Check, AlertCircle,
  Eye, Download
} from "lucide-react";
import { toast } from "sonner";

type Tone = "formal" | "friendly" | "urgent" | "persuasive" | "apologetic";

export default function EmailComposerPage() {
  const { user } = useAuth();
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState<Tone>("formal");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCopyButton, setShowCopyButton] = useState(false);

  const tones: Tone[] = ["formal", "friendly", "urgent", "persuasive", "apologetic"];

  const generateEmail = async () => {
    if (!userPrompt.trim()) {
      toast.error("Please describe what you want to email about");
      return;
    }

    setLoading(true);
    try {
      // Mock email generation
      const mockEmails: Record<Tone, string> = {
        formal: `Dear [Recipient],

I hope this message finds you well. ${userPrompt}

Best regards,
[Your Name]`,
        friendly: `Hey,

How's it going? I wanted to reach out about ${userPrompt}.

Talk soon!
[Your Name]`,
        urgent: `ATTENTION:[Recipient],

This is time-sensitive. ${userPrompt}

Please respond immediately.
[Your Name]`,
        persuasive: `Dear [Recipient],

I'm reaching out because I believe this would be beneficial. ${userPrompt}

I'd love to discuss this further.
Best regards,
[Your Name]`,
        apologetic: `Dear [Recipient],

I sincerely apologize for the inconvenience. ${userPrompt}

I hope we can resolve this together.
Best regards,
[Your Name]`
      };

      setGeneratedEmail(mockEmails[selectedTone]);
      toast.success("Email generated successfully!");
    } catch (error) {
      toast.error("Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  const changeTone = async (newTone: Tone) => {
    if (!generatedEmail) {
      setSelectedTone(newTone);
      return;
    }

    setSelectedTone(newTone);
    setLoading(true);
    try {
      // Mock tone change (would call backend in real app)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newEmail = generatedEmail.replace(
        /\[Your Name\]/g,
        "[Your Name]"
      );
      setGeneratedEmail(newEmail);
      toast.success(`Email rewritten in ${newTone} tone`);
    } catch (error) {
      toast.error("Failed to change tone");
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      toast.success("Email copied to clipboard");
      setShowCopyButton(true);
      setTimeout(() => setShowCopyButton(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const saveEmail = async () => {
    try {
      await supabase.from("generated_emails").insert({
        user_id: user?.id,
        user_prompt: userPrompt,
        generated_email: generatedEmail,
        tone: selectedTone,
      });
      toast.success("Email saved!");
    } catch (error) {
      toast.error("Failed to save email");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Mail className="w-8 h-8" />
            AI Email Composer
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate professional emails in multiple tones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">
                What do you want to email about?
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g., 'Follow up email to client about late payment' or 'Ask manager for a raise'"
                rows={5}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>

            <button
              onClick={generateEmail}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Composing...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Generate Email
                </>
              )}
            </button>

            {generatedEmail && (
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Generated Email</h3>
                  <button
                    onClick={copyEmail}
                    className="text-xs px-2 py-1 rounded hover:bg-muted flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    {showCopyButton ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-white dark:bg-black/20 p-4 rounded border font-mono text-sm whitespace-pre-wrap">
                  {generatedEmail}
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={saveEmail}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setGeneratedEmail("")}
                    className="flex-1 px-3 py-2 border rounded-lg hover:bg-muted flex items-center justify-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tone Selector */}
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Email Tone</h3>
              <div className="space-y-2">
                {tones.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => changeTone(tone)}
                    className={`w-full px-3 py-2 rounded-lg text-left transition text-sm ${
                      selectedTone === tone
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{tone}</span>
                      {selectedTone === tone && <Check className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Descriptions */}
            <div className="bg-card border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Tone Details</h4>
              <div className="text-xs space-y-2 text-muted-foreground">
                {selectedTone === "formal" && (
                  <p>Professional, clear, and respectful. Best for business correspondence.</p>
                )}
                {selectedTone === "friendly" && (
                  <p>Warm, conversational, and approachable. Great for colleagues and friends.</p>
                )}
                {selectedTone === "urgent" && (
                  <p>Direct and time-sensitive. Use when immediate action is needed.</p>
                )}
                {selectedTone === "persuasive" && (
                  <p>Convincing and compelling. Perfect for proposals and requests.</p>
                )}
                {selectedTone === "apologetic" && (
                  <p>Sincere and solution-focused. For apologizing and making amends.</p>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Tips
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Be specific about your request</li>
                <li>Mention context and background</li>
                <li>Try different tones to find the best fit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
