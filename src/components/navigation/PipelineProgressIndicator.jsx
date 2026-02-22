import React from 'react';
import Icon from '../AppIcon';

const PipelineProgressIndicator = ({
    uploadStatus = 'idle',
    searchStatus = 'idle',
    resultsStatus = 'idle',
    uploadProgress = 0,
    searchProgress = 0,
    resultsProgress = 0
}) => {
    const stages = [
        {
            id: 'upload',
            label: 'Upload',
            icon: 'Upload',
            status: uploadStatus,
            progress: uploadProgress,
            description: 'Dataset preparation'
        },
        {
            id: 'search',
            label: 'Search',
            icon: 'Search',
            status: searchStatus,
            progress: searchProgress,
            description: 'Feature extraction'
        },
        {
            id: 'results',
            label: 'Results',
            icon: 'BarChart3',
            status: resultsStatus,
            progress: resultsProgress,
            description: 'Analysis complete'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-warning border-warning bg-warning/10';
            case 'complete':
                return 'text-success border-success bg-success/10';
            case 'error':
                return 'text-error border-error bg-error/10';
            default:
                return 'text-muted-foreground border-border bg-muted/50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return 'Loader2';
            case 'complete':
                return 'CheckCircle2';
            case 'error':
                return 'XCircle';
            default:
                return 'Circle';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-sm">Pipeline Progress</h3>
                <div className="flex items-center space-x-1">
                    {stages?.filter(s => s?.status === 'complete')?.length > 0 && (
                        <span className="text-xs text-muted-foreground font-data">
                            {stages?.filter(s => s?.status === 'complete')?.length}/{stages?.length} Complete
                        </span>
                    )}
                </div>
            </div>
            <div className="space-y-3">
                {stages?.map((stage, index) => (
                    <div key={stage?.id} className="relative">
                        <div className="flex items-center space-x-3">
                            <div className={`
                w-10 h-10 rounded-md border-2 flex items-center justify-center
                transition-all duration-250 ${getStatusColor(stage?.status)}
              `}>
                                <Icon
                                    name={stage?.status === 'idle' ? stage?.icon : getStatusIcon(stage?.status)}
                                    size={18}
                                    className={stage?.status === 'active' ? 'animate-spin' : ''}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{stage?.label}</span>
                                    {stage?.status === 'active' && stage?.progress > 0 && (
                                        <span className="text-xs font-data text-muted-foreground">
                                            {stage?.progress}%
                                        </span>
                                    )}
                                </div>

                                <p className="text-xs text-muted-foreground truncate">
                                    {stage?.description}
                                </p>

                                {stage?.status === 'active' && stage?.progress > 0 && (
                                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-warning rounded-full transition-all duration-250"
                                            style={{ width: `${stage?.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {index < stages?.length - 1 && (
                            <div className={`
                absolute left-5 top-10 w-0.5 h-3 
                ${stage?.status === 'complete' ? 'bg-success' : 'bg-border'}
                transition-colors duration-250
              `} />
                        )}
                    </div>
                ))}
            </div>
            {stages?.some(s => s?.status === 'error') && (
                <div className="mt-4 p-3 bg-error/10 border border-error rounded-md">
                    <div className="flex items-start space-x-2">
                        <Icon name="AlertCircle" size={16} color="var(--color-error)" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-error font-medium">Processing Error</p>
                            <p className="text-xs text-error/80 mt-0.5">
                                Check algorithm configuration and retry
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PipelineProgressIndicator;