import React from 'react';
import Icon from 'components/ui/AppIcon';
import Image from 'components/ui/AppImage';
import Button from 'components/ui/Button';

const ImagePreviewModal = ({ image, onClose }) => {
    if (!image) return null;

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024)?.toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024))?.toFixed(1)} MB`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'uploading':
                return 'text-warning bg-warning/10 border-warning';
            case 'processing':
                return 'text-primary bg-primary/10 border-primary';
            case 'complete':
                return 'text-success bg-success/10 border-success';
            case 'error':
                return 'text-error bg-error/10 border-error';
            default:
                return 'text-muted-foreground bg-muted border-border';
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
                    <div className="flex-1 min-w-0 mr-4">
                        <h2 className="font-heading font-semibold text-lg md:text-xl truncate">
                            {image?.name}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Image Preview & Details
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-muted transition-colors flex-shrink-0"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                                <Image
                                    src={image?.url}
                                    alt={image?.alt}
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>

                            {image?.progress > 0 && image?.progress < 100 && (
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Processing Progress</span>
                                        <span className="font-data text-muted-foreground">{image?.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-250"
                                            style={{ width: `${image?.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-heading font-semibold text-sm mb-3">
                                    Image Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between py-2 border-b border-border">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <div className={`
                      px-2 py-1 rounded-md border text-xs font-medium
                      ${getStatusColor(image?.status)}
                    `}>
                                            <span className="capitalize">{image?.status}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between py-2 border-b border-border">
                                        <span className="text-sm text-muted-foreground">File Size</span>
                                        <span className="text-sm font-medium font-data">
                                            {formatFileSize(image?.size)}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between py-2 border-b border-border">
                                        <span className="text-sm text-muted-foreground">Dimensions</span>
                                        <span className="text-sm font-medium font-data">
                                            {image?.dimensions}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between py-2 border-b border-border">
                                        <span className="text-sm text-muted-foreground">Format</span>
                                        <span className="text-sm font-medium uppercase">
                                            {image?.format}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between py-2">
                                        <span className="text-sm text-muted-foreground">Uploaded</span>
                                        <span className="text-sm font-medium">
                                            {new Date(image.uploadedAt)?.toLocaleString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {image?.metadata && (
                                <div>
                                    <h3 className="font-heading font-semibold text-sm mb-3">
                                        Metadata
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(image?.metadata)?.map(([key, value]) => (
                                            <div key={key} className="flex items-start justify-between py-2 border-b border-border">
                                                <span className="text-sm text-muted-foreground capitalize">
                                                    {key?.replace(/([A-Z])/g, ' $1')?.trim()}
                                                </span>
                                                <span className="text-sm font-medium text-right max-w-[60%] truncate">
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 md:p-6 border-t border-border">
                    <Button
                        variant="outline"
                        iconName="Download"
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = image?.url;
                            link.download = image?.name;
                            link?.click();
                        }}
                    >
                        Download
                    </Button>
                    <Button
                        variant="default"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewModal;
