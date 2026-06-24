import axios from 'axios';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api',
});

// Interceptor to add token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle errors (optional logging)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If 401, maybe logout? But let's handle that in context/components for now to avoid circular deps
        return Promise.reject(error);
    }
);

export default api;
