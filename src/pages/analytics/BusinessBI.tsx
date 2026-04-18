import React from 'react';
import { Activity, Bot, Shield, TrendingUp } from 'lucide-react';

const BusinessBI: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">BusinessBI</h1>
          <p className="text-text-muted">AI-powered feature with real-time data</p>
        </div>
        <Bot className="w-8 h-8 text-accent-purple" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-bg-card to-bg-secondary rounded-xl p-6 border border-border">
          <Shield className="w-10 h-10 text-accent-green mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">AI Ready</h2>
          <p className="text-text-muted">This feature uses Ollama (qwen2.5:7b) for intelligent analysis</p>
        </div>
        
        <div className="bg-gradient-to-br from-bg-card to-bg-secondary rounded-xl p-6 border border-border">
          <Activity className="w-10 h-10 text-accent-cyan mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Real-time Data</h2>
          <p className="text-text-muted">Connected to Supabase for live updates</p>
        </div>
        
        <div className="bg-gradient-to-br from-bg-card to-bg-secondary rounded-xl p-6 border border-border col-span-full">
          <TrendingUp className="w-10 h-10 text-accent-purple mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Coming Soon</h2>
          <p className="text-text-muted">Full AI-powered functionality is being prepared</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessBI;
