import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#011627]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500/20 border-t-sky-500"></div>
                <p className="mt-4 text-sky-400 font-bold animate-pulse">Authenticating...</p>
            </div>
        );
    }

    if (!user) {
        // Use a relative path to avoid /dashboard#/login
        return <Navigate to="/login" replace />;
    }

    return children;
};

const AppContent = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } 
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50">
                <AppContent />
                <Toaster position="top-right" />
            </div>
        </Router>
    );
}

export default App;
