import React, { useState } from 'react';
import Image from 'components/ui/AppImage';
import Icon from 'components/AppIcon';

const DetailedComparison = ({ queryImage, selectedResult, onClose }) => {
    const [activeTab, setActiveTab] = useState('keypoints');

    if (!selectedResult) return null;

    const comparisonTabs = [
        { id: 'keypoints', label: 'Keypoint Matching', icon: 'Target' },
        { id: 'histogram', label: 'Color Histogram', icon: 'BarChart2' },
        { id: 'features', label: 'Feature Vectors', icon: 'Layers' }
    ];

    const renderKeypointMatching = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Query Image</p>
                    <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border border-border">
                        <Image
                            src={queryImage?.image}
                            alt={queryImage?.imageAlt}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(8)]?.map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-warning rounded-full border-2 border-warning-foreground animate-pulse"
                                    style={{
                                        left: `${15 + i * 10}%`,
                                        top: `${20 + (i % 3) * 20}%`,
                                        animationDelay: `${i * 100}ms`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-data">Keypoints: 847</span>
                        <span className="font-data">Descriptors: 128-dim</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Result #{selectedResult?.rank}</p>
                    <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border border-border">
                        <Image
                            src={selectedResult?.image}
                            alt={selectedResult?.imageAlt}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(8)]?.map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-success rounded-full border-2 border-white animate-pulse"
                                    style={{
                                        left: `${15 + i * 10}%`,
                                        top: `${20 + (i % 3) * 20}%`,
                                        animationDelay: `${i * 100}ms`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-data">Keypoints: 823</span>
                        <span className="font-data">Matches: 156</span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-heading font-semibold text-sm">Matching Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Total Matches</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-primary font-data">156</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Good Matches</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-success font-data">142</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Match Ratio</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-warning font-data">91%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Avg Distance</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-foreground font-data">0.24</p>
                    </div>
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

    const renderFeatureVectors = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Query Feature Vector</p>
                    <div className="h-48 md:h-64 bg-muted/30 rounded-lg border border-border p-3 overflow-hidden">
                        <div className="grid grid-cols-16 gap-1 h-full">
                            {[...Array(128)]?.map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-primary rounded-sm transition-all duration-250 hover:bg-primary/80"
                                    style={{
                                        height: `${20 + Math.random() * 80}%`,
                                        opacity: 0.3 + Math.random() * 0.7
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-data">
                        Dimensions: 128 | Norm: 1.000
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Result Feature Vector</p>
                    <div className="h-48 md:h-64 bg-muted/30 rounded-lg border border-border p-3 overflow-hidden">
                        <div className="grid grid-cols-16 gap-1 h-full">
                            {[...Array(128)]?.map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-success rounded-sm transition-all duration-250 hover:bg-success/80"
                                    style={{
                                        height: `${20 + Math.random() * 80}%`,
                                        opacity: 0.3 + Math.random() * 0.7
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-data">
                        Dimensions: 128 | Norm: 0.987
                    </p>
                </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-heading font-semibold text-sm">Distance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-card rounded-md border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Euclidean Distance</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-primary font-data">
                            {selectedResult?.distance?.toFixed(4)}
                        </p>
                    </div>
                    <div className="p-3 bg-card rounded-md border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Cosine Similarity</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-success font-data">
                            {(selectedResult?.similarityScore / 100)?.toFixed(4)}
                        </p>
                    </div>
                    <div className="p-3 bg-card rounded-md border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Manhattan Distance</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-warning font-data">
                            {(selectedResult?.distance * 1.5)?.toFixed(4)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-200 bg-background/95 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen p-4 md:p-6 lg:p-8">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="bg-card border border-border rounded-lg shadow-lg">
                        <div className="p-4 md:p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Icon name="GitCompare" size={20} color="var(--color-primary)" />
                                    </div>
                                    <div>
                                        <h2 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl">
                                            Detailed Comparison
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Query vs Result #{selectedResult?.rank} • {selectedResult?.similarityScore}% Match
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-md hover:bg-muted transition-colors"
                                >
                                    <Icon name="X" size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 md:p-6">
                            <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
                                {comparisonTabs?.map((tab) => (
                                    <button
                                        key={tab?.id}
                                        onClick={() => setActiveTab(tab?.id)}
                                        className={`
                      flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap
                      transition-all duration-250
                      ${activeTab === tab?.id
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'bg-muted text-foreground hover:bg-muted/80'
                                            }
                    `}
                                    >
                                        <Icon name={tab?.icon} size={16} />
                                        <span className="font-medium text-sm">{tab?.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[400px]">
                                {activeTab === 'keypoints' && renderKeypointMatching()}
                                {activeTab === 'histogram' && renderHistogramComparison()}
                                {activeTab === 'features' && renderFeatureVectors()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedComparison;