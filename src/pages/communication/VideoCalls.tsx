import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Phone, Share2, Users, Bot } from 'lucide-react';

const VideoCalls: React.FC = () => {
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState<{ from: string; type: string } | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (inCall) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [inCall]);

  const startCall = async (type: 'video' | 'audio') => {
    setCallType(type);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setInCall(true);
      simulateIncomingCall();
    } catch (err) { console.error(err); }
  };

  const simulateIncomingCall = () => {
    setTimeout(() => {
      setIncomingCall({ from: "John Doe (Security Team)", type: "video" });
    }, 3000);
  };

  const acceptCall = () => { setIncomingCall(null); setInCall(true); };
  const declineCall = () => { setIncomingCall(null); };
  const endCall = () => { setInCall(false); setCallDuration(0); };

  const toggleMute = () => setMuted(!muted);
  const toggleVideo = () => setVideoEnabled(!videoEnabled);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Video Calls</h1><p className="text-text-muted">Secure WebRTC calls</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      {!inCall ? (<div className="text-center py-12"><div className="flex justify-center gap-4 mb-6"><button onClick={() => startCall('video')} className="w-24 h-24 rounded-full bg-accent-green/20 border-4 border-accent-green flex flex-col items-center justify-center"><Video className="w-8 h-8 mb-1" /><span className="text-xs">Video</span></button><button onClick={() => startCall('audio')} className="w-24 h-24 rounded-full bg-accent-cyan/20 border-4 border-accent-cyan flex flex-col items-center justify-center"><Phone className="w-8 h-8 mb-1" /><span className="text-xs">Audio</span></button></div><p className="text-text-muted">Click to start a call</p></div>) : (
        <div className="bg-bg-card rounded-xl overflow-hidden border border-border"><div className="relative bg-black h-96"><video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" /><div className="absolute bottom-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-accent-green"><video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" /></div><div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white text-sm">{formatDuration(callDuration)}</div></div>
        <div className="p-4 flex justify-center gap-4"><button onClick={toggleMute} className="p-3 rounded-full bg-bg-secondary hover:bg-accent">{muted ? <MicOff className="w-5 h-5 text-accent-red" /> : <Mic className="w-5 h-5" />}</button><button onClick={toggleVideo} className="p-3 rounded-full bg-bg-secondary hover:bg-accent">{videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-accent-red" />}</button><button className="p-3 rounded-full bg-bg-secondary hover:bg-accent"><Share2 className="w-5 h-5" /></button><button onClick={endCall} className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/40"><PhoneOff className="w-5 h-5 text-accent-red" /></button></div></div>)}
      {incomingCall && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><div className="bg-bg-card rounded-xl p-6 text-center"><div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-4"><Phone className="w-10 h-10 text-accent-green animate-pulse" /></div><h3 className="text-xl font-bold mb-1">Incoming Call</h3><p className="text-text-muted mb-4">{incomingCall.from}</p><div className="flex gap-4 justify-center"><button onClick={acceptCall} className="px-6 py-2 bg-green-500 rounded-lg flex items-center gap-2"><Phone className="w-4 h-4" />Accept</button><button onClick={declineCall} className="px-6 py-2 bg-red-500 rounded-lg flex items-center gap-2"><PhoneOff className="w-4 h-4" />Decline</button></div></div></div>)}
    </div>
  );
};
export default VideoCalls;
