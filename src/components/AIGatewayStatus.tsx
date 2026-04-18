import { useEffect, useState } from "react";
import { CheckCircle2, Wifi, AlertTriangle } from "lucide-react";

const AIGatewayStatus = () => {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");
  const [ollamaReady, setOllamaReady] = useState(false);

  useEffect(() => {
    let active = true;
    const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${backendUrl}/health`);
        if (!active) return;
        const data = await res.json();
        setStatus(res.ok ? "online" : "offline");
        setOllamaReady(Boolean(data?.ollama));
      } catch (error) {
        if (!active) return;
        setStatus("offline");
        setOllamaReady(false);
      }
    };

    fetchStatus();
    const interval = window.setInterval(fetchStatus, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const label =
    status === "loading"
      ? "Checking AI gateway..."
      : status === "online"
      ? `AI Gateway • ${ollamaReady ? "Ollama ready" : "Ollama offline"}`
      : "AI Gateway offline";

  const statusClasses =
    status === "online"
      ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/20"
      : status === "loading"
      ? "bg-slate-500/10 text-slate-200 border-slate-500/20"
      : "bg-red-500/10 text-red-300 border-red-500/20";

  const Icon = status === "online" ? CheckCircle2 : status === "loading" ? Wifi : AlertTriangle;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${statusClasses}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
};

export default AIGatewayStatus;
