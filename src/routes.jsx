import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ui/ScrollToTop";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import NotFound from "./pages/NotFound";
import SearchResultsVisualization from './pages/search-results-visualization';
import ImageUploadManagement from './pages/image-upload-management';
import VisualSearchInterface from './pages/visual-search-interface';

const Routes = () => {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <ScrollToTop />
                <RouterRoutes>
                    {/* Define your route here */}
                    <Route path="/" element={<ImageUploadManagement />} />
                    <Route path="/search-results-visualization" element={<SearchResultsVisualization />} />
                    <Route path="/image-upload-management" element={<ImageUploadManagement />} />
                    <Route path="/visual-search-interface" element={<VisualSearchInterface />} />
                    <Route path="*" element={<NotFound />} />
                </RouterRoutes>
            </ErrorBoundary>
        </BrowserRouter>
    );
};

export default Routes;
