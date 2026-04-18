import React, { useState } from 'react';
import { Share2, Loader2, Sparkles, Copy, Bot } from 'lucide-react';

const SocialMediaAssistant: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [posts, setPosts] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePosts = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Generate 5 engaging social media posts about "${topic}" for ${platform}. Include hashtags. Make them professional and engaging.`, stream: false })
      });
      const data = await res.json();
      setPosts(data.response);
    } catch(e) { setPosts('AI post generator unavailable'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Social Media Assistant</h1><p className="text-text-muted">AI-generated posts and captions</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border"><input type="text" placeholder="What is your post about? (e.g., cybersecurity tips, new product launch)" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" /><select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3"><option value="twitter">Twitter/X</option><option value="linkedin">LinkedIn</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option></select><button onClick={generatePosts} disabled={loading} className="w-full py-2 bg-accent-green/20 border border-accent-green rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}Generate Posts</button>{posts && <div className="mt-4 bg-bg-secondary rounded-lg p-3"><p className="text-sm whitespace-pre-wrap">{posts}</p><button onClick={() => navigator.clipboard.writeText(posts)} className="mt-2 px-3 py-1 bg-accent-cyan/20 rounded-lg text-sm flex items-center gap-1"><Copy className="w-3 h-3" />Copy All</button></div>}</div>
    </div>
  );
};
export default SocialMediaAssistant;
