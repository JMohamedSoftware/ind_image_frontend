import React, { useState } from 'react';
import Icon from 'components/AppIcon';

const MetadataPanel = ({ result, algorithmParams }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!result) {
        return (
            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center space-y-2">
                        <Icon name="FileSearch" size={32} className="mx-auto opacity-50" />
                        <p className="text-sm">Select a result to view metadata</p>
                    </div>
                </div>
            </div>
        );
    }

    const metadataSections = [
        {
            title: 'Image Information',
            icon: 'Image',
            items: [
                { label: 'Filename', value: result?.filename, icon: 'File' },
                { label: 'Dimensions', value: result?.dimensions, icon: 'Maximize2' },
                { label: 'File Size', value: result?.fileSize, icon: 'HardDrive' },
                { label: 'Format', value: result?.format, icon: 'FileType' }
            ]
        },
        {
            title: 'Similarity Metrics',
            icon: 'Target',
            items: [
                { label: 'Similarity Score', value: `${result?.similarityScore}%`, icon: 'TrendingUp' },
                { label: 'Confidence Level', value: `${result?.confidence}%`, icon: 'Zap' },
                { label: 'Feature Distance', value: result?.distance?.toFixed(4), icon: 'Ruler' },
                { label: 'Ranking Position', value: `#${result?.rank}`, icon: 'Hash' }
            ]
        },
        {
            title: 'Feature Extraction',
            icon: 'Layers',
            items: [
                { label: 'Algorithm', value: result?.algorithm, icon: 'Cpu' },
                { label: 'Keypoints Detected', value: result?.keypoints, icon: 'Target' },
                { label: 'Descriptors', value: result?.descriptors, icon: 'Binary' },
                { label: 'Vector Length', value: result?.vectorLength, icon: 'Hash' }
            ]
        },
        {
            title: 'Processing Details',
            icon: 'Activity',
            items: [
                { label: 'Processing Time', value: result?.processingTime, icon: 'Clock' },
                { label: 'Timestamp', value: result?.timestamp, icon: 'Calendar' },
                { label: 'Match Quality', value: result?.matchQuality, icon: 'CheckCircle2' },
                { label: 'PCA Applied', value: result?.pcaApplied ? 'Yes' : 'No', icon: 'GitBranch' }
            ]
        }
    ];

    return (
        <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-4 md:p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="FileText" size={20} color="var(--color-primary)" />
                        </div>
                        <div>
                            <h3 className="font-heading font-semibold text-lg md:text-xl">
                                Result Metadata
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Detailed technical information
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                    >
                        <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} />
                    </button>
                </div>
            </div>
            <div className="p-4 md:p-6 space-y-6">
                {metadataSections?.map((section, sectionIndex) => (
                    <div
                        key={section?.title}
                        className={`
              space-y-3 pb-6 border-b border-border last:border-b-0 last:pb-0
              ${!isExpanded && sectionIndex > 1 ? 'hidden' : ''}
            `}
                    >
                        <div className="flex items-center space-x-2">
                            <Icon name={section?.icon} size={18} className="text-primary" />
                            <h4 className="font-heading font-semibold text-sm md:text-base">
                                {section?.title}
                            </h4>
                        </div>

                        <div className="space-y-2">
                            {section?.items?.map((item) => (
                                <div
                                    key={item?.label}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Icon name={item?.icon} size={14} className="text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">{item?.label}</span>
                                    </div>
                                    <span className="text-sm font-medium font-data">{item?.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {algorithmParams && (
                    <div className="pt-6 border-t border-border space-y-3">
                        <div className="flex items-center space-x-2">
                            <Icon name="Settings" size={18} className="text-primary" />
                            <h4 className="font-heading font-semibold text-sm md:text-base">
                                Algorithm Parameters
                            </h4>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Feature Method</span>
                                <span className="font-medium font-data">{algorithmParams?.featureMethod}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Distance Method</span>
                                <span className="font-medium font-data">{algorithmParams?.distanceMethod}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Similarity Threshold</span>
                                <span className="font-medium font-data">{algorithmParams?.threshold}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetadataPanel;