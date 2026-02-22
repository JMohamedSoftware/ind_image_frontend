import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const BatchProcessingPanel = ({
    totalImages,
    processedImages,
    isProcessing,
    onStartProcessing,
    onCancelProcessing,
    estimatedTime
}) => {
    const progress = totalImages > 0 ? (processedImages / totalImages) * 100 : 0;

    return (
        <div className="bg-card border border-border rounded-lg shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                        <Icon
                            name={isProcessing ? "Loader2" : "Zap"}
                            size={20}
                            color="var(--color-primary)"
                            className={isProcessing ? 'animate-spin' : ''}
                        />
                    </div>
                    <div>
                        <h3 className="font-heading font-semibold text-sm md:text-base">
                            Batch Processing
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            {isProcessing
                                ? `Processing ${processedImages} of ${totalImages} images`
                                : `${totalImages} images ready for processing`
                            }
                        </p>
                    </div>
                </div>

                {!isProcessing ? (
                    <Button
                        variant="default"
                        iconName="Play"
                        iconPosition="left"
                        onClick={onStartProcessing}
                        disabled={totalImages === 0}
                    >
                        Start Processing
                    </Button>
                ) : (
                    <Button
                        variant="destructive"
                        iconName="Square"
                        iconPosition="left"
                        onClick={onCancelProcessing}
                    >
                        Cancel
                    </Button>
                )}
            </div>

            {isProcessing && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Overall Progress</span>
                        <span className="font-data text-muted-foreground">
                            {Math.round(progress)}%
                        </span>
                    </div>

                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-250"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Icon name="Clock" size={14} />
                            <span>Estimated time: {estimatedTime}</span>
                        </div>
                        <span className="font-data">
                            {processedImages}/{totalImages} completed
                        </span>
                    </div>
                </div>
            )}

            {!isProcessing && totalImages > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <div className="flex items-start gap-2">
                        <Icon name="Info" size={16} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-muted-foreground">
                            Batch processing will apply preprocessing settings to all uploaded images and prepare them for feature extraction.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchProcessingPanel;