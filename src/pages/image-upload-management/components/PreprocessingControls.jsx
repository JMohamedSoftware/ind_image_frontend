import React from 'react';
import Icon from 'components/AppIcon';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';

const PreprocessingControls = ({
    config,
    onConfigChange,
    isExpanded,
    onToggleExpand
}) => {
    const resizeOptions = [
        { value: 'none', label: 'Original Size' },
        { value: '224x224', label: '224×224 (Standard)' },
        { value: '256x256', label: '256×256 (Medium)' },
        { value: '512x512', label: '512×512 (Large)' },
        { value: 'custom', label: 'Custom Size' }
    ];

    const qualityOptions = [
        { value: 'high', label: 'High Quality (95%)' },
        { value: 'medium', label: 'Medium Quality (85%)' },
        { value: 'low', label: 'Low Quality (75%)' }
    ];

    const formatOptions = [
        { value: 'original', label: 'Keep Original' },
        { value: 'jpg', label: 'Convert to JPG' },
        { value: 'png', label: 'Convert to PNG' },
        { value: 'webp', label: 'Convert to WebP' }
    ];

    return (
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <button
                onClick={onToggleExpand}
                className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                        <Icon name="Settings" size={20} color="var(--color-primary)" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-heading font-semibold text-sm md:text-base">
                            Preprocessing Configuration
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Configure image preprocessing parameters
                        </p>
                    </div>
                </div>
                <Icon
                    name={isExpanded ? "ChevronUp" : "ChevronDown"}
                    size={20}
                    color="var(--color-muted-foreground)"
                />
            </button>
            {isExpanded && (
                <div className="px-4 md:px-6 pb-6 space-y-4 md:space-y-6 border-t border-border pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <Select
                            label="Resize Images"
                            description="Target dimensions for uploaded images"
                            options={resizeOptions}
                            value={config?.resize}
                            onChange={(value) => onConfigChange('resize', value)}
                        />

                        <Select
                            label="Image Quality"
                            description="Compression quality for processing"
                            options={qualityOptions}
                            value={config?.quality}
                            onChange={(value) => onConfigChange('quality', value)}
                        />

                        <Select
                            label="Output Format"
                            description="Convert images to specific format"
                            options={formatOptions}
                            value={config?.format}
                            onChange={(value) => onConfigChange('format', value)}
                        />

                        <div className="space-y-3">
                            <label className="block text-sm font-medium">
                                Additional Options
                            </label>
                            <div className="space-y-2">
                                <Checkbox
                                    label="Auto-rotate based on EXIF"
                                    description="Correct image orientation automatically"
                                    checked={config?.autoRotate}
                                    onChange={(e) => onConfigChange('autoRotate', e?.target?.checked)}
                                />
                                <Checkbox
                                    label="Remove metadata"
                                    description="Strip EXIF data for privacy"
                                    checked={config?.removeMetadata}
                                    onChange={(e) => onConfigChange('removeMetadata', e?.target?.checked)}
                                />
                                <Checkbox
                                    label="Normalize colors"
                                    description="Apply color normalization"
                                    checked={config?.normalizeColors}
                                    onChange={(e) => onConfigChange('normalizeColors', e?.target?.checked)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="Info" size={16} />
                            <span>
                                Preprocessing will be applied automatically during upload
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreprocessingControls;