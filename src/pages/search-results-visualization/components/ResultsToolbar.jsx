import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ResultsToolbar = ({ onSort, onExport, onShare, resultsCount }) => {
    const [sortBy, setSortBy] = useState('similarity');
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const sortOptions = [
        { value: 'similarity', label: 'Similarity Score', icon: 'TrendingUp' },
        { value: 'confidence', label: 'Confidence Level', icon: 'Target' },
        { value: 'distance', label: 'Feature Distance', icon: 'Ruler' },
        { value: 'rank', label: 'Ranking Position', icon: 'Hash' }
    ];

    const exportFormats = [
        { value: 'json', label: 'JSON Data', icon: 'FileJson', description: 'Raw result data' },
        { value: 'csv', label: 'CSV Report', icon: 'FileSpreadsheet', description: 'Tabular format' },
        { value: 'pdf', label: 'PDF Report', icon: 'FileText', description: 'Visual report' },
        { value: 'images', label: 'Image Archive', icon: 'Archive', description: 'ZIP with images' }
    ];

    const shareOptions = [
        { value: 'link', label: 'Share Link', icon: 'Link', description: 'Generate shareable URL' },
        { value: 'email', label: 'Email Report', icon: 'Mail', description: 'Send via email' },
        { value: 'clipboard', label: 'Copy Results', icon: 'Clipboard', description: 'Copy to clipboard' }
    ];

    const handleSortChange = (value) => {
        setSortBy(value);
        onSort(value);
    };

    const handleExport = (format) => {
        onExport(format);
        setShowExportMenu(false);
    };

    const handleShare = (method) => {
        onShare(method);
        setShowShareMenu(false);
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <Icon name="Filter" size={20} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Sort by:</span>
                    </div>
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                        {sortOptions?.map((option) => (
                            <button
                                key={option?.value}
                                onClick={() => handleSortChange(option?.value)}
                                className={`
                  flex items-center space-x-1.5 px-3 py-1.5 rounded-md whitespace-nowrap
                  transition-all duration-250 text-sm
                  ${sortBy === option?.value
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-foreground hover:bg-muted/80'
                                    }
                `}
                            >
                                <Icon name={option?.icon} size={14} />
                                <span>{option?.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Button
                            variant="outline"
                            iconName="Download"
                            iconPosition="left"
                            onClick={() => setShowExportMenu(!showExportMenu)}
                        >
                            Export
                        </Button>

                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-100">
                                <div className="p-2 space-y-1">
                                    {exportFormats?.map((format) => (
                                        <button
                                            key={format?.value}
                                            onClick={() => handleExport(format?.value)}
                                            className="w-full flex items-start space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-left"
                                        >
                                            <Icon name={format?.icon} size={18} className="text-primary mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{format?.label}</p>
                                                <p className="text-xs text-muted-foreground">{format?.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Button
                            variant="outline"
                            iconName="Share2"
                            iconPosition="left"
                            onClick={() => setShowShareMenu(!showShareMenu)}
                        >
                            Share
                        </Button>

                        {showShareMenu && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-100">
                                <div className="p-2 space-y-1">
                                    {shareOptions?.map((option) => (
                                        <button
                                            key={option?.value}
                                            onClick={() => handleShare(option?.value)}
                                            className="w-full flex items-start space-x-3 p-3 rounded-md hover:bg-muted transition-colors text-left"
                                        >
                                            <Icon name={option?.icon} size={18} className="text-primary mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{option?.label}</p>
                                                <p className="text-xs text-muted-foreground">{option?.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="default"
                        iconName="Search"
                        iconPosition="left"
                    >
                        New Search
                    </Button>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                        <Icon name="Info" size={16} />
                        <span className="font-data">
                            Showing {resultsCount} results • Sorted by {sortOptions?.find(o => o?.value === sortBy)?.label}
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                            <Icon name="Bookmark" size={16} />
                            <span>Save Query</span>
                        </button>
                        <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                            <Icon name="RefreshCw" size={16} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsToolbar;