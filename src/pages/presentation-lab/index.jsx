import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Cpu, 
  Layers, 
  Maximize, 
  Minimize, 
  Play, 
  RefreshCw, 
  Activity, 
  Target, 
  Database,
  BarChart2,
  Share2,
  Trash2,
  Search,
  Upload,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const API_BASE = 'http://localhost:8007'; // Match backend port

const PresentationLab = () => {
  const [activeTab, setActiveTab] = useState('cnn');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Lab Data states
  const [siftData, setSiftData] = useState(null);
  const [hogData, setHogData] = useState(null);
  const [segmentedImage, setSegmentedImage] = useState(null);
  const [trainHistory, setTrainHistory] = useState(null);
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
    setError(null);
    const formData = new FormData();
    formData.append('file', imgFile);

    try {
      const response = await fetch(`${API_BASE}/api/lab/process`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setSiftData(data.sift_keypoints);
      setHogData(data.hog_orientations);
      setSegmentedImage(data.segmented_image);
    } catch (err) {
      setError('Failed to process image. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const simulateTraining = async (algo) => {
    setLoading(true);
    setCurrentEpoch(0);
    try {
      const response = await fetch(`${API_BASE}/api/lab/train/simulate?algorithm=${algo}`);
      const data = await response.json();
      
      // Animate the training steps
      for (let i = 0; i <= data.history.length; i++) {
        await new Promise(r => setTimeout(r, 150));
        setCurrentEpoch(i);
        setTrainHistory(data.history.slice(0, i));
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
    } catch (err) {
      setError('PCA projection failed.');
    }
  };

  useEffect(() => {
    if (activeTab === 'pca') fetchPCA();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans p-6 md:p-12 overflow-x-hidden">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Zap size={20} className="fill-indigo-400" />
            <span className="uppercase tracking-widest text-sm font-bold">Research & Presentation</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            Visual AI Laboratory
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl text-lg leading-relaxed">
            An interactive playground to explain complex computer vision algorithms. 
            From mathematical feature extraction to deep neural learning.
          </p>
        </div>

        <nav className="flex bg-[#16161a] p-1 rounded-2xl border border-slate-800/50 shadow-2xl">
          {['cnn', 'svm', 'kmeans', 'pca', 'features', 'segmentation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 uppercase tracking-tighter ${
                activeTab === tab 
                ? 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-lg' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Interaction Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* UPLOAD SECTION (Global for most tabs) */}
          {(activeTab !== 'pca' && activeTab !== 'kmeans') && (
            <div className="bg-[#111116] border border-slate-800/50 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl py-12 transition-colors hover:border-indigo-500/50 group-hover:bg-slate-900/30">
                {preview ? (
                  <div className="relative max-w-full max-h-[400px]">
                    <img src={preview} alt="Upload" className="rounded-xl shadow-2xl max-h-[400px] object-contain" />
                    
                    {/* SIFT OVERLAY */}
                    {activeTab === 'features' && siftData && (
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full" viewBox={`0 0 100 100`} preserveAspectRatio="none">
                          {/* Note: This is simplified scaling logic for example purposes */}
                        </svg>
                        {siftData.map((kp, i) => (
                           <div 
                            key={i} 
                            className="absolute bg-yellow-400/40 border border-yellow-200 rounded-full animate-pulse"
                            style={{
                              left: `${kp.x / 5}%`, // Assuming original was 500px, needs calibration
                              top: `${kp.y / 5}%`,
                              width: `${kp.size/2}px`,
                              height: `${kp.size/2}px`,
                            }}
                           />
                        ))}
                      </div>
                    )}

                    {/* HOG OVERLAY */}
                    {activeTab === 'features' && hogData && (
                      <div className="absolute inset-0 grid grid-cols-[repeat(8,1fr)] grid-rows-[repeat(16,1fr)] pointer-events-none opacity-60">
                        {hogData.flat().map((angle, i) => (
                          <div key={i} className="flex items-center justify-center">
                            <div 
                              className="w-full h-[1px] bg-indigo-400" 
                              style={{ transform: `rotate(${angle}deg)` }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SEGMENTATION OVERLAY */}
                    {activeTab === 'segmentation' && segmentedImage && (
                      <div className="absolute inset-0 rounded-xl overflow-hidden shadow-indigo-500/20 shadow-inner">
                        <img src={segmentedImage} className="w-full h-full object-contain opacity-90 transition-opacity" />
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 transform transition-transform group-hover:-translate-y-1">
                      <Upload className="text-indigo-400" />
                    </div>
                    <span className="text-slate-300 font-medium">Drop educational image here</span>
                    <span className="text-slate-500 text-xs mt-2">Works for SIFT, HOG, CNN, and Segmentation</span>
                    <input type="file" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
                
                {preview && (
                  <button 
                    onClick={() => {setPreview(null); setFile(null); setSiftData(null); setHogData(null); setSegmentedImage(null);}}
                    className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              {loading && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center rounded-3xl">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="animate-spin text-indigo-500" size={32} />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Processing Pixels...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: CNN */}
          {activeTab === 'cnn' && (
            <div className="space-y-6">
              <div className="bg-[#111116] border border-slate-800/50 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <Cpu className="text-indigo-500" />
                    Neural Network Cycle (Backpropagation)
                  </h3>
                  <button 
                    onClick={() => simulateTraining('CNN')}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
                  >
                    <Play size={16} fill="currentColor" />
                    START TRAINING
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Loss Chart */}
                  <div className="h-[200px] bg-slate-900/50 rounded-2xl p-4 relative flex items-end gap-1">
                    {!trainHistory ? (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs uppercase tracking-tighter">
                        Training metrics will appear here
                      </div>
                    ) : (
                      trainHistory.map((h, i) => (
                        <div 
                          key={i}
                          className="flex-1 bg-indigo-500 hover:bg-indigo-300 transition-all rounded-t-sm"
                          style={{ height: `${h.loss * 100}%` }}
                          title={`Epoch ${h.epoch}: Loss ${h.loss}`}
                        />
                      ))
                    )}
                    <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-bold uppercase">Training Loss (Cross-Entropy)</div>
                  </div>

                  {/* Info Panel */}
                  <div className="space-y-4">
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                      <div className="text-xs text-slate-500 uppercase mb-1">Current State</div>
                      <div className="text-2xl font-black text-indigo-400">
                        {currentEpoch > 0 ? `Epoch ${currentEpoch}/20` : 'Idle'}
                      </div>
                    </div>
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                      <div className="text-xs text-slate-500 uppercase mb-1">Process Action</div>
                      <div className="text-sm font-medium">
                        {trainHistory && trainHistory.length > 0 
                          ? trainHistory[trainHistory.length-1].action 
                          : 'Waiting for Forward Pass...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: PCA */}
          {activeTab === 'pca' && (
            <div className="bg-[#111116] border border-slate-800/50 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Maximize className="text-indigo-500" />
                Dimension Reduction (Principal Component Analysis)
              </h3>
              
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 aspect-square bg-slate-900/50 rounded-3xl p-8 relative border border-white/5">
                  {/* Scatter Plot Simulation */}
                  {pcaPoints.length === 0 ? (
                    <div className="text-slate-600 flex flex-col items-center justify-center h-full gap-4">
                      <Database size={40} className="opacity-20" />
                      <p className="text-xs uppercase tracking-widest text-center">No indexed data.<br/>Please index some images first.</p>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      {/* Grid Lines */}
                      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10 pointer-events-none">
                        {[...Array(16)].map((_, i) => <div key={i} className="border border-white" />)}
                      </div>
                      
                      {pcaPoints.map((p, i) => (
                        <div 
                          key={i}
                          className={`absolute w-3 h-3 rounded-full cursor-help hover:scale-150 transition-all shadow-lg ${
                            p.category === 'DL' ? 'bg-indigo-500' : p.category === 'TBIR' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ 
                            left: `${50 + (p.x * 4)}%`, 
                            top: `${50 + (p.y * 4)}%`,
                          }}
                          title={`${p.filename} (${p.algorithm})`}
                        />
                      ))}
                      
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                        Principal Component 1
                      </div>
                      <div className="absolute left-0 top-1/2 -rotate-90 -translate-x-14 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                        Principal Component 2
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:w-64 space-y-4">
                  <h4 className="text-sm font-bold text-slate-300">Statistical Insight</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    PCA transforms a high-dimensional feature vector (e.g. 4096 dimensions from CNN) 
                    into a lower-dimensional subspace while preserving the maximum variance. 
                    This results in faster searches and clearer data distribution.
                  </p>
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-500 uppercase">Input Dim</span>
                      <span className="text-indigo-400">4,096 [Full]</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-full" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold pt-2">
                      <span className="text-slate-500 uppercase">Projected Dim</span>
                      <span className="text-emerald-400">2 [Lab Visual]</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[2%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: K-MEANS */}
          {activeTab === 'kmeans' && (
            <div className="bg-[#111116] border border-slate-800/50 rounded-3xl p-8">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Database className="text-indigo-500" />
                Unsupervised Clustering (K-Means)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((clusterId) => (
                  <div key={clusterId} className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase text-indigo-400">Cluster #{clusterId}</span>
                      <div className={`w-2 h-2 rounded-full ${clusterId === 1 ? 'bg-indigo-500' : clusterId === 2 ? 'bg-emerald-500' : 'bg-pink-500'}`} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 opacity-40">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-800 rounded-lg animate-pulse" />
                      ))}
                    </div>
                    <p className="mt-4 text-[10px] text-slate-500 leading-tight">
                      Items grouped based on Euclidean distance to centroid #{clusterId}.
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <h4 className="text-sm font-bold text-indigo-300 mb-2">Unsupervised Logic</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unlike CNN, K-Means does not use labels. It iteratively finds the center of masses (Centroids) 
                  in the feature space and assigns each point to the closest one.
                </p>
              </div>
            </div>
          )}

          {/* TAB CONTENT: SVM */}
          {activeTab === 'svm' && (
             <div className="bg-[#111116] border border-slate-800/50 rounded-3xl p-8">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <Layers className="text-indigo-500" />
                  SVM Classification Workflow
                </h3>

                <div className="flex items-center justify-between relative mb-12">
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-800 -translate-y-1/2 pointer-events-none" />
                  
                  {['Features', 'Train', 'Predict'].map((step, i) => (
                    <div key={step} className="relative z-10 flex flex-col items-center bg-[#111116] px-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border-2 ${
                        i === 0 ? 'bg-indigo-500 border-indigo-200' : 'bg-slate-900 border-slate-700'
                      } text-white font-black text-sm`}>
                        {i + 1}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900/60 p-8 rounded-3xl text-center border border-white/5">
                  <div className="max-w-md mx-auto space-y-6">
                    <p className="text-slate-400 text-sm leading-relaxed">
                      "I extract vectors using <strong>SIFT</strong> or <strong>HOG</strong>, then I find the maximum margin hyperplane to separate your image from everything else."
                    </p>
                    <button 
                      onClick={() => simulateTraining('SVM')}
                      className="w-full py-4 bg-indigo-600 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                    >
                      Process Classification Cycle
                    </button>
                  </div>
                </div>
             </div>
          )}

        </div>

        {/* Sidebar Status / Educational Snippets */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Quick Stats Panel */}
          <div className="bg-[#16161a] border border-slate-800/50 rounded-3xl p-8 shadow-2xl">
            <h4 className="text-xs font-black uppercase text-slate-500 mb-6 tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" /> 
              Telemetry Panel
            </h4>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-900/40 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Mode</span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Presentation</span>
              </div>
              
              {activeTab === 'features' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">SIFT Keypoints</span>
                    <span className="text-xs font-black text-indigo-400">{siftData?.length || 0}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full" style={{ width: siftData ? `${Math.min(100, siftData.length/2)}%` : '0%' }} />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={14} className="text-yellow-500" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Theory Snippet</span>
                </div>
                <p className="text-[11px] text-slate-500 italic leading-relaxed">
                  {activeTab === 'cnn' && "Backpropagation calculates the gradient of the loss function with respect to the weights of the network for a single input-output example."}
                  {activeTab === 'svm' && "SVM avoids the 'curse of dimensionality' by focusing on the Support Vectors—the hardest cases near the decision boundary."}
                  {activeTab === 'features' && "SIFT is scale-invariant, meaning it finds the same object whether it is zoomed in or far away."}
                  {activeTab === 'segmentation' && "Mean Shift is a non-parametric feature-space analysis technique used for locating the modes of a density function."}
                  {activeTab === 'pca' && "By removing correlated variables, PCA effectively speeds up subsequent training and retrieval tasks."}
                  {activeTab === 'kmeans' && "K-Means is a greedy algorithm: it makes local optimal choices to find global clusters."}
                </p>
              </div>
            </div>
          </div>

          {/* Tips for Presentation */}
          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Share2 size={80} className="text-indigo-400" />
             </div>
             <h4 className="text-xs font-black uppercase text-indigo-300 mb-4 tracking-widest">Presentation Tip</h4>
             <ul className="text-xs text-indigo-200/80 space-y-4 font-medium">
               <li className="flex gap-3 items-start">
                 <CheckCircle size={14} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                 Mention that <strong>Backpropagation</strong> is the 'engine' of Deep Learning.
               </li>
               <li className="flex gap-3 items-start">
                 <CheckCircle size={14} className="mt-0.5 text-indigo-400 flex-shrink-0" />
                 Show the <strong>HOG</strong> orientations to prove the machine sees "shapes" not just pixels.
               </li>
             </ul>
          </div>

        </div>

      </main>

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce z-50">
          <AlertTriangle size={18} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}
    </div>
  );
};

export default PresentationLab;
