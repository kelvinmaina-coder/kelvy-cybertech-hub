import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, FileText, Copy, Bot } from 'lucide-react';

const MeetingNotes: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      generateSummary();
    }
  };

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: `Summarize this meeting transcript. Extract decisions and action items:\n\n${transcript}`, stream: false })
      });
      const data = await res.json();
      setSummary(data.response);
    } catch(e) { setSummary('AI summary unavailable'); }
    setLoading(false);
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(summary); alert('Copied!'); };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Meeting Notes</h1><p className="text-text-muted">AI-powered transcription and summaries</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex justify-center mb-4"><button onClick={isRecording ? stopRecording : startRecording} className={`w-20 h-20 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-accent-green/20 border-accent-green'} border-4`}>{isRecording ? <Square className="w-8 h-8 text-red-500" /> : <Mic className="w-8 h-8 text-accent-green" />}</button></div><textarea rows={10} placeholder="Transcript will appear here..." value={transcript} readOnly className="w-full p-3 bg-bg-secondary border border-border rounded-lg font-mono text-sm" /></div>
        <div className="bg-bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4" />AI Summary</h3>{loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : <div className="bg-bg-secondary rounded-lg p-3"><p className="text-sm whitespace-pre-wrap">{summary || 'Click "Stop Recording" to generate AI summary'}</p></div>}{summary && <button onClick={copyToClipboard} className="mt-3 px-3 py-1 bg-accent-cyan/20 rounded-lg text-sm flex items-center gap-1"><Copy className="w-3 h-3" />Copy</button>}</div>
      </div>
    </div>
  );
};
export default MeetingNotes;
