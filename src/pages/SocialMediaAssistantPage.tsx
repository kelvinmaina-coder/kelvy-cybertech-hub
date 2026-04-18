import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2, Brain, Copy, Heart, Share2, Send, TrendingUp,
  AlertCircle, CheckCircle, MessageCircle, Users, Crown
} from "lucide-react";
import { toast } from "sonner";

type Tone = "funny" | "professional" | "inspiring";
type Platform = "twitter" | "linkedin" | "facebook" | "instagram";

export default function SocialMediaAssistant() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"generator" | "analytics" | "competitors">("generator");
  
  // Generator state
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [generatedPosts, setGeneratedPosts] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string>("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const toneOptions: Tone[] = ["funny", "professional", "inspiring"];
  const platformOptions: Platform[] = ["twitter", "linkedin", "facebook", "instagram"];

  const generatePosts = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setGenerating(true);
    try {
      // In a real app, this would call Ollama via the backend
      const mockPosts = [
        `🚀 ${topic}: Just realized something game-changing! ${topic} is revolutionizing how we work. What's your take? #${topic.replace(/\s+/g, '')}`,
        `${topic} update: The intersection of creativity and technology is where magic happens. Learn how to leverage ${topic} today.`,
        `${topic}: Why this matters to you more than you think. Here's what everyone's getting wrong... 🧵`,
        `Unpopular opinion: ${topic} is going to change everything. And yes, I'm ready to back this up.`,
        `${topic} in action: Real results from teams using this approach. The numbers don't lie. 📊`
      ];

      setGeneratedPosts(mockPosts);
      setSelectedPost(mockPosts[0]);
      toast.success("Posts generated! Select your favorite.");
    } catch (error) {
      toast.error("Failed to generate posts");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const toggleFavorite = (post: string) => {
    setFavorites(prev =>
      prev.includes(post) ? prev.filter(p => p !== post) : [...prev, post]
    );
  };

  const savePost = async () => {
    if (!selectedPost) return;
    try {
      await supabase.from("social_media_posts").insert({
        user_id: user?.id,
        topic,
        tone,
        platform,
        generated_captions: generatedPosts,
        selected_caption: selectedPost,
      });
      toast.success("Post saved!");
    } catch (error) {
      toast.error("Failed to save post");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Brain className="w-8 h-8" />
            AI Social Media Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate engaging posts, track analytics, and monitor competitors
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {(["generator", "analytics", "competitors"] as const).map((tab) => (
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

        {/* Generator Tab */}
        {activeTab === "generator" && (
          <div className="space-y-6">
            {/* Input Section */}
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Generate Post Ideas</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Topic / Product</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., AI in Healthcare, New Product Launch"
                    className="w-full px-3 py-2 border rounded-lg bg-background"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tone</label>
                    <div className="flex gap-2">
                      {toneOptions.map((t) => (
                        <button
                          key={t}
                          onClick={() => setTone(t)}
                          className={`px-3 py-2 rounded-lg capitalize text-sm transition ${
                            tone === t
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as Platform)}
                      className="w-full px-3 py-2 border rounded-lg bg-background"
                    >
                      {platformOptions.map((p) => (
                        <option key={p} value={p}>
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={generatePosts}
                  disabled={generating}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Generate Ideas
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Posts */}
            {generatedPosts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Generated Ideas</h2>
                
                <div className="space-y-2">
                  {generatedPosts.map((post, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full p-4 rounded-lg border-2 transition text-left ${
                        selectedPost === post
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <p className="text-sm">{post}</p>
                    </button>
                  ))}
                </div>

                {/* Selected Post Actions */}
                {selectedPost && (
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Selected Post</h3>
                    <p className="mb-3 p-3 bg-muted rounded">{selectedPost}</p>
                    
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => copyToClipboard(selectedPost)}
                        className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 flex items-center gap-2 text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </button>
                      <button
                        onClick={() => toggleFavorite(selectedPost)}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                          favorites.includes(selectedPost)
                            ? "bg-red-100 text-red-700"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <Heart className={favorites.includes(selectedPost) ? "fill-current w-4 h-4" : "w-4 h-4"} />
                        Favorite
                      </button>
                      <button
                        onClick={savePost}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Likes", value: "2.4K", icon: Heart, color: "text-red-500" },
                { label: "Shares", value: "580", icon: Share2, color: "text-blue-500" },
                { label: "Comments", value: "342", icon: MessageCircle, color: "text-green-500" },
                { label: "Engagement", value: "8.2%", icon: TrendingUp, color: "text-purple-500" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-card border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color}/50`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Best Time to Post</h3>
              <p className="text-sm text-muted-foreground">
                Tuesday & Thursday, 9 AM - 11 AM are your peak engagement windows
              </p>
            </div>
          </div>
        )}

        {/* Competitors Tab */}
        {activeTab === "competitors" && (
          <div className="space-y-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Competitor Monitoring
              </h3>

              <div className="space-y-3">
                {[
                  { name: "Competitor A", followers: 45200, engagement: 6.8 },
                  { name: "Competitor B", followers: 38900, engagement: 5.2 },
                  { name: "Competitor C", followers: 52100, engagement: 7.4 },
                ].map((comp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{comp.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {comp.followers.toLocaleString()} followers • {comp.engagement}% engagement
                      </p>
                    </div>
                    <Crown className="w-5 h-5 text-yellow-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
