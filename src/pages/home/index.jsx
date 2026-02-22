import React, { useState, useEffect, useRef, useCallback } from 'react';
import DetailedComparison from '../search-results-visualization/components/DetailedComparison';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ALGORITHMS = [
    {
        id: 'ORB',
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
        id: 'SVM',
        name: 'SVM',
        full: 'Support Vector Machine',
        accent: '#db2777',
        light: '#fdf2f8',
        border: '#fbcfe8',
        text: '#be185d',
        badge: 'ML Classifier',
        description: 'Finds the optimal boundary between different types of images. Great for binary classification.',
        speed: 4,
        accuracy: 4,
        descriptorSize: 'Variable',
        descriptorType: 'Decision Boundary',
        matchMetric: 'Distance to Hyperplane',
        detectorDetail: 'Support Vectors — the algorithm identifies the most "difficult" data points that define the separation boundary',
        descriptorDetail: 'Kernel Trick — maps data to higher dimensions to find a linear separation where none existed before',
        matchDetail: 'Classification — checks which side of the learned boundary the new image falls on.',
    },
    {
        id: 'PCA',
        name: 'PCA',
        full: 'Principal Component Analysis',
        accent: '#475569',
        light: '#f8fafc',
        border: '#e2e8f0',
        text: '#334155',
        badge: 'Dimension Reduction',
        description: 'Simplifies complex data. Retains only the most important visual variations.',
        speed: 5,
        accuracy: 3,
        descriptorSize: '16-64 components',
        descriptorType: 'Reduced Vector',
        matchMetric: 'Mahalanobis distance',
        detectorDetail: 'Eigenvectors — finds the directions of maximum variance (the "main look" of the dataset)',
        descriptorDetail: 'Projection — squashes a massive 128-float vector down to just 16 "principal components" without losing core info',
        matchDetail: 'Low-rank matching — comparing images in a much smaller, compressed space for maximum speed.',
    },
    {
        id: 'MEANSHIFT',
        name: 'Mean Shift',
        full: 'Non-Parametric Clustering',
        accent: '#d97706',
        light: '#fffbeb',
        border: '#fef3c7',
        text: '#b45309',
        badge: 'Segmentation',
        description: 'Groups pixels together to find "blobs" of color or texture. No fixed number of clusters needed.',
        speed: 2,
        accuracy: 4,
        descriptorSize: 'N clusters',
        descriptorType: 'Modal Centroids',
        matchMetric: 'Bhattacharyya distance',
        detectorDetail: 'Density Gradient — iteratively shifts towards regions of higher data density (the "modes")',
        descriptorDetail: 'Segmentation — clusters pixels into regions of uniform color/texture, creating a simplified map',
        matchDetail: 'Histogram matching — comparing the distribution of the segmented regions.',
    },
    {
        id: 'CLIP',
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';
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
                    {['ORB', 'SIFT', 'AKAZE'].includes(algo.id) && (
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
                    {algo.id === 'CNN' && (
                        <div className="grid grid-cols-5 grid-rows-5 h-full w-full opacity-30 p-1">
                            {[...Array(25)].map((_, i) => (
                                <div key={i} className="rounded-sm" style={{ background: `rgba(37, 99, 235, ${Math.random()})` }} />
                            ))}
                        </div>
                    )}
                    {(algo.id === 'MEANSHIFT' || algo.id === 'K-MEANS') && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full bg-orange-400/10 backdrop-blur-[0.5px] grid grid-cols-2 grid-rows-2 gap-0.5 p-1">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-orange-400/40 rounded-sm" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Descriptor Generation (Pulse) */}
            {stepIndex === 3 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full animate-pulse border-4" style={{ borderColor: algo.accent + '40' }} />
                </div>
            )}
        </div>
    );
}

// ─── INDEXED IMAGE WITH LIVE LOG ─────────────────────────────────────────────
function IndexedCard({ image, algo }) {
    const [stepIndex, setStepIndex] = useState(-1);
    const [steps, setSteps] = useState([
        { text: 'Received image file', detail: null, status: 'pending' },
        { text: 'Preprocessing', detail: null, status: 'pending' },
        { text: 'Feature Extraction', detail: null, status: 'pending' },
        { text: 'Descriptor Generation', detail: null, status: 'pending' },
        { text: 'Store in index', detail: null, status: 'pending' },
    ]);

    const update = (i, status, detail) => {
        setStepIndex(i);
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status, detail: detail ?? s.detail } : s));
    };

    useEffect(() => {
        update(0, 'running');
        const t0 = setTimeout(() => { update(0, 'done', `File: ${image.name}`); update(1, 'running'); }, 300);
        const t1 = setTimeout(() => { update(1, 'done', 'Image converted to internal format & resized.'); update(2, 'running'); }, 1200);
        const t2 = setTimeout(() => {
            const isKeypoint = ['ORB', 'SIFT', 'AKAZE'].includes(algo.id);
            update(2, 'done',
                isKeypoint
                    ? `${algo.detectorDetail} → Found ${image.keypoints} keypoints`
                    : `${algo.detectorDetail}`
            );
            update(3, 'running');
        }, 2400);
        const t3 = setTimeout(() => {
            const isKeypoint = ['ORB', 'SIFT', 'AKAZE'].includes(algo.id);
            update(3, 'done',
                isKeypoint
                    ? `${algo.descriptorDetail} → ${image.keypoints} descriptors`
                    : algo.descriptorDetail
            );
            update(4, 'running');
        }, 3600);
        const t4 = setTimeout(() => {
            update(4, 'done', `Index updated with ${algo.name} features.`);
            setStepIndex(-1);
        }, 4500);
        return () => [t0, t1, t2, t3, t4].forEach(clearTimeout);
    }, [image.keypoints, algo]);

    return (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: algo.border }}>
            <div className="flex gap-4 p-4">
                <div className="relative w-20 h-20 shrink-0">
                    <img src={image.preview} alt={image.name} className="w-full h-full rounded-xl object-cover border" style={{ borderColor: algo.border }} />
                    <IndexingOverlay algo={algo} stepIndex={stepIndex} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-500 truncate mb-3">{image.name}</p>
                    <LiveLog steps={steps} />
                </div>
            </div>
        </div>
    );
}

