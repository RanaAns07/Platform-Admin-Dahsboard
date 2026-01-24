"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, LoginResponse } from '@/types';
import api, { setTokens, clearTokens, getAccessToken } from '@/lib/api';

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
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            // Verify token by fetching user profile
            const response = await api.get<User>('/v1/users/auth/me/');
            setUser(response.data);
        } catch {
            // Token invalid, clear it
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
