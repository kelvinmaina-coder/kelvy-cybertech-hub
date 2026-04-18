import React, { useEffect, useRef } from 'react';
import { Globe, Bot } from 'lucide-react';

const HackerGlobe: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Three.js globe would be initialized here
    console.log('3D Globe ready - requires Three.js');
  }, []);

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">3D Hacker Globe</h1><p className="text-text-muted">Global attack visualization</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div ref={containerRef} className="bg-bg-card rounded-xl p-4 border border-border h-96 flex items-center justify-center"><Globe className="w-24 h-24 text-accent-cyan animate-pulse" /><p className="text-text-muted ml-4">3D visualization loading... (Three.js required)</p></div>
    </div>
  );
};
export default HackerGlobe;
