import React, { useState, useRef } from 'react';
import Icon from 'components/ui/AppIcon';
import Button from 'components/ui/Button';

const UploadZone = ({ onFilesSelected, isProcessing }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

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

        const files = Array.from(e?.dataTransfer?.files)?.filter(file =>
            file?.type?.startsWith('image/')
        );

        if (files?.length > 0) {
            onFilesSelected(files);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e?.target?.files)?.filter(file =>
            file?.type?.startsWith('image/')
        );

        if (files?.length > 0) {
            onFilesSelected(files);
        }
        e.target.value = '';
    };

    const handleFolderSelect = (e) => {
        const files = Array.from(e?.target?.files)?.filter(file =>
            file?.type?.startsWith('image/')
        );

        if (files?.length > 0) {
            onFilesSelected(files);
        }
        e.target.value = '';
    };

    return (
        <div className="w-full">
            <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-lg transition-all duration-250
          ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
                    }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <div className="p-8 md:p-12 lg:p-16 text-center">
                    <div className="flex justify-center mb-4 md:mb-6">
                        <div className={`
              w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center
              transition-all duration-250
              ${isDragging ? 'bg-primary/20 scale-110' : 'bg-primary/10'}
            `}>
                            <Icon
                                name={isDragging ? "Upload" : "ImagePlus"}
                                size={32}
                                color="var(--color-primary)"
                                className={isDragging ? 'animate-bounce' : ''}
                            />
                        </div>
                    </div>

                    <h3 className="font-heading font-semibold text-lg md:text-xl lg:text-2xl mb-2 md:mb-3">
                        {isDragging ? 'Drop images here' : 'Upload Image Dataset'}
                    </h3>

                    <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto">
                        Drag and drop images or folders, or click to browse. Supports JPG, PNG, WebP formats.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                        <Button
                            variant="default"
                            iconName="Upload"
                            iconPosition="left"
                            onClick={() => fileInputRef?.current?.click()}
                            disabled={isProcessing}
                        >
                            Select Images
                        </Button>

                        <Button
                            variant="outline"
                            iconName="FolderOpen"
                            iconPosition="left"
                            onClick={() => folderInputRef?.current?.click()}
                            disabled={isProcessing}
                        >
                            Select Folder
                        </Button>
                    </div>

                    <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Icon name="CheckCircle2" size={16} color="var(--color-success)" />
                            <span>Batch Upload</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="CheckCircle2" size={16} color="var(--color-success)" />
                            <span>Auto Preprocessing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="CheckCircle2" size={16} color="var(--color-success)" />
                            <span>Max 50MB per file</span>
                        </div>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <input
                    ref={folderInputRef}
                    type="file"
                    accept="image/*"
                    webkitdirectory=""
                    directory=""
                    multiple
                    onChange={handleFolderSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default UploadZone;