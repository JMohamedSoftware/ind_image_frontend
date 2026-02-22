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

    // Get query image from location state or fall back to mock
    const passedQueryImage = location.state?.queryImage;
    const queryImage = passedQueryImage || {
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
        imageAlt: "Abstract visual pattern for feature analysis",
        filename: "default_query.jpg",
        dimensions: "1920x1080",
        keypoints: 1000,
        processingTime: "1.24s",
        algorithm: "ORB"
    };

    // Stabilize random category
    const randomCategory = React.useMemo(() => {
        const categories = ['nature', 'technology', 'architecture', 'abstract', 'travel'];
        return categories[Math.floor(Math.random() * categories.length)];
    }, []);

    const generateMockResults = () => {
        // If we have real backend results, use them
        if (passedQueryImage?.backendResults) {
            return passedQueryImage.backendResults.map((result, i) => ({
                id: i + 1,
                rank: i + 1,
                // Use the backend URL if available, otherwise fallback to Unsplash
                image: result.url || `https://images.unsplash.com/photo-${1600000000000 + i + (result.matchesCount * 1000)}?auto=format&fit=crop&w=800&q=80`,
                imageAlt: `Similar result: ${result.filename}`,
                filename: result.filename,
                similarityScore: result.similarityScore,
                confidence: result.similarityScore + 2,
                distance: (100 - result.similarityScore) / 100,
                dimensions: "1920x1080",
                fileSize: "1.8 MB",
                format: "JPEG",
                algorithm: queryImage.algorithm,
                keypoints: result.matchesCount,
                descriptors: "128-dim",
                vectorLength: 128,
                processingTime: "0.85s",
                timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
                matchQuality: result.similarityScore > 80 ? "Excellent" : "Good",
                pcaApplied: true
            }));
        }

        if (!passedQueryImage) return [
            {
                id: 1,
                rank: 1,
                image: "https://images.unsplash.com/photo-1635802015921-7bc6bd5fc776?auto=format&fit=crop&w=800&q=80",
                imageAlt: "Red luxury sports car",
                filename: "sports_car_001.jpg",
                similarityScore: 94,
                confidence: 96,
                distance: 0.142,
                dimensions: "1920x1080",
                fileSize: "2.4 MB",
                format: "JPEG",
                algorithm: "ORB",
                keypoints: 823,
                descriptors: "128-dim",
                vectorLength: 128,
                processingTime: "0.98s",
                timestamp: "2026-02-21 00:05:32",
                matchQuality: "Excellent",
                pcaApplied: true
            },
            {
                id: 2,
                rank: 2,
                image: "https://images.unsplash.com/photo-1661324594853-ddc62aa74625?auto=format&fit=crop&w=800&q=80",
                imageAlt: "White modern sports coupe",
                filename: "sports_car_002.jpg",
                similarityScore: 89,
                confidence: 91,
                distance: 0.267,
                dimensions: "1920x1080",
                fileSize: "2.1 MB",
                format: "JPEG",
                algorithm: "ORB",
                keypoints: 791,
                descriptors: "128-dim",
                vectorLength: 128,
                processingTime: "1.02s",
                timestamp: "2026-02-21 00:05:34",
                matchQuality: "Very Good",
                pcaApplied: true
            },
            {
                id: 3,
                rank: 3,
                image: "https://images.unsplash.com/photo-1731867800927-c6371260b6cd?auto=format&fit=crop&w=800&q=80",
                imageAlt: "Black performance sports car",
                filename: "sports_car_003.jpg",
                similarityScore: 85,
                confidence: 88,
                distance: 0.389,
                dimensions: "1920x1080",
                fileSize: "2.6 MB",
                format: "JPEG",
                algorithm: "ORB",
                keypoints: 756,
                descriptors: "128-dim",
                vectorLength: 128,
                processingTime: "1.15s",
                timestamp: "2026-02-21 00:05:36",
                matchQuality: "Good",
                pcaApplied: true
            },
            {
                id: 4,
                rank: 4,
                image: "https://images.unsplash.com/photo-1642538033755-b5989e65f686?auto=format&fit=crop&w=800&q=80",
                imageAlt: "Blue metallic sports sedan",
                filename: "sports_car_004.jpg",
                similarityScore: 78,
                confidence: 82,
                distance: 0.512,
                dimensions: "1920x1080",
                fileSize: "2.3 MB",
                format: "JPEG",
                algorithm: "ORB",
                keypoints: 712,
                descriptors: "128-dim",
                vectorLength: 128,
                processingTime: "1.08s",
                timestamp: "2026-02-21 00:05:38",
                matchQuality: "Good",
                pcaApplied: true
            },
            {
                id: 5,
                rank: 5,
                image: "https://images.unsplash.com/photo-1676222618703-a5272de01494?auto=format&fit=crop&w=800&q=80",
                imageAlt: "Orange high-performance sports car",
                filename: "sports_car_005.jpg",
                similarityScore: 72,
                confidence: 76,
                distance: 0.634,
                dimensions: "1920x1080",
                fileSize: "2.5 MB",
                format: "JPEG",
                algorithm: "ORB",
                keypoints: 689,
                descriptors: "128-dim",
                vectorLength: 128,
                processingTime: "1.21s",
                timestamp: "2026-02-21 00:05:40",
                matchQuality: "Fair",
                pcaApplied: true
            }
        ];

        return [92, 88, 81, 75, 68].map((score, i) => ({
            id: i + 1,
            rank: i + 1,
            image: `https://images.unsplash.com/photo-${1600000000000 + i * 1000000}?auto=format&fit=crop&w=800&q=80`,
            imageAlt: `Similar result ${i + 1} for category ${randomCategory}`,
            filename: `match_${randomCategory}_${i + 1}.jpg`,
            similarityScore: score,
            confidence: score + 2,
            distance: (100 - score) / 100,
            dimensions: "1920x1080",
            fileSize: "1.8 MB",
            format: "JPEG",
            algorithm: queryImage.algorithm,
            keypoints: 700 + Math.floor(Math.random() * 200),
            descriptors: "128-dim",
            vectorLength: 128,
            processingTime: "0.85s",
            timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
            matchQuality: score > 90 ? "Excellent" : "Good",
            pcaApplied: true
        }));
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
            <div className="pt-20 md:pt-24 pb-8 md:pb-12">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 md:mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div>
                                <h1 className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl mb-2">
                                    Search Results & Visualization
                                </h1>
                                <p className="text-sm md:text-base text-muted-foreground">
                                    Comprehensive analysis of visual similarity search outcomes with detailed comparisons
                                </p>
                            </div>

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
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
                        <div className="lg:col-span-1">
                            <PipelineProgressIndicator
                                uploadStatus="complete"
                                searchStatus="complete"
                                resultsStatus="complete"
                                uploadProgress={100}
                                searchProgress={100}
                                resultsProgress={100} />

                        </div>

                        <div className="lg:col-span-3">
                            <QueryImageDisplay queryImage={queryImage} />
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