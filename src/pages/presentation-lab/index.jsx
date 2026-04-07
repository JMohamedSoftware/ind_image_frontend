import React, { useState, useRef, useEffect } from 'react';
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
  BarChart
} from 'lucide-react';

const API_BASE = 'http://localhost:8007';

const PresentationLab = () => {
  const [activeTab, setActiveTab] = useState('cnn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('inference'); // 'training' or 'inference'

  // Lab Data states
  const [analysis, setAnalysis] = useState(null);
  const [trainHistory, setTrainHistory] = useState([]);
  const [pcaPoints, setPcaPoints] = useState([]);
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
      setError('Failed to reach backend analysis engine.');
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
      
      // Educational simulation speed
      for (let i = 0; i < data.history.length; i++) {
        await new Promise(r => setTimeout(r, 200));
        setCurrentEpoch(i + 1);
        setTrainHistory(prev => [...prev, data.history[i]]);
      }
    } catch (err) {
      setError('Training simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPCA = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/lab/pca/projection`);
      const data = await response.json();
      setPcaPoints(data.points || []);
    } catch (err) { }
  };

  useEffect(() => {
    if (activeTab === 'pca') fetchPCA();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#050507] text-[#e2e8f0] font-mono selection:bg-indigo-500/30">
      
      {/* SCANLINE EFFECT */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

      {/* TOP NAV */}
      <nav className="sticky top-0 z-[60] bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Terminal className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">Visual AI Lab <span className="text-indigo-500 text-xs not-italic font-bold ml-2">v2.0 Industrial</span></h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                System Online — Presentation Mode Active
              </div>
            </div>
          </div>

          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
            {['cnn', 'svm', 'features', 'pca', 'kmeans', 'segmentation'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${
                  activeTab === t 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: VISUALIZATION */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* CORE EXPLORER CARD */}
          <div className="bg-[#0f0f13] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* CARD HEADER: MODE SELECTOR */}
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setMode('inference')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'inference' ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 opacity-50'}`}
              >
                <Eye size={14} /> Utilisation / Inference
              </button>
              <button 
                onClick={() => setMode('training')}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'training' ? 'bg-amber-600/10 text-amber-400 border-b-2 border-amber-500' : 'text-slate-500 opacity-50'}`}
              >
                <Settings size={14} /> Entraînement / Training
              </button>
            </div>

            <div className="p-8">
              {/* INFERENCE VIEW */}
              {mode === 'inference' && (
                <div className="space-y-8">
                  {/* UPLOAD & ANALYSIS OVERLAY */}
                  <div className="relative group rounded-2xl border-2 border-dashed border-white/10 p-8 hover:border-indigo-500/50 transition-all bg-black/20">
                     {!preview ? (
                       <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                         <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                           <Upload className="text-indigo-400" />
                         </div>
                         <p className="text-sm font-black uppercase tracking-widest text-slate-400">Load Test Image</p>
                         <p className="text-[10px] text-slate-600 mt-2 italic">Select image for real-time analysis</p>
                         <input type="file" onChange={handleFileChange} className="hidden" />
                       </label>
                     ) : (
                       <div className="relative max-w-2xl mx-auto flex items-center justify-center">
                          <img src={preview} className="rounded-xl shadow-2xl max-h-[450px] object-contain" alt="Target" />
                          
                          {/* DYNAMIC ANALYSIS OVERLAYS */}
                          {analysis && (
                            <div className="absolute inset-0 pointer-events-none">
                               {/* SVM ENHANCEMENT: Show HOG/SIFT as the source of SVM features */}
                               {(activeTab === 'features' || activeTab === 'svm') && analysis.sift_keypoints?.map((kp, i) => (
                                 <div 
                                  key={i} 
                                  className="absolute w-1.5 h-1.5 border border-yellow-400 rounded-full bg-yellow-400/20"
                                  style={{ left: `${kp.x/5}%`, top: `${kp.y/5}%` }} // Simplified mapping
                                 />
                               ))}

                               {(activeTab === 'features' || activeTab === 'svm') && analysis.hog_orientations?.map((row, y) => 
                                 row.map((angle, x) => (
                                  <div 
                                    key={`${x}-${y}`} 
                                    className="absolute w-4 h-4 opacity-40" 
                                    style={{ left: `${x*6.25}%`, top: `${y*6.25}%` }}
                                  >
                                    <div className="w-full h-0.5 bg-indigo-400" style={{ transform: `rotate(${angle}deg)` }} />
                                  </div>
                                 ))
                               )}

                               {/* MEAN SHIFT SEGMENTS */}
                               {activeTab === 'segmentation' && analysis.segmented_image && (
                                 <img src={analysis.segmented_image} className="absolute inset-0 w-full h-full object-contain mix-blend-overlay opacity-80" alt="Segmented" />
                               )}
                            </div>
                          )}

                          {/* SCANNER ANIMATION */}
                          {loading && (
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              <div className="w-full h-1 bg-indigo-400 shadow-[0_0_20px_#818cf8] animate-scan" />
                            </div>
                          )}
                       </div>
                     )}

                     {preview && (
                        <button 
                          onClick={() => {setPreview(null); setAnalysis(null);}}
                          className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                        >
                          <RefreshCw size={16} />
                        </button>
                     )}
                  </div>

                  {/* ANALYSIS RESULTS BARS */}
                  {analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500">
                      {/* VECTEURS (Digital Signature) */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2">
                            <Code size={14} /> Digital Signature (Vecteur)
                          </h4>
                          <span className="text-[8px] font-bold text-slate-600">32 / 128 FLOATS</span>
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                          {analysis.digital_signature?.map((v, i) => (
                            <div key={i} className="bg-slate-900 border border-white/5 p-1 text-center group relative cursor-help">
                              <span className="text-[8px] font-bold text-indigo-300">{(v*10).toFixed(0)}</span>
                              <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 p-2 bg-indigo-600 text-white text-[8px] rounded z-20 whitespace-normal">
                                Feature Value: {v}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 text-[9px] text-slate-500 italic leading-relaxed">
                          This vector is the "Mathematical ID" extracted by {activeTab.toUpperCase()}. 
                          The machine compares these arrays of numbers to find similarity.
                        </p>
                      </div>

                      {/* CLASSIFICATION (SVM/CNN/IA Result) */}
                      <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-2">
                            <Target size={14} /> {activeTab === 'svm' ? 'SVM CLASSIFIER RESULT' : 'IA Prediction (Inference)'}
                          </h4>
                          {activeTab === 'svm' && (
                             <span className="text-[8px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-black">
                               INPUT: SIFT/HOG FEATURES
                             </span>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-end justify-between">
                            <span className="text-2xl font-black text-white">{analysis.classification?.label}</span>
                            <span className="text-emerald-400 text-xs font-black">{(analysis.classification?.confidence * 100).toFixed(0)}% MATCH</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-emerald-500 h-full shadow-[0_0_10px_#10b981]" 
                              style={{ width: `${analysis.classification?.confidence * 100}%` }} 
                            />
                          </div>
                          
                          <div className="pt-2 flex flex-wrap gap-2 opacity-50">
                            {analysis.classification?.alternatives?.map((alt, i) => (
                              <div key={i} className="text-[8px] font-bold bg-white/5 border border-white/5 px-2 py-1 rounded">
                                {alt.label}: {(alt.score * 100).toFixed(0)}%
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TRAINING VIEW */}
              {mode === 'training' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* TRAINING MONITOR */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center justify-between">
                         <h3 className="text-xs font-black uppercase tracking-widest text-amber-500">Backpropagation Engine</h3>
                         <button 
                          onClick={() => runTraining(activeTab)}
                          disabled={loading}
                          className="bg-amber-600 hover:bg-amber-500 px-6 py-2 rounded-xl text-[10px] font-black text-white transition-all disabled:opacity-50 flex items-center gap-2"
                         >
                           {loading ? <RefreshCw className="animate-spin" size={14}/> : <Play size={14} />} INITIATE TRAINING CYCLE
                         </button>
                      </div>

                      {/* DATASET SIMULATION MOCK */}
                      <div className="bg-black/30 border border-white/5 p-6 rounded-2xl grid grid-cols-4 gap-4 opacity-40">
                         {[...Array(8)].map((_, i) => (
                           <div key={i} className="aspect-square bg-slate-800 rounded-lg flex items-center justify-center border border-dashed border-slate-700">
                              <Database size={24} className="text-slate-600" />
                           </div>
                         ))}
                         <div className="col-span-4 text-center mt-2">
                           <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Training Dataset: 1,000+ Annotated Samples</span>
                         </div>
                      </div>

                      {/* LOSS GRAPH */}
                      <div className="h-[200px] bg-[#050507] rounded-2xl p-6 border border-white/5 relative flex items-end gap-1">
                        {!trainHistory.length ? (
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-700 uppercase tracking-widest font-black">
                            Waiting for Epoch 0
                          </div>
                        ) : (
                          trainHistory.map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-amber-500/40 hover:bg-amber-400 transition-all rounded-t-sm border-t border-amber-400"
                              style={{ height: `${h.loss * 100}%` }}
                            />
                          ))
                        )}
                        <div className="absolute top-4 left-4 text-[9px] font-black uppercase text-amber-500/50">Training Loss (Cross Entropy Error)</div>
                      </div>
                    </div>

                    {/* STATUS CONSOLE */}
                    <div className="w-full md:w-80 space-y-4">
                       <div className="bg-black border border-white/5 rounded-2xl p-6 font-mono text-[10px] h-[400px] overflow-y-auto space-y-2">
                          <p className="text-emerald-500 leading-tight mb-4">[SYSTEM]: Training module initialized.</p>
                          {trainHistory.map((h, i) => (
                            <div key={i} className="border-l border-white/5 pl-2 py-1">
                              <p className="text-amber-500 font-bold tracking-tight uppercase">Epoch {h.epoch}: Loss {h.loss}</p>
                              <p className="text-slate-500 leading-3 mt-1">Action: {h.meta.action}</p>
                              <p className="text-indigo-400 leading-3">Correction: {h.meta.correction}</p>
                            </div>
                          ))}
                          {currentEpoch === 20 && (
                            <div className="pt-4 text-emerald-500 font-black animate-pulse uppercase tracking-widest">
                               [SUCCESS]: Global Minima Found. Model state converged.
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SVM BOUNDARY SPECIAL (Specific for SVM Tab) */}
          {activeTab === 'svm' && (
            <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 animate-in slide-in-from-right duration-500 overflow-hidden relative">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#6366f1] mb-8 flex items-center gap-2">
                <Layers size={14}/> Support Vector Machine Separation Boundary
              </h3>
              
              <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="flex-1 aspect-square md:max-w-[400px] w-full bg-black/40 rounded-3xl p-8 relative border border-white/5 flex items-center justify-center">
                    {/* Scatter plot mock */}
                    <div className="relative w-full h-full">
                      {/* Hyperplane line */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-indigo-500 shadow-[0_0_15px_#818cf8] -rotate-12 transform-gpu" />
                      
                      {/* Dots side A (Cat) */}
                      {[...Array(12)].map((_, i) => (
                        <div key={`a-${i}`} className="absolute w-2 h-2 rounded-full bg-emerald-500 opacity-60" style={{ left: `${10+Math.random()*35}%`, top: `${10+Math.random()*80}%` }} />
                      ))}
                      
                      {/* Dots side B (Dog) */}
                      {[...Array(12)].map((_, i) => (
                        <div key={`b-${i}`} className="absolute w-2 h-2 rounded-full bg-pink-500 opacity-60" style={{ left: `${55+Math.random()*35}%`, top: `${10+Math.random()*80}%` }} />
                      ))}
                      
                      <div className="absolute top-4 left-4 text-[9px] text-emerald-400 font-black uppercase">Class A</div>
                      <div className="absolute bottom-4 right-4 text-[9px] text-pink-400 font-black uppercase">Class B</div>
                    </div>
                 </div>

                 <div className="flex-1 space-y-6">
                    <p className="text-xs text-slate-400 leading-relaxed italic">
                      "Unlike CNN which takes raw pixels, <strong>SVM uses the HOG/SIFT features</strong> you see highlighted on the image above. It plots these visual markers as points in a multidimensional space and finds the <strong>Optimal Hyperplane</strong> to separate the classes."
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] text-slate-600 block mb-1">Hyperplane Equation</span>
                          <span className="text-[10px] font-black text-indigo-400 italic font-serif">w·x + b = 0</span>
                       </div>
                       <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                          <span className="text-[9px] text-slate-600 block mb-1">Kernel Type</span>
                          <span className="text-[10px] font-black text-indigo-400 uppercase">Linear (RBF Support)</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* PCA PROJECTION (For PCA Tab) */}
          {activeTab === 'pca' && (
            <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 animate-in slide-in-from-right duration-500 overflow-hidden">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-8 flex items-center gap-2">
                 <Maximize size={14}/> Feature Dimensionality Reduction (PCA)
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="bg-black/40 aspect-square rounded-3xl p-8 relative border border-white/5 overflow-hidden">
                     {pcaPoints.length > 0 ? (
                        <div className="relative w-full h-full">
                           {pcaPoints.map((p, i) => (
                             <div 
                              key={i} 
                              className={`absolute w-3 h-3 rounded-full shadow-lg cursor-help group transition-transform hover:scale-150 ${p.type === 'CBIR' ? 'bg-indigo-500' : p.type === 'DL' ? 'bg-emerald-500' : 'bg-pink-500'}`}
                              style={{ left: `${50+(p.x*4)}%`, top: `${50+(p.y*4)}%` }}
                             >
                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white text-black text-[8px] rounded whitespace-nowrap z-30 font-bold uppercase">
                                  {p.filename} ({p.type})
                                </div>
                             </div>
                           ))}
                           <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                              {[...Array(36)].map((_, i) => <div key={i} className="border border-white/20" />)}
                           </div>
                        </div>
                     ) : (
                       <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-700">
                          <Database size={48} className="opacity-10" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Index images first to see 2D Projection</p>
                       </div>
                     )}
                  </div>
                  <div className="space-y-6">
                     <p className="text-xs text-slate-400 leading-relaxed italic">
                        "Here, I take a high-dimensional vector (e.g. 4096 features from a CNN) and reduce it to just <strong>2 Principal Components</strong>. This speeds up indexing while keeping the most important visual variances."
                     </p>
                     <div className="pt-4 space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-black uppercase text-indigo-500">
                            <span>Input Dimensions</span>
                            <span>4,096 [Neural State]</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="bg-indigo-600 h-full w-full shadow-[0_0_10px_#6366f1]" />
                          </div>
                        </div>
                        <div className="space-y-1 opacity-60">
                           <div className="text-[7px] text-slate-700 font-bold uppercase animate-pulse">Processing Covariance Matrix...</div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-black uppercase text-emerald-500">
                            <span>Transformed Dimensions (PCA Output)</span>
                            <span>2 [Visualization Ready]</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div className="bg-emerald-500 h-full w-[2%] shadow-[0_0_10px_#10b981]" />
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: LAB TELEMETRY */}
        <div className="lg:col-span-4 space-y-6">
           {/* ALGO DESCRIPTION CARD */}
           <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-xl">
              <div className="absolute -top-10 -right-10 bg-indigo-500/5 group-hover:bg-indigo-500/10 w-40 h-40 rounded-full blur-[40px] transition-all duration-500" />
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl filter grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                  {activeTab === 'cnn' && "🧠"}
                  {activeTab === 'svm' && "📐"}
                  {activeTab === 'features' && "🧬"}
                  {activeTab === 'pca' && "📉"}
                  {activeTab === 'kmeans' && "📦"}
                  {activeTab === 'segmentation' && "🧩"}
                </span>
                <h2 className="text-lg font-black uppercase tracking-tighter truncate">{activeTab.toUpperCase()} Analysis</h2>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic border-l border-indigo-500/30 pl-4 py-2">
                 {activeTab === 'cnn' && "Réseau Neuronal Convolutif: Automatically extracts hierarchical features. Backpropagation optimizes the weights to minimize error over time."}
                 {activeTab === 'svm' && "Support Vector Machine: A supervised classifier that finds the optimal hyperplane to separate data into distinct classes."}
                 {activeTab === 'features' && "Feature Engineering (SIFT & HOG): Mathematical equations used to extract keypoints (Sift) or structural gradients (Hog) for robust matching."}
                 {activeTab === 'pca' && "Principal Component Analysis: Statistical technique used to reduce computational costs by focusing on variables with the highest variance."}
                 {activeTab === 'kmeans' && "Unsupervised Clustering: Groups unlabeled images based on the Euclidean distance between their feature vectors."}
                 {activeTab === 'segmentation' && "Image Segmentation (Mean Shift): Clusters similar pixels into segments to separate foreground objects from the background."}
              </p>
           </div>

           {/* STATUS GAUGE */}
           <div className="bg-[#0f0f13] border border-white/5 rounded-3xl p-8 shadow-xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-6 flex items-center gap-2">
                <Activity size={14} className="text-indigo-500" /> Live Telemetry
              </h4>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase">
                       <span className="text-slate-500">Processing Load</span>
                       <span className="text-indigo-400">{loading ? "78%" : "2%"}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className={`h-full transition-all duration-700 ${loading ? 'bg-indigo-500 w-[78%] animate-pulse' : 'bg-slate-800 w-[2%]'}`} />
                    </div>
                 </div>

                 <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                       <TrendingDown size={14} className="text-amber-500"/>
                       <span className="text-[9px] font-black uppercase text-amber-500">Learning Stability</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-white italic">
                       <span>{mode === 'training' ? 'LOW_VAR' : 'STABLE'}</span>
                       <CheckCircle size={20} className="text-emerald-500" />
                    </div>
                 </div>
              </div>
           </div>

           {/* THEORY CORNER */}
           <div className="bg-indigo-600/5 border border-indigo-500/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <BarChart size={60} className="text-indigo-400 rotate-12" />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 underline underline-offset-4">Academic Insight</h4>
              <p className="text-[11px] text-indigo-200/60 leading-relaxed font-bold">
                 {activeTab === 'cnn' && "In Training mode, we use Backpropagation to propagate the error backwards from the output to the input layer to optimize millions of parameters."}
                 {activeTab === 'svm' && "SVM handles high-dimensional vectors effectively. In Inference mode, it simply checks where the new point falls relative to the decision boundary."}
                 {activeTab === 'features' && "SIFT is rotation-invariant. SIFT is scale-invariant. This makes the extraction process extremely reliable for object detection."}
                 {activeTab === 'segmentation' && "Mean Shift moves towards the densest regions of the color space to find the 'Mode' — which becomes the pixel's segment color."}
                 {activeTab === 'pca' && "By removing noisy features, PCA often improves the accuracy of the overall search system by reducing the Curse of Dimensionality."}
                 {activeTab === 'kmeans' && "K-Means is an Unsupervised learner. It finds patterns in data that doesn't have labels, grouping images by visual similarity automatically."}
              </p>
           </div>
        </div>
      </main>

      {error && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom duration-500">
           <div className="bg-red-600/90 text-white px-8 py-3 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] backdrop-blur-md flex items-center gap-4">
              <AlertTriangle size={18} />
              <span className="text-xs font-bold uppercase tracking-tight">{error}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default PresentationLab;
