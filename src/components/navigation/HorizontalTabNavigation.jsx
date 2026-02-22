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
        <nav className="fixed top-0 left-0 right-0 z-100 glass shadow-sm border-b border-border/50">
            <div className="fluid-container">
                <div className="flex items-center justify-between h-16 md:h-20">
                    <div className="flex items-center space-x-4 md:space-x-8">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shadow-inner">
                                <Icon name="Image" size={24} color="var(--color-primary)" />
                            </div>
                            <span className="font-heading font-bold text-lg text-foreground hidden sm:block tracking-tight">
                                VisualSearch
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-1">
                            {tabs?.map((tab) => {
                                const isActive = getCurrentTab() === tab?.id;
                                const status = processingStatus?.[tab?.id];

                                return (
                                    <button
                                        key={tab?.id}
                                        onClick={() => handleTabClick(tab?.path)}
                                        className={`
                                            relative flex items-center space-x-2 px-4 lg:px-6 py-2 rounded-full
                                            transition-all duration-300 ease-out
                                            ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                                            }
                                        `}
                                        title={tab?.description}
                                    >
                                        <Icon
                                            name={tab?.icon}
                                            size={18}
                                            color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
                                        />
                                        <span className="font-semibold text-sm whitespace-nowrap">{tab?.label}</span>
                                        {status !== 'idle' && (
                                            <div className={`ml-1 ${getStatusColor(status)}`}>
                                                <Icon
                                                    name={getStatusIcon(status)}
                                                    size={14}
                                                    className={status === 'active' ? 'animate-spin' : ''}
                                                />
                                            </div>
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
                                className="flex items-center space-x-2 px-4 py-2 rounded-full glass hover:bg-muted/80 transition-all duration-300 shadow-sm border border-border/50"
                                title="Algorithm Configuration"
                            >
                                <Icon name="Settings" size={18} />
                                <span className="text-sm font-bold font-data">
                                    {algorithmConfig?.featureMethod}
                                </span>
                                <Icon name={showConfigPanel ? 'ChevronUp' : 'ChevronDown'} size={16} />
                            </button>

                            {showConfigPanel && (
                                <div className="absolute right-0 top-full mt-2 w-80 glass border border-border/50 rounded-2xl shadow-xl z-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-border/30">
                                            <h3 className="font-heading font-bold text-sm uppercase tracking-wider">Algorithm Settings</h3>
                                            <button
                                                onClick={() => setShowConfigPanel(false)}
                                                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                            >
                                                <Icon name="X" size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Feature Extraction</label>
                                                <select
                                                    value={algorithmConfig?.featureMethod}
                                                    onChange={(e) => handleConfigChange('featureMethod', e?.target?.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                >
                                                    <option value="ORB">ORB (Oriented FAST)</option>
                                                    <option value="SIFT">SIFT (Scale-Invariant)</option>
                                                    <option value="SURF">SURF (Speeded-Up)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Distance Method</label>
                                                <select
                                                    value={algorithmConfig?.distanceMethod}
                                                    onChange={(e) => handleConfigChange('distanceMethod', e?.target?.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                >
                                                    <option value="Euclidean">Euclidiènne</option>
                                                    <option value="Cosine">Cosínus</option>
                                                    <option value="Manhattan">Manhátan</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase text-muted-foreground mb-2 flex justify-between">
                                                    <span>Similarity Threshold</span>
                                                    <span className="text-primary">{algorithmConfig?.threshold}</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.05"
                                                    value={algorithmConfig?.threshold}
                                                    onChange={(e) => handleConfigChange('threshold', parseFloat(e?.target?.value))}
                                                    className="w-full accent-primary"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowConfigPanel(false)}
                                            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                                        >
                                            Apply & Close
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={() => setShowConfigPanel(!showConfigPanel)}
                            className="p-2 rounded-full glass border border-border/50 shadow-sm"
                        >
                            <Icon name="Settings" size={20} />
                        </button>
                        <button
                            onClick={() => {/* Toggle mobile menu */ }}
                            className="p-2 rounded-full glass border border-border/50 shadow-sm"
                        >
                            <Icon name="Menu" size={22} />
                        </button>
                    </div>
                </div>

                <div className="md:hidden pt-2 pb-4">
                    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                        {tabs?.map((tab) => {
                            const isActive = getCurrentTab() === tab?.id;
                            const status = processingStatus?.[tab?.id];

                            return (
                                <button
                                    key={tab?.id}
                                    onClick={() => handleTabClick(tab?.path)}
                                    className={`
                                        flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap
                                        transition-all duration-300
                                        ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-md'
                                            : 'glass text-foreground border-border/30'
                                        }
                                    `}
                                >
                                    <Icon
                                        name={tab?.icon}
                                        size={16}
                                        color={isActive ? 'var(--color-primary-foreground)' : 'currentColor'}
                                    />
                                    <span className="text-xs font-bold uppercase tracking-wide">{tab?.label}</span>
                                    {status !== 'idle' && (
                                        <Icon
                                            name={getStatusIcon(status)}
                                            size={12}
                                            className={`${getStatusColor(status)} ${status === 'active' ? 'animate-spin' : ''}`}
                                        />
                                    )}
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