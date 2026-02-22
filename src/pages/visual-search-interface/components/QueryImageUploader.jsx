import React, { useState, useRef } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/ui/AppImage';
import Button from 'components/ui/Button';

const QueryImageUploader = ({ onImageSelect, selectedImage, onClearImage }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
    };

    const handleDrop = (e) => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsDragging(false);

        const files = e?.dataTransfer?.files;
        if (files && files?.length > 0) {
            const file = files?.[0];
            if (file?.type?.startsWith('image/')) {
                handleImageFile(file);
            }
        }
    };

    const handleFileSelect = (e) => {
        const files = e?.target?.files;
        if (files && files?.length > 0) {
            handleImageFile(files?.[0]);
        }
    };

    const handleImageFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            onImageSelect({
                file: file,
                preview: e?.target?.result,
                name: file?.name,
                size: file?.size,
                type: file?.type
            });
        };
        reader?.readAsDataURL(file);
    };

    const handleBrowseClick = () => {
        fileInputRef?.current?.click();
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024)?.toFixed(1) + ' KB';
        return (bytes / (1024 * 1024))?.toFixed(1) + ' MB';
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 lg:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl text-foreground">
                    Query Image
                </h2>
                {selectedImage && (
                    <Button
                        variant="ghost"
                        size="sm"
                        iconName="X"
                        onClick={onClearImage}
                    >
                        Clear
                    </Button>
                )}
            </div>
            {!selectedImage ? (
                <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative border-2 border-dashed rounded-lg p-8 md:p-12 lg:p-16
            transition-all duration-250 cursor-pointer
            ${isDragging
                            ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
                        }
          `}
                    onClick={handleBrowseClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center space-y-4 md:space-y-6">
                        <div className={`
              w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center
              transition-all duration-250
              ${isDragging ? 'bg-primary/20' : 'bg-primary/10'}
            `}>
                            <Icon
                                name="Upload"
                                size={32}
                                color="var(--color-primary)"
                                className="md:w-10 md:h-10 lg:w-12 lg:h-12"
                            />
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-sm md:text-base lg:text-lg font-medium text-foreground">
                                {isDragging ? 'Drop image here' : 'Drag & drop query image'}
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                or click to browse files
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                                <Icon name="FileImage" size={14} />
                                <span>JPG, PNG, WebP</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                                <Icon name="HardDrive" size={14} />
                                <span>Max 10MB</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 md:space-y-6">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        <Image
                            src={selectedImage?.preview}
                            alt="Selected query image for visual similarity search showing uploaded content"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                                <Icon name="FileImage" size={18} color="var(--color-primary)" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground">File Name</p>
                                <p className="text-sm font-medium text-foreground truncate">
                                    {selectedImage?.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                                <Icon name="HardDrive" size={18} color="var(--color-primary)" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-muted-foreground">File Size</p>
                                <p className="text-sm font-medium text-foreground font-data">
                                    {formatFileSize(selectedImage?.size)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueryImageUploader;