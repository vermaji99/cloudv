import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.success && response.authenticated) {
                setUser(response.user);
            } else {
                setUser(null);
                // If the API says not authenticated, but we have a token in localStorage,
                // it might mean the cookie failed but the token is still valid.
                // However, our api interceptor already adds the token to headers,
                // so if the server returns authenticated: false, the token is truly invalid.
                localStorage.removeItem('auth_token');
            }
        } catch (error) {
            console.error('Unexpected error checking authentication', error);
            setUser(null);
            localStorage.removeItem('auth_token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check for token in URL (fallback for mobile/cross-site cookie issues)
        const query = new URLSearchParams(window.location.hash.split('?')[1]);
        const tokenFromUrl = query.get('token');
        
        if (tokenFromUrl) {
            localStorage.setItem('auth_token', tokenFromUrl);
            // Clean up the URL
            const newUrl = window.location.hash.split('?')[0];
            window.location.hash = newUrl;
        }

        fetchUser();
    }, []);

    const login = () => {
        // Clear old token before starting new login
        localStorage.removeItem('auth_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${API_URL}/auth/login`;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            localStorage.removeItem('auth_token');
            toast.success('Logged out successfully');
        } catch (error) {
            localStorage.removeItem('auth_token');
            setUser(null);
            toast.error('Logout failed');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
