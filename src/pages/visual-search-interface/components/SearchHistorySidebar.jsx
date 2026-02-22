import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/ui/AppImage';
import Button from 'components/ui/Button';

const SearchHistorySidebar = ({
    isOpen,
    onToggle,
    searchHistory,
    onRerunSearch,
    onClearHistory
}) => {
    const formatTimestamp = (date) => {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <>
            <button
                onClick={onToggle}
                className="fixed right-4 top-24 z-50 lg:hidden w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-250"
                aria-label="Toggle search history"
            >
                <Icon name={isOpen ? 'X' : 'History'} size={20} />
            </button>
            <div className={`
        fixed lg:relative inset-y-0 right-0 z-40
        w-80 bg-card border-l border-border shadow-xl lg:shadow-none
        transform transition-transform duration-250 ease-smooth
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
                <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Icon name="History" size={20} color="var(--color-primary)" />
                            <h3 className="font-heading font-semibold text-base text-foreground">
                                Search History
                            </h3>
                        </div>
                        <button
                            onClick={onToggle}
                            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Icon name="X" size={18} />
                        </button>
                    </div>

                    {searchHistory?.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            iconName="Trash2"
                            iconPosition="left"
                            onClick={onClearHistory}
                        >
                            Clear History
                        </Button>
                    )}
                </div>

                <div className="p-4">
                    {searchHistory?.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon name="Search" size={24} color="var(--color-muted-foreground)" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No search history yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your recent searches will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {searchHistory?.map((item) => (
                                <div
                                    key={item?.id}
                                    className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                                    onClick={() => onRerunSearch(item)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="w-16 h-16 bg-background rounded-md overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item?.queryImage}
                                                alt={`Search history thumbnail showing ${item?.algorithm} query from ${formatTimestamp(item?.timestamp)}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <span className="text-xs font-data text-muted-foreground">
                                                    {formatTimestamp(item?.timestamp)}
                                                </span>
                                                <Icon
                                                    name="RotateCw"
                                                    size={14}
                                                    className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center space-x-1">
                                                    <Icon name="Cpu" size={12} color="var(--color-primary)" />
                                                    <span className="text-xs text-foreground font-medium truncate">
                                                        {item?.algorithm}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-1">
                                                    <Icon name="Target" size={12} color="var(--color-primary)" />
                                                    <span className="text-xs text-muted-foreground truncate">
                                                        {item?.similarityMethod}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-1">
                                                    <Icon name="Image" size={12} color="var(--color-success)" />
                                                    <span className="text-xs text-success font-data">
                                                        {item?.resultsCount} matches
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onToggle}
                />
            )}
        </>
    );
};

export default SearchHistorySidebar;