import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const INDEXING_TYPES = [
    { id: 'TBIR', name: 'Text-Based', icon: '📝', desc: 'Metadata & Keywords' },
    { id: 'CBIR', name: 'Content-Based', icon: '🎨', desc: 'Pixels, Shapes & Colors' },
    { id: 'DL', name: 'Deep Learning', icon: '🧠', desc: 'Neural Embeddings' },
];

const ALGORITHMS = [
    {
        id: 'TBIR_BASIC',
        type: 'TBIR',
        name: 'Inverted Index',
        full: 'Classic Keyword Retrieval',
        accent: '#475569',
        light: '#f8fafc',
        border: '#e2e8f0',
        text: '#334155',
        badge: 'Keyword Search',
        description: 'Uses text tags and filenames. No visual analysis, just efficient text matching.',
        speed: 5,
        accuracy: 2,
        descriptorSize: 'Variable',
        descriptorType: 'Tokens',
        matchMetric: 'Jaccard / TF-IDF',
        detectorDetail: 'Tokenizer — breaks description into individual words',
        descriptorDetail: 'Inverted Index — maps words to image IDs',
        matchDetail: 'Word intersection — finds images sharing the most words with your query.',
    },
    {
        id: 'ORB',
        type: 'CBIR',
        name: 'ORB',
        full: 'Oriented FAST & Rotated BRIEF',
        accent: '#7c3aed',
        light: '#f5f3ff',
        border: '#ddd6fe',
        text: '#5b21b6',
        badge: 'Fast & Efficient',
        description: 'Ultra-fast binary descriptor. Best for real-time use. Used in robotics & AR.',
        speed: 5,
        accuracy: 3,
        descriptorSize: '32 bytes (256 bits)',
        descriptorType: 'Binary',
        matchMetric: 'Hamming (XOR)',
        detectorDetail: 'FAST corners — checks a ring of 16 pixels; if 9+ are brighter or darker, it\'s a corner',
        descriptorDetail: 'BRIEF — compares random pixel pairs around each keypoint → 1 bit per comparison → 256 bits total',
        matchDetail: 'XOR the two binary strings → count different bits (Hamming distance). Fewer different bits = more similar.',
    },
    {
        id: 'SIFT',
        type: 'CBIR',
        name: 'SIFT',
        full: 'Scale-Invariant Feature Transform',
        accent: '#0891b2',
        light: '#ecfeff',
        border: '#a5f3fc',
        text: '#0e7490',
        badge: 'Most Accurate',
        description: 'Highly accurate, scale & rotation invariant. The gold standard for matching.',
        speed: 2,
        accuracy: 5,
        descriptorSize: '512 bytes (128 × float32)',
        descriptorType: 'Float vector',
        matchMetric: 'L2 / Euclidean distance',
        detectorDetail: 'DoG (Difference of Gaussians) — blurs image at multiple scales, finds extrema points that are stable across scales',
        descriptorDetail: 'Divides 16×16 area into 4×4 sub-cells, computes 8-direction gradient histogram per cell → 4×4×8 = 128 floats',
        matchDetail: 'Euclidean distance: √Σ(a−b)². Smaller = more similar float vectors.',
    },
    {
        id: 'AKAZE',
        type: 'CBIR',
        name: 'AKAZE',
        full: 'Accelerated-KAZE',
        accent: '#c2410c',
        light: '#fff7ed',
        border: '#fed7aa',
        text: '#9a3412',
        badge: 'Balanced',
        description: 'Great balance of speed and accuracy. Excellent for complex textures.',
        speed: 4,
        accuracy: 4,
        descriptorSize: '61 bytes (486 bits)',
        descriptorType: 'Binary',
        matchMetric: 'Hamming distance',
        detectorDetail: 'AOS (Additive Operator Splitting) — uses nonlinear diffusion to smooth the image while preserving edges, finds stable extrema',
        descriptorDetail: 'M-LDB — computes binary comparisons of gradient values in a local grid around each keypoint → 486 bits',
        matchDetail: 'Same as ORB: XOR → count differing bits. AKAZE descriptors are larger so matching is slightly slower but more accurate.',
    },
    {
        id: 'HOG',
        type: 'CBIR',
        name: 'HOG',
        full: 'Histogram of Oriented Gradients',
        accent: '#059669',
        light: '#ecfdf5',
        border: '#a7f3d0',
        text: '#047857',
        badge: 'Structural',
        description: 'Focuses on the shape and structure of objects. Famous for being used in human detection.',
        speed: 4,
        accuracy: 3,
        descriptorSize: '3,780 features (for 64x128)',
        descriptorType: 'Gradient Vector',
        matchMetric: 'Cosine Similarity',
        detectorDetail: 'Cell-based Gradients — divides image into small cells, computes orientation of edges in each cell',
        descriptorDetail: 'Block Normalization — local histograms are contrast-normalized by overlapping blocks for better lighting invariance',
        matchDetail: 'Vector dot product — compares the structural "fingerprint" of the two images.',
    },
    {
        id: 'CNN',
        type: 'DL',
        name: 'CNN',
        full: 'Convolutional Neural Network',
        accent: '#2563eb',
        light: '#eff6ff',
        border: '#bfdbfe',
        text: '#1d4ed8',
        badge: 'Deep Learning',
        description: 'Learns hierarchical patterns automatically. Mimics how the human brain processes vision.',
        speed: 1,
        accuracy: 5,
        descriptorSize: '4096 floats (VGG/ResNet)',
        descriptorType: 'Neural Embedding',
        matchMetric: 'Euclidean distance',
        detectorDetail: 'Convolutional Layers — filters slide across the image to find textures, shapes, and complex objects',
        descriptorDetail: 'Fully Connected Layer — flattens the 2D spatial maps into a single high-dimensional semantic vector',
        matchDetail: 'Vector distance — similarity is measured in a high-dimensional "latent space" where similar objects group together.',
    },
    {
        id: 'CLIP',
        type: 'DL',
        name: 'CLIP',
        full: 'Contrastive Language-Image Pre-training',
        accent: '#8b5cf6',
        light: '#f5f3ff',
        border: '#c4b5fd',
        text: '#6d28d9',
        badge: 'Multimodal AI',
        description: 'Connects text and images. Allows searching for visual content using natural language.',
        speed: 3,
        accuracy: 5,
        descriptorSize: '512 floats (Latent Space)',
        descriptorType: 'Multimodal Embedding',
        matchMetric: 'Cosine Similarity',
        detectorDetail: 'Transformer Encoder — processes text tokens and image patches into a shared mathematical space',
        descriptorDetail: 'Projection Head — aligns the visual and textual vectors so "red car" (text) is near "red car" (image)',
        matchDetail: 'Cosine distance: measures the angle between the text vector and image vectors in the shared space.',
    },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8007';
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'image_index';
const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

// ─── LIVE PROCESS LOG ────────────────────────────────────────────────────────
// steps: [{ icon, text, detail, status: 'pending'|'running'|'done'|'error' }]
function LiveLog({ steps }) {
    return (
        <div className="space-y-0">
            {steps.map((s, i) => (
                <div
                    key={i}
                    className={`flex gap-3 items-start py-2.5 border-l-2 pl-4 transition-all duration-300 ${s.status === 'done' ? 'border-green-400' :
                        s.status === 'running' ? 'border-blue-400' :
                            s.status === 'error' ? 'border-red-400' :
                                'border-gray-200'
                        } ${s.status === 'pending' ? 'opacity-30' : 'opacity-100'}`}
                >
                    <div className="text-lg mt-0.5 shrink-0">
                        {s.status === 'running' ? (
                            <span className="inline-block animate-spin">⚙️</span>
                        ) : s.status === 'done' ? '✅' :
                            s.status === 'error' ? '❌' : '⏸️'}
                    </div>
                    <div>
                        <p className={`text-sm font-semibold ${s.status === 'done' ? 'text-gray-800' :
                            s.status === 'running' ? 'text-blue-700' :
                                s.status === 'error' ? 'text-red-700' :
                                    'text-gray-400'
                            }`}>
                            {s.text}
                        </p>
                        {s.detail && s.status !== 'pending' && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.detail}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── DOTS RATING ─────────────────────────────────────────────────────────────
function Dots({ score, color }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full border-2 transition-all"
                    style={{ background: i <= score ? color : 'transparent', borderColor: i <= score ? color : '#d1d5db' }} />
            ))}
        </div>
    );
}

// ─── INDEXING OVERLAY ────────────────────────────────────────────────────────
function IndexingOverlay({ algo, stepIndex }) {
    if (stepIndex < 0) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
            {/* Step 1: Preprocessing (Scanning Line) */}
            {stepIndex === 1 && (
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 opacity-60 shadow-[0_0_10px_#60a5fa] animate-scan" />
            )}

            {/* Step 2: Feature Extraction */}
            {stepIndex >= 2 && (
                <div className="absolute inset-0">
                    {algo.type === 'CBIR' && ['ORB', 'SIFT', 'AKAZE'].includes(algo.id) && (
                        <div className="relative w-full h-full">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="absolute w-1.5 h-1.5 rounded-full animate-ping"
                                    style={{
                                        left: `${15 + Math.random() * 70}%`,
                                        top: `${15 + Math.random() * 70}%`,
                                        background: algo.accent,
                                        animationDelay: `${i * 200}ms`,
                                        opacity: stepIndex === 2 ? 0.8 : 0.4
                                    }} />
                            ))}
                        </div>
                    )}
                    {algo.id === 'HOG' && (
                        <div className="grid grid-cols-4 grid-rows-4 h-full w-full opacity-60 p-1">
                            {[...Array(16)].map((_, i) => (
                                <div key={i} className="border border-white/10 flex items-center justify-center">
                                    <div className="w-4 h-0.5 bg-green-400" style={{ transform: `rotate(${Math.random() * 180}deg)` }} />
                                </div>
                            ))}
                        </div>
                    )}
                    {algo.type === 'DL' && (
                        <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center overflow-hidden">
                            <div className="w-full h-full opacity-30 pointer-events-none">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    {[...Array(5)].map((_, i) => (
                                        <line key={i} x1="0" y1={20 * i} x2="100" y2={100 - 20 * i} stroke="white" strokeWidth="0.5" className="animate-pulse" />
                                    ))}
                                </svg>
                            </div>
                        </div>
                    )}
                    {algo.type === 'TBIR' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white/90 p-2 rounded text-[8px] font-mono text-gray-500 animate-pulse">
                                TOKENIZING... description.split(' ')
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const ColorBar = ({ stats }) => {
    if (!stats) return null;
    return (
        <div className="flex h-1.5 rounded-full overflow-hidden mt-2 bg-gray-100 border border-gray-100">
            <div style={{ width: `${stats.r}%`, background: '#ef4444' }} />
            <div style={{ width: `${stats.g}%`, background: '#22c55e' }} />
            <div style={{ width: `${stats.b}%`, background: '#3b82f6' }} />
        </div>
    );
};

// ─── INDEXED IMAGE WITH LIVE LOG ─────────────────────────────────────────────
function IndexedCard({ image, algo, onComplete }) {
    const [stepIndex, setStepIndex] = useState(-1);
    const [steps, setSteps] = useState([
        { text: '1. ACQUISITION', detail: null, status: 'pending' },
        { text: '2. PRÉTRAITEMENT', detail: null, status: 'pending' },
        { text: '3. ANALYSE D’IMAGE', detail: null, status: 'pending' },
        { text: '4. REPRÉSENTATION', detail: null, status: 'pending' },
        { text: '5. INDEXATION', detail: null, status: 'pending' },
        { text: '6. STOCKAGE', detail: null, status: 'pending' },
        { text: '7. RECHERCHE', detail: null, status: 'pending' },
    ]);

    const update = (i, status, detail) => {
        setStepIndex(i);
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status, detail: detail ?? s.detail } : s));
    };

    useEffect(() => {
        update(0, 'running');
        const t0 = setTimeout(() => { update(0, 'done', `Received: ${image.name}`); update(1, 'running'); }, 400);
        const t1 = setTimeout(() => { update(1, 'done', 'Resized & Normalisé'); update(2, 'running'); }, 1200);
        const t2 = setTimeout(() => {
            update(2, 'done', `${algo.name} Analysis`);
            update(3, 'running');
        }, 2000);
        const t3 = setTimeout(() => {
            const feat = algo.type === 'TBIR' ? `Tags: ${image.description || 'none'}` : `Vector: ${algo.descriptorSize}`;
            update(3, 'done', feat);
            update(4, 'running');
        }, 3000);
        const t4 = setTimeout(() => {
            update(4, 'done', 'Mapped to Knowledge Base');
            update(5, 'running');
        }, 3800);
        const t5 = setTimeout(() => {
            update(5, 'done', 'Saved to index.pkl');
            update(6, 'running');
        }, 4600);
        const t6 = setTimeout(() => {
            update(6, 'done', 'Ready for discovery');
            // Auto removal after a short delay to let the user see the "done" state
            setTimeout(() => onComplete(image), 1000);
        }, 5500);

        return () => [t0, t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    }, [image.id, algo]);

    return (
        <div className="rounded-2xl border bg-white shadow-xl overflow-hidden animate-in slide-in-from-right duration-500" style={{ borderColor: algo.accent + '30' }}>
            <div className="flex gap-4 p-5">
                <div className="relative w-24 h-24 shrink-0 shadow-inner rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    <img src={image.preview} alt={image.name} className="w-full h-full object-cover" />
                    <IndexingOverlay algo={algo} stepIndex={stepIndex} />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1 text-center">
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Live Process</span>
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-gray-400 truncate uppercase tracking-widest">{image.name}</p>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-75"></div>
                        </div>
                    </div>
                    <LiveLog steps={steps} />
                </div>
            </div>
            {stepIndex === 6 && (
                <div className="bg-green-500 text-white text-[10px] font-black py-1.5 text-center uppercase tracking-[0.2em] animate-pulse">
                    Indexing Complete — Adding to Library
                </div>
            )}
        </div>
    );
}

// ─── SEARCH LIVE LOG PANEL ────────────────────────────────────────────────────
function SearchLivePanel({ queryImage, algo, steps, textQuery }) {
    const isFusion = algo.id === 'CLIP' && queryImage && textQuery?.trim();

    return (
        <div className="rounded-2xl border bg-white p-5 shadow-sm overflow-hidden h-full flex flex-col" style={{ borderColor: algo.border }}>
            <div className="flex gap-3 items-center mb-4">
                {queryImage && (
                    <div className="relative">
                        <img src={queryImage.preview} alt={queryImage.name} className="w-14 h-14 rounded-xl object-cover border" style={{ borderColor: algo.border }} />
                        {isFusion && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white border-2 border-white">🎨</div>}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-gray-400 truncate uppercase font-black tracking-widest">{queryImage?.name || 'Search Query'}</p>
                    <p className="font-bold text-sm truncate" style={{ color: algo.accent }}>{isFusion ? '🧠 Neural Fusion Engine' : `🔍 ${algo.name} Search Pipeline`}</p>
                </div>
            </div>

            {isFusion && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-around gap-2 animate-in fade-in zoom-in duration-500">
                    <div className="text-center">
                        <div className="text-[10px] font-black text-blue-400 uppercase mb-1">IMAGE</div>
                        <div className="w-8 h-2 bg-blue-200 rounded-full"></div>
                    </div>
                    <div className="text-lg text-blue-300">＋</div>
                    <div className="text-center">
                        <div className="text-[10px] font-black text-blue-400 uppercase mb-1">TEXT</div>
                        <div className="w-8 h-2 bg-blue-200 rounded-full"></div>
                    </div>
                    <div className="text-lg text-blue-300">＝</div>
                    <div className="text-center">
                        <div className="text-[10px] font-black text-blue-600 uppercase mb-1">FUSION</div>
                        <div className="w-8 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1">
                <LiveLog steps={steps} />
            </div>
        </div>
    );
}

// ─── RESULT CARD ─────────────────────────────────────────────────────────────
function ResultCard({ result, rank, onSelect }) {
    return (
        <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => onSelect(result)}>
            <div className="aspect-square relative overflow-hidden">
                <img src={result.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    RANK #{rank + 1}
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full border shadow-sm">
                    <span className="text-[10px] font-black">{result.similarityScore}%</span>
                </div>
            </div>
            <div className="p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{result.algorithm}</p>
                <p className="text-xs font-bold text-gray-800 truncate mb-2">{result.filename}</p>

                {result.color_stats && (
                    <div className="mb-3">
                        <p className="text-[9px] text-gray-400 mb-1">Visual Distribution</p>
                        <ColorBar stats={result.color_stats} />
                    </div>
                )}

                {result.description && (
                    <p className="mb-3 text-[9px] text-gray-800 font-bold italic line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{result.description}"
                    </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400">{result.matchesCount > 0 ? `${result.matchesCount} matches` : 'Vector Similarity'}</span>
                    <button className="text-[10px] font-bold text-blue-600 hover:underline">View Analysis →</button>
                </div>
            </div>
        </div>
    );
}

// ─── FEATURE REPRESENTATION MODAL (7-Step Process) ──────────────────────────
function FeatureRepresentationModal({ image, onClose }) {
    if (!image) return null;

    const steps = [
        { name: "1. ACQUISITION", desc: "Digital capture & data ingestion", status: "Done", icon: "📸" },
        { name: "2. PRÉTRAITEMENT", desc: "Resize, Grayscale, Noise reduction", status: "Done", icon: "⚙️" },
        { name: "3. ANALYSE D’IMAGE", desc: `Feature extraction via ${image.algorithm || 'Algorithm'}`, status: "Done", icon: "🔍" },
        { name: "4. REPRÉSENTATION", desc: "Numerical feature vector construction", status: "Current", icon: "📊" },
        { name: "5. INDEXATION", desc: "Mapping features to searchable database", status: "Done", icon: "🏷️" },
        { name: "6. STOCKAGE", desc: "Persistent storage in index.pkl", status: "Done", icon: "💾" },
        { name: "7. RECHERCHE", desc: "Ready for retrieval operations", status: "Ready", icon: "🚀" }
    ];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[85vh]">
                <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-8 border-r border-gray-100">
                    <div className="relative group">
                        <img src={image.url || image.preview} className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                            {image.algorithm} Reference
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">Représentation des Caractéristiques</h2>
                            <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-tighter">Fichier: {image.name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {/* Feature Data Display */}
                        <div className="bg-violet-50 border border-violet-100 p-5 rounded-2xl">
                            <h4 className="text-[10px] font-black text-violet-600 uppercase mb-3 tracking-widest">Digital Signature (Step 4)</h4>
                            {image.type === 'TBIR' ? (
                                <div className="space-y-3">
                                    <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Keyword Token Vector</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(image.description || '').split(' ').filter(w => w.trim().length > 0).map((word, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-slate-700 text-white text-[10px] font-mono rounded-md">{word.toLowerCase()}</span>
                                        ))}
                                        {!image.description && <span className="text-[10px] text-violet-400 italic">No description provided</span>}
                                    </div>
                                    <p className="text-[9px] text-violet-600/70 leading-relaxed italic">
                                        Each word becomes a key in the Inverted Index. Images are stored under their matching tokens.
                                    </p>
                                    <p className="text-[9px] uppercase font-black text-violet-400 tracking-widest pt-1 border-t border-violet-100">Information source: Textual Metadata</p>
                                </div>
                            ) : image.color_stats ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold text-violet-400">
                                        <span>COLOR DISTRIBUTION</span>
                                        <span>R:{image.color_stats.r}% G:{image.color_stats.g}% B:{image.color_stats.b}%</span>
                                    </div>
                                    <ColorBar stats={image.color_stats} />
                                    <p className="text-[10px] text-violet-600/70 leading-relaxed italic">
                                        The algorithm reduced millions of pixels into these primary statistics.
                                    </p>
                                    <p className="text-[9px] uppercase font-black text-violet-400 tracking-widest pt-1 border-t border-violet-100">
                                        Information source: {image.algorithm === 'CLIP' ? 'Semantic Neural Embedding' : `${image.algorithm} Visual Features`}
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-white/50 rounded-xl font-mono text-xs text-violet-700 break-all leading-relaxed">
                                    {image.algorithm === 'CLIP' && image.description
                                        ? `"${image.description}"`
                                        : `Feature Descriptor: [${Array.from({ length: 8 }).map(() => (Math.random() * 0.9).toFixed(2)).join(', ')} ...]`}
                                    <p className="text-[9px] uppercase font-black opacity-50 mt-3">
                                        Information source: {image.algorithm === 'CLIP' ? 'Semantic Neural Embedding' : `${image.algorithm || 'Visual'} Features`}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 7 Academic Steps */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Pipeline Status</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {steps.map((s, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${s.status === 'Current' ? 'border-violet-300 bg-violet-50/50 scale-[1.02]' : 'border-gray-50 bg-gray-50/30 opacity-70'}`}>
                                        <div className="text-lg">{s.icon}</div>
                                        <div className="flex-1">
                                            <p className={`text-[10px] font-black ${s.status === 'Current' ? 'text-violet-600' : 'text-gray-700'}`}>{s.name}</p>
                                            <p className="text-[9px] text-gray-400 leading-tight">{s.desc}</p>
                                        </div>
                                        {s.status === 'Done' && <div className="text-green-500 text-[10px]">✔</div>}
                                        {s.status === 'Current' && <div className="flex gap-0.5"><div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce delay-75"></div><div className="w-1 h-1 bg-violet-600 rounded-full animate-bounce delay-150"></div></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
// ─── INDEX GALLERY ──────────────────────────────────────────────────────────
function IndexGallery({ images, totalImages, onClear, algo, onSelectImage }) {
    if (images.length === 0 && totalImages === 0) return null;

    const isTBIR = algo.type === 'TBIR';

    // Build inverted index map: word -> [images that have it]
    const invertedIndexMap = React.useMemo(() => {
        if (!isTBIR) return null;
        const map = {};
        images.forEach(img => {
            const words = (img.description || '').toLowerCase().split(/\s+/).filter(w => w.length > 0);
            words.forEach(word => {
                if (!map[word]) map[word] = [];
                if (!map[word].find(x => x.name === img.name)) map[word].push(img);
            });
        });
        return map;
    }, [images, isTBIR]);

    return (
        <section className="mt-12 p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        {isTBIR ? '📋' : '🖼️'} {algo.name} Pool
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-200">
                            {images.length} Images Indexed
                        </span>
                    </h3>
                    <p className="text-sm text-gray-500">The "knowledge base" your {algo.name} algorithm is searching through.</p>
                </div>
                <button
                    onClick={onClear}
                    className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                >
                    🗑️ Clear Database
                </button>
            </div>

            {images.length > 0 ? (
                isTBIR && invertedIndexMap ? (
                    // ── TBIR: Inverted Index Table View ───────────────────────
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-lg">📝</span>
                            <div>
                                <p className="text-xs font-black text-gray-800 uppercase tracking-widest">Organization: Inverted Index</p>
                                <p className="text-[10px] text-gray-400">{Object.keys(invertedIndexMap).length} unique keywords → {images.length} images</p>
                            </div>
                        </div>
                        {Object.entries(invertedIndexMap).sort((a, b) => b[1].length - a[1].length).map(([word, imgs]) => (
                            <div key={word} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                                {/* Keyword column */}
                                <div className="w-32 flex-shrink-0">
                                    <span className="inline-block px-3 py-1 bg-slate-800 text-white text-[11px] font-mono font-bold rounded-lg">{word}</span>
                                    <p className="text-[9px] text-gray-400 mt-0.5 font-bold">{imgs.length} image{imgs.length > 1 ? 's' : ''}</p>
                                </div>
                                {/* Arrow */}
                                <span className="text-gray-300 text-sm">→</span>
                                {/* Matching images */}
                                <div className="flex flex-wrap gap-2">
                                    {imgs.map((img, j) => (
                                        <div
                                            key={j}
                                            onClick={() => onSelectImage(img)}
                                            className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-2 py-1 cursor-pointer hover:bg-violet-50 hover:border-violet-200 transition-all group"
                                        >
                                            <img src={img.url || img.preview} alt={img.name} className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                                            <p className="text-[9px] text-gray-600 font-bold max-w-[80px] truncate group-hover:text-violet-700">{img.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // ── Visual: flat image grid ────────────────────────────────
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {images.map((img, i) => (
                            <div
                                key={i}
                                onClick={() => onSelectImage(img)}
                                className="group relative bg-white p-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                            >
                                <img src={img.url || img.preview} alt={img.name} className="w-full aspect-square object-cover rounded-xl border mb-2" />
                                <div className="px-1">
                                    <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-tighter">{img.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold">{img.algorithm || 'INDEXED'}</span>
                                        {img.keypoints > 0 && <span className="text-[9px] text-gray-400 font-mono">{img.keypoints} pts</span>}
                                    </div>
                                    {img.color_stats && <ColorBar stats={img.color_stats} />}
                                    {img.description && (
                                        <p className="mt-1 text-[9px] text-gray-800 font-bold italic truncate border-t border-gray-50 pt-1">
                                            "{img.description}"
                                        </p>
                                    )}
                                    <div className="mt-2 text-[8px] text-center font-bold text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                        Detailed Analysis →
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="py-20 text-center text-gray-300">
                    <div className="text-6xl mb-4">📂</div>
                    <p className="font-bold">This pool is empty</p>
                    <p className="text-xs">Index some images using {algo.name} in Step 1 to see them here.</p>
                </div>
            )}
        </section>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const HomePage = () => {
    const [activeType, setActiveType] = useState(INDEXING_TYPES[1]); // Default to CBIR
    const [algo, setAlgo] = useState(ALGORITHMS.find(a => a.type === 'CBIR'));
    const [indexedImages, setIndexedImages] = useState([]);
    const [queryImage, setQueryImage] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchLogSteps, setSearchLogSteps] = useState([]);
    const [isDraggingIndex, setIsDraggingIndex] = useState(false);
    const [isDraggingSearch, setIsDraggingSearch] = useState(false);
    const [textQuery, setTextQuery] = useState('');
    const [indexDescription, setIndexDescription] = useState('');
    const [selectedDetailResult, setSelectedDetailResult] = useState(null);
    const [indexingPending, setIndexingPending] = useState([]); // Images currently in the 7-step log
    const indexInputRef = useRef(null);
    const searchInputRef = useRef(null);
    const [selectedLibraryImage, setSelectedLibraryImage] = useState(null);

    // Fetch index on mount and when activeType changes
    useEffect(() => {
        setIndexedImages([]); // Clear previous type images
        setSearchResults(null); // Clear previous results
        setQueryImage(null); // Clear previous query image
        setTextQuery(''); // Clear previous text query
        setSearchLogSteps([]); // Clear logs

        fetch(`${API_BASE}/api/index/list?type=${activeType.id}`)
            .then(r => r.json())
            .then(data => {
                setIndexedImages(data.map(img => ({
                    ...img,
                    name: img.filename,
                    preview: img.url,
                    keypoints: img.keypoint_count
                })));
            })
            .catch(err => {
                console.error("Failed to fetch index", err);
                setSearchError("Backend unreachable. Persistence might be disabled.");
            });

        // Update current algorithm if it doesn't match the new type
        if (algo.type !== activeType.id) {
            setAlgo(ALGORITHMS.find(a => a.type === activeType.id));
        }
    }, [activeType]);

    const handleClearIndex = async () => {
        if (!confirm("Are you sure you want to delete all indexed images?")) return;
        try {
            const res = await fetch(`${API_BASE}/api/index`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`Status: ${res.status}`);

            setIndexedImages([]);
            setSearchResults(null);
            alert("Database cleared successfully!");
        } catch (err) {
            console.error("Failed to clear index", err);
            alert("Failed to clear index. Please check your connection.");
        }
    };

    // ── Index ─────────────────────────────────────────────────────────────────
    const handleIndexingComplete = useCallback((image) => {
        // Move to library only AFTER the 7-step process is done
        setIndexedImages(prev => [...prev, image]);
        setIndexingPending(prev => prev.filter(img => img.id !== image.id));
    }, []);

    const uploadAndIndex = useCallback(async (file) => {
        const preview = URL.createObjectURL(file);
        const tempId = Date.now() + Math.random();
        const currentDesc = indexDescription; // Capture current description

        setIndexingPending(prev => [...prev, { id: tempId, preview, name: file.name, description: currentDesc, pending: true }]);

        try {
            const f = new FormData();
            f.append('file', file);
            f.append('upload_preset', CLOUDINARY_PRESET);
            const cdn = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: f }).then(r => r.json());
            const url = cdn.secure_url;

            const idx = new FormData();
            if (url) { idx.append('url', url); idx.append('filename', file.name); } else { idx.append('file', file); }
            idx.append('algorithm', algo.id);
            if (currentDesc) idx.append('description', currentDesc);

            const data = await fetch(`${API_BASE}/api/index`, { method: 'POST', body: idx }).then(r => r.json());

            // Update the pending card with real backend data so it can proceed through the final 7 steps
            setIndexingPending(prev => prev.map(img => img.id === tempId
                ? {
                    ...img,
                    ...data,
                    preview: url || preview,
                    keypoints: data.keypoints || 0,
                    algorithm: algo.id,
                    pending: false
                } : img));

        } catch (err) {
            console.error(err);
            setIndexingPending(prev => prev.filter(img => img.id !== tempId));
        }
    }, [algo, indexDescription]);

    const handleIndexFiles = useCallback((e) => {
        e.preventDefault();
        setIsDraggingIndex(false);
        const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
        files.filter(f => f.type.startsWith('image/')).forEach(uploadAndIndex);
        if (e.target) e.target.value = '';
    }, [uploadAndIndex]);

    // ── Search ────────────────────────────────────────────────────────────────
    const handleSearch = useCallback(async (file, explicitText) => {
        const searchFile = file || queryImage?.file;
        const currentText = (explicitText !== undefined ? explicitText : textQuery)?.trim();

        if (!searchFile && !currentText) return;

        setIsSearching(true);
        setSearchResults(null);
        setSearchError(null);

        const isTextSearch = algo.type === 'TBIR' || algo.id === 'CLIP';
        const isKeypoint = ['ORB', 'SIFT', 'AKAZE'].includes(algo.id);
        const makeStep = (text, detail = null, status = 'pending') => ({ text, detail, status });

        const initSteps = isTextSearch ? [
            makeStep(`Tokenizing text query: "${textQuery}"`, null, 'running'),
            makeStep(algo.type === 'TBIR' ? 'Parsing keywords for Inverted Index' : 'Projecting tokens to latent space via Transformer'),
            makeStep(algo.type === 'TBIR' ? 'Searching entries in Inverted Index' : 'Multimodal search in index using Cosine Similarity'),
            makeStep(`Ranking ${indexedImages.length} images by relevance score`),
        ] : [
            makeStep(`Load query image`, null, 'running'),
            makeStep(isKeypoint ? `Extract ${algo.name} keypoints from query` : `Preprocess query image for ${algo.name}`),
            makeStep(isKeypoint ? `Compute ${algo.name} descriptors for query` : `Generate ${algo.name} feature vector`),
            makeStep(`Match against ${indexedImages.length} images using ${algo.matchMetric}`),
            makeStep('Rank results by similarity score'),
        ];

        setSearchLogSteps(initSteps);

        const upd = (idx, status, detail) =>
            setSearchLogSteps(prev => prev.map((s, i) => i === idx ? { ...s, status, detail: detail ?? s.detail } : s));

        try {
            if (isTextSearch) {
                // Text Search Path (TBIR or CLIP)
                await new Promise(r => setTimeout(r, 600));
                upd(0, 'done', algo.type === 'TBIR' ? 'Keywords extracted.' : 'Query parsed into 12 semantic tokens.');
                upd(1, 'running');
                await new Promise(r => setTimeout(r, 800));
                upd(1, 'done', algo.type === 'TBIR' ? 'Words mapped to hash keys.' : 'Vector coordinates projected to 512D shared space.');
                upd(2, 'running');

                const form = new FormData();
                form.append('query', currentText || "");
                form.append('query_text', currentText || ""); // For multimodal backend
                form.append('algorithm', algo.id);

                const endpoint = (algo.type === 'TBIR' && !searchFile) ? `${API_BASE}/api/search/text` : `${API_BASE}/api/search`;

                // If we also have a file in a text-based search (like CLIP multimodal), append it
                if (searchFile) form.append('file', searchFile);

                const res = await fetch(endpoint, { method: 'POST', body: form });
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();

                upd(2, 'done', algo.type === 'TBIR' ? 'Match found in Inverted Index.' : 'Found semantic matches in image database.');
                upd(3, 'running');
                await new Promise(r => setTimeout(r, 400));
                upd(3, 'done', `Top match: ${data.results?.[0]?.filename || "N/A"} with ${data.results?.[0]?.similarityScore?.toFixed(1) || 0}% confidence.`);

                setSearchResults(data);
            } else {
                // Classic Image Search Path
                const contentSource = searchFile || queryImage?.file;
                if (!contentSource) throw new Error("No image data available for search");

                // Use the file directly if we have it, otherwise fallback to fetching the preview (though file is preferred)
                const blob = contentSource instanceof Blob ? contentSource : await fetch(queryImage.preview).then(r => r.blob());

                upd(0, 'done', `Query loaded (${(blob.size / 1024).toFixed(1)} KB)`);
                upd(1, 'running');

                const form = new FormData();
                form.append('file', blob, searchFile?.name || queryImage?.name || "query.jpg");
                form.append('algorithm', algo.id);
                if (currentText) form.append('query_text', currentText);

                await new Promise(r => setTimeout(r, 600));
                upd(1, 'done', algo.detectorDetail);
                upd(2, 'running');
                await new Promise(r => setTimeout(r, 600));
                upd(2, 'done', algo.descriptorDetail);
                upd(3, 'running');

                const res = await fetch(`${API_BASE}/api/search`, { method: 'POST', body: form });
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();

                const matchSummary = data.results?.length > 0
                    ? data.results.slice(0, 3).map((r, i) => `#${i + 1} "${r.filename}" (${r.similarityScore.toFixed(1)}%)`).join(', ') + (data.results.length > 3 ? '...' : '')
                    : 'No matches found';

                upd(3, 'done', `${algo.matchDetail} — ${matchSummary}`);
                upd(4, 'running');
                await new Promise(r => setTimeout(r, 400));
                upd(4, 'done', data.results?.length > 0
                    ? `Found ${data.results.length} results. Top: ${data.results[0].filename} (${data.results[0].similarityScore.toFixed(1)}%)`
                    : 'Search complete. No matches found.');

                setSearchResults(data);
            }
            setIsSearching(false);
        } catch (err) {
            setSearchError(err.message);
            setIsSearching(false);
            setSearchLogSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'error', detail: err.message } : s));
        }
    }, [queryImage, algo, indexedImages.length, textQuery]);

    const handleSearchDrop = useCallback((e) => {
        e.preventDefault();
        setIsDraggingSearch(false);
        const file = (e.dataTransfer?.files || e.target?.files)?.[0];
        if (file?.type.startsWith('image/')) {
            const preview = URL.createObjectURL(file);
            setQueryImage({ preview, name: file.name, file: file });
            setSearchResults(null);
            setSearchLogSteps([]);
            setSearchError(null);

            // Auto-trigger search if it's a classical algorithm (not CLIP/TBIR where text might be needed)
            if (algo.type !== 'TBIR' && algo.id !== 'CLIP') {
                handleSearch(file);
            }
        }
        if (e.target) e.target.value = '';
    }, [handleSearch]);


    return (
        <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Type Selector (The 3 Pillars) ─────────────────────────────── */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 flex justify-around">
                    {INDEXING_TYPES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveType(t)}
                            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all border-b-2 ${activeType.id === t.id ? 'border-violet-600 opacity-100' : 'border-transparent opacity-40 hover:opacity-60'}`}
                        >
                            <span className="text-xl">{t.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-widest">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-6">
                        🎓 Educational Demo · {activeType.name} Mode
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
                        <span style={{ color: activeType.id === 'CBIR' ? '#0891b2' : activeType.id === 'DL' ? '#2563eb' : '#475569' }}>
                            {activeType.name}
                        </span> Indexing
                    </h1>
                    <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                        {activeType.desc}. {activeType.id === 'CBIR' ? 'Algorithms that analyze colors, shapes, and patterns.' : activeType.id === 'DL' ? 'Smart systems that learn semantic concepts.' : 'Classical keyword-based archiving.'}
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12 space-y-14">

                {/* ── 0: Algorithm ─────────────────────────────────────────── */}
                <section>
                    <SectionHeader number="0" title="Choose an Algorithm" sub="Determines how keypoints are detected and described" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {ALGORITHMS.filter(a => a.type === activeType.id).map(a => {
                            const sel = algo.id === a.id;
                            return (
                                <button key={a.id} onClick={() => setAlgo(a)}
                                    className="text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-md"
                                    style={{ borderColor: sel ? a.accent : '#e5e7eb', background: sel ? a.light : 'white', boxShadow: sel ? `0 0 0 3px ${a.accent}20` : undefined }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xl font-black" style={{ color: a.accent }}>{a.name}</span>
                                        {sel && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: a.accent }}>✓ Active</span>}
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">{a.full}</p>
                                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">{a.description}</p>
                                    <div className="space-y-2">
                                        <div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Speed</span><span>{a.speed}/5</span></div><Dots score={a.speed} color={a.accent} /></div>
                                        <div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>Accuracy</span><span>{a.accuracy}/5</span></div><Dots score={a.accuracy} color={a.accent} /></div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Descriptor details */}
                    <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: algo.border }}>
                        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: algo.accent }}>{algo.name} — Technical Details</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="rounded-xl p-4" style={{ background: algo.light }}>
                                <p className="text-xs font-bold text-gray-400 mb-1">① Detector</p>
                                <p className="font-semibold text-gray-800 mb-1">{['ORB', 'SIFT', 'AKAZE'].includes(algo.id) ? 'Keypoint Detector' : 'Feature Extractor'}</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{algo.detectorDetail}</p>
                            </div>
                            <div className="rounded-xl p-4" style={{ background: algo.light }}>
                                <p className="text-xs font-bold text-gray-400 mb-1">② Descriptor</p>
                                <p className="font-semibold text-gray-800 mb-1">{algo.descriptorType} · {algo.descriptorSize}</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{algo.descriptorDetail}</p>
                            </div>
                            <div className="rounded-xl p-4" style={{ background: algo.light }}>
                                <p className="text-xs font-bold text-gray-400 mb-1">③ Matching</p>
                                <p className="font-semibold text-gray-800 mb-1">{algo.matchMetric}</p>
                                <p className="text-xs text-gray-500 leading-relaxed">{algo.matchDetail}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 1: Index ─────────────────────────────────────────────── */}
                <section>
                    <SectionHeader number="1" title="Index Images" sub={`Drop images → ${algo.name} extracts features → stored in the search index`} accent={algo.accent} />
                    <div
                        onClick={() => indexInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setIsDraggingIndex(true); }}
                        onDragLeave={() => setIsDraggingIndex(false)}
                        onDrop={handleIndexFiles}
                        className="cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 mb-6"
                        style={{ borderColor: isDraggingIndex ? algo.accent : '#d1d5db', background: isDraggingIndex ? algo.light : 'white' }}
                    >
                        <input ref={indexInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleIndexFiles} />

                        {algo.type === 'TBIR' ? (
                            <div className="mb-6 bg-amber-50 rounded-2xl p-6 border-2 border-amber-200 shadow-sm transition-all animate-in slide-in-from-top duration-500">
                                <label className="block text-xs font-black text-amber-600 mb-2 uppercase tracking-[0.2em] text-left">
                                    Step 4: Représentation des caractéristiques (Mots-clés)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Entrez les mots-clés manuellement (ex: chat, blanc, canapé)..."
                                    className="w-full px-5 py-4 bg-white rounded-xl border-2 border-amber-100 text-lg font-bold focus:outline-none focus:border-amber-400 placeholder:text-amber-200 shadow-inner"
                                    value={indexDescription}
                                    onChange={(e) => setIndexDescription(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <p className="mt-2 text-[10px] text-amber-500 text-left italic">
                                    En mode TBIR, vous devez associer du texte manuellement car l'algorithme ne regarde pas le contenu visuel.
                                </p>
                            </div>
                        ) : (
                            <div className="mb-4 text-xs text-gray-400 bg-gray-50 py-2 rounded-lg border border-dashed border-gray-200">
                                ℹ️ {algo.name} extracts features automatically. No manual tagging needed.
                            </div>
                        )}

                        <div className="text-4xl mb-3">{isDraggingIndex ? '✨' : '📁'}</div>
                        <p className="font-bold text-gray-700 mb-1">Drop images here or click to select</p>
                        <p className="text-sm text-gray-400">Watch {algo.name} process each image step by step</p>
                    </div>

                    {indexingPending.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="font-black text-gray-700 uppercase tracking-widest text-xs flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                    7-Step Academic Pipeline
                                </p>
                            </div>
                            <div className="space-y-6">
                                {indexingPending.map(img => (
                                    <IndexedCard
                                        key={img.id}
                                        image={img}
                                        algo={algo}
                                        onComplete={handleIndexingComplete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* ── 2: Search ────────────────────────────────────────────── */}
                <section>
                    <SectionHeader
                        number="2"
                        title={algo.id === 'CLIP' ? "Multimodal Semantic Search" : "Visual Retrieval & Matching"}
                        sub={algo.id === 'CLIP' ? "Combine image + text → CLIP fuses them in neural space" : "Drop a query image → Watch the matching pipeline in real-time"}
                        accent={algo.accent}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: query selection (image or text) */}
                        <div className="space-y-4">
                            {/* 1. TEXT INPUT (For TBIR and CLIP) */}
                            {(algo.type === 'TBIR' || algo.id === 'CLIP') && (
                                <div className="rounded-2xl border-2 p-8 bg-white shadow-sm flex flex-col justify-between" style={{ borderColor: textQuery ? algo.accent : '#d1d5db' }}>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">
                                            {algo.type === 'TBIR' ? 'Keyword Query (Inverted Index)' : 'Semantic Search Query'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={textQuery}
                                                onChange={e => setTextQuery(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                                placeholder={algo.type === 'TBIR' ? "Saisir une kelma..." : "A sunset over the mountains..."}
                                                className="w-full text-xl font-black bg-transparent outline-none border-b-4 pb-3 transition-all placeholder:text-gray-200"
                                                style={{ borderColor: textQuery ? algo.accent : '#f3f4f6' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 p-4 rounded-xl border italic" style={{ background: algo.light + '40', borderColor: algo.border + '40' }}>
                                        <p className="text-[10px] uppercase font-black mb-1 tracking-widest" style={{ color: algo.accent }}>Educational Insight</p>
                                        <p className="text-[10px] leading-relaxed" style={{ color: algo.accent + 'CC' }}>
                                            {algo.id === 'CLIP'
                                                ? "CLIP fuses text and image in a shared space. Use both for best results."
                                                : "TBIR finds exact keywords in indexed descriptions."}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* 2. IMAGE INPUT (For CBIR and CLIP) */}
                            {algo.type !== 'TBIR' && (
                                <div
                                    onClick={() => searchInputRef.current?.click()}
                                    onDragOver={e => { e.preventDefault(); setIsDraggingSearch(true); }}
                                    onDragLeave={() => setIsDraggingSearch(false)}
                                    onDrop={handleSearchDrop}
                                    className="cursor-pointer rounded-2xl border-2 border-dashed overflow-hidden transition-all shadow-sm hover:shadow-lg"
                                    style={{ borderColor: isDraggingSearch ? algo.accent : queryImage ? algo.accent + '80' : '#d1d5db', background: isDraggingSearch ? algo.light : 'white' }}
                                >
                                    <input ref={searchInputRef} type="file" accept="image/*" className="hidden" onChange={handleSearchDrop} />
                                    {queryImage ? (
                                        <img src={queryImage.preview} alt={queryImage.name} className="w-full aspect-square object-cover" />
                                    ) : (
                                        <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                                            <div className="text-4xl mb-3">�️</div>
                                            <p className="font-bold text-gray-700 mb-1">{algo.id === 'CLIP' ? 'Optional: Visual Context' : 'Drop your query image'}</p>
                                            <p className="text-xs text-gray-400">{algo.id === 'CLIP' ? 'Optional refinement' : 'The image to match'}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => handleSearch()}
                                disabled={isSearching || (algo.type !== 'TBIR' && algo.id !== 'CLIP' && !queryImage) || ((algo.type === 'TBIR' || algo.id === 'CLIP') && !textQuery.trim() && !queryImage) || indexedImages.length === 0}
                                className="w-full py-4 rounded-2xl font-black text-white text-lg transition-all active:scale-95 disabled:grayscale disabled:opacity-50 shadow-lg hover:shadow-xl"
                                style={{ background: algo.accent }}
                            >
                                {isSearching ? '⏳ Searching…' : indexedImages.length === 0 ? 'Wait! Add images to index first' : `Run ${algo.name} Search`}
                            </button>
                            {indexedImages.length === 0 && <p className="text-xs text-center text-gray-400">⬆ Index some images in Step 1 first</p>}
                            {searchError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">❌ {searchError}</div>}
                        </div>

                        {/* Right: live log */}
                        <div>
                            {searchLogSteps.length > 0 ? (
                                <SearchLivePanel queryImage={queryImage} algo={algo} steps={searchLogSteps} textQuery={textQuery} />
                            ) : (
                                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-300 h-full flex flex-col items-center justify-center">
                                    <div className="text-5xl mb-3">📋</div>
                                    <p className="font-semibold">The live search log will appear here</p>
                                    <p className="text-xs mt-1">Each step will show what {algo.name} is doing and what it found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    {searchResults?.results?.length > 0 && (
                        <div className="mt-8">
                            <p className="font-bold text-gray-700 mb-4">
                                Results
                                <span className="ml-2 text-sm font-normal text-gray-400">
                                    — {searchResults.results.length} images ranked by {algo.name} similarity
                                </span>
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {searchResults.results.map((r, i) => <ResultCard key={i} result={r} rank={i} onSelect={setSelectedDetailResult} />)}
                            </div>
                        </div>
                    )}
                    {searchResults && searchResults.results?.length === 0 && (
                        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-400">
                            <div className="text-4xl mb-2">🤷</div>
                            <p className="font-semibold">{searchResults.message || 'No matches found'}</p>
                        </div>
                    )}
                </section>

                {/* ── Index Gallery ────────────────────────────────────────── */}
                <IndexGallery
                    images={indexedImages}
                    totalImages={indexedImages.length}
                    onClear={handleClearIndex}
                    algo={algo}
                    onSelectImage={setSelectedLibraryImage}
                />

            </main>

            <footer className="border-t border-gray-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 py-10 text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-gray-200"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Project Credits</p>
                        <div className="h-px w-8 bg-gray-200"></div>
                    </div>
                    <p className="text-lg font-black text-gray-900 mb-2">
                        by: <span className="text-violet-600">Mohamed Jbeli, Mohamed Aziz Mannai, Maram Ben Amara, Khawla Balti, Nour Saidani</span>
                    </p>
                    <p className="mt-1 text-[10px] text-gray-300 uppercase font-bold tracking-widest">
                        Academic Visual Search Systems © 2026
                    </p>
                </div>
            </footer>

            {selectedDetailResult && (
                <DetailedComparison
                    queryImage={queryImage || { filename: textQuery, algorithm: 'CLIP' }}
                    selectedResult={selectedDetailResult}
                    onClose={() => setSelectedDetailResult(null)}
                />
            )}

            {selectedLibraryImage && (
                <FeatureRepresentationModal
                    image={selectedLibraryImage}
                    onClose={() => setSelectedLibraryImage(null)}
                />
            )}
        </div>
    );
}

// ─── DETAILED COMPARISON (Vector Visualization) ───────────────────────────────
function DetailedComparison({ queryImage, selectedResult, onClose }) {
    if (!selectedResult) return null;

    const queryColors = queryImage?.color_stats || { r: 33, g: 33, b: 33 };
    const targetColors = selectedResult.color_stats || { r: 33, g: 33, b: 33 };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-gray-900/90 backdrop-blur-lg animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh]">
                {/* Left: Visual Comparison */}
                <div className="w-full md:w-1/2 p-8 border-r border-gray-100 flex flex-col items-center justify-center bg-gray-50/50">
                    <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform md:hidden">✕</button>

                    <div className="w-full grid grid-cols-2 gap-4 mb-8">
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Query {queryImage?.preview ? 'Image' : 'Text'}</p>
                            <div className="aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                {queryImage?.preview ? (
                                    <img src={queryImage.preview} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-3xl">🔤</div>
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Matched Result</p>
                            <div className="aspect-square rounded-2xl overflow-hidden border-4 border-violet-600 shadow-lg">
                                <img src={selectedResult.url} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                {selectedResult.algorithm === 'CLIP' ? '🧠 Semantic Neural Alignment' : selectedResult.type === 'TBIR' ? '📋 Textual Inverted Index Match' : '📊 Visual Distribution Comparison'}
                            </h4>
                            {selectedResult.algorithm === 'CLIP' ? (
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-dashed border-blue-200">
                                    <p className="text-xs text-blue-800 italic leading-relaxed">
                                        Multi-modal alignment: The distance between the query context (text + image) and the target feature vector.
                                        The system "sees" concepts, not just pixels.
                                    </p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="px-2 py-1 bg-white border border-blue-100 rounded text-[9px] font-black text-blue-600">SEMANTIC SPACE</div>
                                        <div className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 animate-pulse" style={{ width: `${selectedResult.similarityScore}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ) : selectedResult.type === 'TBIR' ? (
                                <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-xs text-gray-500 italic">
                                        Academic Purity: Text-based algorithms do not extract visual features. The match is strictly based on metadata keyword intersection.
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(selectedResult.description || "").split(' ').map((word, i) => (
                                            <span key={i} className="px-2 py-1 bg-white border border-gray-100 rounded-md text-[10px] font-bold text-gray-500">
                                                {word}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                            <span>QUERY FEATURE</span>
                                            <span>{queryColors ? `R:${queryColors.r}% G:${queryColors.g}% B:${queryColors.b}%` : 'N/A'}</span>
                                        </div>
                                        {queryColors && <ColorBar stats={queryColors} />}
                                    </div>
                                    <div className="flex justify-center py-1 opacity-20">
                                        <span className="text-xl">↕</span>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                                            <span>TARGET FEATURE</span>
                                            {targetColors && <span>R:{targetColors.r}% G:{targetColors.g}% B:{targetColors.b}%</span>}
                                        </div>
                                        {targetColors && <ColorBar stats={targetColors} />}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Technical Breakdown */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 mb-1">Match Analysis</h2>
                            <p className="text-sm text-gray-500">Method: <span className="font-bold text-violet-600">{selectedResult.algorithm}</span></p>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-100 text-gray-400 rounded-full hover:bg-gray-200 transition-colors">✕</button>
                    </div>

                    <div className="space-y-8">
                        {/* Score Gauge */}
                        <div className="relative h-48 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-8 text-white flex flex-col items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                <div className="grid grid-cols-10 gap-2 h-full w-full">
                                    {Array.from({ length: 100 }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-sm h-1"></div>
                                    ))}
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-80">Mathematical Similarity</span>
                            <span className="text-7xl font-black">{selectedResult.similarityScore}%</span>
                            <div className="mt-4 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
                                {selectedResult.similarityScore > 90 ? '🔥 Exact Context Patch' : selectedResult.similarityScore > 70 ? '✨ Highly Similar' : '👀 Probable Match'}
                            </div>
                        </div>

                        {/* Vector Visualization (The "Nuts & Bolts") */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-black text-gray-800">Vector Space Logic</h4>
                                {(() => {
                                    const a = ALGORITHMS.find(x => x.id === selectedResult.algorithm);
                                    return (
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-md font-bold text-gray-500 uppercase tracking-widest">{a?.descriptorType || 'FEATURE'} SPACE</span>
                                            <span className="text-[8px] text-gray-400 mt-1">{a?.descriptorSize || ''}</span>
                                        </div>
                                    );
                                })()}
                            </div>
                            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                                {selectedResult.educational_info?.concept || "How the algorithm sees these images:"} {selectedResult.educational_info?.details}
                            </p>

                            <div className="flex items-end gap-0.5 h-20 bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-inner overflow-hidden">
                                {Array.from({ length: 64 }).map((_, i) => {
                                    // Simulated vector values that look "related"
                                    const val = (Math.sin(i * 0.2) + 1) * 20 + (Math.random() * 10);
                                    const mod = Math.abs(Math.sin(i * 0.2 + selectedResult.similarityScore / 100) + 1) * 20;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col gap-0.5 h-full justify-end">
                                            <div className="bg-violet-600/30 rounded-t-sm" style={{ height: `${val}%` }}></div>
                                            <div className="bg-violet-600 rounded-t-sm" style={{ height: `${mod}%` }}></div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-2">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-violet-600/30 rounded-full"></div><span className="text-[9px] font-bold text-gray-400">QUERY VECTOR</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 bg-violet-600 rounded-full"></div><span className="text-[9px] font-bold text-gray-400">TARGET VECTOR</span></div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                            <h5 className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">Academic Insight</h5>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                {selectedResult.algorithm === 'CLIP'
                                    ? "CLIP projects both text and images into a shared semantic space. Similarity isn't calculated on pixels, but on the alignment of vectors in this 'Meaning Space'."
                                    : "CBIR algorithms detect patterns (gradients, textures). The distance between the query vector and target vector determines the rank. Smaller Euclidean distance = Higher similarity score."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ number, title, sub, accent }) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-base shrink-0"
                style={{ background: accent || '#1f2937', color: 'white' }}>
                {number}
            </div>
            <div>
                <h2 className="text-2xl font-black text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{sub}</p>
            </div>
        </div>
    );
}

export default HomePage;
