import React, { useState, useRef } from 'react';
import { Upload, Image, Loader2, Bot, Eye, FileText } from 'lucide-react';

const VisionAnalysis: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'online' | 'offline'>('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    checkOllama();
  }, []);

  const checkOllama = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (res.ok) setOllamaStatus('online');
      else setOllamaStatus('offline');
    } catch { setOllamaStatus('offline'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      analyzeImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Image: string) => {
    setLoading(true);
    setAnalysis('');
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen3-vl:8b',
          prompt: 'Describe this image in detail. What do you see? Include objects, colors, text, and any notable details.',
          images: [base64Image.split(',')[1]],
          stream: false
        })
      });
      const data = await res.json();
      setAnalysis(data.response || 'No description generated');
    } catch (error) {
      setAnalysis('Error analyzing image. Make sure Ollama is running with qwen3-vl:8b model.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Vision Analysis</h1>
          <p className="text-text-muted">AI-powered image analysis using qwen3-vl:8b</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-mono">Ollama: {ollamaStatus === 'online' ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <div className="text-center mb-4">
            <Eye className="w-12 h-12 text-accent-purple mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-text-primary">Upload Image</h2>
            <p className="text-text-muted text-sm">Supported: JPG, PNG, GIF, WebP</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-accent-green/20 border border-accent-green rounded-lg text-accent-green font-mono flex items-center justify-center gap-2 hover:bg-accent-green/30"
          >
            <Upload className="w-4 h-4" />
            Select Image
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          
          {selectedImage && (
            <div className="mt-4">
              <img src={selectedImage} alt="Preview" className="rounded-lg max-h-64 w-auto mx-auto border border-border" />
            </div>
          )}
        </div>

        {/* Analysis Section */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-accent-green" />
            <h2 className="text-lg font-semibold text-text-primary">AI Analysis</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent-purple" />
              <span className="ml-2 text-text-muted">Analyzing image...</span>
            </div>
          ) : analysis ? (
            <div className="bg-bg-secondary rounded-lg p-4">
              <p className="text-text-primary whitespace-pre-wrap">{analysis}</p>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Upload an image to see AI analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisionAnalysis;
