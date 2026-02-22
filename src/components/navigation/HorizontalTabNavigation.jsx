import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const HorizontalTabNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [processingStatus, setProcessingStatus] = useState({
        upload: 'idle',
        search: 'idle',
        results: 'idle'
    });

    const [algorithmConfig, setAlgorithmConfig] = useState({
        featureMethod: 'ORB',
        distanceMethod: 'Euclidean',
        threshold: 0.75
    });

    const [showConfigPanel, setShowConfigPanel] = useState(false);

    const tabs = [
        {
            id: 'upload',
            label: 'Upload',
            path: '/image-upload-management',
            icon: 'Upload',
            description: 'Image dataset management and preprocessing'
        },
        {
            id: 'search',
            label: 'Search',
            path: '/visual-search-interface',
            icon: 'Search',
            description: 'Visual similarity query with algorithm configuration'
        },
        {
            id: 'results',
            label: 'Results',
            path: '/search-results-visualization',
            icon: 'BarChart3',
            description: 'Similarity analysis visualization and export'
        }
    ];

    const getCurrentTab = () => {
        const currentTab = tabs?.find(tab => location?.pathname === tab?.path);
        return currentTab ? currentTab?.id : 'upload';
    };

    const handleTabClick = (path) => {
        navigate(path);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-warning';
            case 'complete':
                return 'text-success';
            default:
                return 'text-muted-foreground';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return 'Loader2';
            case 'complete':
                return 'CheckCircle2';
            default:
                return 'Circle';
        }
    };

    const handleConfigChange = (key, value) => {
        setAlgorithmConfig(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-100 bg-card shadow-md border-b border-border">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Icon name="Image" size={24} color="var(--color-primary)" />
                            </div>
                            <span className="font-heading font-semibold text-lg text-foreground hidden sm:block">
                                ImageSearchEngine
                            </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-2">
                            {tabs?.map((tab) => {
                                const isActive = getCurrentTab() === tab?.id;
                                const status = processingStatus?.[tab?.id];

                                return (
                                    <button
                                        key={tab?.id}
                                        onClick={() => handleTabClick(tab?.path)}
                                        className={`
                      relative flex items-center space-x-2 px-6 py-3 rounded-md
                      transition-all duration-250 ease-smooth
                      ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-foreground hover:bg-muted hover:text-foreground'
                                            }
                    `}
                                        title={tab?.description}
                                    >
                                        <Icon
                                            name={tab?.icon}
                                            size={18}
                                            color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
                                        />
                                        <span className="font-medium text-sm">{tab?.label}</span>
                                        <div className={`ml-1 ${getStatusColor(status)}`}>
                                            <Icon
                                                name={getStatusIcon(status)}
                                                size={14}
                                                className={status === 'active' ? 'animate-spin' : ''}
                                            />
                                        </div>
                                        {isActive && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-foreground rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowConfigPanel(!showConfigPanel)}
                                className="flex items-center space-x-2 px-4 py-2 rounded-md bg-muted hover:bg-muted/80 transition-all duration-250"
                                title="Algorithm Configuration"
                            >
                                <Icon name="Settings" size={18} />
                                <span className="text-sm font-medium font-data">
                                    {algorithmConfig?.featureMethod}
                                </span>
                                <Icon name={showConfigPanel ? 'ChevronUp' : 'ChevronDown'} size={16} />
                            </button>

                            {showConfigPanel && (
                                <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg z-200">
                                    <div className="p-4 space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-border">
                                            <h3 className="font-heading font-semibold text-sm">Algorithm Settings</h3>
                                            <button
                                                onClick={() => setShowConfigPanel(false)}
                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Icon name="X" size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-1.5">Feature Extraction</label>
                                                <select
                                                    value={algorithmConfig?.featureMethod}
                                                    onChange={(e) => handleConfigChange('featureMethod', e?.target?.value)}
                                                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    <option value="ORB">ORB (Oriented FAST)</option>
                                                    <option value="SIFT">SIFT (Scale-Invariant)</option>
                                                    <option value="SURF">SURF (Speeded-Up)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1.5">Distance Method</label>
                                                <select
                                                    value={algorithmConfig?.distanceMethod}
                                                    onChange={(e) => handleConfigChange('distanceMethod', e?.target?.value)}
                                                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                >
                                                    <option value="Euclidean">Euclidean Distance</option>
                                                    <option value="Cosine">Cosine Similarity</option>
                                                    <option value="Manhattan">Manhattan Distance</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1.5">
                                                    Similarity Threshold: {algorithmConfig?.threshold}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={algorithmConfig?.threshold}
                                                    onChange={(e) => handleConfigChange('threshold', parseFloat(e?.target?.value))}
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>0.0</span>
                                                    <span>1.0</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-border">
                                            <button
                                                onClick={() => setShowConfigPanel(false)}
                                                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                                            >
                                                Apply Settings
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setShowConfigPanel(!showConfigPanel)}
                            className="p-2 rounded-md text-foreground hover:bg-muted transition-colors"
                        >
                            <Icon name="Menu" size={24} />
                        </button>
                    </div>
                </div>

                <div className="md:hidden pb-3">
                    <div className="flex items-center space-x-2 overflow-x-auto">
                        {tabs?.map((tab) => {
                            const isActive = getCurrentTab() === tab?.id;
                            const status = processingStatus?.[tab?.id];

                            return (
                                <button
                                    key={tab?.id}
                                    onClick={() => handleTabClick(tab?.path)}
                                    className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap
                    transition-all duration-250 ease-smooth
                    ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground'
                                        }
                  `}
                                >
                                    <Icon
                                        name={tab?.icon}
                                        size={16}
                                        color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
                                    />
                                    <span className="text-sm font-medium">{tab?.label}</span>
                                    <Icon
                                        name={getStatusIcon(status)}
                                        size={12}
                                        className={`${getStatusColor(status)} ${status === 'active' ? 'animate-spin' : ''}`}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            {showConfigPanel && (
                <div className="md:hidden fixed inset-0 top-16 bg-background z-200">
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <h3 className="font-heading font-semibold">Algorithm Settings</h3>
                            <button
                                onClick={() => setShowConfigPanel(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Icon name="X" size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Feature Extraction</label>
                                <select
                                    value={algorithmConfig?.featureMethod}
                                    onChange={(e) => handleConfigChange('featureMethod', e?.target?.value)}
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="ORB">ORB (Oriented FAST)</option>
                                    <option value="SIFT">SIFT (Scale-Invariant)</option>
                                    <option value="SURF">SURF (Speeded-Up)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Distance Method</label>
                                <select
                                    value={algorithmConfig?.distanceMethod}
                                    onChange={(e) => handleConfigChange('distanceMethod', e?.target?.value)}
                                    className="w-full px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="Euclidean">Euclidean Distance</option>
                                    <option value="Cosine">Cosine Similarity</option>
                                    <option value="Manhattan">Manhattan Distance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Similarity Threshold: {algorithmConfig?.threshold}
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={algorithmConfig?.threshold}
                                    onChange={(e) => handleConfigChange('threshold', parseFloat(e?.target?.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>0.0</span>
                                    <span>1.0</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowConfigPanel(false)}
                            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                        >
                            Apply Settings
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default HorizontalTabNavigation;