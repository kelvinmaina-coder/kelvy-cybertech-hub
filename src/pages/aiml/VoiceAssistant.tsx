import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Bot, Loader2, Volume2 } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [ollamaStatus, setOllamaStatus] = useState<'online' | 'offline'>('checking');

  useEffect(() => {
    checkOllama();
    initSpeechRecognition();
  }, []);

  const checkOllama = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (res.ok) setOllamaStatus('online');
      else setOllamaStatus('offline');
    } catch { setOllamaStatus('offline'); }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      recognitionInstance.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        sendToOllama(text);
      };
      recognitionInstance.onerror = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  };

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      recognition.start();
      setIsListening(true);
    }
  };

  const sendToOllama = async (text: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: text, stream: false })
      });
      const data = await res.json();
      setResponse(data.response || 'No response');
      speakResponse(data.response || 'No response');
    } catch (error) {
      setResponse('Error connecting to Ollama');
    }
    setLoading(false);
  };

  const speakResponse = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Voice Assistant</h1>
          <p className="text-text-muted">Speak naturally - AI responds with voice</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-mono">Ollama: {ollamaStatus === 'online' ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <button onClick={toggleListening} disabled={ollamaStatus !== 'online'} className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all ${isListening ? 'bg-accent-red/20 border-accent-red animate-pulse' : 'bg-accent-green/20 border-accent-green'} border-4`}>
            {isListening ? <MicOff className="w-12 h-12 text-accent-red" /> : <Mic className="w-12 h-12 text-accent-green" />}
          </button>
          <p className="mt-4 text-text-muted">{isListening ? 'Listening... Speak now' : 'Click the microphone to start'}</p>
        </div>

        {transcript && (
          <div className="bg-bg-card rounded-xl p-4 mb-4 border border-border">
            <p className="text-sm text-text-muted mb-1">You said:</p>
            <p className="text-text-primary">{transcript}</p>
          </div>
        )}

        {(loading || response) && (
          <div className="bg-bg-card rounded-xl p-4 border border-accent-purple/30">
            <p className="text-sm text-text-muted mb-1 flex items-center gap-2"><Bot className="w-4 h-4" /> AI Response:</p>
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-accent-purple mx-auto" /> : <p className="text-text-primary">{response}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;
