import React, { useState, useEffect } from 'react';
import { Cpu, Download, Trash2, Loader2, Bot, HardDrive } from 'lucide-react';

const ModelManager: React.FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newModel, setNewModel] = useState('');
  const [pulling, setPulling] = useState(false);

  useEffect(() => { fetchModels(); }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (res.ok) { const data = await res.json(); setModels(data.models || []); }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const pullModel = async () => {
    if (!newModel) return;
    setPulling(true);
    try {
      await fetch('http://localhost:11434/api/pull', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newModel }) });
      fetchModels();
      setNewModel('');
    } catch(e) { alert('Failed to pull model'); }
    setPulling(false);
  };

  const deleteModel = async (name: string) => {
    if (confirm(`Delete ${name}?`)) {
      await fetch('http://localhost:11434/api/delete', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      fetchModels();
    }
  };

  return (
    <div className="p-6"><div className="flex justify-between items-center mb-6"><div><h1 className="text-2xl font-bold">Model Manager</h1><p className="text-text-muted">Manage Ollama AI models</p></div><Bot className="w-8 h-8 text-accent-purple" /></div>
      <div className="bg-bg-card rounded-xl p-4 border border-border mb-6"><div className="flex gap-2"><input type="text" placeholder="Model name (e.g., llama3.2:3b, mistral:7b)" value={newModel} onChange={(e) => setNewModel(e.target.value)} className="flex-1 px-3 py-2 bg-bg-secondary border border-border rounded-lg" /><button onClick={pullModel} disabled={pulling} className="px-4 py-2 bg-accent-green/20 rounded-lg flex items-center gap-2">{pulling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}Pull</button></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{loading ? (<div className="col-span-full text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>) : models.map(model => (<div key={model.name} className="bg-bg-card rounded-xl p-4 border border-border"><div className="flex justify-between items-start"><div><h3 className="font-semibold">{model.name}</h3><p className="text-text-muted text-xs mt-1">Size: {(model.size / 1e9).toFixed(2)} GB</p><p className="text-text-muted text-xs">Modified: {new Date(model.modified_at).toLocaleString()}</p></div><button onClick={() => deleteModel(model.name)} className="p-1 hover:bg-accent-red/20 rounded"><Trash2 className="w-4 h-4 text-accent-red" /></button></div></div>))}</div>
    </div>
  );
};
export default ModelManager;
