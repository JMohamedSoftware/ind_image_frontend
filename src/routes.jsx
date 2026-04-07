import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import HomePage from "./pages/home";
import PresentationLab from "./pages/presentation-lab";

const Routes = () => {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <RouterRoutes>
                    <Route path="*" element={<HomePage />} />
                </RouterRoutes>
            </ErrorBoundary>
        </BrowserRouter>
    );
};

export default Routes;
