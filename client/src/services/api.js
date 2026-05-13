import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to return data directly
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // If we get a 401, clear the token
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
        }
        return Promise.reject(error);
    }
);

export const metadataService = {
    getValidationRules: async () => {
        return api.get('/metadata/validation-rules');
    },
    
    toggleValidationRule: async (id, active) => {
        return api.patch(`/metadata/validation-rule/${id}`, { active });
    },

    bulkUpdateValidationRules: async (updates) => {
        return api.post('/metadata/validation-rules/bulk', { updates });
    }
};

export default api;
