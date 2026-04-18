import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, TrendingUp, Bot } from 'lucide-react';

const SOCDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/security/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">SOCDashboard</h1>
          <p className="text-text-muted"></p>
        </div>
        <Bot className="w-8 h-8 text-accent-purple" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-card rounded-xl p-6 border border-border">
            <Shield className="w-8 h-8 text-accent-green mb-3" />
            <p className="text-2xl font-bold text-text-primary">AI-Powered</p>
            <p className="text-text-muted text-sm mt-2">Real-time analysis using Ollama</p>
          </div>
          <div className="bg-bg-card rounded-xl p-6 border border-border">
            <Activity className="w-8 h-8 text-accent-cyan mb-3" />
            <p className="text-2xl font-bold text-text-primary">Live Data</p>
            <p className="text-text-muted text-sm mt-2">Connected to Supabase</p>
          </div>
          <div className="bg-bg-card rounded-xl p-6 border border-border">
            <TrendingUp className="w-8 h-8 text-accent-purple mb-3" />
            <p className="text-2xl font-bold text-text-primary">Predictive</p>
            <p className="text-text-muted text-sm mt-2">AI forecasts and insights</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SOCDashboard;
