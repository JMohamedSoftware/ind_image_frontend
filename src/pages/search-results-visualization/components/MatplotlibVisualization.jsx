import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const MatplotlibVisualization = ({ results, queryImage }) => {
    const [activeChart, setActiveChart] = useState('distribution');

    const chartTypes = [
        { id: 'distribution', label: 'Score Distribution', icon: 'BarChart3' },
        { id: 'featureSpace', label: 'Feature Space', icon: 'Scatter' },
        { id: 'comparison', label: 'Comparative Analysis', icon: 'LineChart' }
    ];

    const renderDistributionChart = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading font-semibold text-sm md:text-base">
                    Similarity Score Distribution
                </h4>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="TrendingUp" size={14} />
                    <span className="font-data">Mean: 82.4%</span>
                </div>
            </div>

            <div className="space-y-3">
                {results?.map((result, index) => (
                    <div key={result?.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="font-medium">Result #{result?.rank}</span>
                            <span className="font-data font-bold text-primary">
                                {result?.similarityScore}%
                            </span>
                        </div>
                        <div className="relative h-8 md:h-10 bg-muted rounded-md overflow-hidden">
                            <div
                                className={`
                  absolute inset-y-0 left-0 rounded-md transition-all duration-500
                  ${result?.similarityScore >= 90 ? 'bg-success' :
                                        result?.similarityScore >= 70 ? 'bg-warning' : 'bg-error'
                                    }
                `}
                                style={{
                                    width: `${result?.similarityScore}%`,
                                    transitionDelay: `${index * 100}ms`
                                }}
                            >
                                <div className="absolute inset-0 flex items-center justify-end pr-2">
                                    <span className="text-xs font-bold text-white font-data">
                                        {result?.similarityScore}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Highest</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-success font-data">
                            {Math.max(...results?.map(r => r?.similarityScore))}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Average</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-warning font-data">
                            {(results?.reduce((sum, r) => sum + r?.similarityScore, 0) / results?.length)?.toFixed(1)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Lowest</p>
                        <p className="text-lg md:text-xl font-heading font-bold text-error font-data">
                            {Math.min(...results?.map(r => r?.similarityScore))}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFeatureSpaceChart = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading font-semibold text-sm md:text-base">
                    Feature Space Projection
                </h4>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Layers" size={14} />
                    <span className="font-data">2D PCA</span>
                </div>
            </div>

            <div className="relative aspect-square bg-muted/30 rounded-lg border border-border overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 400 400">
                    <defs>
                        <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>

                    {[...Array(10)]?.map((_, i) => (
                        <React.Fragment key={i}>
                            <line
                                x1={i * 40}
                                y1="0"
                                x2={i * 40}
                                y2="400"
                                stroke="var(--color-border)"
                                strokeWidth="1"
                                opacity="0.3"
                            />
                            <line
                                x1="0"
                                y1={i * 40}
                                x2="400"
                                y2={i * 40}
                                stroke="var(--color-border)"
                                strokeWidth="1"
                                opacity="0.3"
                            />
                        </React.Fragment>
                    ))}

                    <circle
                        cx="200"
                        cy="200"
                        r="12"
                        fill="var(--color-warning)"
                        stroke="var(--color-warning-foreground)"
                        strokeWidth="2"
                    />
                    <text x="200" y="185" textAnchor="middle" fontSize="10" fill="var(--color-foreground)">
                        Query
                    </text>

                    {results?.map((result, index) => {
                        const angle = (index * 2 * Math.PI) / results?.length;
                        const distance = 50 + (100 - result?.similarityScore) * 1.5;
                        const x = 200 + distance * Math.cos(angle);
                        const y = 200 + distance * Math.sin(angle);

                        return (
                            <g key={result?.id}>
                                <line
                                    x1="200"
                                    y1="200"
                                    x2={x}
                                    y2={y}
                                    stroke="var(--color-primary)"
                                    strokeWidth="1"
                                    strokeDasharray="4 2"
                                    opacity="0.4"
                                />
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="8"
                                    fill={
                                        result?.similarityScore >= 90 ? 'var(--color-success)' :
                                            result?.similarityScore >= 70 ? 'var(--color-warning)' : 'var(--color-error)'
                                    }
                                    stroke="white"
                                    strokeWidth="2"
                                />
                                <text
                                    x={x}
                                    y={y - 15}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="var(--color-foreground)"
                                    fontWeight="bold"
                                >
                                    #{result?.rank}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-muted-foreground">High Similarity (&gt;90%)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-muted-foreground">Medium (70-90%)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-error" />
                    <span className="text-muted-foreground">Low (&lt;70%)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-warning border-2 border-warning-foreground" />
                    <span className="text-muted-foreground">Query Image</span>
                </div>
            </div>
        </div>
    );

    const renderComparisonChart = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading font-semibold text-sm md:text-base">
                    Comparative Analysis
                </h4>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Icon name="Activity" size={14} />
                    <span className="font-data">Multi-metric</span>
                </div>
            </div>

            <div className="space-y-4">
                {['Similarity Score', 'Confidence Level', 'Feature Distance']?.map((metric, metricIndex) => (
                    <div key={metric} className="space-y-2">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">{metric}</p>
                        <div className="relative h-24 md:h-32 bg-muted/30 rounded-lg border border-border p-2">
                            <svg className="w-full h-full" viewBox="0 0 500 100">
                                <defs>
                                    <linearGradient id={`gradient-${metricIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>

                                {[...Array(5)]?.map((_, i) => (
                                    <line
                                        key={i}
                                        x1="0"
                                        y1={i * 20}
                                        x2="500"
                                        y2={i * 20}
                                        stroke="var(--color-border)"
                                        strokeWidth="1"
                                        opacity="0.3"
                                    />
                                ))}

                                <polyline
                                    points={results?.map((r, i) => {
                                        const x = (i * 500) / (results?.length - 1);
                                        const value = metricIndex === 0 ? r?.similarityScore :
                                            metricIndex === 1 ? r?.confidence :
                                                (100 - r?.distance * 10);
                                        const y = 100 - value;
                                        return `${x},${y}`;
                                    })?.join(' ')}
                                    fill="none"
                                    stroke="var(--color-primary)"
                                    strokeWidth="2"
                                />

                                <polygon
                                    points={`0,100 ${results?.map((r, i) => {
                                        const x = (i * 500) / (results?.length - 1);
                                        const value = metricIndex === 0 ? r?.similarityScore :
                                            metricIndex === 1 ? r?.confidence :
                                                (100 - r?.distance * 10);
                                        const y = 100 - value;
                                        return `${x},${y}`;
                                    })?.join(' ')} 500,100`}
                                    fill={`url(#gradient-${metricIndex})`}
                                />

                                {results?.map((r, i) => {
                                    const x = (i * 500) / (results?.length - 1);
                                    const value = metricIndex === 0 ? r?.similarityScore :
                                        metricIndex === 1 ? r?.confidence :
                                            (100 - r?.distance * 10);
                                    const y = 100 - value;
                                    return (
                                        <circle
                                            key={r?.id}
                                            cx={x}
                                            cy={y}
                                            r="4"
                                            fill="var(--color-primary)"
                                            stroke="white"
                                            strokeWidth="2"
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl">
                    Visualization Analysis
                </h3>
                <Icon name="BarChart" size={24} className="text-primary" />
            </div>
            <div className="flex items-center space-x-2 mb-4 md:mb-6 overflow-x-auto pb-2">
                {chartTypes?.map((chart) => (
                    <button
                        key={chart?.id}
                        onClick={() => setActiveChart(chart?.id)}
                        className={`
              flex items-center space-x-2 px-3 md:px-4 py-2 rounded-md whitespace-nowrap
              transition-all duration-250 text-sm md:text-base
              ${activeChart === chart?.id
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                            }
            `}
                    >
                        <Icon name={chart?.icon} size={16} />
                        <span className="font-medium">{chart?.label}</span>
                    </button>
                ))}
            </div>
            <div className="min-h-[300px] md:min-h-[400px]">
                {activeChart === 'distribution' && renderDistributionChart()}
                {activeChart === 'featureSpace' && renderFeatureSpaceChart()}
                {activeChart === 'comparison' && renderComparisonChart()}
            </div>
        </div>
    );
};

export default MatplotlibVisualization;