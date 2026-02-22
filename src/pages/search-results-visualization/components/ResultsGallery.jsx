import React from 'react';
import Image from 'components/ui/AppImage';
import Icon from 'components/AppIcon';

const ResultsGallery = ({ results, onResultClick, selectedResult }) => {
    const getRankColor = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-warning text-warning-foreground';
            case 2:
                return 'bg-primary text-primary-foreground';
            case 3:
                return 'bg-secondary text-secondary-foreground';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 90) return 'text-success';
        if (confidence >= 70) return 'text-warning';
        return 'text-error';
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-xl md:text-2xl lg:text-3xl">
                    Top 5 Similar Images
                </h2>
                <div className="flex items-center space-x-2">
                    <Icon name="TrendingUp" size={20} className="text-success" />
                    <span className="text-sm md:text-base font-data text-muted-foreground">
                        {results?.length} Results
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                {results?.map((result) => (
                    <div
                        key={result?.id}
                        onClick={() => onResultClick(result)}
                        className={`
              relative bg-card border-2 rounded-lg overflow-hidden cursor-pointer
              transition-all duration-250 hover:shadow-lg hover:-translate-y-1
              ${selectedResult?.id === result?.id
                                ? 'border-primary shadow-md'
                                : 'border-border hover:border-primary/50'
                            }
            `}
                    >
                        <div className="absolute top-2 left-2 z-10">
                            <div className={`
                ${getRankColor(result?.rank)} 
                px-2 py-1 rounded-md font-heading font-bold text-xs md:text-sm
                shadow-sm
              `}>
                                #{result?.rank}
                            </div>
                        </div>

                        <div className="absolute top-2 right-2 z-10">
                            <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md">
                                <Icon name="Star" size={14} className="text-warning" />
                            </div>
                        </div>

                        <div className="aspect-[3/4] overflow-hidden">
                            <Image
                                src={result?.image}
                                alt={result?.imageAlt}
                                className="w-full h-full object-cover transition-transform duration-250 hover:scale-110"
                            />
                        </div>

                        <div className="p-3 md:p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                                    Similarity Score
                                </span>
                                <span className={`
                  text-base md:text-lg font-heading font-bold font-data
                  ${getConfidenceColor(result?.similarityScore)}
                `}>
                                    {result?.similarityScore}%
                                </span>
                            </div>

                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${result?.similarityScore >= 90 ? 'bg-success' :
                                        result?.similarityScore >= 70 ? 'bg-warning' : 'bg-error'
                                        }`}
                                    style={{ width: `${result?.similarityScore}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                    <Icon name="Zap" size={12} />
                                    <span className="font-data">{result?.confidence}%</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Icon name="Target" size={12} />
                                    <span className="font-data">{result?.distance?.toFixed(3)}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground truncate">
                                    {result?.filename}
                                </p>
                            </div>
                        </div>

                        {selectedResult?.id === result?.id && (
                            <div className="absolute inset-0 border-4 border-primary rounded-lg pointer-events-none" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultsGallery;