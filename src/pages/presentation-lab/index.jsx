import React, { useState, useRef, useEffect } from 'react';
import AnalyticalDashboard from '../../components/AnalyticalDashboard';
import { 
  Zap, 
  Cpu, 
  Layers, 
  Maximize, 
  Target, 
  Database,
  Activity, 
  Play, 
  RefreshCw, 
  Search,
  Upload,
  Info,
  CheckCircle,
  AlertTriangle,
  Code,
  Terminal,
  Eye,
  Settings,
  TrendingDown,
  BarChart,
  ArrowRight,
  BookOpen
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8007';

const PresentationLab = () => {
  const [activeTab, setActiveTab] = useState('cnn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('inference'); // 'training' or 'inference'
  const [showGuide, setShowGuide] = useState(true);

  // Lab Data states
  const [analysis, setAnalysis] = useState(null);
  const [trainHistory, setTrainHistory] = useState([]);
  const [currentEpoch, setCurrentEpoch] = useState(0);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
      processImage(selected);
    }
  };

  const processImage = async (imgFile) => {
    setLoading(true);
    setAnalysis(null);
    const formData = new FormData();
    formData.append('file', imgFile);

    try {
      const response = await fetch(`${API_BASE}/api/lab/process`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError('Analysis engine timeout.');
    } finally {
      setLoading(false);
    }
  };

  const runTraining = async (algo) => {
    setLoading(true);
    setCurrentEpoch(0);
    setTrainHistory([]);
    try {
      const response = await fetch(`${API_BASE}/api/lab/train/simulate?algorithm=${algo}`);
      const data = await response.json();
      
      for (let i = 0; i < data.history.length; i++) {
        await new Promise(r => setTimeout(r, 150));
        setCurrentEpoch(i + 1);
        setTrainHistory(prev => [...prev, data.history[i]]);
      }
    } catch (err) {
      setError('Training simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const algoLabels = {
    cnn: { name: 'CNN (Deep Learning)', desc: 'Réseau Neuronal Convolutif', color: '#6366f1' },
    svm: { name: 'SVM (Classification)', desc: 'Support Vector Machine', color: '#8b5cf6' },
    kmeans: { name: 'K-Means (Clustering)', desc: 'Unsupervised Grouping', color: '#ec4899' },
    features: { name: 'SIFT & HOG', desc: 'Deterministic Extraction', color: '#eab308' },
    pca: { name: 'PCA (Reduction)', desc: 'Principal Component Analysis', color: '#06b6d4' },
    segmentation: { name: 'Mean Shift', desc: 'Image Segmentation', color: '#10b981' }
  };

  const ScientificLineage = () => {
    const isFeatureDep = ['svm', 'kmeans', 'pca'].includes(activeTab);
    const isNeuralDep = ['cnn'].includes(activeTab);
    
    return (
      <div className="mb-8 px-6 py-4 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
        <div className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'inference' ? 'opacity-50' : ''}`}>
           <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10">
              <Database size={14} className="text-slate-400" />
           </div>
           <span className="text-[7px] font-black uppercase text-slate-500">Raw Pixels</span>
        </div>

        <ArrowRight size={14} className="text-slate-800 shrink-0" />

        <div className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'features' ? 'scale-110 shadow-lg' : isFeatureDep ? 'opacity-100' : 'opacity-30'}`}>
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'features' ? 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-slate-900 border-white/5'}`}>
              <Layers size={18} className={activeTab === 'features' ? 'text-yellow-400' : 'text-slate-500'} />
           </div>
           <span className={`text-[8px] font-black uppercase ${activeTab === 'features' ? 'text-yellow-400' : 'text-slate-600'}`}>CBIR (Descriptors)</span>
        </div>

        <div className="flex-1 h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 relative">
           {(isFeatureDep || activeTab === 'features') && <div className="absolute inset-0 bg-indigo-500/30 animate-pulse" />}
        </div>

        <div className={`flex flex-col items-center gap-1 transition-all ${['svm', 'kmeans', 'pca'].includes(activeTab) ? 'scale-110 shadow-lg' : 'opacity-30'}`}>
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${['svm', 'kmeans', 'pca'].includes(activeTab) ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'bg-slate-900 border-white/5'}`}>
              <Cpu size={18} className={['svm', 'kmeans', 'pca'].includes(activeTab) ? 'text-purple-400' : 'text-slate-500'} />
           </div>
           <span className={`text-[8px] font-black uppercase ${['svm', 'kmeans', 'pca'].includes(activeTab) ? 'text-purple-400' : 'text-slate-600'}`}>ML Model</span>
        </div>

        <div className="flex-1 h-px bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 relative">
           {isNeuralDep && <div className="absolute inset-0 bg-indigo-500/30 animate-pulse" />}
        </div>

        <div className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'cnn' ? 'scale-110 shadow-lg' : 'opacity-30'}`}>
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${activeTab === 'cnn' ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-white/5'}`}>
              <Zap size={18} className={activeTab === 'cnn' ? 'text-indigo-400' : 'text-slate-500'} />
           </div>
           <span className={`text-[8px] font-black uppercase ${activeTab === 'cnn' ? 'text-indigo-400' : 'text-slate-600'}`}>Machine Learning</span>
        </div>

        <ArrowRight size={14} className="text-slate-800 shrink-0" />

        <div className={`flex flex-col items-center gap-1 transition-all opacity-100`}>
           <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle size={14} className="text-emerald-500" />
           </div>
           <span className="text-[7px] font-black uppercase text-emerald-600">Decision</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020203] text-slate-200 font-mono overflow-x-hidden">
      
      {/* AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-indigo-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-40 -right-40 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-[100] bg-[#050508]/80 backdrop-blur-2xl border-b border-white/5 py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <Zap className="text-white" size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase italic leading-none">Visual AI Lab <span className="text-indigo-400 not-italic text-[10px] ml-1 tracking-widest font-bold border border-indigo-400/30 px-1 rounded">TAYARA PRO MAX</span></h1>
              <div className="flex items-center gap-2 text-[8px] text-slate-500 font-black uppercase mt-1">
                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" />
                Live Kernel v3.0 // Academic Mode
              </div>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 h-12">
            {Object.keys(algoLabels).map((t) => (
              <button
                key={t}
                onClick={() => { setActiveTab(t); setAnalysis(null); setTrainHistory([]); setCurrentEpoch(0); }}
                className={`px-4 rounded-xl text-[9px] font-black transition-all uppercase tracking-widest ${
                  activeTab === t ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button onClick={() => setShowGuide(true)} className="p-2 border border-white/10 rounded-xl hover:bg-white/5 transition-all text-slate-400">
            <BookOpen size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: CORE WORKBENCH */}
        <div className="lg:col-span-8 space-y-6">
           
           <ScientificLineage />

           <div className="bg-[#0a0a10] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
              {/* PHASE SELECTOR (The Academic Split) */}
              {['features', 'segmentation'].includes(activeTab) ? (
                 <div className="bg-indigo-600/10 border-b border-indigo-500/20 py-3 px-8 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Deterministic Algorithm (Fixed Math - No Training Phase)</span>
                    <Info size={14} className="text-indigo-400" />
                 </div>
              ) : (
                <div className="flex bg-[#050508]/50 border-b border-white/5 p-2">
                  <button 
                    onClick={() => setMode('training')}
                    className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'training' ? 'bg-amber-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}
                  >
                    <Settings size={14} /> Phase 1: Training / Fitting
                  </button>
                  <button 
                    onClick={() => setMode('inference')}
                    className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'inference' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}
                  >
                    <Play size={14} /> Phase 2: Inference / Usage
                  </button>
                </div>
              )}

              {/* DYNAMIC CONTENT PER PHASE */}
              <div className="flex-1 p-8 lg:p-12">
                 
                 {/* TRAINING PHASE VIEW */}
                 {(mode === 'training' && !['features', 'segmentation'].includes(activeTab)) && (
                   <div className="space-y-10 animate-in fade-in duration-500 h-full flex flex-col">
                      <div className="flex justify-between items-start">
                         <div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">{activeTab.toUpperCase()} Training Process</h2>
                            <p className="text-xs text-slate-500 tracking-tight italic">Algorithm is learning from a labeled dataset to optimize weights/parameters.</p>
                         </div>
                         <button 
                          onClick={() => runTraining(activeTab)}
                          disabled={loading}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-3 disabled:opacity-50"
                         >
                           {loading ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />} RUN TRAINING CYCLE
                         </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                        {/* THE MATH CONSOLE */}
                        <div className="bg-black/50 border border-white/5 rounded-3xl p-6 font-mono text-[10px] overflow-hidden flex flex-col">
                           <div className="flex items-center gap-2 mb-4 text-amber-500/50">
                              <Terminal size={14} />
                              <span className="font-black uppercase tracking-widest">Backpropagation / Optimizer Logs</span>
                           </div>
                           <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                              <p className="text-blue-400 opacity-50 border-b border-white/5 pb-2 mb-2">INITIALIZING ARCHITECTURE: {activeTab === 'cnn' ? 'RESEAU NEURONAL' : 'MATHEMATICAL KERNEL'}</p>
                              {trainHistory.map((h, i) => (
                                <div key={i} className="animate-in slide-in-from-left duration-300">
                                   <span className="text-amber-500 opacity-60">EPOCH {h.epoch}:</span> <span className="text-white">LOSS {h.loss.toFixed(4)}</span>
                                   <p className="text-slate-500 pl-4">→ {h.meta.step}: {h.meta.action}</p>
                                   <p className="text-indigo-400/80 pl-4">→ {h.meta.correction || h.meta.status}</p>
                                </div>
                              ))}
                              {currentEpoch === 20 && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-4 text-emerald-500 font-black text-center uppercase tracking-widest">Convergence Complete. Weights Frozen.</div>}
                           </div>
                        </div>

                        {/* ACCURACY GAUGE */}
                        <div className="flex flex-col gap-6">
                           <div className="bg-black/30 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 relative overflow-hidden group">
                              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Model Accuracy</div>
                              <div className="text-7xl font-black italic text-white leading-none">
                                {trainHistory.length ? (trainHistory[trainHistory.length-1].accuracy * 100).toFixed(1) : "0.0"}%
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                                 <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(trainHistory[trainHistory.length-1]?.accuracy || 0) * 100}%` }} />
                              </div>
                              <Activity className="absolute bottom-4 right-4 text-white/5" size={48} />
                           </div>

                           <div className="bg-amber-600/10 border border-amber-600/20 rounded-3xl p-6 italic">
                              <p className="text-[11px] text-amber-200/60 leading-relaxed font-bold">
                                {activeTab === 'cnn' && "Academic Point: Backpropagation works backward from output to input, updating the weights of millions of parameters using the Chain Rule."}
                                {activeTab === 'svm' && "Academic Point: SVM solves a quadratic optimization problem to find the separating boundary with the largest possible Margin."}
                                {activeTab === 'kmeans' && "Academic Point: Unsupervised learning. K-means clusters data by iteratively moving K-centroids to the center of their assigned points."}
                                {activeTab === 'pca' && "Academic Point: PCA uses linear algebra (Eigenvalues) to identify axes of maximum variance and 'fit' the principal components."}
                              </p>
                           </div>
                        </div>
                      </div>
                   </div>
                 )}

                 {/* INFERENCE / USAGE PHASE VIEW */}
                 {(mode === 'inference' || ['features', 'segmentation'].includes(activeTab)) && (
                   <div className="space-y-10 animate-in fade-in duration-500 h-full flex flex-col">
                      <div className="flex justify-between items-start">
                         <div>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">{activeTab.toUpperCase()} Inference Engine</h2>
                            <p className="text-xs text-slate-500 tracking-tight italic">Using the trained model to process and identify a new, unseen image.</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
                        {/* INPUT: LOAD IMAGE */}
                        <div className="relative group min-h-[400px]">
                           {!preview ? (
                             <label className="absolute inset-0 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                                   <Upload size={32} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Load Task Image</span>
                                <input type="file" onChange={handleFileChange} className="hidden" />
                             </label>
                           ) : (
                             <div className="relative h-full bg-black/40 rounded-[32px] overflow-hidden border border-white/5 flex items-center justify-center">
                                <img src={preview} className="max-h-[450px] object-contain rounded-xl" alt="Input" />
                                
                                {loading && (
                                   <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                      <RefreshCw className="animate-spin text-indigo-500" size={32} />
                                      <span className="text-[10px] font-black uppercase text-indigo-400 animate-pulse">Running {activeTab} Inference...</span>
                                   </div>
                                )}

                                {/* OVERLAYS PER ALGO */}
                                {analysis && (
                                  <div className="absolute inset-0 pointer-events-none">
                                     {['features', 'svm'].includes(activeTab) && analysis.sift_keypoints?.map((kp, i) => (
                                       <div key={i} className="absolute w-1 h-1 bg-yellow-400 rounded-full" style={{ left: `${kp.x/5}%`, top: `${kp.y/5}%` }} />
                                     ))}
                                     {['features', 'svm'].includes(activeTab) && analysis.hog_orientations?.map((row, y) => row.map((a, x) => (
                                       <div key={`${x}-${y}`} className="absolute w-2 h-0.5 bg-indigo-500/40" style={{ left: `${x*6.25}%`, top: `${y*6.25}%`, transform: `rotate(${a}deg)` }} />
                                     )))}
                                     {activeTab === 'segmentation' && analysis.segmented_image && (
                                       <img src={analysis.segmented_image} className="absolute inset-0 w-full h-full object-contain opacity-70" alt="Segmented" />
                                     )}
                                  </div>
                                )}

                                <button onClick={() => { setPreview(null); setAnalysis(null); }} className="absolute top-4 right-4 p-2 bg-red-600/20 text-red-500 rounded-xl hover:bg-red-600/40"><RefreshCw size={16}/></button>
                             </div>
                           )}
                        </div>

                        {/* OUTPUT: LABELS & VECTORS */}
                        <div className="flex flex-col gap-6">
                           {analysis ? (
                             <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                
                                {/* 1. NUMERICAL VECTOR (THE SIGNATURE) */}
                                <div className="bg-black/30 border border-white/5 p-6 rounded-3xl">
                                   <div className="flex items-center justify-between mb-4">
                                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Code size={14}/> Feature Vector (Signature)</span>
                                      <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-slate-600">32D PROJECTION</span>
                                   </div>
                                   <div className="grid grid-cols-8 gap-0.5 opacity-80">
                                      {analysis.digital_signature?.slice(0, 16).map((v, i) => (
                                        <div key={i} className="aspect-square bg-slate-900 flex items-center justify-center text-[7px] font-bold text-indigo-400 border border-white/5">{v.toString().replace('0.', '.')}</div>
                                      ))}
                                   </div>
                                   <p className="mt-3 text-[9px] text-slate-600 italic">This is the mathematical data sent to the search index.</p>
                                </div>

                                {/* 2. THE FINAL LABEL (PRO MAX RESULT) */}
                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] shadow-inner relative overflow-hidden group">
                                   <div className="absolute -bottom-10 -right-10 bg-indigo-500/5 w-40 h-40 rounded-full blur-3xl" />
                                   
                                   {activeTab === 'cnn' && (
                                     <div className="space-y-4">
                                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2"><CheckCircle size={14}/> CNN Inference Result</span>
                                        <div className="flex flex-col">
                                          <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">Identified Content:</span>
                                          <span className="text-4xl font-black italic text-white tracking-tighter leading-none">{analysis.cnn?.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${analysis.cnn?.confidence*100}%` }} />
                                          </div>
                                          <span className="text-[10px] font-black text-emerald-500">{(analysis.cnn?.confidence*100).toFixed(0)}% PROB.</span>
                                        </div>
                                     </div>
                                   )}

                                   {activeTab === 'svm' && (
                                     <div className="space-y-4">
                                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] flex items-center gap-2"><Maximize size={14}/> SVM Classifier Result</span>
                                        <div className="flex flex-col">
                                          <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">Class Assigned:</span>
                                          <span className="text-4xl font-black italic text-white tracking-tighter leading-none">{analysis.svm?.label}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-600 italic mt-2 leading-relaxed">{analysis.svm?.description}</p>
                                     </div>
                                   )}

                                   {activeTab === 'kmeans' && (
                                     <div className="space-y-4">
                                        <span className="text-[10px] font-black uppercase text-pink-400 tracking-[0.2em] flex items-center gap-2"><Layers size={14}/> Cluster Assignment</span>
                                        <div className="flex flex-col">
                                          <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">Nearest Centroid:</span>
                                          <span className="text-4xl font-black italic text-white tracking-tighter leading-none">CLUSTER #{analysis.kmeans?.cluster}</span>
                                        </div>
                                        <div className="pt-2 flex gap-2">
                                          {analysis.kmeans?.distances.map((d, i) => (
                                            <div key={i} className={`flex-1 p-2 rounded-lg border text-center ${i+1 === analysis.kmeans.cluster ? 'border-pink-500/50 bg-pink-500/10' : 'border-white/5 bg-black/20 text-slate-600'}`}>
                                               <span className="text-[7px] block font-black uppercase">C#{i+1} DIST</span>
                                               <span className="text-[10px] font-bold">{d}</span>
                                            </div>
                                          ))}
                                        </div>
                                     </div>
                                   )}

                                   {['features', 'pca', 'segmentation'].includes(activeTab) && (
                                     <div className="space-y-2">
                                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.2em] flex items-center gap-2"><Activity size={14}/> Structural Processing Complete</span>
                                        <p className="text-[11px] text-slate-400 italic font-bold">Mathematical extraction performed. Resulting data visualized on the image and exported as a {activeTab.toUpperCase()} vector.</p>
                                     </div>
                                   )}
                                </div>
                             </div>
                           ) : (
                             <div className="bg-black/20 border-2 border-dashed border-white/5 rounded-[40px] p-12 flex flex-col items-center justify-center text-center gap-4 h-full">
                                <Cpu size={48} className="text-slate-800" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 leading-tight">Waiting for Image Input<br/><span className="text-[9px] font-bold text-slate-800 italic">Phase 2: Use Model for Predictions</span></h3>
                             </div>
                           )}

                           <div className="p-8 bg-indigo-600/5 border border-white/5 rounded-[32px] italic">
                             <div className="flex items-center gap-2 mb-3">
                               <Info size={14} className="text-indigo-400" />
                               <span className="text-[9px] font-black uppercase tracking-widest text-white underline underline-offset-4">Academic Guide</span>
                             </div>
                             <p className="text-[11px] text-indigo-200/50 leading-relaxed font-bold">
                                {activeTab === 'cnn' && "In Inference, the input image goes through a single FORWARD PASS. The CNN uses its 'learned' weights to automatically classify the image content."}
                                {activeTab === 'svm' && "Crucial Logic: SVM does not use image pixels. It uses the HOG/SIFT vector as input and checks its position relative to the optimal hyperplane."}
                                {activeTab === 'kmeans' && "For a new image, K-means calculates the Euclidean distance to the pre-fitted K centroids to find the immediate cluster assignment."}
                                {activeTab === 'features' && "SIFT (DoG) and HOG (Gradients) are deterministic. No training is required as they follow fixed geometric and color equations."}
                             </p>
                           </div>
                        </div>
                      </div>
                   </div>
                 )}
              </div>
           </div>

        </div>

        {/* RIGHT: THEORETICAL TELEMETRY */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* LOGICAL SUMMARY */}
           <div className="bg-[#0a0a10] border border-white/5 rounded-[40px] p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 bg-indigo-500/5 group-hover:bg-indigo-500/10 w-40 h-40 rounded-full blur-3xl transition-all" />
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{activeTab === 'cnn' ? '🧠' : activeTab === 'svm' ? '📐' : activeTab === 'kmeans' ? '📦' : activeTab === 'features' ? '🧬' : '📈'}</span>
                <div>
                   <h3 className="text-lg font-black tracking-tighter uppercase italic leading-none">{algoLabels[activeTab].name}</h3>
                   <span className="text-[9px] font-bold text-slate-500 uppercase">{algoLabels[activeTab].desc}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4 py-2 bg-white/[0.01] rounded-r-xl">
                 {activeTab === 'cnn' && "CNN (Convolutional Neural Network) is a deep learning architecture that automates feature extraction through multiple layers of trained filters."}
                 {activeTab === 'svm' && "SVM handles high-dimensional vectors and finds a separation boundary. Note: Requires HOG/SIFT pre-processing for image tasks."}
                 {activeTab === 'kmeans' && "K-Means uses Unsupervised learning (no labels) to group images by visual similarity. Iterates centroids until stable."}
                 {activeTab === 'features' && "SIFT (invariant keypoints) and HOG (structural gradients) are the building blocks of classic computer vision indexing."}
                 {activeTab === 'pca' && "PCA reduces data complexity. It keeps only the axes (components) that contain the most important information for faster search."}
                 {activeTab === 'segmentation' && "Mean Shift is a sliding-window segmentation tool that groups pixels to isolate foreground objects from background noise."}
              </p>
           </div>

           {/* INFRASTRUCTURE MONITOR */}
           <div className="bg-[#0a0a10] border border-white/5 rounded-[40px] p-8 space-y-8 shadow-xl">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Site Infrastructure</span>
                 <Activity size={18} className="text-indigo-500" />
              </div>

              <div className="space-y-6 pt-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase">
                       <span className="text-slate-500">Processing Load</span>
                       <span className="text-emerald-500">{loading ? "78%" : "LOW"}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className={`h-full bg-emerald-500 transition-all duration-1000 ${loading ? 'w-[78%] animate-pulse' : 'w-[2%]'}`} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
                       <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Status</span>
                       <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 group"><CheckCircle size={10}/> OPERATIONAL</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-3xl">
                       <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Architecture</span>
                       <span className="text-[10px] font-black text-indigo-400 flex items-center gap-1"><Cpu size={10}/> FULL-STACK JS/PY</span>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                 <h4 className="text-[9px] font-black uppercase text-indigo-500 flex items-center gap-2 underline underline-offset-4 tracking-widest">Presenter Quick-Links</h4>
                 <div className="flex flex-col gap-2">
                    <button onClick={() => window.location.href = '/'} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                       <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">Main Search App</span>
                       <ArrowRight size={14} className="text-slate-700" />
                    </button>
                 </div>
              </div>
           </div>

           {/* THE "HOW TO USE" MINI-GUIDE */}
           <div className="bg-emerald-600/5 border border-emerald-500/10 rounded-[40px] p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                 <CheckCircle size={60} className="text-emerald-400" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 underline underline-offset-4 flex items-center gap-2"><Play size={10} fill="currentColor" /> Presenter Guide</h4>
              <ul className="space-y-1 text-[10px] text-emerald-200/50 font-bold leading-relaxed">
                 <li className="flex gap-2"><span>1.</span> <span>Pick an Algorithm from the top menu.</span></li>
                 <li className="flex gap-2"><span>2.</span> <span>Run **Phase 1 (Training)** to show the Math & Backprop logic.</span></li>
                 <li className="flex gap-2"><span>3.</span> <span>Switch to **Phase 2 (Inference)** to test actual images.</span></li>
                 <li className="flex gap-2"><span>4.</span> <span>Show the **Vecteur (Signature)** and the final generated **Label result** for full Pro-Max analysis.</span></li>
              </ul>
           </div>
        </div>
      </main>

      {/* ERROR MODAL */}
      {error && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom duration-500">
           <div className="bg-red-600/90 text-white px-10 py-4 rounded-3xl shadow-2xl backdrop-blur-md flex items-center gap-4 border border-red-400/30">
              <AlertTriangle size={20} />
              <span className="text-xs font-black uppercase tracking-widest leading-none">{error}</span>
           </div>
        </div>
      )}

      {/* INITIAL GUIDE OVERLAY */}
      {showGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-[#0f0f18] border border-white/10 rounded-[50px] max-w-2xl w-full p-12 text-center shadow-[0_0_100px_rgba(79,70,229,0.2)]">
              <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center mx-auto mb-10 shadow-2xl">
                 <Terminal className="text-white" size={40} />
              </div>
              <h2 className="text-4xl font-black italic text-white tracking-tighter uppercase mb-4">Tayara Pro Max Analysis Engined V3.0</h2>
              <p className="text-slate-500 text-sm italic mb-10 leading-relaxed">
                 Ready for your presentation. We have strictly implemented Phase 1 (Training) and Phase 2 (Inference) logic as per the academic guidelines. SIFT/HOG descriptors are integrated as inputs for SVM/K-Means classifiers.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-10">
                 <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                    <span className="text-[10px] font-black text-indigo-400 uppercase block mb-2 tracking-[0.2em]">Step 1: The Model Class</span>
                    <p className="text-[11px] text-slate-400 font-bold italic leading-tight">Start with "Training/Fitting" to explain the internal math (Centroids, Hyperplanes, Gradients).</p>
                 </div>
                 <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                    <span className="text-[10px] font-black text-emerald-400 uppercase block mb-2 tracking-[0.2em]">Step 2: The Action Result</span>
                    <p className="text-[11px] text-slate-400 font-bold italic leading-tight">Switch to "Inference" for actual classification naming (Cat, Dog, Medical, Architecture).</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-16 rounded-[24px] text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
              >
                INITIALIZE LABORATORY <ArrowRight size={20} />
              </button>
           </div>
        </div>
      )}

      <GlobalAnalysisWrapper />
    </div>
  );
};

// Global Wrapper to handle the event-driven analysis trigger
function GlobalAnalysisWrapper() {
    const [state, setState] = useState({ id: null, queryImage: null });
    useEffect(() => {
        const handle = (e) => setState(e.detail);
        window.addEventListener('openAnalysis', handle);
        return () => window.removeEventListener('openAnalysis', handle);
    }, []);
    if (!state.id) return null;
    return <AnalyticalDashboard 
        imageId={state.id} 
        queryImage={state.queryImage}
        onClose={() => setState({ id: null, queryImage: null })} 
    />;
}

export default PresentationLab;
