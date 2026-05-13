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
            // The server now returns 200 OK even if not authenticated
            // We check the 'authenticated' flag instead of catching a 401
            if (response.success && response.authenticated) {
                setUser(response.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Unexpected error checking authentication', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = () => {
        // Redirect to backend login route which redirects to Salesforce
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${API_URL}/auth/login`;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
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