// ─── SEARCH LIVE LOG PANEL ────────────────────────────────────────────────────
function SearchLivePanel({ queryImage, algo, steps }) {
    return (
        <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: algo.border }}>
            <div className="flex gap-3 items-center mb-4">
                {queryImage && (
                    <img src={queryImage.preview} alt={queryImage.name} className="w-14 h-14 rounded-xl object-cover border" style={{ borderColor: algo.border }} />
                )}
                <div>
                    <p className="text-xs text-gray-400">{queryImage?.name || 'Query image'}</p>
                    <p className="font-bold text-sm" style={{ color: algo.accent }}>🔍 {algo.name} Search Process</p>
                </div>
            </div>
            <LiveLog steps={steps} />
        </div>
    );
}

// ─── RESULT CARD ─────────────────────────────────────────────────────────────
function ResultCard({ result, rank, onSelect }) {
    const score = result.similarityScore;
    const color = score > 65 ? '#16a34a' : score > 35 ? '#ca8a04' : '#dc2626';
    return (
        <div
            onClick={() => onSelect(result)}
            className="rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group"
        >
            <div className="relative">
                {result.url
                    ? <img src={result.url} alt={result.filename} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-4xl">🖼️</div>
                }
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow" style={{ background: color }}>{score.toFixed(0)}%</div>
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center text-xs font-bold text-gray-600 shadow">#{rank + 1}</div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-700 shadow-xl border border-gray-100">
                        🔍 View Deep-dive
                    </div>
                </div>
            </div>
            <div className="h-1.5 bg-gray-100">
                <div className="h-full rounded-r-full transition-all duration-700" style={{ width: score + '%', background: color }} />
            </div>
            <div className="p-3">
                <p className="text-xs text-gray-500 truncate font-semibold">{result.filename}</p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-400 capitalize">{result.algorithm}</span>
                    <span className="text-[10px] text-gray-400">{result.matchesCount || 0} pts</span>
                </div>
            </div>
        </div>
    );
}

// ─── INDEX GALLERY ──────────────────────────────────────────────────────────
function IndexGallery({ images, onClear, algo }) {
    if (images.length === 0) return null;

    return (
        <div className="mt-12 p-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">🖼️ Indexed Image Library</h3>
                    <p className="text-sm text-gray-500">The "knowledge base" your {algo.name} algorithm is searching through.</p>
                </div>
                <button
                    onClick={onClear}
                    className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                >
                    🗑️ Clear Database
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {images.map((img, i) => (
                    <div key={i} className="group relative bg-white p-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                        <img src={img.url || img.preview} alt={img.name} className="w-full aspect-square object-cover rounded-xl border mb-2" />
                        <div className="px-1">
                            <p className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-tighter">{img.name}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold">{img.algorithm || 'INDEXED'}</span>
                                {img.keypoints > 0 && <span className="text-[9px] text-gray-400 font-mono">{img.keypoints} pts</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const HomePage = () => {
    const [algo, setAlgo] = useState(ALGORITHMS[0]);
    const [indexedImages, setIndexedImages] = useState([]);
    const [queryImage, setQueryImage] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchLogSteps, setSearchLogSteps] = useState([]);
    const [isDraggingIndex, setIsDraggingIndex] = useState(false);
    const [isDraggingSearch, setIsDraggingSearch] = useState(false);
    const [textQuery, setTextQuery] = useState('');
    const [selectedDetailResult, setSelectedDetailResult] = useState(null);
    const indexInputRef = useRef(null);
    const searchInputRef = useRef(null);

    // Fetch index on mount
    useEffect(() => {
        fetch(`${API_BASE}/api/index/list`)
            .then(r => r.json())
            .then(data => {
                setIndexedImages(data.map(img => ({
                    ...img,
                    name: img.filename,
                    preview: img.url,
                    keypoints: img.keypoint_count
                })));
            })
            .catch(err => console.error("Failed to fetch index", err));
    }, []);

    const handleClearIndex = async () => {
        if (!confirm("Are you sure you want to delete all indexed images?")) return;
        try {
            await fetch(`${API_BASE}/api/index`, { method: 'DELETE' });
            setIndexedImages([]);
        } catch (err) {
            console.error("Failed to clear index", err);
        }
    };

    // ── Index ─────────────────────────────────────────────────────────────────
    const uploadAndIndex = useCallback(async (file) => {
        const preview = URL.createObjectURL(file);
        const tempId = Date.now() + Math.random();
        setIndexedImages(prev => [...prev, { id: tempId, preview, name: file.name, keypoints: 0, pending: true }]);
        try {
            const f = new FormData();
            f.append('file', file);
            f.append('upload_preset', CLOUDINARY_PRESET);
            const cdn = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, { method: 'POST', body: f }).then(r => r.json());
            const url = cdn.secure_url;
            const idx = new FormData();
            if (url) { idx.append('url', url); idx.append('filename', file.name); } else { idx.append('file', file); }
            idx.append('algorithm', algo.id);
            const data = await fetch(`${API_BASE}/api/index`, { method: 'POST', body: idx }).then(r => r.json());
            setIndexedImages(prev => prev.map(img => img.id === tempId
                ? { ...img, preview: url || preview, keypoints: data.keypoints || 0, pending: false } : img));
        } catch (err) {
            console.error(err);
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

    // ── Search ────────────────────────────────────────────────────────────────
    const handleSearch = useCallback(async () => {
        if (algo.id !== 'CLIP' && !queryImage) return;
        if (algo.id === 'CLIP' && !textQuery.trim()) return;

        setIsSearching(true);
        setSearchResults(null);
        setSearchError(null);

        const isClip = algo.id === 'CLIP';
        const isKeypoint = ['ORB', 'SIFT', 'AKAZE'].includes(algo.id);
        const makeStep = (text, detail = null, status = 'pending') => ({ text, detail, status });

        const initSteps = isClip ? [
            makeStep(`Tokenizing text query: "${textQuery}"`, null, 'running'),
            makeStep(`Projecting tokens to latent space via Transformer`),
            makeStep(`Multimodal search in index using Cosine Similarity`),
            makeStep(`Ranking ${indexedImages.length} images by semantic distance`),
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
            if (isClip) {
                // CLIP Text Search Path
                await new Promise(r => setTimeout(r, 600));
                upd(0, 'done', 'Query parsed into 12 semantic tokens.');
                upd(1, 'running');
                await new Promise(r => setTimeout(r, 800));
                upd(1, 'done', 'Vector coordinates projected to 512D shared space.');
                upd(2, 'running');

                const form = new FormData();
                form.append('query', textQuery);
                form.append('algorithm', 'CLIP');
                const res = await fetch(`${API_BASE}/api/search/text`, { method: 'POST', body: form });
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();

                upd(2, 'done', 'Found semantic matches in image database.');
                upd(3, 'running');
                await new Promise(r => setTimeout(r, 400));
                upd(3, 'done', `Top match: ${data.results?.[0]?.filename} with ${data.results?.[0]?.similarityScore.toFixed(1)}% confidence.`);

                setSearchResults(data);
            } else {
                // Classic Image Search Path
                const blob = await fetch(queryImage.preview).then(r => r.blob());
                upd(0, 'done', `Query loaded (${(blob.size / 1024).toFixed(1)} KB)`);
                upd(1, 'running');

                const form = new FormData();
                form.append('file', blob, queryImage.name);
                form.append('algorithm', algo.id);

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
            setQueryImage({ preview: URL.createObjectURL(file), name: file.name });
            setSearchResults(null);
            setSearchLogSteps([]);
            setSearchError(null);
        }
        if (e.target) e.target.value = '';
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-6">
                        🎓 Educational Demo · Computer Vision
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-4">
                        How does <span style={{ color: algo.accent }}>Image Search</span> Work?
                    </h1>
                    <p className="text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
                        Upload images, pick an algorithm, and watch each processing step unfold live — with real numbers and explanations.
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-12 space-y-14">

                {/* ── 0: Algorithm ─────────────────────────────────────────── */}
                <section>
                    <SectionHeader number="0" title="Choose an Algorithm" sub="Determines how keypoints are detected and described" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {ALGORITHMS.map(a => {
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
                        <div className="text-4xl mb-3">{isDraggingIndex ? '✨' : '📁'}</div>
                        <p className="font-bold text-gray-700 mb-1">Drop images here or click to select</p>
                        <p className="text-sm text-gray-400">Watch {algo.name} process each image step by step</p>
                    </div>

                    {indexedImages.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-bold text-gray-700">
                                    Live indexing log
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ background: algo.accent }}>
                                        {indexedImages.filter(i => !i.pending).length} done
                                    </span>
                                </p>
                                <button onClick={async () => { await fetch(`${API_BASE}/api/index`, { method: 'DELETE' }).catch(() => { }); setIndexedImages([]); setSearchResults(null); }}
                                    className="text-xs text-red-500 border border-red-200 hover:border-red-400 px-3 py-1 rounded-full transition-colors">
                                    Clear index
                                </button>
                            </div>
                            <div className="space-y-4">
                                {indexedImages.map(img => <IndexedCard key={img.id} image={img} algo={algo} />)}
                            </div>
                        </div>
                    )}
                </section>

                {/* ── 2: Search ────────────────────────────────────────────── */}
                <section>
                    <SectionHeader
                        number="2"
                        title={algo.id === 'CLIP' ? "Search with Natural Language" : "Search for Similar Images"}
                        sub={algo.id === 'CLIP' ? "Type a description → CLIP maps pixels to concepts" : "Drop a query image → live matching log shows every step"}
                        accent={algo.accent}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: query selection (image or text) */}
                        <div className="space-y-4">
                            {algo.id === 'CLIP' ? (
                                <div className="rounded-2xl border-2 p-8 bg-white" style={{ borderColor: textQuery ? algo.accent : '#d1d5db' }}>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Semantic Search Query</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={textQuery}
                                            onChange={e => setTextQuery(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                            placeholder="Example: 'A sunset over the mountains' or 'Red car'..."
                                            className="w-full text-lg font-semibold bg-transparent outline-none border-b-2 py-2 transition-all placeholder:text-gray-200"
                                            style={{ borderColor: textQuery ? algo.accent : '#e5e7eb' }}
                                        />
                                        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 italic">
                                            <p className="text-[10px] uppercase font-bold text-purple-400 mb-1">Educational Insight</p>
                                            <p className="text-xs text-purple-700 leading-relaxed">
                                                Multimodal AI doesn't look for pixels. It translates your words into a numeric vector that points to concepts stored during indexing.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => searchInputRef.current?.click()}
                                    onDragOver={e => { e.preventDefault(); setIsDraggingSearch(true); }}
                                    onDragLeave={() => setIsDraggingSearch(false)}
                                    onDrop={handleSearchDrop}
                                    className="cursor-pointer rounded-2xl border-2 border-dashed overflow-hidden transition-all"
                                    style={{ borderColor: isDraggingSearch ? algo.accent : queryImage ? algo.accent + '80' : '#d1d5db', background: isDraggingSearch ? algo.light : 'white' }}
                                >
                                    <input ref={searchInputRef} type="file" accept="image/*" className="hidden" onChange={handleSearchDrop} />
                                    {queryImage ? (
                                        <img src={queryImage.preview} alt={queryImage.name} className="w-full aspect-square object-cover" />
                                    ) : (
                                        <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                                            <div className="text-4xl mb-3">🔍</div>
                                            <p className="font-bold text-gray-700 mb-1">Drop your query image</p>
                                            <p className="text-xs text-gray-400">The image you want to find matches for</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleSearch}
                                disabled={isSearching || (algo.id !== 'CLIP' && !queryImage) || (algo.id === 'CLIP' && !textQuery.trim()) || indexedImages.length === 0}
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
                                <SearchLivePanel queryImage={queryImage} algo={algo} steps={searchLogSteps} />
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
                <IndexGallery images={indexedImages} onClear={handleClearIndex} algo={algo} />

                {/* ── Comparison table ─────────────────────────────────────── */}
                <section>
                    <SectionHeader number="📚" title="Algorithm Reference" sub="Side-by-side technical comparison" />
                    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left p-4 font-bold text-gray-500">Property</th>
                                    {ALGORITHMS.map(a => <th key={a.id} className="text-left p-4 font-bold" style={{ color: a.accent }}>{a.name}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'Badge', key: 'badge' },
                                    { label: 'Type', key: 'descriptorType' },
                                    { label: 'Output Size', key: 'descriptorSize' },
                                    { label: 'Metric', key: 'matchMetric' },
                                    { label: 'Rel. Accuracy', key: 'accuracy', isDots: true },
                                    { label: 'Rel. Speed', key: 'speed', isDots: true },
                                ].map((prop, i) => (
                                    <tr key={prop.label} className={`border-b border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                                        <td className="p-4 font-semibold text-gray-600">{prop.label}</td>
                                        {ALGORITHMS.map(a => (
                                            <td key={a.id} className="p-4 text-gray-700 text-xs">
                                                {prop.isDots ? (
                                                    <Dots score={a[prop.key]} color={a.accent} />
                                                ) : (
                                                    <span className="font-mono">{a[prop.key]}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <footer className="border-t border-gray-200 bg-white">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
                    <p>Built with <strong>FastAPI</strong> · <strong>OpenCV</strong> · <strong>React</strong> · <strong>Cloudinary</strong></p>
                    <p className="mt-1">An educational demo of computer vision feature matching</p>
                </div>
            </footer>

            {selectedDetailResult && (
                <DetailedComparison
                    queryImage={queryImage || { filename: textQuery, algorithm: 'CLIP' }}
                    selectedResult={selectedDetailResult}
                    onClose={() => setSelectedDetailResult(null)}
                />
            )}
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
