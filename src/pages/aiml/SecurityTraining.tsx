import React, { useState } from 'react';
import { BookOpen, Award, Loader2, CheckCircle, Bot } from 'lucide-react';

const SecurityTraining: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [quiz, setQuiz] = useState('');
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const generateCourse = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Create a short training course on ${topic} for cybersecurity professionals. Include key concepts and best practices.`, stream: false })
      });
      const data = await res.json();
      setContent(data.response);
      const quizRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Create 3 multiple choice quiz questions about ${topic}. Format as JSON with question, options A/B/C, and answer.`, stream: false })
      });
      const quizData = await quizRes.json();
      setQuiz(quizData.response);
    } catch(e) { setContent('AI course unavailable'); }
    setLoading(false);
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Security Training</h1><p className="text-text-muted">AI-powered cybersecurity courses</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><input type="text" placeholder="Enter topic (e.g., SQL Injection, Phishing, Ransomware)" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg mb-3" /><button onClick={generateCourse} disabled={loading} className="w-full py-2 bg-accent-green/20 border border-accent-green rounded-lg flex items-center justify-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}Generate Course</button></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3 flex items-center gap-2"><Award className="w-4 h-4" />Course Content</h3><div className="bg-bg-secondary rounded-lg p-3 max-h-[400px] overflow-auto"><p className="text-sm whitespace-pre-wrap">{content || 'Enter a topic and click Generate Course'}</p></div></div>
      </div>
    </div>
  );
};
export default SecurityTraining;
