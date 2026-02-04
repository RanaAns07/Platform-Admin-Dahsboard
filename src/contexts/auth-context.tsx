"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, LoginResponse } from '@/types';
import api, { setTokens, clearTokens, getAccessToken, getRefreshToken } from '@/lib/api';
import axios from 'axios';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!token && !refreshToken) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            // Verify token by fetching user profile
            const response = await api.get<User>('/v1/users/auth/me/');
            setUser(response.data);
        } catch (error: any) {
            // If it's a 401, the axios interceptor might have already tried refreshing.
            // But if it reached here with an error, it means refresh failed or 
            // the initial request failed and wasn't retried for some reason.

            // If we have a refresh token but no user, the interceptor might still be working
            // or it might have failed. Let's check if we now have a token (from a successful refresh)
            const newToken = getAccessToken();
            if (newToken && newToken !== token) {
                try {
                    const retryResponse = await api.get<User>('/v1/users/auth/me/');
                    setUser(retryResponse.data);
                    return;
                } catch {
                    // Fall through to cleanup
                }
            }

            // Token invalid or refresh failed, clear it
            clearTokens();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        try {
            const response = await api.post<LoginResponse>('/v1/users/auth/login/', credentials);
            const { access, refresh, user: userData } = response.data;

            // Store tokens
            setTokens(access, refresh);

            // Set user
            setUser(userData);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        clearTokens();
        setUser(null);
        // Redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
