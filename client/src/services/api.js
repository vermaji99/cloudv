import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Add a response interceptor to return data directly
api.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
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
