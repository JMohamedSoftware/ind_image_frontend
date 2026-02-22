import React from 'react';
import Icon from 'components/AppIcon';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';

const AlgorithmConfiguration = ({
    config,
    onConfigChange,
    isProcessing
}) => {
    const featureExtractionOptions = [
        {
            value: 'ORB',
            label: 'ORB (Oriented FAST)',
            description: 'Fast keypoint detection and description'
        },
        {
            value: 'SIFT',
            label: 'SIFT (Scale-Invariant)',
            description: 'Robust to scale and rotation changes'
        },
        {
            value: 'SURF',
            label: 'SURF (Speeded-Up)',
            description: 'Faster alternative to SIFT'
        },
        {
            value: 'ColorHistogram',
            label: 'Color Histogram',
            description: 'Color distribution analysis'
        },
        {
            value: 'HOG',
            label: 'HOG (Histogram of Gradients)',
            description: 'Edge and gradient patterns'
        }
    ];

    const similarityMethodOptions = [
        {
            value: 'Euclidean',
            label: 'Euclidean Distance',
            description: 'Straight-line distance between vectors'
        },
        {
            value: 'Cosine',
            label: 'Cosine Similarity',
            description: 'Angular similarity between vectors'
        },
        {
            value: 'Manhattan',
            label: 'Manhattan Distance',
            description: 'Sum of absolute differences'
        }
    ];

    const vectorLengthOptions = [
        { value: '128', label: '128 dimensions' },
        { value: '256', label: '256 dimensions' },
        { value: '512', label: '512 dimensions' },
        { value: '1024', label: '1024 dimensions' }
    ];

    return (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 lg:p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                    <Icon name="Settings" size={20} color="var(--color-primary)" />
                </div>
                <h2 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
                    Algorithm Configuration
                </h2>
            </div>
            <div className="space-y-4 md:space-y-6">
                <Select
                    label="Feature Extraction Method"
                    description="Choose the algorithm for extracting visual features"
                    options={featureExtractionOptions}
                    value={config?.featureMethod}
                    onChange={(value) => onConfigChange('featureMethod', value)}
                    disabled={isProcessing}
                    required
                />

                <Select
                    label="Similarity Matching Method"
                    description="Select the distance metric for comparing images"
                    options={similarityMethodOptions}
                    value={config?.similarityMethod}
                    onChange={(value) => onConfigChange('similarityMethod', value)}
                    disabled={isProcessing}
                    required
                />

                <Select
                    label="Feature Vector Length"
                    description="Unified length for all feature vectors"
                    options={vectorLengthOptions}
                    value={config?.vectorLength}
                    onChange={(value) => onConfigChange('vectorLength', value)}
                    disabled={isProcessing}
                    required
                />

                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Icon name="Sparkles" size={18} color="var(--color-primary)" />
                            <span className="font-medium text-sm md:text-base text-foreground">
                                Advanced Options
                            </span>
                        </div>
                    </div>

                    <Checkbox
                        label="Enable PCA Dimensionality Reduction"
                        description="Reduce feature vector dimensions while preserving variance"
                        checked={config?.enablePCA}
                        onChange={(e) => onConfigChange('enablePCA', e?.target?.checked)}
                        disabled={isProcessing}
                    />

                    {config?.enablePCA && (
                        <div className="pl-6 space-y-3 border-l-2 border-primary/20">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    PCA Components: {config?.pcaComponents}
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="10"
                                    value={config?.pcaComponents}
                                    onChange={(e) => onConfigChange('pcaComponents', parseInt(e?.target?.value))}
                                    disabled={isProcessing}
                                    className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>10</span>
                                    <span>100</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Variance Threshold: {config?.varianceThreshold}%
                                </label>
                                <input
                                    type="range"
                                    min="80"
                                    max="99"
                                    step="1"
                                    value={config?.varianceThreshold}
                                    onChange={(e) => onConfigChange('varianceThreshold', parseInt(e?.target?.value))}
                                    disabled={isProcessing}
                                    className="w-full accent-primary"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>80%</span>
                                    <span>99%</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                        <Icon name="Info" size={18} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium mb-1">
                                Configuration Requirements
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Query image must match the preprocessing parameters used during dataset indexing. Mismatched configurations may produce inaccurate results.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlgorithmConfiguration;