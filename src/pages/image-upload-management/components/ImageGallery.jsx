import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/ui/AppImage';
import Button from 'components/ui/Button';

const ImageGallery = ({
    images,
    selectedImages,
    onSelectImage,
    onRemoveImage,
    onPreviewImage,
    onSelectAll,
    onDeselectAll,
    onRemoveSelected
}) => {
    const [viewMode, setViewMode] = useState('grid');

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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'uploading':
                return 'Upload';
            case 'processing':
                return 'Loader2';
            case 'complete':
                return 'CheckCircle2';
            case 'error':
                return 'XCircle';
            default:
                return 'Clock';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024)?.toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024))?.toFixed(1)} MB`;
    };

    if (images?.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-8 md:p-12 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center">
                        <Icon name="ImageOff" size={32} color="var(--color-muted-foreground)" />
                    </div>
                </div>
                <h3 className="font-heading font-semibold text-base md:text-lg mb-2">
                    No Images Uploaded
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                    Upload images to start building your dataset
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                        {images?.length} {images?.length === 1 ? 'Image' : 'Images'}
                    </span>
                    {selectedImages?.length > 0 && (
                        <span className="text-sm text-muted-foreground">
                            ({selectedImages?.length} selected)
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedImages?.length > 0 ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                iconName="X"
                                onClick={onDeselectAll}
                            >
                                Deselect All
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                iconName="Trash2"
                                onClick={onRemoveSelected}
                            >
                                Delete Selected
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            iconName="CheckSquare"
                            onClick={onSelectAll}
                        >
                            Select All
                        </Button>
                    )}

                    <div className="flex items-center gap-1 ml-2 border border-border rounded-md">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-l-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                }`}
                        >
                            <Icon name="Grid3x3" size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-r-md transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                }`}
                        >
                            <Icon name="List" size={16} />
                        </button>
                    </div>
                </div>
            </div>
            <div className={
                viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'
            }>
                {images?.map((image) => {
                    const isSelected = selectedImages?.includes(image?.id);

                    return (
                        <div
                            key={image?.id}
                            className={`
                bg-card border-2 rounded-lg overflow-hidden transition-all duration-250
                ${isSelected
                                    ? 'border-primary shadow-md'
                                    : 'border-border hover:border-primary/50 hover:shadow-sm'
                                }
              `}
                        >
                            {viewMode === 'grid' ? (
                                <>
                                    <div className="relative aspect-square bg-muted overflow-hidden group">
                                        <Image
                                            src={image?.url}
                                            alt={image?.alt}
                                            className="w-full h-full object-cover"
                                        />

                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-250">
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    iconName="Eye"
                                                    onClick={() => onPreviewImage(image)}
                                                >
                                                    Preview
                                                </Button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => onSelectImage(image?.id)}
                                            className={`
                        absolute top-3 left-3 w-6 h-6 rounded-md border-2 flex items-center justify-center
                        transition-all duration-250
                        ${isSelected
                                                    ? 'bg-primary border-primary' : 'bg-white/90 border-white hover:bg-white'
                                                }
                      `}
                                        >
                                            {isSelected && (
                                                <Icon name="Check" size={14} color="var(--color-primary-foreground)" />
                                            )}
                                        </button>

                                        <div className={`
                      absolute top-3 right-3 px-2 py-1 rounded-md border text-xs font-medium
                      ${getStatusColor(image?.status)}
                    `}>
                                            <div className="flex items-center gap-1">
                                                <Icon
                                                    name={getStatusIcon(image?.status)}
                                                    size={12}
                                                    className={image?.status === 'processing' ? 'animate-spin' : ''}
                                                />
                                                <span className="capitalize">{image?.status}</span>
                                            </div>
                                        </div>

                                        {image?.progress > 0 && image?.progress < 100 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                                <div
                                                    className="h-full bg-primary transition-all duration-250"
                                                    style={{ width: `${image?.progress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3">
                                        <h4 className="font-medium text-sm truncate mb-1" title={image?.name}>
                                            {image?.name}
                                        </h4>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="font-data">{formatFileSize(image?.size)}</span>
                                            <span>{image?.dimensions}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-4 p-4">
                                    <button
                                        onClick={() => onSelectImage(image?.id)}
                                        className={`
                      w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                      transition-all duration-250
                      ${isSelected
                                                ? 'bg-primary border-primary' : 'border-border hover:border-primary'
                                            }
                    `}
                                    >
                                        {isSelected && (
                                            <Icon name="Check" size={12} color="var(--color-primary-foreground)" />
                                        )}
                                    </button>

                                    <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                        <Image
                                            src={image?.url}
                                            alt={image?.alt}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm truncate mb-1" title={image?.name}>
                                            {image?.name}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="font-data">{formatFileSize(image?.size)}</span>
                                            <span>{image?.dimensions}</span>
                                        </div>
                                    </div>

                                    <div className={`
                    px-3 py-1.5 rounded-md border text-xs font-medium flex-shrink-0
                    ${getStatusColor(image?.status)}
                  `}>
                                        <div className="flex items-center gap-1.5">
                                            <Icon
                                                name={getStatusIcon(image?.status)}
                                                size={12}
                                                className={image?.status === 'processing' ? 'animate-spin' : ''}
                                            />
                                            <span className="capitalize hidden sm:inline">{image?.status}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            iconName="Eye"
                                            onClick={() => onPreviewImage(image)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            iconName="Trash2"
                                            onClick={() => onRemoveImage(image?.id)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImageGallery;