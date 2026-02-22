import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const ALGORITHMS = [
    {
        id: 'ORB',
        name: 'ORB',
        full: 'Oriented FAST & Rotated BRIEF',
        color: '#a78bfa',
        glow: 'rgba(167,139,250,0.4)',
        badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
        ring: 'ring-violet-500',
        description: 'Ultra-fast binary descriptor. Best for real-time use. Used in robotics and AR apps.',
        speed: 5,
        accuracy: 3,
    },
    {
        id: 'SIFT',
        name: 'SIFT',
        full: 'Scale-Invariant Feature Transform',
        color: '#22d3ee',
        glow: 'rgba(34,211,238,0.4)',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        ring: 'ring-cyan-500',
        description: 'Highly accurate, scale & rotation invariant. The gold standard for feature matching.',
        speed: 2,
        accuracy: 5,
    },
    {
        id: 'AKAZE',
        name: 'AKAZE',
        full: 'Accelerated-KAZE',
        color: '#fb923c',
        glow: 'rgba(251,146,60,0.4)',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        ring: 'ring-orange-500',
        description: 'Great balance of speed and accuracy. Excellent for non-linear scale spaces.',
        speed: 4,
        accuracy: 4,
    },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'image_index';
const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

// ─── PARTICLE ANIMATION CANVAS ──────────────────────────────────────────────
function ParticleCanvas() {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const animRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        for (let i = 0; i < 80; i++) {
            particles.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2,
                color: ['#a78bfa', '#22d3ee', '#fb923c'][Math.floor(Math.random() * 3)],
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.current.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();

                // Draw lines to nearby particles
                particles.current.slice(i + 1).forEach((p2) => {
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = p.color;
                        ctx.globalAlpha = (1 - dist / 100) * 0.15;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
                ctx.globalAlpha = 1;
            });
            animRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ─── SCORE BAR ───────────────────────────────────────────────────────────────
function ScoreBar({ score, color }) {
    return (
        <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full transition-all duration-500"
                    style={{ background: i <= score ? color : 'rgba(255,255,255,0.1)' }}
                />
            ))}
        </div>
    );
}

// ─── KEYPOINT OVERLAY ────────────────────────────────────────────────────────
function KeypointOverlay({ show, color }) {
    const dots = Array.from({ length: 20 }, (_, i) => ({
        x: `${10 + Math.sin(i * 1.7 + 1) * 35 + 35}%`,
        y: `${10 + Math.cos(i * 2.3 + 0.5) * 35 + 35}%`,
        delay: i * 80,
    }));

    if (!show) return null;

    return (
        <div className="absolute inset-0 pointer-events-none">
            {dots.map((d, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full border-2 animate-ping-once"
                    style={{
                        left: d.x,
                        top: d.y,
                        borderColor: color,
                        background: color + '40',
                        animationDelay: d.delay + 'ms',
                        opacity: 0,
                        animation: `fadeInDot 0.3s ${d.delay}ms ease-out forwards`,
                    }}
                />
            ))}
        </div>
    );
}

// ─── INDEXED IMAGE CARD ───────────────────────────────────────────────────────
function IndexedCard({ image, algo }) {
    const [stage, setStage] = useState('uploading'); // uploading | extracting | done

    useEffect(() => {
        const t1 = setTimeout(() => setStage('extracting'), 600);
        const t2 = setTimeout(() => setStage('done'), 1600);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const stageLabel = { uploading: 'Uploading...', extracting: 'Extracting features...', done: `Indexed ✓ (${image.keypoints} keypoints)` };
    const stageColor = { uploading: '#60a5fa', extracting: algo.color, done: '#4ade80' };

    return (
        <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 group transition-all duration-500 hover:border-white/20">
            <img src={image.preview} alt={image.name} className="w-full aspect-square object-cover" />
            <KeypointOverlay show={stage === 'extracting' || stage === 'done'} color={algo.color} />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs truncate" style={{ color: stageColor[stage] }}>
                    {stageLabel[stage]}
                </p>
                {stage !== 'done' && (
                    <div className="mt-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                                width: stage === 'uploading' ? '40%' : '100%',
                                background: stageColor[stage],
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── SEARCH RESULT CARD ───────────────────────────────────────────────────────
function ResultCard({ result, algo, rank }) {
    const score = result.similarityScore;
    const scoreColor = score > 70 ? '#4ade80' : score > 40 ? '#facc15' : '#f87171';

    return (
        <div
            className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/25 transition-all duration-300 group"
            style={{ animationDelay: rank * 100 + 'ms' }}
        >
            {result.url ? (
                <img src={result.url} alt={result.filename} className="w-full aspect-square object-cover" />
            ) : (
                <div className="w-full aspect-square bg-white/10 flex items-center justify-center text-4xl">🖼️</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-2 right-2">
                <div
                    className="px-2 py-1 rounded-full text-xs font-bold border"
                    style={{ background: scoreColor + '20', color: scoreColor, borderColor: scoreColor + '50' }}
                >
                    {score.toFixed(0)}%
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: score + '%', background: scoreColor }}
                    />
                </div>
                <p className="text-xs text-white/60 mt-1 truncate">{result.filename}</p>
                <p className="text-xs mt-0.5" style={{ color: algo.color }}>{result.matchesCount} matches</p>
            </div>
        </div>
    );
}

// ─── PIPELINE STEP ────────────────────────────────────────────────────────────
function PipelineStep({ icon, label, active, done, color }) {
    return (
        <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${active || done ? 'opacity-100' : 'opacity-30'}`}>
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${active ? 'animate-pulse' : ''}`}
                style={{
                    borderColor: done ? '#4ade80' : active ? color : 'rgba(255,255,255,0.15)',
                    background: done ? '#4ade8015' : active ? color + '20' : 'transparent',
                    boxShadow: active ? `0 0 20px ${color}60` : 'none',
                }}
            >
                {done ? '✓' : icon}
            </div>
            <span className="text-xs text-white/60 whitespace-nowrap">{label}</span>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
    const [algo, setAlgo] = useState(ALGORITHMS[0]);
    const [indexedImages, setIndexedImages] = useState([]);
    const [queryImage, setQueryImage] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchStage, setSearchStage] = useState(0); // 0=idle 1=extracting 2=matching 3=ranking 4=done
    const [isDraggingIndex, setIsDraggingIndex] = useState(false);
    const [isDraggingSearch, setIsDraggingSearch] = useState(false);
    const indexDropRef = useRef(null);
    const searchDropRef = useRef(null);

    // ── Upload to Cloudinary then index ─────────────────────────────────────────
    const uploadAndIndex = useCallback(async (file) => {
        const preview = URL.createObjectURL(file);
        const tempId = Date.now() + Math.random();
        const placeholder = { id: tempId, preview, name: file.name, keypoints: 0, pending: true };
        setIndexedImages(prev => [...prev, placeholder]);

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
            if (imageUrl) {
                idxForm.append('url', imageUrl);
                idxForm.append('filename', file.name);
            } else {
                idxForm.append('file', file);
            }
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

    const handleIndexDrop = useCallback((e) => {
        e.preventDefault();
        setIsDraggingIndex(false);
        const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
        files.filter(f => f.type.startsWith('image/')).forEach(uploadAndIndex);
    }, [uploadAndIndex]);

    // ── Search ───────────────────────────────────────────────────────────────────
    const handleSearch = useCallback(async () => {
        if (!queryImage) return;
        setIsSearching(true);
        setSearchResults(null);
        setSearchStage(1);

        try {
            const blob = await fetch(queryImage.preview).then(r => r.blob());
            const formData = new FormData();
            formData.append('file', blob, queryImage.name);
            formData.append('algorithm', algo.id);

            setTimeout(() => setSearchStage(2), 800);
            setTimeout(() => setSearchStage(3), 1500);

            const res = await fetch(`${API_BASE}/api/search`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();

            setSearchStage(4);
            setTimeout(() => {
                setSearchResults(data);
                setIsSearching(false);
                setSearchStage(0);
            }, 600);
        } catch (err) {
            console.error('Search error:', err);
            setIsSearching(false);
            setSearchStage(0);
            setSearchResults({ error: err.message });
        }
    }, [queryImage, algo]);

    const handleSearchFileDrop = useCallback((e) => {
        e.preventDefault();
        setIsDraggingSearch(false);
        const file = (e.dataTransfer?.files || e.target?.files)?.[0];
        if (file && file.type.startsWith('image/')) {
            setQueryImage({ preview: URL.createObjectURL(file), name: file.name });
            setSearchResults(null);
        }
    }, []);

    const clearIndex = async () => {
        await fetch(`${API_BASE}/api/index`, { method: 'DELETE' }).catch(() => { });
        setIndexedImages([]);
        setSearchResults(null);
    };

    const pipelineStages = [
        { icon: '📤', label: 'Upload' },
        { icon: '🔍', label: 'Extract' },
        { icon: '🧮', label: 'Match' },
        { icon: '🏆', label: 'Rank' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0e1a] text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 text-center">
                <ParticleCanvas />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Open-source · Educational · Interactive
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-none">
                        How does{' '}
                        <span
                            className="bg-clip-text text-transparent"
                            style={{ backgroundImage: `linear-gradient(135deg, ${ALGORITHMS[0].color}, ${ALGORITHMS[1].color}, ${ALGORITHMS[2].color})` }}
                        >
                            Image Search
                        </span>{' '}
                        Work?
                    </h1>
                    <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
                        An interactive, visual explanation of feature extraction, descriptor matching, and similarity ranking — pick an algorithm and try it live.
                    </p>
                    <a
                        href="#algorithms"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg transition-all duration-300 hover:scale-105"
                        style={{
                            background: `linear-gradient(135deg, ${ALGORITHMS[0].color}, ${ALGORITHMS[1].color})`,
                            boxShadow: `0 0 40px ${ALGORITHMS[0].glow}`,
                        }}
                    >
                        Start Exploring ↓
                    </a>
                </div>
            </section>

            {/* ── Section 2: Algorithm Selector ───────────────────────────────── */}
            <section id="algorithms" className="py-24 px-4 max-w-5xl mx-auto">
                <div className="text-center mb-14">
                    <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: algo.color }}>Step 0</p>
                    <h2 className="text-4xl font-black mb-4">Choose Your Algorithm</h2>
                    <p className="text-white/50 max-w-xl mx-auto">Each algorithm detects and describes image features differently. Select one — it changes how indexing and search work.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ALGORITHMS.map((a) => {
                        const isSelected = algo.id === a.id;
                        return (
                            <button
                                key={a.id}
                                onClick={() => setAlgo(a)}
                                className={`relative p-6 rounded-3xl border-2 text-left transition-all duration-400 hover:scale-105 ${isSelected ? a.ring : 'border-white/10'}`}
                                style={{
                                    background: isSelected ? a.color + '15' : 'rgba(255,255,255,0.03)',
                                    borderColor: isSelected ? a.color : 'rgba(255,255,255,0.1)',
                                    boxShadow: isSelected ? `0 0 40px ${a.glow}` : 'none',
                                }}
                            >
                                {isSelected && (
                                    <div className="absolute top-4 right-4 w-3 h-3 rounded-full animate-pulse" style={{ background: a.color }} />
                                )}
                                <div className="text-3xl font-black mb-2" style={{ color: a.color }}>{a.name}</div>
                                <div className="text-xs text-white/40 mb-3">{a.full}</div>
                                <p className="text-sm text-white/70 mb-5 leading-relaxed">{a.description}</p>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex justify-between text-xs text-white/40 mb-1"><span>Speed</span><span>{a.speed}/5</span></div>
                                        <ScoreBar score={a.speed} color={a.color} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-white/40 mb-1"><span>Accuracy</span><span>{a.accuracy}/5</span></div>
                                        <ScoreBar score={a.accuracy} color={a.color} />
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="mt-4 text-center">
                                        <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ color: a.color, borderColor: a.color + '50', background: a.color + '10' }}>
                                            ✓ Selected
                                        </span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* How this algo works */}
                <div
                    className="mt-8 p-6 rounded-2xl border transition-all duration-500"
                    style={{ borderColor: algo.color + '40', background: algo.color + '08' }}
                >
                    <h3 className="font-bold mb-3" style={{ color: algo.color }}>How {algo.name} finds features:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
                        {algo.id === 'ORB' && <>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">1. FAST Detector</span><br />Finds corner-like points by checking pixel ring brightness.</div>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">2. BRIEF Descriptor</span><br />Creates a 256-bit binary string per keypoint by comparing pixel pairs.</div>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">3. Hamming Distance</span><br />Matching done with XOR — extremely fast on modern CPUs.</div>
                        </>}
                        {algo.id === 'SIFT' && <>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">1. DoG Scale Space</span><br />Applies Gaussian blurs at multiple scales to find stable interest points.</div>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">2. 128-dim Gradient</span><br />Builds a histogram of image gradients around each keypoint.</div>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">3. L2 Distance</span><br />Euclidean distance between float vectors — very accurate but slower.</div>
                        </>}
                        {algo.id === 'AKAZE' && <>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">1. Non-linear Scale Space</span><br />Uses diffusion equations instead of Gaussians for sharper edges.</div>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">2. M-LDB Descriptor</span><br />Modified Local Difference Binary — compact and invariant.</div>
                            <div className="p-3 bg-white/5 rounded-xl"><span className="font-bold text-white">3. Hamming Distance</span><br />Fast binary matching like ORB, but more accurate on complex textures.</div>
                        </>}
                    </div>
                </div>
            </section>

            {/* ── Section 3: Step 1 — Index ───────────────────────────────────── */}
            <section className="py-24 px-4 max-w-5xl mx-auto border-t border-white/5">
                <div className="text-center mb-14">
                    <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: algo.color }}>Step 1</p>
                    <h2 className="text-4xl font-black mb-4">Build the Index</h2>
                    <p className="text-white/50 max-w-xl mx-auto">
                        Drop images here. The system will extract <strong style={{ color: algo.color }}>{algo.name}</strong> keypoints from each one and store their descriptors in memory.
                    </p>
                </div>

                {/* Drop zone */}
                <div
                    ref={indexDropRef}
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingIndex(true); }}
                    onDragLeave={() => setIsDraggingIndex(false)}
                    onDrop={handleIndexDrop}
                    onClick={() => indexDropRef.current?.querySelector('input')?.click()}
                    className="relative cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300"
                    style={{
                        borderColor: isDraggingIndex ? algo.color : 'rgba(255,255,255,0.15)',
                        background: isDraggingIndex ? algo.color + '10' : 'rgba(255,255,255,0.02)',
                        boxShadow: isDraggingIndex ? `0 0 40px ${algo.glow}` : 'none',
                    }}
                >
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleIndexDrop} />
                    <div className="text-5xl mb-4">{isDraggingIndex ? '✨' : '📁'}</div>
                    <p className="text-lg font-bold mb-2">Drop images here</p>
                    <p className="text-sm text-white/40">or click to select · any format · multiple files OK</p>
                    {indexedImages.length > 0 && (
                        <div
                            className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold"
                            style={{ background: algo.color + '20', color: algo.color }}
                        >
                            {indexedImages.filter(i => !i.pending).length} indexed
                        </div>
                    )}
                </div>

                {/* Image grid */}
                {indexedImages.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white/70">Indexed Images</h3>
                            <button onClick={clearIndex} className="text-xs text-red-400/70 hover:text-red-400 transition-colors px-3 py-1 rounded-full border border-red-400/20 hover:border-red-400/50">
                                Clear all
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {indexedImages.map(img => (
                                <IndexedCard key={img.id} image={img} algo={algo} />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* ── Section 4: Step 2 — Search ──────────────────────────────────── */}
            <section className="py-24 px-4 max-w-5xl mx-auto border-t border-white/5">
                <div className="text-center mb-14">
                    <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: algo.color }}>Step 2</p>
                    <h2 className="text-4xl font-black mb-4">Search for Similar Images</h2>
                    <p className="text-white/50 max-w-xl mx-auto">
                        Upload a query image. The system extracts its features and compares them against your index using <strong style={{ color: algo.color }}>{algo.name}</strong>.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Query drop zone */}
                    <div>
                        <h3 className="font-bold mb-4 text-white/70">Query Image</h3>
                        <div
                            ref={searchDropRef}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingSearch(true); }}
                            onDragLeave={() => setIsDraggingSearch(false)}
                            onDrop={handleSearchFileDrop}
                            onClick={() => searchDropRef.current?.querySelector('input')?.click()}
                            className="relative cursor-pointer rounded-3xl border-2 border-dashed overflow-hidden transition-all duration-300"
                            style={{
                                borderColor: isDraggingSearch ? algo.color : queryImage ? algo.color + '60' : 'rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.02)',
                                boxShadow: isDraggingSearch ? `0 0 40px ${algo.glow}` : 'none',
                            }}
                        >
                            <input type="file" accept="image/*" className="hidden" onChange={handleSearchFileDrop} />
                            {queryImage ? (
                                <>
                                    <img src={queryImage.preview} alt={queryImage.name} className="w-full aspect-square object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <p className="text-xs text-white/80 truncate">{queryImage.name}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="aspect-square flex flex-col items-center justify-center text-center p-8">
                                    <div className="text-5xl mb-4">🔍</div>
                                    <p className="font-bold mb-1">Drop your query image</p>
                                    <p className="text-xs text-white/40">The image you want to find matches for</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            disabled={!queryImage || isSearching || indexedImages.length === 0}
                            className="w-full mt-4 py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: queryImage && !isSearching ? `linear-gradient(135deg, ${algo.color}, ${algo.color}aa)` : 'rgba(255,255,255,0.1)',
                                boxShadow: queryImage && !isSearching ? `0 0 30px ${algo.glow}` : 'none',
                                color: 'white',
                            }}
                        >
                            {isSearching ? '⏳ Searching...' : '🔍 Run Search'}
                        </button>

                        {indexedImages.length === 0 && (
                            <p className="text-xs text-center text-white/30 mt-2">Index some images in Step 1 first</p>
                        )}
                    </div>

                    {/* Pipeline & results */}
                    <div>
                        <h3 className="font-bold mb-4 text-white/70">Search Pipeline</h3>
                        <div
                            className="rounded-3xl border p-6 mb-6"
                            style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                        >
                            <div className="flex items-center justify-between">
                                {pipelineStages.map((s, i) => (
                                    <React.Fragment key={i}>
                                        <PipelineStep
                                            icon={s.icon}
                                            label={s.label}
                                            active={searchStage === i + 1}
                                            done={searchStage > i + 1 || searchStage === 4}
                                            color={algo.color}
                                        />
                                        {i < pipelineStages.length - 1 && (
                                            <div
                                                className="flex-1 h-px mx-2 transition-all duration-500"
                                                style={{ background: searchStage > i + 1 ? algo.color : 'rgba(255,255,255,0.1)' }}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="mt-4 text-center text-sm text-white/40">
                                {searchStage === 0 && 'Ready to search'}
                                {searchStage === 1 && <span style={{ color: algo.color }}>Extracting {algo.name} features from query...</span>}
                                {searchStage === 2 && <span style={{ color: algo.color }}>Matching descriptors against {indexedImages.length} indexed images...</span>}
                                {searchStage === 3 && <span style={{ color: algo.color }}>Ranking results by similarity score...</span>}
                                {searchStage === 4 && <span className="text-green-400">Search complete!</span>}
                            </div>
                        </div>

                        {/* Results or empty state */}
                        {searchResults && !searchResults.error && (
                            searchResults.results?.length > 0 ? (
                                <div>
                                    <p className="text-xs text-white/40 mb-3">
                                        Found <strong className="text-white">{searchResults.results.length}</strong> matches · Query had <strong className="text-white">{searchResults.query_keypoints}</strong> keypoints
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {searchResults.results.map((r, i) => (
                                            <ResultCard key={i} result={r} algo={algo} rank={i} />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-white/30">
                                    <div className="text-4xl mb-2">🤷</div>
                                    <p>{searchResults.message || 'No similar images found'}</p>
                                </div>
                            )
                        )}
                        {searchResults?.error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                ❌ {searchResults.error}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Section 5: How it Works ──────────────────────────────────────── */}
            <section className="py-24 px-4 max-w-5xl mx-auto border-t border-white/5">
                <div className="text-center mb-14">
                    <h2 className="text-4xl font-black mb-4">How It Works</h2>
                    <p className="text-white/50 max-w-xl mx-auto">The full pipeline, from pixel to result.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { step: '01', title: 'Feature Extraction', icon: '🔎', desc: 'The algorithm scans the image for interesting points (corners, edges, blobs). Each point is called a "keypoint".', code: 'orb.detectAndCompute(img, None)' },
                        { step: '02', title: 'Descriptor Creation', icon: '🧬', desc: 'Around each keypoint, a descriptor vector is computed (e.g., 128 floats for SIFT or 256 bits for ORB). This is the image\'s "fingerprint".', code: 'descriptors.shape → (N, 128)' },
                        { step: '03', title: 'Matching & Ranking', icon: '🏆', desc: 'For search, we compare the query\'s descriptors against every indexed image using Hamming or Euclidean distance. More matches = higher similarity.', code: 'bf.match(des_query, des_db)' },
                    ].map((item) => (
                        <div key={item.step} className="p-6 rounded-3xl border border-white/10 bg-white/3 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <div className="text-xs font-bold text-white/30 mb-1">Step {item.step}</div>
                            <h3 className="text-lg font-black mb-3">{item.title}</h3>
                            <p className="text-sm text-white/60 leading-relaxed mb-4">{item.desc}</p>
                            <code className="text-xs text-green-400/80 bg-green-400/5 px-3 py-2 rounded-lg block font-mono">
                                {item.code}
                            </code>
                        </div>
                    ))}
                </div>

                {/* Algorithm comparison table */}
                <div className="rounded-3xl border border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="text-left p-4 font-bold text-white/70">Algorithm</th>
                                <th className="text-left p-4 font-bold text-white/70">Descriptor Type</th>
                                <th className="text-left p-4 font-bold text-white/70">Descriptor Size</th>
                                <th className="text-left p-4 font-bold text-white/70">Matching</th>
                                <th className="text-left p-4 font-bold text-white/70">Best For</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { a: ALGORITHMS[0], type: 'Binary', size: '256 bits', match: 'Hamming', use: 'Real-time / Mobile' },
                                { a: ALGORITHMS[1], type: 'Float', size: '128 float32', match: 'L2 / Euclidean', use: 'High accuracy' },
                                { a: ALGORITHMS[2], type: 'Binary', size: '486 bits', match: 'Hamming', use: 'Balanced quality' },
                            ].map(({ a, type, size, match, use }) => (
                                <tr key={a.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                    <td className="p-4 font-bold" style={{ color: a.color }}>{a.name}</td>
                                    <td className="p-4 text-white/60">{type}</td>
                                    <td className="p-4 text-white/60 font-mono text-xs">{size}</td>
                                    <td className="p-4 text-white/60">{match}</td>
                                    <td className="p-4 text-white/60">{use}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────────────────────── */}
            <footer className="py-12 px-4 border-t border-white/5 text-center text-white/30 text-sm">
                <p>Built with FastAPI · OpenCV · React · Cloudinary</p>
                <p className="mt-1">An educational demo of computer vision feature matching</p>
            </footer>

            <style>{`
        @keyframes fadeInDot {
          0% { opacity: 0; transform: scale(0); }
          60% { opacity: 1; transform: scale(1.3); }
          100% { opacity: 0.8; transform: scale(1); }
        }
      `}</style>
        </div>
    );
}
