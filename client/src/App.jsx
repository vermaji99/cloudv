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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-salesforce-blue"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
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
