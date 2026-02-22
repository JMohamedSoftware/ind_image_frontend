import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HorizontalTabNavigation from '../../components/navigation/HorizontalTabNavigation';
import PipelineProgressIndicator from '../../components/navigation/PipelineProgressIndicator';
import QueryImageUploader from './components/QueryImageUploader';
import AlgorithmConfiguration from './components/AlgorithmConfiguration';
import SearchExecutionPanel from './components/SearchExecutionPanel';
import SearchHistorySidebar from './components/SearchHistorySidebar';
import ValidationFeedback from './components/ValidationFeedback';
import Icon from '../../components/AppIcon';

const VisualSearchInterface = () => {
    const navigate = useNavigate();
    const [queryImage, setQueryImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(0);
    const [searchHistory] = useState([
        { id: 1, queryName: 'mountain_landscape.jpg', timestamp: '2026-02-21 00:05', results: 12 },
        { id: 2, queryName: 'urban_architecture.jpg', timestamp: '2026-02-20 18:30', results: 8 },
        { id: 3, queryName: 'wildlife_tiger.jpg', timestamp: '2026-02-20 14:15', results: 15 }
    ]);

    const [algorithmConfig, setAlgorithmConfig] = useState({
        featureMethod: 'ORB',
        similarityMethod: 'Euclidean',
        vectorLength: '128',
        enablePCA: true,
        pcaComponents: 50,
        varianceThreshold: 95
    });

    const [validationStatus, setValidationStatus] = useState({
        isValid: true,
        errors: []
    });

    const handleImageSelect = (imageData) => {
        setQueryImage(imageData);
        // Simple mock validation logic
        if (imageData.size > 1024 * 1024 * 5) { // If > 5MB
            setValidationStatus({
                isValid: false,
                errors: [{ field: 'File Size', message: 'Large files may slow down extraction' }]
            });
        } else {
            setValidationStatus({ isValid: true, errors: [] });
        }
    };

    const handleConfigChange = (key, value) => {
        setAlgorithmConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const handleSearchExecution = async () => {
        if (!queryImage) return;

        setIsProcessing(true);
        setProgress(10);
        setEstimatedTime(2);

        try {
            // Get the blob from the preview URL
            const response_blob = await fetch(queryImage.preview);
            const blob = await response_blob.blob();

            const formData = new FormData();
            formData.append('file', blob, queryImage.name);

            setProgress(30);

            const response = await fetch(`${API_BASE_URL}/api/search`, {
                method: 'POST',
                body: formData,
            });

            setProgress(70);

            const result = await response.json();

            setProgress(100);

            setTimeout(() => {
                setIsProcessing(false);
                navigate('/search-results-visualization', {
                    state: {
                        queryImage: {
                            image: queryImage.preview,
                            imageAlt: `Visual search query for ${queryImage.name}`,
                            filename: queryImage.name,
                            dimensions: "1024x768",
                            keypoints: result.results?.[0]?.matchesCount || 0,
                            processingTime: "0.85s",
                            algorithm: algorithmConfig.featureMethod,
                            backendResults: result.results
                        }
                    }
                });
            }, 500);
        } catch (error) {
            console.error('Search error:', error);
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleClearImage = () => {
        setQueryImage(null);
        setProgress(0);
        setValidationStatus({ isValid: true, errors: [] });
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <HorizontalTabNavigation />

            <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="mb-6 md:mb-8 text-left">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Icon name="Search" size={24} color="var(--color-primary)" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold">
                                    Visual Search Interface
                                </h1>
                                <p className="text-sm md:text-base text-muted-foreground mt-1 text-left">
                                    Analyze content and find visual similarities within your indexed image collection
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                        <div className="lg:col-span-9 space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <QueryImageUploader
                                    selectedImage={queryImage}
                                    onImageSelect={handleImageSelect}
                                    onClearImage={handleClearImage}
                                />

                                <AlgorithmConfiguration
                                    config={algorithmConfig}
                                    onConfigChange={handleConfigChange}
                                    isProcessing={isProcessing}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                                <div className="md:col-span-2">
                                    <SearchExecutionPanel
                                        onSearch={handleSearchExecution}
                                        isProcessing={isProcessing}
                                        progress={progress}
                                        estimatedTime={estimatedTime}
                                        canSearch={!!queryImage}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <ValidationFeedback
                                        validationStatus={validationStatus}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-3 space-y-6">
                            <PipelineProgressIndicator
                                uploadStatus="complete"
                                searchStatus={isProcessing ? 'processing' : queryImage ? 'active' : 'idle'}
                                resultsStatus="idle"
                                uploadProgress={100}
                                searchProgress={progress}
                                resultsProgress={0}
                            />

                            <SearchHistorySidebar
                                history={searchHistory}
                                onHistoryItemClick={(id) => console.log('Load history', id)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualSearchInterface;