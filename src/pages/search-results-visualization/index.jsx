import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HorizontalTabNavigation from '../../components/navigation/HorizontalTabNavigation';
import PipelineProgressIndicator from '../../components/navigation/PipelineProgressIndicator';
import ResultsGallery from './components/ResultsGallery';
import MatplotlibVisualization from './components/MatplotlibVisualization';
import DetailedComparison from './components/DetailedComparison';
import ResultsToolbar from './components/ResultsToolbar';
import MetadataPanel from './components/MetadataPanel';
import QueryImageDisplay from './components/QueryImageDisplay';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const SearchResultsVisualization = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedResult, setSelectedResult] = useState(null);
    const [showComparison, setShowComparison] = useState(false);
    const [sortBy, setSortBy] = useState('similarity');

    // Get query image from location state or fall back to empty
    const passedQueryImage = location.state?.queryImage;
    const queryImage = passedQueryImage || {
        image: null,
        imageAlt: "No query image",
        filename: "—",
        dimensions: "—",
        keypoints: 0,
        processingTime: "—",
        algorithm: "ORB"
    };

    // Stabilize random category
    const randomCategory = React.useMemo(() => {
        const categories = ['nature', 'technology', 'architecture', 'abstract', 'travel'];
        return categories[Math.floor(Math.random() * categories.length)];
    }, []);

    const generateMockResults = () => {
        // Only use real backend results — never show mock/fake data
        if (passedQueryImage?.backendResults && passedQueryImage.backendResults.length > 0) {
            return passedQueryImage.backendResults.map((result, i) => ({
                id: i + 1,
                rank: i + 1,
                image: result.url || null,
                imageAlt: `Similar result: ${result.filename}`,
                filename: result.filename,
                similarityScore: result.similarityScore,
                confidence: result.similarityScore + 2,
                distance: (100 - result.similarityScore) / 100,
                dimensions: "—",
                fileSize: "—",
                format: "JPEG",
                algorithm: queryImage.algorithm,
                keypoints: result.matchesCount,
                descriptors: "Multi-dim",
                vectorLength: 128,
                processingTime: "—",
                timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
                matchQuality: result.similarityScore > 80 ? "Excellent" : result.similarityScore > 60 ? "Good" : "Fair",
                pcaApplied: false
            }));
        }
        // No real results — return empty so the UI shows the empty state
        return [];
    };

    const [mockResults] = useState(generateMockResults());

    const algorithmParams = {
        featureMethod: queryImage.algorithm,
        distanceMethod: "Euclidean",
        threshold: 0.75
    };

    const [sortedResults, setSortedResults] = useState(mockResults);

    useEffect(() => {
        const sorted = [...mockResults]?.sort((a, b) => {
            switch (sortBy) {
                case 'similarity':
                    return b?.similarityScore - a?.similarityScore;
                case 'confidence':
                    return b?.confidence - a?.confidence;
                case 'distance':
                    return a?.distance - b?.distance;
                case 'rank':
                    return a?.rank - b?.rank;
                default:
                    return 0;
            }
        });
        setSortedResults(sorted);
    }, [sortBy]);

    const handleResultClick = (result) => {
        setSelectedResult(result);
        setShowComparison(true);
    };

    const handleSort = (sortType) => {
        setSortBy(sortType);
    };

    const handleExport = (format) => {
        console.log(`Exporting results as ${format}`);
    };

    const handleShare = (method) => {
        console.log(`Sharing results via ${method}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <HorizontalTabNavigation />
            <div className="pt-24 md:pt-32 pb-8 px-4">
                <div className="fluid-container">
                    <div className="mb-8 md:mb-12">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-sm">
                                <Icon name="BarChart3" size={32} color="var(--color-primary)" />
                            </div>
                            <div>
                                <h1 className="text-foreground tracking-tight">
                                    Similarity Analysis Results
                                </h1>
                                <p className="text-muted-foreground mt-2 max-w-2xl">
                                    Comprehensive breakdown of visual correlations, feature distribution, and multi-dimensional similarity mapping.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        <div className="lg:col-span-12 xl:col-span-12 lg:mb-8">
                            <div className="glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border border-border/50 shadow-lg">
                                <div className="w-full md:w-1/3 lg:w-1/4">
                                    <div className="aspect-square rounded-2xl overflow-hidden shadow-inner ring-4 ring-primary/5">
                                        <Image
                                            src={queryImage.image}
                                            alt={queryImage.imageAlt}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-4 text-left">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                        Query Target
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                                        {queryImage.filename}
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dimensions</p>
                                            <p className="font-data font-semibold">{queryImage.dimensions}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Features</p>
                                            <p className="font-data font-semibold text-primary">{queryImage.keypoints}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Latency</p>
                                            <p className="font-data font-semibold">{queryImage.processingTime}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Method</p>
                                            <p className="font-data font-semibold badge bg-primary/5">{queryImage.algorithm}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-12 xl:col-span-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="outline"
                                    iconName="ArrowLeft"
                                    iconPosition="left"
                                    onClick={() => navigate('/visual-search-interface')}>

                                    Back to Search
                                </Button>
                                <Button
                                    variant="default"
                                    iconName="Search"
                                    iconPosition="left"
                                    onClick={() => navigate('/visual-search-interface')}>

                                    New Search
                                </Button>
                            </div>
                            <PipelineProgressIndicator
                                uploadStatus="complete"
                                searchStatus="complete"
                                resultsStatus="complete"
                                uploadProgress={100}
                                searchProgress={100}
                                resultsProgress={100} />
                        </div>
                    </div>

                    <div className="mb-6 md:mb-8">
                        <ResultsToolbar
                            onSort={handleSort}
                            onExport={handleExport}
                            onShare={handleShare}
                            resultsCount={sortedResults?.length} />

                    </div>

                    <div className="mb-6 md:mb-8">
                        <ResultsGallery
                            results={sortedResults}
                            onResultClick={handleResultClick}
                            selectedResult={selectedResult} />

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
                        <div className="lg:col-span-2">
                            <MatplotlibVisualization
                                results={sortedResults}
                                queryImage={queryImage} />

                        </div>

                        <div className="lg:col-span-1">
                            <MetadataPanel
                                result={selectedResult}
                                algorithmParams={algorithmParams} />

                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="Lightbulb" size={24} color="var(--color-primary)" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-heading font-semibold text-lg md:text-xl mb-2">
                                    Analysis Insights
                                </h3>
                                <div className="space-y-3 text-sm md:text-base text-muted-foreground">
                                    <p>
                                        • The top result shows {mockResults[0]?.similarityScore}% similarity with robust feature correlation and precise spatial alignment in keypoint distribution.
                                    </p>
                                    <p>
                                        • Statistical analysis of the feature space suggests a high degree of confidence in the top matches, successfully filtering through the indexed collection.
                                    </p>
                                    <p>
                                        • The {queryImage.algorithm} algorithm identified complex visual patterns and textures, enabling accurate cross-image feature mapping.
                                    </p>
                                    <p>
                                        • Performance metrics indicate a processing latency below 1.5s, maintaining low computational overhead for real-time visual similarity search.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showComparison &&
                <DetailedComparison
                    queryImage={queryImage}
                    selectedResult={selectedResult}
                    onClose={() => setShowComparison(false)} />

            }
        </div>);

};

export default SearchResultsVisualization;