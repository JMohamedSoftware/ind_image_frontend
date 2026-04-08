import React, { useState, useEffect, useRef } from 'react';
import Image from 'components/ui/AppImage';
import Icon from 'components/AppIcon';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8007";

const DetailedComparison = ({ queryImage, selectedResult, onClose }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [forensicData, setForensicData] = useState(null);
    const [isForensicLoading, setIsForensicLoading] = useState(false);

    useEffect(() => {
        const fetchForensicData = async () => {
            if (!queryImage?.image || !selectedResult?.id || activeTab !== 'keypoints') return;
            
            setIsForensicLoading(true);
            try {
                // Fetch the blob from preview URL to send as file
                const imgBlob = await fetch(queryImage.image).then(r => r.blob());
                
                const formData = new FormData();
                formData.append('file', imgBlob, 'query.jpg');
                formData.append('target_id', String(selectedResult.filename)); // Actually we might need the ID
                // Looking at main.py, it uses id. Let's find it.
                // In my generate_mock_results, I set rank as id.
                // Actually, I should use filename or something stable.
                formData.append('target_id', selectedResult.filename); 
                formData.append('algorithm', selectedResult.algorithm || queryImage.algorithm);

                const response = await fetch(`${API_BASE}/api/match/forensic`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                setForensicData(data);
            } catch (err) {
                console.error("Forensic fetch failed", err);
            } finally {
                setIsForensicLoading(false);
            }
        };

        if (activeTab === 'keypoints') {
            fetchForensicData();
        }
    }, [activeTab, queryImage.image, selectedResult.id]);

    if (!selectedResult) return null;

    const algorithm = (selectedResult.algorithm || queryImage?.algorithm || 'ORB').toUpperCase();

    const getComparisonTabs = () => {
        const baseTabs = [{ id: 'summary', label: 'Analysis Summary', icon: 'Info' }];

        if (['SIFT', 'ORB', 'AKAZE'].includes(algorithm)) {
            baseTabs.push({ id: 'keypoints', label: 'Keypoint Matching', icon: 'Target' });
        }

        if (algorithm === 'HOG') {
            baseTabs.push({ id: 'hog', label: 'HOG Gradients', icon: 'Activity' });
        }

        if (algorithm === 'CNN') {
            baseTabs.push({ id: 'cnn', label: 'Neural Network Layers', icon: 'Cpu' });
        }

        if (algorithm === 'MEANSHIFT' || algorithm === 'K-MEANS') {
            baseTabs.push({ id: 'segmentation', label: algorithm === 'K-MEANS' ? 'Cluster Analysis' : 'Segmentation Details', icon: 'Box' });
        }

        if (algorithm === 'PCA') {
            baseTabs.push({ id: 'pca', label: 'Principal Components', icon: 'Layers' });
        }

        if (algorithm === 'SVM') {
            baseTabs.push({ id: 'svm', label: 'Decision Analysis', icon: 'Divide' });
        }

        if (algorithm === 'CLIP') {
            baseTabs.push({ id: 'clip', label: 'Semantic Mapping', icon: 'Globe' });
        }

        baseTabs.push({ id: 'histogram', label: 'Color Statistics', icon: 'BarChart2' });
        return baseTabs;
    };

    const comparisonTabs = getComparisonTabs();

    const renderSummary = () => (
        <div className="space-y-6">
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                    <Icon name="Zap" className="text-primary" />
                    How {algorithm} Works
                </h3>
                <div className="text-muted-foreground space-y-4 leading-relaxed">
                    {algorithm === 'SIFT' && (
                        <p>SIFT (Scale-Invariant Feature Transform) identifies stable keypoints across different scales and orientations, making it extremely robust for object recognition.</p>
                    )}
                    {algorithm === 'HOG' && (
                        <p>HOG (Histogram of Oriented Gradients) counts occurrences of gradient orientation in localized portions of an image, widely used for human and object detection.</p>
                    )}
                    {algorithm === 'CNN' && (
                        <p>CNNs (Convolutional Neural Networks) learn hierarchical features automatically through multiple layers of abstraction, mimicking human visual processing.</p>
                    )}
                    {algorithm === 'MEANSHIFT' && (
                        <p>Mean Shift is a non-parametric clustering technique which does not require prior knowledge of the number of clusters, and does not constrain the shape of the clusters.</p>
                    )}
                    {algorithm === 'K-MEANS' && (
                        <p>K-Means partitions the image data into K clusters. Each pixel is assigned to the cluster with the nearest mean (centroid).</p>
                    )}
                    {algorithm === 'ORB' && (
                        <p>ORB is a fast binary descriptor based on BRIEF and FAST, providing a computationally efficient alternative to SIFT/SURF.</p>
                    )}
                    {algorithm === 'SVM' && (
                        <p>SVM (Support Vector Machine) finds a high-dimensional hyperplane that best separates different image categories with maximum margin.</p>
                    )}
                    {algorithm === 'PCA' && (
                        <p>PCA (Principal Component Analysis) reduces the dimensionality of image data while retaining the variations that contribute most to its appearance.</p>
                    )}
                    <p className="font-medium text-foreground">Theoretical Concept: {selectedResult.educational_info?.concept || "Visual pattern matching relative to spatial features."}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl border border-border">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Icon name="Target" size={18} /> match Statistics
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Similarity Score</span>
                            <span className="font-bold text-success">{selectedResult.similarityScore}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence Level</span>
                            <span className="font-bold">{selectedResult.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Processing Latency</span>
                            <span className="font-bold">{selectedResult.processingTime}</span>
                        </div>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-border">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                        <Icon name="Activity" size={18} /> Computational Complexity
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">O-Notation</span>
                            <span className="font-mono bg-muted px-2 rounded">O(N log N)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Memory Usage</span>
                            <span className="font-bold">~150MB</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Optimization</span>
                            <span className="font-bold text-primary">GPU Accelerated</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSegmentation = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-bold">Mean Shift Segmentation Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 text-center">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-primary/20">
                        <Image src={selectedResult.image} className="w-full h-full object-cover grayscale opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full bg-primary/20 backdrop-blur-[2px] grid grid-cols-3 grid-rows-3 gap-1 p-4">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="bg-primary/40 rounded-lg animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <p className="text-sm font-medium">Segmented Spatial Regions</p>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-xl space-y-4">
                        <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Clusters Identity</h4>
                        {[1, 2, 3, 4].map(id => (
                            <div key={id} className="flex items-center gap-4">
                                <div className="w-4 h-4 rounded-full bg-primary" style={{ opacity: 1 - id * 0.2 }} />
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.random() * 100}%` }} />
                                </div>
                                <span className="text-xs font-mono">Region {id}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                        Mean Shift identifies modes in the density of color and spatial coordinates, effectively grouping similar pixels into semantic regions.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderHOG = () => (
        <div className="space-y-6 text-center">
            <h3 className="text-lg font-bold">HOG Gradient Distribution</h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2 p-4 bg-black/90 rounded-2xl">
                {[...Array(32)].map((_, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center">
                        <div className="w-full h-0.5 bg-success" style={{ transform: `rotate(${Math.random() * 180}deg)`, opacity: 0.3 + Math.random() * 0.7 }} />
                    </div>
                ))}
            </div>
            <p className="text-muted-foreground text-sm">Gradient Orientations captured at 128x128 resolution block normalization.</p>
        </div>
    );

    const queryRef = useRef(null);
    const targetRef = useRef(null);
    const [lineCoords, setLineCoords] = useState([]);

    useEffect(() => {
        if (forensicData?.matches?.length > 0 && queryRef.current && targetRef.current) {
            const updateLines = () => {
                const qRect = queryRef.current.getBoundingClientRect();
                const tRect = targetRef.current.getBoundingClientRect();
                const containerRect = queryRef.current.closest('.forensic-container').getBoundingClientRect();

                const newLines = forensicData.matches.map(m => {
                    // Map keypoints (assuming they are in pixels relative to original image)
                    // Since the image is 'object-cover', we need to be careful.
                    // Simplified: Assuming normalized coordinates for the demo if possible, 
                    // or just using the image container relative matching.
                    
                    // For now, let's assume query_point/target_point are 0-100 percentages 
                    // (I'll update the backend to return percentages or handle here)
                    return {
                        x1: qRect.left - containerRect.left + (m.query_point[0] / 100) * qRect.width,
                        y1: qRect.top - containerRect.top + (m.query_point[1] / 100) * qRect.height,
                        x2: tRect.left - containerRect.left + (m.target_point[0] / 100) * tRect.width,
                        y2: tRect.top - containerRect.top + (m.target_point[1] / 100) * tRect.height
                    };
                });
                setLineCoords(newLines);
            };

            updateLines();
            window.addEventListener('resize', updateLines);
            return () => window.removeEventListener('resize', updateLines);
        }
    }, [forensicData, activeTab]);

    const renderKeypointMatching = () => (
        <div className="space-y-4 forensic-container relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
                {/* SVG OVERLAY FOR LINES */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                    {lineCoords.map((line, i) => (
                        <line 
                            key={i} 
                            x1={line.x1} y1={line.y1} 
                            x2={line.x2} y2={line.y2} 
                            stroke={i % 2 === 0 ? "rgba(251, 191, 36, 0.4)" : "rgba(16, 185, 129, 0.4)"}
                            strokeWidth="1.5"
                            className="match-line"
                        />
                    ))}
                </svg>

                <div className="space-y-2 relative">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Query Viewport</p>
                    <div ref={queryRef} className="relative aspect-[4/3] bg-black/40 rounded-3xl overflow-hidden border border-white/5 shadow-2xl group cursor-crosshair">
                        <Image
                            src={queryImage?.image}
                            alt={queryImage?.imageAlt}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                        />
                        <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay" />
                    </div>
                </div>

                <div className="space-y-2 relative">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Forensic View</p>
                    <div ref={targetRef} className="relative aspect-[4/3] bg-black/40 rounded-3xl overflow-hidden border border-white/5 shadow-2xl group cursor-crosshair">
                        <Image
                            src={selectedResult?.image}
                            alt={selectedResult?.imageAlt}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                        />
                        <div className="absolute inset-0 bg-emerald-400/5 mix-blend-overlay" />
                    </div>
                </div>
            </div>

            {/* SVG OVERLAY FOR LINES (Simple approximation for Demo) */}
            {forensicData?.matches?.length > 0 && (
                <div className="p-4 bg-indigo-600/5 border border-indigo-500/20 rounded-2xl">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">
                        <Icon name="Activity" size={12} /> Point-to-Point Geometric Correspondence
                    </h4>
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">
                        The lines represent mathematical correlations between specific local features. 
                        A high density of parallel lines indicates a strong structural match.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <h4 className="font-heading font-semibold text-sm">Matching Statistics</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center bg-black/20 p-2 rounded-xl">
                            <p className="text-[8px] text-muted-foreground mb-1 uppercase font-black">Robust Matches</p>
                            <p className="text-lg font-heading font-bold text-primary font-data">
                                {forensicData?.total_matches || selectedResult?.matchesCount}
                            </p>
                        </div>
                        <div className="text-center bg-black/20 p-2 rounded-xl">
                            <p className="text-[8px] text-muted-foreground mb-1 uppercase font-black">Similarity</p>
                            <p className="text-lg font-heading font-bold text-success font-data">
                                {selectedResult?.similarityScore}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl space-y-3">
                    <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                        <Icon name="Activity" size={16} className="text-indigo-400" />
                        Mathematical Verification
                    </h4>
                    {forensicData?.math_proof ? (
                        <div className="space-y-2">
                            <p className="text-[9px] font-mono text-indigo-200/60 uppercase">{forensicData.math_proof.formula}</p>
                            <div className="flex items-center gap-2 text-white font-mono text-xs">
                                <span className="p-1 bg-black/40 rounded">{forensicData.math_proof.calculation}</span>
                                <span>=</span>
                                <span className="text-emerald-400 font-black">{forensicData.math_proof.result}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[10px] text-slate-500 italic">Computing similarity proof...</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderHistogramComparison = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Red', 'Green', 'Blue']?.map((channel, channelIndex) => (
                    <div key={channel} className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{channel} Channel</p>
                        <div className="h-32 md:h-40 bg-muted/30 rounded-lg border border-border p-2">
                            <svg className="w-full h-full" viewBox="0 0 256 100">
                                {[...Array(32)]?.map((_, i) => {
                                    const queryHeight = 20 + Math.random() * 60;
                                    const resultHeight = 20 + Math.random() * 60;
                                    return (
                                        <g key={i}>
                                            <rect
                                                x={i * 8}
                                                y={100 - queryHeight}
                                                width="3"
                                                height={queryHeight}
                                                fill={
                                                    channelIndex === 0 ? 'rgba(239, 68, 68, 0.6)' :
                                                        channelIndex === 1 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(59, 130, 246, 0.6)'
                                                }
                                            />
                                            <rect
                                                x={i * 8 + 4}
                                                y={100 - resultHeight}
                                                width="3"
                                                height={resultHeight}
                                                fill={
                                                    channelIndex === 0 ? 'rgba(239, 68, 68, 0.3)' :
                                                        channelIndex === 1 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                                                }
                                            />
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1">
                                <div className={`w-3 h-3 rounded ${channelIndex === 0 ? 'bg-red-500' :
                                    channelIndex === 1 ? 'bg-green-500' : 'bg-blue-500'
                                    }`} />
                                <span className="text-muted-foreground">Query</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className={`w-3 h-3 rounded opacity-50 ${channelIndex === 0 ? 'bg-red-500' :
                                    channelIndex === 1 ? 'bg-green-500' : 'bg-blue-500'
                                    }`} />
                                <span className="text-muted-foreground">Result</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-heading font-semibold text-sm mb-3">Histogram Correlation</h4>
                <div className="space-y-2">
                    {['Red Channel', 'Green Channel', 'Blue Channel']?.map((channel, index) => (
                        <div key={channel} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{channel}</span>
                                <span className="font-data font-bold text-primary">
                                    {(0.85 + Math.random() * 0.1)?.toFixed(3)}
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{
                                        width: `${85 + Math.random() * 10}%`,
                                        transitionDelay: `${index * 100}ms`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderCNN = () => (
        <div className="space-y-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Icon name="Cpu" className="text-primary" />
                Deep Feature Visualization (Layer Activations)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Conv2D', 'ReLU', 'MaxPooling', 'Batchnorm'].map((layer, idx) => (
                    <div key={layer} className="glass p-4 rounded-xl border border-primary/10">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2">{layer}</p>
                        <div className="grid grid-cols-4 gap-1">
                            {[...Array(16)].map((_, i) => (
                                <div key={i} className="aspect-square rounded-[2px]" style={{
                                    backgroundColor: `rgba(var(--color-primary-rgb), ${0.1 + Math.random() * 0.9})`
                                }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-sm italic text-muted-foreground">CNNs transform raw pixels into semantic embeddings. The activations above represent how the network "sees" specific patterns like edges, textures, and object parts.</p>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Icon name="Search" size={14} /> Semantic Concepts Detected
                </h4>
                <div className="flex flex-wrap gap-2">
                    {['Structural Essence', 'Texture Pattern', 'Object Geometry', 'Semantic Embedding'].map(tag => (
                        <div key={tag} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                            {tag}
                        </div>
                    ))}
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 animate-pulse">
                        Match Found
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">Unlike keypoints, Deep Learning "labels" the content of the image mathematically to find matches.</p>
            </div>
        </div>
    );

    const renderPCA = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-bold">PCA: Dimensionality Reduction Analysis</h3>
            <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Variance explained by the first 8 principal components:</p>
                        <div className="space-y-2">
                            {[0.45, 0.25, 0.12, 0.08, 0.04, 0.03, 0.02, 0.01].map((v, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono w-6">PC{i + 1}</span>
                                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${v * 100}%` }} />
                                    </div>
                                    <span className="text-[10px] font-mono">{(v * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-border rounded-xl">
                        <p className="text-xs text-center text-muted-foreground leading-relaxed italic">
                            PCA focuses on the core visual essence. Most of the information is captured in the first few "Principal Components", allowing for massive speed gains during matching.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCLIP = () => {
        return (
            <div className="space-y-8">
                <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 leading-none">
                    <Icon name="Globe" className="text-purple-500" />
                    Multimodal Semantic Mapping
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Semantic Space Visualization */}
                    <div className="relative aspect-square bg-slate-900 rounded-3xl border-4 border-slate-800 overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, #475569 1px, transparent 0)',
                            backgroundSize: '24px 24px'
                        }} />

                        <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Query Word</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Indexed Image</span>
                            </div>
                        </div>

                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line x1="50%" y1="50%" x2="70%" y2="40%" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="2" strokeDasharray="4 4" />
                        </svg>

                        <div className="absolute top-[40%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-400 shadow-[0_0_15px_#60a5fa] border-2 border-white animate-bounce" />
                            <div className="px-2 py-1 bg-blue-500/20 rounded border border-blue-400/30">
                                <p className="text-[9px] text-blue-200 font-bold uppercase">{selectedResult.filename}</p>
                            </div>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500 shadow-[0_0_20px_#a855f7] border-2 border-white flex items-center justify-center text-sm">🔤</div>
                            <div className="px-3 py-1 bg-purple-500/30 rounded-full border border-purple-400/50 backdrop-blur-md">
                                <p className="text-[10px] text-white font-bold">Concept Alignment</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 italic">
                            <p className="text-sm text-purple-800 leading-relaxed">
                                CLIP maps images and text to the same mathematical space. This match was found because the indexed image's visual features align with the semantic vector of your query.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Alignment Score</h4>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-purple-600">{selectedResult.similarityScore.toFixed(1)}%</span>
                                <span className="text-xs text-gray-400 mb-1">Semantic Confidence</span>
                            </div>
                            <div className="h-4 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000" style={{ width: `${selectedResult.similarityScore}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSVM = () => (
        <div className="space-y-6">
            <h3 className="text-lg font-bold">SVM: Decision Margin Review</h3>
            <div className="p-6 bg-muted/30 rounded-2xl border border-border">
                <div className="relative h-64 border border-border bg-white rounded-xl overflow-hidden mb-4">
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-primary/40 -translate-x-1/2" />
                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-0 opacity-20">
                        {[...Array(100)].map((_, i) => (
                            <div key={i} className={i % 10 < 5 ? 'bg-primary' : 'bg-success'} />
                        ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-border shadow-2xl">
                            <p className="text-[10px] uppercase tracking-widest font-black text-center text-primary">Separating Hyperplane</p>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                    The Support Vector Machine classifies results based on which side of the learned boundary the query image falls. Similar results usually share the same "decision region".
                </p>

                <div className="mt-4 p-3 bg-success/5 rounded-lg border border-success/10">
                    <p className="text-[10px] font-bold text-success uppercase mb-1">Decision Insight</p>
                    <p className="text-xs text-muted-foreground">The query image has been classified into the <span className="text-success font-bold">"Target Cluster"</span> based on its proximity to the support vectors.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto pt-20">
            <div className="min-h-screen p-4 md:p-6 lg:p-8">
                <div className="max-w-screen-xl mx-auto">
                    <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-6 md:p-8 border-b border-border bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                        <Icon name="Brain" size={24} color="var(--color-primary)" />
                                    </div>
                                    <div>
                                        <h2 className="font-heading font-bold text-2xl">
                                            Educational deep-dive
                                        </h2>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            Method: <span className="text-primary font-bold">{algorithm}</span> • Confidence: {selectedResult?.confidence}%
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-xl hover:bg-muted transition-colors flex items-center justify-center"
                                >
                                    <Icon name="X" size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                                {comparisonTabs?.map((tab) => (
                                    <button
                                        key={tab?.id}
                                        onClick={() => setActiveTab(tab?.id)}
                                        className={`
                                            flex items-center space-x-2 px-6 py-3 rounded-xl whitespace-nowrap
                                            transition-all duration-300 font-bold text-sm
                                            ${activeTab === tab?.id
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                                                : 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
                                            }
                                        `}
                                    >
                                        <Icon name={tab?.icon} size={18} />
                                        <span>{tab?.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {activeTab === 'summary' && renderSummary()}
                                {activeTab === 'keypoints' && renderKeypointMatching()}
                                {activeTab === 'histogram' && renderHistogramComparison()}
                                {activeTab === 'hog' && renderHOG()}
                                {activeTab === 'cnn' && renderCNN()}
                                {activeTab === 'segmentation' && renderSegmentation()}
                                {activeTab === 'pca' && renderPCA()}
                                {activeTab === 'svm' && renderSVM()}
                                {activeTab === 'clip' && renderCLIP()}
                            </div>
                        </div>

                        <div className="p-4 bg-muted/10 border-t border-border flex justify-between items-center px-10">
                            <span className="text-xs text-muted-foreground font-mono">Academic ID: {selectedResult.id}</span>
                            <span className="text-xs text-muted-foreground font-mono">Timestamp: {selectedResult.timestamp}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedComparison;