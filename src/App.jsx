import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import RelationsPage from './pages/RelationsPage';
import LimitsPage from './pages/LimitsPage';
import { LanguageProvider } from './languajes/i18n';

function App() {
    return (
        <LanguageProvider>
            <Router>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/relations" element={<RelationsPage />} />
                    <Route path="/limits" element={<LimitsPage />} />
                </Routes>
            </Router>
        </LanguageProvider>
    );
}

export default App;
