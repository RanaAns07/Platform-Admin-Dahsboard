import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
    ApiError,
    Tenant,
    CreateTenantPayload,
    UpdateTenantPayload,
    PaginatedResponse
} from '@/types';

// Create axios instance pointing to the proxy
const api = axios.create({
    baseURL: '/api/proxy',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Token storage keys
const ACCESS_TOKEN_KEY = 'ftf_access_token';
const REFRESH_TOKEN_KEY = 'ftf_refresh_token';

// Token helper functions
export const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - attach Authorization header
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors gracefully
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ detail?: string; message?: string }>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();
            if (refreshToken) {
                try {
                    // Use plain axios to avoid infinite loops
                    const response = await axios.post('/api/proxy/v1/users/auth/refresh/', {
                        refresh: refreshToken,
                    });

                    const { access } = response.data;
                    setTokens(access, refreshToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${access}`;
                    }

                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, clear tokens and redirect to login
                    clearTokens();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, redirect to login
                clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        // Transform error to a user-friendly format
        let errorMessage = 'An unexpected error occurred';

        // Handle specific error cases
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        } else if (error.response?.status === 400) {
            errorMessage = (error.response.data as any)?.detail || error.response.data?.message || 'Invalid request. Please check your input.';
        } else if (error.response?.status === 401) {
            errorMessage = (error.response.data as any)?.detail || 'Session expired. Please login again.';
        } else if (error.response?.status === 403) {
            errorMessage = 'Access denied. You do not have permission to perform this action.';
        } else if (error.response?.status === 404) {
            errorMessage = 'The requested resource was not found.';
        } else if (error.response?.status === 500) {
            errorMessage = 'Server error. Please try again later.';
        } else if (error.response?.data?.detail) {
            errorMessage = error.response.data.detail;
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        }

        const apiError: ApiError = {
            message: errorMessage,
            status: error.response?.status || 500,
        };

        return Promise.reject(apiError);
    }
);

// Tenant Services
export const tenantService = {
    getTenants: async (params?: any) => {
        const response = await api.get<PaginatedResponse<Tenant>>('/v1/platform/tenants/', { params });
        return response.data;
    },
    getTenant: async (id: string) => {
        const response = await api.get<Tenant>(`/v1/platform/tenants/${id}/`);
        return response.data;
    },
    createTenant: async (data: CreateTenantPayload) => {
        const response = await api.post<Tenant>('/v1/platform/tenants/', data);
        return response.data;
    },
    updateTenant: async (id: string, data: UpdateTenantPayload) => {
        const response = await api.patch<Tenant>(`/v1/platform/tenants/${id}/`, data);
        return response.data;
    },
    deleteTenant: async (id: string) => {
        await api.delete(`/v1/platform/tenants/${id}/`);
    },
    assignPlan: async (tenantId: string, planId: string) => {
        const response = await api.post(`/v1/platform/tenants/${tenantId}/assign_plan/`, { plan_id: planId });
        return response.data;
    }
};

export default api;
