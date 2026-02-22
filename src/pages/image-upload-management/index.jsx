import React, { useState, useEffect } from 'react';
import HorizontalTabNavigation from '../../components/navigation/HorizontalTabNavigation';
import PipelineProgressIndicator from '../../components/navigation/PipelineProgressIndicator';
import UploadZone from './components/UploadZone';
import PreprocessingControls from './components/PreprocessingControls';
import ImageGallery from './components/ImageGallery';
import ImagePreviewModal from './components/ImagePreviewModal';
import BatchProcessingPanel from './components/BatchProcessingPanel';
import Icon from '../../components/AppIcon';

const ImageUploadManagement = () => {
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedCount, setProcessedCount] = useState(0);
    const [showPreprocessing, setShowPreprocessing] = useState(false);

    const [preprocessingConfig, setPreprocessingConfig] = useState({
        resize: '224x224',
        quality: 'high',
        format: 'original',
        autoRotate: true,
        removeMetadata: false,
        normalizeColors: true
    });

    const mockImages = [
        {
            id: 1,
            name: "mountain_landscape_001.jpg",
            url: "https://images.unsplash.com/photo-1707755211346-9369eb40f5f5",
            alt: "Majestic snow-capped mountain peak with clear blue sky and pine forest in foreground during golden hour",
            size: 4567890,
            dimensions: "3840×2160",
            format: "jpg",
            status: "complete",
            progress: 100,
            uploadedAt: new Date(2026, 1, 20, 14, 30)?.toISOString(),
            metadata: {
                colorSpace: "sRGB",
                bitDepth: "8-bit",
                compression: "JPEG"
            }
        },
        {
            id: 2,
            name: "urban_architecture_002.jpg",
            url: "https://images.unsplash.com/photo-1644257526556-f7f1c99cfb63",
            alt: "Modern glass skyscraper reflecting clouds with geometric patterns and steel framework in urban downtown area",
            size: 3456789,
            dimensions: "2560×1440",
            format: "jpg",
            status: "processing",
            progress: 65,
            uploadedAt: new Date(2026, 1, 20, 15, 15)?.toISOString(),
            metadata: {
                colorSpace: "sRGB",
                bitDepth: "8-bit",
                compression: "JPEG"
            }
        },
        {
            id: 3,
            name: "wildlife_portrait_003.jpg",
            url: "https://images.unsplash.com/photo-1728590483034-f98ebd43fdf4",
            alt: "Close-up portrait of Bengal tiger with intense amber eyes and orange striped fur in natural jungle habitat",
            size: 5678901,
            dimensions: "4096×2730",
            format: "jpg",
            status: "complete",
            progress: 100,
            uploadedAt: new Date(2026, 1, 20, 16, 45)?.toISOString(),
            metadata: {
                colorSpace: "Adobe RGB",
                bitDepth: "16-bit",
                compression: "Lossless"
            }
        },
        {
            id: 4,
            name: "ocean_sunset_004.jpg",
            url: "https://images.unsplash.com/photo-1552272492-3053fbacbf4b",
            alt: "Vibrant orange and purple sunset over calm ocean waters with silhouetted palm trees on tropical beach",
            size: 4123456,
            dimensions: "3200×2400",
            format: "jpg",
            status: "uploading",
            progress: 35,
            uploadedAt: new Date(2026, 1, 20, 17, 20)?.toISOString(),
            metadata: {
                colorSpace: "sRGB",
                bitDepth: "8-bit",
                compression: "JPEG"
            }
        },
        {
            id: 5,
            name: "forest_pathway_005.jpg",
            url: "https://images.unsplash.com/photo-1601020719235-05c5525cfe2a",
            alt: "Winding dirt path through dense green forest with sunlight filtering through tall tree canopy creating dappled shadows",
            size: 3987654,
            dimensions: "2880×1920",
            format: "jpg",
            status: "complete",
            progress: 100,
            uploadedAt: new Date(2026, 1, 20, 18, 10)?.toISOString(),
            metadata: {
                colorSpace: "sRGB",
                bitDepth: "8-bit",
                compression: "JPEG"
            }
        },
        {
            id: 6,
            name: "city_night_006.jpg",
            url: "https://images.unsplash.com/photo-1727379466853-611891243d04",
            alt: "Illuminated city skyline at night with colorful neon lights reflecting on wet streets and busy traffic trails",
            size: 4789012,
            dimensions: "3600×2400",
            format: "jpg",
            status: "complete",
            progress: 100,
            uploadedAt: new Date(2026, 1, 20, 19, 30)?.toISOString(),
            metadata: {
                colorSpace: "sRGB",
                bitDepth: "8-bit",
                compression: "JPEG"
            }
        }];


    useEffect(() => {
        // Start with empty dataset
        setImages([]);
    }, []);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";
    const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) throw new Error('Cloudinary upload failed');
        const data = await response.json();
        return data.secure_url;
    };

    const handleFilesSelected = async (files) => {
        const newImages = Array.from(files)?.map((file, index) => ({
            id: Date.now() + index,
            name: file?.name,
            url: URL.createObjectURL(file), // Local preview
            alt: `Uploaded image ${file?.name} showing visual content for feature extraction and similarity analysis`,
            size: file?.size,
            dimensions: "Unknown",
            format: file?.type?.split('/')?.[1],
            status: "uploading",
            progress: 0,
            uploadedAt: new Date()?.toISOString(),
            metadata: {
                colorSpace: "sRGB",
                bitDepth: "8-bit",
                compression: "JPEG"
            }
        }));

        setImages((prev) => [...prev, ...newImages]);

        for (const [index, file] of Array.from(files).entries()) {
            const imageId = newImages[index].id;

            setImages((prev) => prev?.map((img) =>
                img?.id === imageId ? { ...img, status: 'processing', progress: 30 } : img
            ));

            try {
                // 1. Upload to Cloudinary
                const cloudinaryUrl = await uploadToCloudinary(file);

                setImages((prev) => prev?.map((img) =>
                    img?.id === imageId ? { ...img, progress: 60 } : img
                ));

                // 2. Index in Python Backend using the Cloudinary URL
                const response = await fetch(`${API_BASE_URL}/api/index`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url: cloudinaryUrl,
                        filename: file.name
                    }),
                });

                if (response.ok) {
                    setImages((prev) => prev?.map((img) =>
                        img?.id === imageId ? {
                            ...img,
                            status: 'complete',
                            progress: 100,
                            url: cloudinaryUrl // Update to Cloudinary URL
                        } : img
                    ));
                } else {
                    throw new Error('Backend indexing failed');
                }
            } catch (error) {
                console.error('Error processing:', error);
                setImages((prev) => prev?.map((img) =>
                    img?.id === imageId ? { ...img, status: 'error', progress: 0 } : img
                ));
            }
        }
    };

    const handleSelectImage = (imageId) => {
        setSelectedImages((prev) =>
            prev?.includes(imageId) ?
                prev?.filter((id) => id !== imageId) :
                [...prev, imageId]
        );
    };

    const handleSelectAll = () => {
        setSelectedImages(images?.map((img) => img?.id));
    };

    const handleDeselectAll = () => {
        setSelectedImages([]);
    };

    const handleRemoveImage = (imageId) => {
        setImages((prev) => prev?.filter((img) => img?.id !== imageId));
        setSelectedImages((prev) => prev?.filter((id) => id !== imageId));
    };

    const handleRemoveSelected = () => {
        setImages((prev) => prev?.filter((img) => !selectedImages?.includes(img?.id)));
        setSelectedImages([]);
    };

    const handlePreviewImage = (image) => {
        setPreviewImage(image);
    };

    const handleConfigChange = (key, value) => {
        setPreprocessingConfig((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    const handleStartProcessing = () => {
        // Since images are processed on upload, this could be used to re-trigger
        // Or we can just disable it and show it's already done
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 500);
    };

    const handleCancelProcessing = () => {
        setIsProcessing(false);
    };

    const estimatedTime = "Done on upload";

    const completedImages = images?.filter((img) => img?.status === 'complete')?.length;

    return (
        <div className="min-h-screen bg-background">
            <HorizontalTabNavigation />
            <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="mb-6 md:mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Icon name="Upload" size={24} color="var(--color-primary)" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold">
                                    Image Upload & Management
                                </h1>
                                <p className="text-sm md:text-base text-muted-foreground mt-1">
                                    Upload and organize your image dataset for feature extraction
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                        <div className="lg:col-span-3 space-y-6 md:space-y-8">
                            <UploadZone
                                onFilesSelected={handleFilesSelected}
                                isProcessing={isProcessing} />


                            <PreprocessingControls
                                config={preprocessingConfig}
                                onConfigChange={handleConfigChange}
                                isExpanded={showPreprocessing}
                                onToggleExpand={() => setShowPreprocessing(!showPreprocessing)} />


                            <BatchProcessingPanel
                                totalImages={images?.length}
                                processedImages={processedCount}
                                isProcessing={isProcessing}
                                onStartProcessing={handleStartProcessing}
                                onCancelProcessing={handleCancelProcessing}
                                estimatedTime={estimatedTime} />


                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg md:text-xl font-heading font-semibold">
                                        Uploaded Images
                                    </h2>
                                    {images?.length > 0 &&
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Icon name="CheckCircle2" size={16} color="var(--color-success)" />
                                            <span className="font-data">
                                                {completedImages}/{images?.length} processed
                                            </span>
                                        </div>
                                    }
                                </div>

                                <ImageGallery
                                    images={images}
                                    selectedImages={selectedImages}
                                    onSelectImage={handleSelectImage}
                                    onRemoveImage={handleRemoveImage}
                                    onPreviewImage={handlePreviewImage}
                                    onSelectAll={handleSelectAll}
                                    onDeselectAll={handleDeselectAll}
                                    onRemoveSelected={handleRemoveSelected} />

                            </div>
                        </div>

                        <div className="space-y-6">
                            <PipelineProgressIndicator
                                uploadStatus={images?.length > 0 ? 'complete' : 'idle'}
                                searchStatus="idle"
                                resultsStatus="idle"
                                uploadProgress={100}
                                searchProgress={0}
                                resultsProgress={0} />


                            <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                                <h3 className="font-heading font-semibold text-sm mb-4">
                                    Dataset Statistics
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                        <span className="text-sm text-muted-foreground">Total Images</span>
                                        <span className="text-sm font-medium font-data">{images?.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                        <span className="text-sm text-muted-foreground">Processed</span>
                                        <span className="text-sm font-medium font-data">{completedImages}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-border">
                                        <span className="text-sm text-muted-foreground">Processing</span>
                                        <span className="text-sm font-medium font-data">
                                            {images?.filter((img) => img?.status === 'processing')?.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm text-muted-foreground">Total Size</span>
                                        <span className="text-sm font-medium font-data">
                                            {(images?.reduce((sum, img) => sum + img?.size, 0) / (1024 * 1024))?.toFixed(1)} MB
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Icon name="Lightbulb" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-sm mb-1">Quick Tip</h4>
                                        <p className="text-xs text-muted-foreground">
                                            For best results, upload images with consistent dimensions and quality. The system supports JPG, PNG, and WebP formats up to 50MB per file.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {previewImage &&
                <ImagePreviewModal
                    image={previewImage}
                    onClose={() => setPreviewImage(null)} />

            }
        </div>);

};

export default ImageUploadManagement;