import { useState, useEffect, useCallback } from 'react';
import { api, storage } from '@/lib/api';

interface AdminUser {
    id: string;
    email: string;
    role: string;
    active: boolean;
    created_at?: string;
}

interface UseAdminAuth {
    admin: AdminUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuth {
    const [admin, setAdmin] = useState<AdminUser | null>(storage.getAdminUser());
    const [loading, setLoading] = useState(false);

    const isAuthenticated = !!storage.getAdminToken() && !!admin;

    const refresh = useCallback(async () => {
        if (!storage.getAdminToken()) return;

        try {
            setLoading(true);
            const user = await api.admin.getCurrentUser();
            setAdmin(user);
        } catch (error) {
            console.error('Failed to refresh admin user:', error);
            // Token might be expired - clear storage
            storage.clearAll();
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await api.admin.login(email, password);
            setAdmin(response.admin);
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await api.admin.logout();
        } finally {
            storage.clearAll();
            setAdmin(null);
            setLoading(false);
        }
    }, []);

    // Try to get cached admin data on mount
    useEffect(() => {
        const cachedAdmin = storage.getAdminUser();
        if (cachedAdmin) {
            setAdmin(cachedAdmin);
        }
    }, []);

    return {
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
        refresh
    };
}
