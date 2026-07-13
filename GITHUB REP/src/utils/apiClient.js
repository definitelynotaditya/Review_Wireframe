import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL = import.meta.env.VITE_BASE_URL;

// Create authenticated API client
export const createApiClient = () => {
    const api = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor to add auth token
    api.interceptors.request.use(
        (config) => {
            const authStore = useAuthStore.getState();
            const authHeaders = authStore.getAuthHeader();
            config.headers = { ...config.headers, ...authHeaders };
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor to handle auth errors
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Token expired or invalid, logout user
                const authStore = useAuthStore.getState();
                authStore.logout();
                // Redirect to login if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );

    return api;
};

// Default API client instance
export const apiClient = createApiClient();