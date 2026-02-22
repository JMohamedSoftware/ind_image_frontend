import React from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const SearchExecutionPanel = ({
    onSearch,
    isProcessing,
    progress,
    estimatedTime,
    canSearch
}) => {
    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 lg:p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-10 h-10 bg-success/10 rounded-md flex items-center justify-center">
                    <Icon name="Play" size={20} color="var(--color-success)" />
                </div>
                <h2 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
                    Search Execution
                </h2>
            </div>
            <div className="space-y-4 md:space-y-6">
                {!isProcessing ? (
                    <>
                        <Button
                            variant="default"
                            size="lg"
                            fullWidth
                            iconName="Search"
                            iconPosition="left"
                            onClick={onSearch}
                            disabled={!canSearch}
                        >
                            Execute Visual Search
                        </Button>

                        {!canSearch && (
                            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <Icon name="AlertCircle" size={16} color="var(--color-warning)" className="flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-warning">
                                        Please upload a query image to begin search
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Icon name="Database" size={16} color="var(--color-primary)" />
                                    <span className="text-xs text-muted-foreground">Indexed Images</span>
                                </div>
                                <p className="text-xl md:text-2xl font-semibold text-foreground font-data">
                                    1,247
                                </p>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Icon name="Clock" size={16} color="var(--color-primary)" />
                                    <span className="text-xs text-muted-foreground">Est. Time</span>
                                </div>
                                <p className="text-xl md:text-2xl font-semibold text-foreground font-data">
                                    ~2.5s
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                                Processing Search Query
                            </span>
                            <span className="text-sm font-data text-muted-foreground">
                                {progress}%
                            </span>
                        </div>

                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-250"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                                <Icon name="Loader2" size={16} color="var(--color-primary)" className="animate-spin" />
                                <span className="text-xs text-muted-foreground">Extracting features</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Icon name="Clock" size={16} color="var(--color-primary)" />
                                <span className="text-xs text-muted-foreground">
                                    {formatTime(estimatedTime)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: 'Feature extraction', status: progress > 30 ? 'complete' : 'active' },
                                { label: 'Vector comparison', status: progress > 60 ? 'complete' : progress > 30 ? 'active' : 'pending' },
                                { label: 'Ranking results', status: progress > 90 ? 'complete' : progress > 60 ? 'active' : 'pending' }
                            ]?.map((step, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    {step?.status === 'complete' && (
                                        <Icon name="CheckCircle2" size={14} color="var(--color-success)" />
                                    )}
                                    {step?.status === 'active' && (
                                        <Icon name="Loader2" size={14} color="var(--color-primary)" className="animate-spin" />
                                    )}
                                    {step?.status === 'pending' && (
                                        <Icon name="Circle" size={14} color="var(--color-muted-foreground)" />
                                    )}
                                    <span className={`text-xs ${step?.status === 'complete' ? 'text-success' :
                                        step?.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                                        }`}>
                                        {step?.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchExecutionPanel;