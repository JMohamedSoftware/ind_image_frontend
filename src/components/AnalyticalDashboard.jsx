import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  BarChart, 
  Table, 
  Activity, 
  Info,
  Hash,
  Share2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8007";

const AnalyticalDashboard = ({ imageId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('vector'); // 'vector', 'graph'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/analysis/${imageId}`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Analysis fetch failed");
      } finally {
        setLoading(false);
      }
    };
    if (imageId) fetchData();
  }, [imageId]);

  if (!imageId) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-[#020203]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0a0a0f] border border-white/10 w-full max-w-5xl h-[85vh] rounded-[40px] shadow-[0_0_100px_rgba(79,70,229,0.1)] flex flex-col overflow-hidden relative">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Database className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic text-white flex items-center gap-2 truncate max-w-md">
                Numerical Audit: <span className="text-indigo-400">{data?.filename || 'Analyzing...'}</span>
              </h2>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-500 mt-1">
                <span>Algorithm: {data?.algorithm || 'Loading'}</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span>Dimension: {data?.dimension || '...'}D Vector</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* SIDEBAR TABS */}
          <div className="w-full md:w-20 border-r border-white/5 bg-black/20 flex md:flex-col items-center py-6 gap-6">
            <button 
              onClick={() => setActiveView('vector')}
              className={`p-4 rounded-2xl transition-all ${activeView === 'vector' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              title="Raw Vector Matrix"
            >
              <Hash size={24} />
            </button>
            <button 
              onClick={() => setActiveView('graph')}
              className={`p-4 rounded-2xl transition-all ${activeView === 'graph' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              title="Mathematical Distribution"
            >
              <BarChart size={24} />
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-black/40">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                   <Activity className="animate-spin text-indigo-500" size={48} />
                   <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Crunching Numerical Data...</span>
                </div>
             ) : (
                <div className="space-y-8 animate-in slide-in-from-right duration-500">
                   
                   {/* VIEW 1: VECTOR MATRIX */}
                   {activeView === 'vector' && (
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Feature Vector Matrix (Floats)</h3>
                           <span className="text-[8px] bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 font-black">STRICT NUMERICAL MODE</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1 overflow-hidden rounded-xl border border-white/5 shadow-2xl">
                           {data?.raw_vector.map((val, i) => (
                             <div key={i} className="bg-slate-900 border border-white/5 p-3 text-center transition-colors hover:bg-indigo-900/40 group">
                                <span className="text-[9px] font-black font-mono text-indigo-300 transition-transform group-hover:scale-110 block">
                                   {val.toFixed(4)}
                                </span>
                                <span className="text-[6px] text-slate-700 block mt-1">Idx: {i}</span>
                             </div>
                           ))}
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl italic">
                           <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                              Academic Insight: Each value represents a numeric weight in the multidimensional space. 
                              The search algorithm uses the **Euclidean Distance** between these vectors to find similarity.
                           </p>
                        </div>
                     </div>
                   )}

                   {/* VIEW 2: DISTRIBUTION GRAPH (SVG) */}
                   {activeView === 'graph' && (
                     <div className="space-y-8 h-full flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Statistical Feature Distribution</h3>
                        <div className="h-[350px] w-full bg-black/40 rounded-3xl border border-white/5 p-12 flex items-end justify-between items-stretch gap-2">
                           {data?.distribution.map((d, i) => (
                             <div key={i} className="flex-1 flex flex-col justify-end items-center group relative">
                                <div 
                                  className="w-full bg-indigo-600/40 hover:bg-indigo-500 rounded-t-lg transition-all duration-500 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                                  style={{ height: `${(d.count / Math.max(...data.distribution.map(x => x.count))) * 100}%` }}
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-[8px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                   Bin: {d.bin}
                                </div>
                             </div>
                           ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                           <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center">
                              <span className="text-[8px] text-slate-600 font-black uppercase block mb-1">Mean μ</span>
                              <span className="text-sm font-black text-white">{data?.math_metadata.mean}</span>
                           </div>
                           <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center">
                              <span className="text-[8px] text-slate-600 font-black uppercase block mb-1">Std Deviation σ</span>
                              <span className="text-sm font-black text-white">{data?.math_metadata.std}</span>
                           </div>
                           <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center">
                              <span className="text-[8px] text-slate-600 font-black uppercase block mb-1">Normalization</span>
                              <span className="text-[10px] font-black text-emerald-500 uppercase">{data?.math_metadata.norm}</span>
                           </div>
                           <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-center">
                              <span className="text-[8px] text-slate-600 font-black uppercase block mb-1">Precision</span>
                              <span className="text-[10px] font-black text-indigo-400 uppercase">FP32 (SINGLE)</span>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             )}
          </div>
        </div>

        {/* FOOTER STATS */}
        <div className="p-6 border-t border-white/5 bg-black/60 flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-600">
           <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Mathematical State: Validated</div>
           <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Descriptor Size: {data?.dimension} Dimensions</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticalDashboard;
