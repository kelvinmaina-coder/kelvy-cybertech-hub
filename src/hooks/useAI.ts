import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AIResponse {
  response?: string;
  error?: string;
  content?: string;
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const callAI = useCallback(async (
    prompt: string, 
    options: { 
      model?: "qwen2.5:7b" | "qwen3-vl:8b";
      systemPrompt?: string;
      image?: string;
      retries?: number;
    } = {}
  ): Promise<string> => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const { model = "qwen2.5:7b", systemPrompt, image, retries = 3 } = options;
    setLoading(true);

    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        const endpoint = image ? "/api/ollama/vision" : "/api/ollama/chat";
        const body = image 
          ? { prompt, image, model } 
          : { 
              model, 
              messages: [{ role: "user", content: prompt }],
              system_prompt: systemPrompt || "You are a helpful AI assistant in the Kelvy CyberTech Hub."
            };

        const response = await fetch(`${backendUrl}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(`Gateway Error: ${response.statusText}`);
        }

        if (image) {
          const data: AIResponse = await response.json();
          setLoading(false);
          return data.response || "No description generated.";
        } else {
          // Handle streaming response structure from backend/api/ai.py
          const data = await response.text();
          const content = data.split('\n')
            .filter(l => l.startsWith('data: '))
            .map(l => {
               try { return JSON.parse(l.replace('data: ', '')).content; } 
               catch { return ''; }
            })
            .join('');
          
          setLoading(false);
          return content || "Processing complete.";
        }
      } catch (err) {
        lastError = err;
        console.warn(`AI Attempt ${i + 1} failed:`, err);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
      }
    }

    setLoading(false);
    const errorMsg = "Backend AI gateway is not responding. Please ensure 'cd backend && python main.py' and 'ollama serve' are running.";
    toast.error(errorMsg);
    throw lastError || new Error(errorMsg);
  }, []);

  const checkHealth = async () => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${backendUrl}/health`);
      return await res.json();
    } catch {
      return { status: "offline", ollama: false };
    }
  };

  return { callAI, checkHealth, loading };
};
