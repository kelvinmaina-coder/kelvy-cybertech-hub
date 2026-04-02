const OLLAMA_BASE_URL = "http://localhost:11434";

export interface OllamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
}

export interface OllamaStreamChunk {
  model: string;
  message: { role: string; content: string };
  done: boolean;
}

export async function streamOllamaChat({
  messages,
  model = "qwen2.5:7b",
  systemPrompt,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  messages: OllamaMessage[];
  model?: string;
  systemPrompt?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}) {
  const allMessages: OllamaMessage[] = [];
  if (systemPrompt) {
    allMessages.push({ role: "system", content: systemPrompt });
  }
  allMessages.push(...messages);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: allMessages, stream: true }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      onError(`Ollama error (${response.status}): ${errorText}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("No response stream available");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk: OllamaStreamChunk = JSON.parse(line);
          if (chunk.message?.content) {
            onDelta(chunk.message.content);
          }
          if (chunk.done) {
            onDone();
            return;
          }
        } catch {
          // partial JSON, skip
        }
      }
    }
    onDone();
  } catch (err: any) {
    if (err.name === "AbortError") return;
    onError(
      err.message?.includes("Failed to fetch")
        ? "Cannot connect to Ollama. Make sure Ollama is running on localhost:11434 and has CORS enabled.\n\nRun: OLLAMA_ORIGINS=* ollama serve"
        : `Connection error: ${err.message}`
    );
  }
}

export async function listOllamaModels(): Promise<string[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m: any) => m.name);
  } catch {
    return [];
  }
}

export async function analyzeWithOllama(tool: string, output: string, model = "qwen2.5:7b"): Promise<string> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: `I ran the security tool '${tool}' and got this output:\n${output.substring(0, 3000)}\n\nPlease explain in plain English:\n1. What was found\n2. What the security risk level is (Critical/High/Medium/Low/Info)\n3. What actions should be taken\nKeep it concise and practical.`,
        stream: false,
      }),
    });
    if (!res.ok) return "AI analysis unavailable";
    const data = await res.json();
    return data.response || "No analysis generated";
  } catch {
    return "AI analysis unavailable - Ollama not connected";
  }
}
