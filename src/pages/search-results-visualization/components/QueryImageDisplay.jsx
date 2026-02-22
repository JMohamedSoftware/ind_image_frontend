import React from 'react';
import Image from 'components/ui/AppImage';
import Icon from 'components/AppIcon';

const QueryImageDisplay = ({ queryImage }) => {
    return (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Icon name="Search" size={20} className="text-primary" />
                    <h3 className="font-heading font-semibold text-lg md:text-xl">
                        Query Image
                    </h3>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-success/10 text-success rounded-md text-xs font-medium">
                        Processed
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border-2 border-primary/20">
                    <Image
                        src={queryImage?.image}
                        alt={queryImage?.imageAlt}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                        <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center space-x-1">
                            <Icon name="Eye" size={14} className="text-primary" />
                            <span className="text-xs font-medium font-data">Original</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center space-x-2 mb-1">
                            <Icon name="File" size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Filename</span>
                        </div>
                        <p className="text-sm font-medium font-data truncate">{queryImage?.filename}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center space-x-2 mb-1">
                            <Icon name="Maximize2" size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Dimensions</span>
                        </div>
                        <p className="text-sm font-medium font-data">{queryImage?.dimensions}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center space-x-2 mb-1">
                            <Icon name="Target" size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Keypoints</span>
                        </div>
                        <p className="text-sm font-medium font-data">{queryImage?.keypoints}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md">
                        <div className="flex items-center space-x-2 mb-1">
                            <Icon name="Clock" size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Processed</span>
                        </div>
                        <p className="text-sm font-medium font-data">{queryImage?.processingTime}</p>
                    </div>
                </div>

                <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Feature Extraction</span>
                        <span className="font-medium font-data text-primary">{queryImage?.algorithm}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryImageDisplay;