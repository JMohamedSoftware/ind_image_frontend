import React from 'react';
import Icon from 'components/AppIcon';

const ValidationFeedback = ({ validationStatus }) => {
    if (!validationStatus || validationStatus?.isValid) return null;

    return (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
            <div className="space-y-4">
                <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-error/10 rounded-md flex items-center justify-center flex-shrink-0">
                        <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-base md:text-lg text-error mb-2">
                            Configuration Mismatch Detected
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            The query image parameters do not match the indexed dataset configuration. This may result in inaccurate search results.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pl-13">
                    {validationStatus?.errors?.map((error, index) => (
                        <div key={index} className="flex items-start space-x-2">
                            <Icon name="X" size={14} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground font-medium">{error?.field}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{error?.message}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pl-13 pt-3 border-t border-border">
                    <div className="flex items-start space-x-2">
                        <Icon name="Info" size={14} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                            Update your configuration to match the dataset preprocessing parameters or re-index your dataset with current settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValidationFeedback;