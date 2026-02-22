import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const ALGORITHMS = [
    {
        id: 'ORB',
        name: 'ORB',
        full: 'Oriented FAST & Rotated BRIEF',
        accent: '#7c3aed',       // violet-700
        light: '#f5f3ff',        // violet-50
        border: '#ddd6fe',       // violet-200
        text: '#5b21b6',         // violet-800
        badge: 'Fast & Efficient',
        description: 'Ultra-fast binary descriptor. Best for real-time use. Used in robotics & AR.',
        how: [
            { label: 'Detector', value: 'FAST corners', icon: '📍' },
            { label: 'Descriptor', value: '256-bit binary string (BRIEF)', icon: '🧬' },
            { label: 'Matching', value: 'Hamming distance (XOR)', icon: '⚡' },
            { label: 'Scale invariant?', value: 'Partial (via pyramid)', icon: '🔭' },
        ],
        speed: 5,
        accuracy: 3,
    },
    {
        id: 'SIFT',
        name: 'SIFT',
        full: 'Scale-Invariant Feature Transform',
        accent: '#0891b2',       // cyan-700
        light: '#ecfeff',        // cyan-50
        border: '#a5f3fc',       // cyan-200
        text: '#0e7490',         // cyan-800
        badge: 'Most Accurate',
        description: 'Highly accurate, scale & rotation invariant. The gold standard for matching.',
        how: [
            { label: 'Detector', value: 'DoG (Difference of Gaussians)', icon: '🌀' },
            { label: 'Descriptor', value: '128 float32 gradient histogram', icon: '📊' },
            { label: 'Matching', value: 'L2 / Euclidean distance', icon: '🎯' },
            { label: 'Scale invariant?', value: 'Full (multi-scale)', icon: '🔭' },
        ],
        speed: 2,
        accuracy: 5,
    },
    {
        id: 'AKAZE',
        name: 'AKAZE',
        full: 'Accelerated-KAZE',
        accent: '#c2410c',       // orange-700
        light: '#fff7ed',        // orange-50
        border: '#fed7aa',       // orange-200
        text: '#9a3412',         // orange-800
        badge: 'Balanced',
        description: 'Great balance of speed and accuracy. Excellent for complex textures.',
        how: [
            { label: 'Detector', value: 'Nonlinear diffusion scale space', icon: '🌊' },
            { label: 'Descriptor', value: 'M-LDB binary (486 bits)', icon: '🧬' },
            { label: 'Matching', value: 'Hamming distance', icon: '⚡' },
            { label: 'Scale invariant?', value: 'Yes (improved DoG)', icon: '🔭' },
        ],
        speed: 4,
        accuracy: 4,
    },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'image_index';
const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

// ─── SPEED/ACCURACY DOTS ─────────────────────────────────────────────────────
function Dots({ score, color }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border-2 transition-all"
                    style={{
                        background: i <= score ? color : 'transparent',
                        borderColor: i <= score ? color : '#d1d5db',
                    }}
                />
            ))}
        </div>
    );
}

// ─── PROCESS LOG PANEL ───────────────────────────────────────────────────────
function ProcessLog({ steps, accent }) {
    return (
        <div className="mt-3 rounded-xl border p-4 bg-white text-sm space-y-2" style={{ borderColor: accent + '30' }}>
            {steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                    <div
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: accent }}
                    >
                        {i + 1}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-800">{s.label}: </span>
                        <span className="text-gray-600">{s.value}</span>
                        {s.extra && <div className="text-xs text-gray-400 mt-0.5">{s.extra}</div>}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── INDEXED IMAGE CARD ───────────────────────────────────────────────────────
function IndexedCard({ image, algo }) {
    const [stage, setStage] = useState('uploading');

    useEffect(() => {
        const t1 = setTimeout(() => setStage('extracting'), 700);
        const t2 = setTimeout(() => setStage('done'), 1800);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const stageColor = { uploading: '#6b7280', extracting: algo.accent, done: '#16a34a' };
    const stageLabel = { uploading: 'Uploading…', extracting: `Running ${algo.id}…`, done: 'Indexed ✓' };
    const progressPct = { uploading: 35, extracting: 75, done: 100 };

    const logSteps = stage === 'done' && image.keypoints > 0 ? [
        { label: 'Step 1', value: `Loaded image pixels`, extra: 'Converted to grayscale for processing' },
        { label: 'Step 2', value: `Detected keypoints with ${algo.id}`, extra: `${image.keypoints} keypoints found` },
        { label: 'Step 3', value: `Computed descriptors`, extra: algo.id === 'SIFT' ? `${image.keypoints} × 128 float32 vectors` : `${image.keypoints} × ${algo.id === 'AKAZE' ? '61 bytes (M-LDB)' : '32 bytes (BRIEF)'} binary strings` },
        { label: 'Step 4', value: `Stored in index`, extra: 'Ready for similarity search' },
    ] : null;

    return (
        <div className="rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: stage === 'done' ? algo.border : '#e5e7eb' }}>
            <div className="relative">
                <img src={image.preview} alt={image.name} className="w-full aspect-square object-cover" />
                {stage === 'extracting' && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: algo.accent + '20' }}>
                        <div className="text-white text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: algo.accent }}>
                            ⚙️ {algo.id} scanning…
                        </div>
                    </div>
                )}
                {stage === 'done' && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shadow-md">✓</div>
                )}
            </div>

            {/* Stage progress bar */}
            <div className="h-1.5" style={{ background: '#f3f4f6' }}>
                <div
                    className="h-full rounded-r-full transition-all duration-700"
                    style={{ width: progressPct[stage] + '%', background: stageColor[stage] }}
                />
            </div>

            <div className="p-3">
                <p className="text-xs text-gray-500 truncate">{image.name}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: stageColor[stage] }}>{stageLabel[stage]}</p>

                {/* Expandable log after done */}
                {stage === 'done' && logSteps && (
                    <details className="mt-2">
                        <summary className="text-xs cursor-pointer font-medium" style={{ color: algo.accent }}>
                            See algorithm details ↓
                        </summary>
                        <ProcessLog steps={logSteps} accent={algo.accent} />
                    </details>
                )}
            </div>
        </div>
    );
}

// ─── SEARCH RESULT CARD ───────────────────────────────────────────────────────
function ResultCard({ result, algo, rank }) {
    const score = result.similarityScore;
    const scoreColor = score > 65 ? '#16a34a' : score > 35 ? '#ca8a04' : '#dc2626';

    return (
        <div className="rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="relative">
                {result.url ? (
                    <img src={result.url} alt={result.filename} className="w-full aspect-square object-cover" />
                ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-4xl">🖼️</div>
                )}
                <div
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow"
                    style={{ background: scoreColor }}
                >
                    {score.toFixed(0)}%
                </div>
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-xs font-bold text-gray-600 shadow">
                    #{rank + 1}
                </div>
            </div>

            {/* Similarity bar */}
            <div className="h-1.5 bg-gray-100">
                <div className="h-full rounded-r-full transition-all duration-700" style={{ width: score + '%', background: scoreColor }} />
            </div>

            <div className="p-3">
                <p className="text-xs text-gray-500 truncate">{result.filename}</p>
                <div className="mt-2 space-y-1">
                    <details>
                        <summary className="text-xs cursor-pointer font-medium" style={{ color: algo.accent }}>
                            Matching details ↓
                        </summary>
                        <ProcessLog
                            steps={[
                                { label: 'Algorithm used', value: algo.name + ' — ' + algo.full },
                                { label: 'Descriptor comparison', value: `${algo.id === 'SIFT' ? 'L2 (Euclidean)' : 'Hamming (XOR)'}`, extra: algo.id === 'SIFT' ? 'Lower distance = more similar float vectors' : 'Fewer different bits = more similar binary strings' },
                                { label: 'Good matches found', value: `${result.matchesCount} pairs (distance < 60)`, extra: 'Pairs with low distance are considered "good"' },
                                { label: 'Similarity score', value: `${score.toFixed(1)}%`, extra: '(goodMatches / queryKeypoints) × scale factor' },
                            ]}
                            accent={algo.accent}
                        />
                    </details>
                </div>
            </div>
        </div>
    );
}

// ─── PIPELINE BADGE ──────────────────────────────────────────────────────────
function StageBadge({ label, active, done, accent }) {
    return (
        <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300"
            style={{
                background: done ? '#f0fdf4' : active ? accent + '15' : '#f9fafb',
                borderColor: done ? '#86efac' : active ? accent : '#e5e7eb',
                color: done ? '#16a34a' : active ? accent : '#9ca3af',
            }}
        >
            {done ? '✓' : active ? <span className="animate-spin text-xs">⏳</span> : '○'}
            {label}
        </span>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
    const [algo, setAlgo] = useState(ALGORITHMS[0]);
    const [indexedImages, setIndexedImages] = useState([]);
    const [queryImage, setQueryImage] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchStage, setSearchStage] = useState(0);
    const [isDraggingIndex, setIsDraggingIndex] = useState(false);
    const [isDraggingSearch, setIsDraggingSearch] = useState(false);
    const indexInputRef = useRef(null);
    const searchInputRef = useRef(null);

    const uploadAndIndex = useCallback(async (file) => {
        const preview = URL.createObjectURL(file);
        const tempId = Date.now() + Math.random();
        setIndexedImages(prev => [...prev, { id: tempId, preview, name: file.name, keypoints: 0, pending: true }]);

        try {
            // 1. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_PRESET);
            const cdnRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: formData });
            const cdnData = await cdnRes.json();
            const imageUrl = cdnData.secure_url;

            // 2. Index via backend
            const idxForm = new FormData();
            if (imageUrl) { idxForm.append('url', imageUrl); idxForm.append('filename', file.name); }
            else { idxForm.append('file', file); }
            idxForm.append('algorithm', algo.id);

            const idxRes = await fetch(`${API_BASE}/api/index`, { method: 'POST', body: idxForm });
            const idxData = await idxRes.json();

            setIndexedImages(prev => prev.map(img =>
                img.id === tempId
                    ? { ...img, preview: imageUrl || preview, keypoints: idxData.keypoints || 0, pending: false }
                    : img
            ));
        } catch (err) {
            console.error('Index error:', err);
            setIndexedImages(prev => prev.filter(img => img.id !== tempId));
        }
    }, [algo]);

    const handleIndexFiles = useCallback((e) => {
        e.preventDefault();
        setIsDraggingIndex(false);
        const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
        files.filter(f => f.type.startsWith('image/')).forEach(uploadAndIndex);
        if (e.target) e.target.value = '';
    }, [uploadAndIndex]);

    const handleSearch = useCallback(async () => {
        if (!queryImage) return;
        setIsSearching(true);
        setSearchResults(null);
        setSearchError(null);
        setSearchStage(1);

        try {
            const blob = await fetch(queryImage.preview).then(r => r.blob());
            const formData = new FormData();
            formData.append('file', blob, queryImage.name);
            formData.append('algorithm', algo.id);

            setTimeout(() => setSearchStage(2), 900);
            setTimeout(() => setSearchStage(3), 1700);

            const res = await fetch(`${API_BASE}/api/search`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();

            setSearchStage(4);
            setTimeout(() => { setSearchResults(data); setIsSearching(false); setSearchStage(0); }, 500);
        } catch (err) {
            setSearchError(err.message);
            setIsSearching(false);
            setSearchStage(0);
        }
    }, [queryImage, algo]);

    const handleSearchFileDrop = useCallback((e) => {
        e.preventDefault();
        setIsDraggingSearch(false);
        const file = (e.dataTransfer?.files || e.target?.files)?.[0];
        if (file?.type.startsWith('image/')) {
            setQueryImage({ preview: URL.createObjectURL(file), name: file.name });
            setSearchResults(null);
            setSearchError(null);
        }
        if (e.target) e.target.value = '';
    }, []);

    const clearIndex = async () => {
        await fetch(`${API_BASE}/api/index`, { method: 'DELETE' }).catch(() => { });
        setIndexedImages([]);
        setSearchResults(null);
    };

    const searchPipelineStages = ['Extract features', 'Compare descriptors', 'Rank results'];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-6">
                        🎓 Educational Demo — Computer Vision
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-4">
                        How does <span style={{ color: algo.accent }}>Image Search</span> Work?
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Upload images, pick an algorithm, and watch the system extract features, build an index, and find similar images — step by step.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center mt-8">
                        {['🔍 Feature Extraction', '🧬 Descriptor Matching', '📊 Similarity Ranking'].map(t => (
                            <span key={t} className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">{t}</span>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-12 space-y-16">

                {/* ── Step 0: Choose Algorithm ─────────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-black text-lg">0</div>
                        <div>
                            <h2 className="text-2xl font-black">Choose an Algorithm</h2>
                            <p className="text-gray-500 text-sm">This determines how keypoints are detected and described</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {ALGORITHMS.map(a => {
                            const sel = algo.id === a.id;
                            return (
                                <button
                                    key={a.id}
                                    onClick={() => setAlgo(a)}
                                    className="text-left rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                                    style={{
                                        borderColor: sel ? a.accent : '#e5e7eb',
                                        background: sel ? a.light : 'white',
                                        boxShadow: sel ? `0 0 0 3px ${a.accent}25` : undefined,
                                    }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className="text-2xl font-black" style={{ color: a.accent }}>{a.name}</span>
                                            {sel && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: a.accent }}>Selected</span>}
                                        </div>
                                        <span className="text-xs font-semibold px-2 py-1 rounded-full border" style={{ background: a.light, borderColor: a.border, color: a.text }}>{a.badge}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs mb-1">{a.full}</p>
                                    <p className="text-gray-700 text-sm mb-5 leading-relaxed">{a.description}</p>
                                    <div className="space-y-2.5">
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Speed</span><span>{a.speed}/5</span></div>
                                            <Dots score={a.speed} color={a.accent} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Accuracy</span><span>{a.accuracy}/5</span></div>
                                            <Dots score={a.accuracy} color={a.accent} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Algorithm internals */}
                    <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: algo.border, background: algo.light }}>
                        <h3 className="font-bold mb-4" style={{ color: algo.text }}>How {algo.name} works internally:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {algo.how.map(h => (
                                <div key={h.label} className="bg-white rounded-xl border p-3" style={{ borderColor: algo.border }}>
                                    <div className="text-xl mb-1">{h.icon}</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{h.label}</div>
                                    <div className="text-sm font-semibold mt-0.5" style={{ color: algo.text }}>{h.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Step 1: Index ────────────────────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-black text-lg" style={{ background: algo.accent }}>1</div>
                        <div>
                            <h2 className="text-2xl font-black">Index Images</h2>
                            <p className="text-gray-500 text-sm">Upload images to build a searchable database using <strong style={{ color: algo.accent }}>{algo.name}</strong></p>
                        </div>
                    </div>

                    <div
                        onClick={() => indexInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setIsDraggingIndex(true); }}
                        onDragLeave={() => setIsDraggingIndex(false)}
                        onDrop={handleIndexFiles}
                        className="cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200"
                        style={{
                            borderColor: isDraggingIndex ? algo.accent : '#d1d5db',
                            background: isDraggingIndex ? algo.light : 'white',
                        }}
                    >
                        <input ref={indexInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleIndexFiles} />
                        <div className="text-4xl mb-3">{isDraggingIndex ? '✨' : '📁'}</div>
                        <p className="font-bold text-gray-700 mb-1">Drop images here or click to select</p>
                        <p className="text-sm text-gray-400">Any format · Multiple files · {algo.name} will extract features</p>
                    </div>

                    {indexedImages.length > 0 && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-700">
                                    Indexed Images
                                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: algo.accent }}>
                                        {indexedImages.filter(i => !i.pending).length}
                                    </span>
                                </h3>
                                <button onClick={clearIndex} className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1 rounded-full transition-colors">
                                    Clear all
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {indexedImages.map(img => <IndexedCard key={img.id} image={img} algo={algo} />)}
                            </div>
                        </div>
                    )}

                    {/* What happens during indexing — always visible */}
                    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
                        <h3 className="font-bold text-gray-800 mb-4">🔬 What happens when you index an image with {algo.name}?</h3>
                        <div className="space-y-3">
                            {[
                                { n: 1, title: 'Load & Preprocess', desc: `The image is decoded and converted to grayscale. ${algo.id === 'SIFT' ? 'SIFT also creates a Gaussian pyramid at multiple scales.' : 'ORB and AKAZE build an image pyramid for scale handling.'}` },
                                { n: 2, title: 'Detect Keypoints', desc: `${algo.id === 'ORB' ? 'FAST algorithm checks each pixel: if enough surrounding pixels are brighter/darker, it\'s a corner.' : algo.id === 'SIFT' ? 'DoG (Difference of Gaussians) finds stable extrema across scales.' : 'Nonlinear diffusion finds stable structures that resist noise.'}` },
                                { n: 3, title: 'Compute Descriptors', desc: `${algo.id === 'ORB' ? 'BRIEF samples pixel pairs around each keypoint and encodes comparisons into a 256-bit binary string.' : algo.id === 'SIFT' ? 'Computes gradient histograms in a 4×4 grid around each keypoint → 128 float values.' : 'M-LDB computes binary comparisons in a local grid → 486-bit vector.'}` },
                                { n: 4, title: 'Store in Index', desc: 'All descriptors are saved to memory (and disk via pickle). The index is now ready for similarity search.' },
                            ].map(s => (
                                <div key={s.n} className="flex gap-4 items-start">
                                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5" style={{ background: algo.accent }}>{s.n}</div>
                                    <div>
                                        <span className="font-semibold text-gray-800">{s.title}: </span>
                                        <span className="text-gray-600 text-sm">{s.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Step 2: Search ────────────────────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-black text-lg" style={{ background: algo.accent }}>2</div>
                        <div>
                            <h2 className="text-2xl font-black">Search for Similar Images</h2>
                            <p className="text-gray-500 text-sm">Upload a query image — the system finds the closest matches in your index</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Query drop + pipeline */}
                        <div className="space-y-4">
                            <div
                                onClick={() => searchInputRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setIsDraggingSearch(true); }}
                                onDragLeave={() => setIsDraggingSearch(false)}
                                onDrop={handleSearchFileDrop}
                                className="cursor-pointer rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200"
                                style={{
                                    borderColor: isDraggingSearch ? algo.accent : queryImage ? algo.accent + '80' : '#d1d5db',
                                    background: isDraggingSearch ? algo.light : 'white',
                                }}
                            >
                                <input ref={searchInputRef} type="file" accept="image/*" className="hidden" onChange={handleSearchFileDrop} />
                                {queryImage ? (
                                    <img src={queryImage.preview} alt={queryImage.name} className="w-full aspect-square object-cover" />
                                ) : (
                                    <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                                        <div className="text-4xl mb-3">🔍</div>
                                        <p className="font-bold text-gray-700 mb-1">Drop query image here</p>
                                        <p className="text-xs text-gray-400">The image you want to find matches for</p>
                                    </div>
                                )}
                            </div>
                            {queryImage && <p className="text-xs text-gray-400 text-center">{queryImage.name}</p>}

                            {/* Pipeline */}
                            <div className="rounded-2xl border border-gray-200 bg-white p-5">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Search Pipeline</p>
                                <div className="flex flex-wrap gap-2">
                                    {searchPipelineStages.map((s, i) => (
                                        <StageBadge key={s} label={s} active={searchStage === i + 1} done={searchStage > i + 1 || searchStage === 4} accent={algo.accent} />
                                    ))}
                                </div>
                                {searchStage > 0 && (
                                    <p className="text-xs mt-3" style={{ color: algo.accent }}>
                                        {searchStage === 1 && `Extracting ${algo.name} features from your query image…`}
                                        {searchStage === 2 && `Comparing descriptors against ${indexedImages.length} indexed images using ${algo.id === 'SIFT' ? 'L2 distance' : 'Hamming distance'}…`}
                                        {searchStage === 3 && 'Ranking matches by similarity score…'}
                                        {searchStage === 4 && '✓ Done!'}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleSearch}
                                disabled={!queryImage || isSearching || indexedImages.length === 0}
                                className="w-full py-3.5 rounded-2xl font-bold text-white text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                                style={{ background: algo.accent }}
                            >
                                {isSearching ? '⏳ Searching…' : '🔍 Run Search'}
                            </button>
                            {indexedImages.length === 0 && <p className="text-xs text-center text-gray-400">⬆ Index some images first in Step 1</p>}
                            {searchError && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">❌ {searchError}</div>
                            )}
                        </div>

                        {/* What happens during search */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6">
                            <h3 className="font-bold text-gray-800 mb-4">🔬 What happens during search with {algo.name}?</h3>
                            <div className="space-y-3">
                                {[
                                    { n: 1, title: 'Extract query features', desc: `Same as indexing: ${algo.name} finds keypoints in the query image and computes their descriptors.` },
                                    { n: 2, title: 'Match descriptors', desc: `Each query descriptor is compared against every descriptor in the index using ${algo.id === 'SIFT' ? 'L2 (Euclidean) distance — lower distance = more similar float vectors.' : 'Hamming distance (XOR) — fewer different bits = more similar binary strings.'}` },
                                    { n: 3, title: 'Filter good matches', desc: 'Only pairs where distance < 60 are counted as "good matches". This removes noise and false positives.' },
                                    { n: 4, title: 'Compute score', desc: 'Score = (goodMatches / queryKeypoints) × 250, capped at 100%. Higher = more similar.' },
                                    { n: 5, title: 'Rank & return', desc: 'Top 6 most similar images are returned, sorted by score descending.' },
                                ].map(s => (
                                    <div key={s.n} className="flex gap-4 items-start">
                                        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5" style={{ background: algo.accent }}>{s.n}</div>
                                        <div>
                                            <span className="font-semibold text-gray-800">{s.title}: </span>
                                            <span className="text-gray-600 text-sm">{s.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Search results */}
                    {searchResults && !searchResults.error && (
                        <div className="mt-8">
                            <div className="flex items-center gap-4 mb-5">
                                <h3 className="font-bold text-gray-800">Results</h3>
                                <span className="text-sm text-gray-400">
                                    {searchResults.results?.length > 0
                                        ? `${searchResults.results.length} matches found · Query had ${searchResults.query_keypoints} keypoints`
                                        : searchResults.message || 'No results'}
                                </span>
                            </div>
                            {searchResults.results?.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {searchResults.results.map((r, i) => <ResultCard key={i} result={r} algo={algo} rank={i} />)}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-400">
                                    <div className="text-4xl mb-3">🤷</div>
                                    <p className="font-semibold">{searchResults.message || 'No similar images found'}</p>
                                    <p className="text-sm mt-1">Try indexing more images or using a different algorithm</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>

                {/* ── Algorithm Comparison Table ───────────────────────────────── */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-black text-lg">📚</div>
                        <div>
                            <h2 className="text-2xl font-black">Algorithm Comparison</h2>
                            <p className="text-gray-500 text-sm">Side-by-side technical comparison of all three algorithms</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left p-4 font-bold text-gray-600">Property</th>
                                    {ALGORITHMS.map(a => (
                                        <th key={a.id} className="text-left p-4 font-bold" style={{ color: a.accent }}>{a.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { prop: 'Detector', vals: ['FAST corners', 'DoG extrema', 'AOS extrema'] },
                                    { prop: 'Descriptor type', vals: ['Binary (256 bits)', 'Float (128 × 4B)', 'Binary (486 bits)'] },
                                    { prop: 'Memory/keypoint', vals: ['32 bytes', '512 bytes', '61 bytes'] },
                                    { prop: 'Matching metric', vals: ['Hamming (XOR)', 'L2 Euclidean', 'Hamming'] },
                                    { prop: 'Scale invariant', vals: ['Partial', 'Full', 'Full'] },
                                    { prop: 'Rotation invariant', vals: ['Yes', 'Yes', 'Yes'] },
                                    { prop: 'Typical speed', vals: ['~10ms', '~80ms', '~25ms'] },
                                ].map((row, i) => (
                                    <tr key={row.prop} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        <td className="p-4 font-semibold text-gray-600">{row.prop}</td>
                                        {row.vals.map((v, j) => (
                                            <td key={j} className="p-4 text-gray-700 font-mono text-xs">{v}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-200 bg-white">
                <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
                    <p>Built with <strong>FastAPI</strong> · <strong>OpenCV</strong> · <strong>React</strong> · <strong>Cloudinary</strong></p>
                    <p className="mt-1">An open-source educational demo of computer vision feature matching</p>
                </div>
            </footer>
        </div>
    );
}
