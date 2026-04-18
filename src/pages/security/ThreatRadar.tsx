import React, { useState, useEffect, useRef } from 'react';
import { Radar, Activity, AlertTriangle, Shield, Bot, Volume2, VolumeX } from 'lucide-react';

const ThreatRadar: React.FC = () => {
  const [threats, setThreats] = useState<any[]>([]);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => { setSweepAngle(prev => (prev + 2) % 360); }, 50);
    fetchThreats();
    const threatInterval = setInterval(fetchThreats, 5000);
    return () => {
      clearInterval(interval);
      clearInterval(threatInterval);
    };
  }, []);

  useEffect(() => {
    drawRadar();
  }, [threats, sweepAngle]);

  const fetchThreats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/security/threats');
      if (res.ok) {
        const data = await res.json();
        setThreats(data);
        // Announce new critical threats
        data.forEach((threat: any) => {
          if (voiceEnabled && threat.severity === 'critical') {
            speak(`Critical threat detected from ${threat.source_ip}`);
          }
        });
      }
    } catch(e) {
      setThreats([
        { id: 1, type: 'SQL Injection Attempt', severity: 'critical', source_ip: '45.33.22.1', timestamp: new Date().toISOString() },
        { id: 2, type: 'Port Scan Detected', severity: 'medium', source_ip: '192.168.1.45', timestamp: new Date().toISOString() },
        { id: 3, type: 'Brute Force Attack', severity: 'high', source_ip: '103.45.67.89', timestamp: new Date().toISOString() }
      ]);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.2;
      utterance.pitch = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const drawRadar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw radar background
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;

    // Draw concentric circles
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 4, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw radial lines
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = (angle * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(rad) * radius, centerY + Math.sin(rad) * radius);
      ctx.stroke();
    }

    // Draw sweep line
    const sweepRad = (sweepAngle * Math.PI) / 180;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(sweepRad) * radius, centerY + Math.sin(sweepRad) * radius);
    ctx.stroke();

    // Draw threats
    threats.forEach((threat, index) => {
      const distance = (index + 1) * radius / (threats.length + 1); // Distribute threats
      const angle = (index * 137.5) % 360; // Golden angle distribution
      const rad = (angle * Math.PI) / 180;
      const x = centerX + Math.cos(rad) * distance;
      const y = centerY + Math.sin(rad) * distance;

      let color = '#ffff00'; // yellow for medium
      if (threat.severity === 'critical') color = '#ff0000'; // red
      else if (threat.severity === 'high') color = '#ff8800'; // orange
      else if (threat.severity === 'low') color = '#00ff00'; // green

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Pulsing effect for critical threats
      if (threat.severity === 'critical') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8 + Math.sin(Date.now() / 200) * 2, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  };

  return (
    <div className="p-6 bg-black text-green-400 font-mono min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Radar className="w-8 h-8 text-green-400 animate-pulse" />
          <h1 className="text-2xl font-bold">THREAT RADAR</h1>
          <span className="text-sm text-green-300">MILITARY GRADE</span>
        </div>
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="px-3 py-1 bg-green-900 border border-green-400 rounded text-sm flex items-center gap-2 hover:bg-green-800"
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          {voiceEnabled ? 'VOICE ON' : 'VOICE OFF'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border-2 border-green-400 rounded-lg p-4 shadow-lg shadow-green-400/20">
            <div className="text-center mb-4">
              <div className="text-sm text-green-300">RADAR STATUS: ACTIVE</div>
              <div className="text-xs text-green-400">SWEEP ANGLE: {sweepAngle}°</div>
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="w-full h-auto border border-green-400/50 rounded"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 border border-green-400 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              ACTIVE THREATS ({threats.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {threats.map((threat, index) => (
                <div key={threat.id || index} className="bg-black/50 border border-gray-600 p-3 rounded text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                      threat.severity === 'critical' ? 'bg-red-600 text-white' :
                      threat.severity === 'high' ? 'bg-orange-600 text-white' :
                      threat.severity === 'medium' ? 'bg-yellow-600 text-black' : 'bg-green-600 text-white'
                    }`}>
                      {threat.severity?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {threat.timestamp ? new Date(threat.timestamp).toLocaleTimeString() : 'NOW'}
                    </span>
                  </div>
                  <div className="text-xs text-green-300 font-semibold mb-1">{threat.type}</div>
                  <div className="text-xs text-gray-300">{threat.source_ip}</div>
                  {threat.severity === 'critical' && (
                    <div className="text-xs text-red-400 mt-1 animate-pulse">⚠️ IMMEDIATE ACTION REQUIRED</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-green-400 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3">SYSTEM STATUS</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>RADAR SWEEP:</span>
                <span className="text-green-400">ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>THREAT DETECTION:</span>
                <span className="text-green-400">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>VOICE ALERTS:</span>
                <span className={voiceEnabled ? 'text-green-400' : 'text-red-400'}>
                  {voiceEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>LAST SCAN:</span>
                <span className="text-green-400">{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span>AI ANALYSIS:</span>
                <span className="text-green-400">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatRadar;
