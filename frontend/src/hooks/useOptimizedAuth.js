import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de autenticación
 * Implementa cache inteligente, refresh token automático y cleanup automático
 */
const useOptimizedAuth = () => {
    const memoryOptimization = useComponentMemoryOptimization('OptimizedAuth');
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [tokenExpiry, setTokenExpiry] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [cache, setCache] = useState(new Map());
    const [lastSync, setLastSync] = useState(null);
    const authRef = useRef(null);

    // Función para obtener clave de cache
    const getCacheKey = useCallback((endpoint, params = {}) => {
        return `${endpoint}-${JSON.stringify(params)}`;
    }, []);

    // Función para hacer login
    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            // Guardar tokens
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setTokenExpiry(data.expiresIn);

            // Guardar usuario
            setUser(data.user);
            setIsAuthenticated(true);

            // Actualizar cache
            const cacheKey = getCacheKey('user', { id: data.user.id });
            setCache(prev => new Map(prev).set(cacheKey, data.user));

            setLastSync(Date.now());
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [getCacheKey]);

    // Función para hacer logout
    const logout = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Simular llamada a API
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        } catch (err) {
            console.warn('Logout API call failed:', err);
        } finally {
            // Limpiar estado local
            setUser(null);
            setIsAuthenticated(false);
            setAccessToken(null);
            setRefreshToken(null);
            setTokenExpiry(null);
            setCache(new Map());
            setIsLoading(false);
        }
    }, [accessToken]);

    // Función para registrar usuario
    const register = useCallback(async (userData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();

            // Si el registro incluye login automático
            if (data.accessToken) {
                setAccessToken(data.accessToken);
                setRefreshToken(data.refreshToken);
                setTokenExpiry(data.expiresIn);
                setUser(data.user);
                setIsAuthenticated(true);
            }

            setLastSync(Date.now());
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Función para refrescar token
    const refreshAccessToken = useCallback(async () => {
        if (!refreshToken) return false;

        setIsRefreshing(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();

            setAccessToken(data.accessToken);
            setTokenExpiry(data.expiresIn);

            return true;
        } catch (err) {
            setError(err.message);
            // Si el refresh falla, hacer logout
            await logout();
            return false;
        } finally {
            setIsRefreshing(false);
        }
    }, [refreshToken, logout]);

    // Función para obtener perfil de usuario
    const getUserProfile = useCallback(async () => {
        if (!isAuthenticated) return null;

        const cacheKey = getCacheKey('userProfile');

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                throw new Error('Failed to get user profile');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, accessToken, cache, getCacheKey]);

    // Función para actualizar perfil
    const updateProfile = useCallback(async (profileData) => {
        if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();

            // Actualizar usuario local
            setUser(prev => ({ ...prev, ...data }));

            // Actualizar cache
            const cacheKey = getCacheKey('userProfile');
            setCache(prev => new Map(prev).set(cacheKey, data));

            setLastSync(Date.now());
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, accessToken, getCacheKey]);

    // Función para verificar si el token está expirado
    const isTokenExpired = useCallback(() => {
        if (!tokenExpiry) return false;
        return Date.now() >= tokenExpiry;
    }, [tokenExpiry]);

    // Función para verificar si es admin
    const isAdmin = useCallback(() => {
        return user?.role === 'admin' || user?.rol === 'admin';
    }, [user]);

    // Función para verificar si es moderador
    const isModerator = useCallback(() => {
        return user?.role === 'moderator' || user?.rol === 'moderator';
    }, [user]);

    // Función para obtener estadísticas
    const getAuthStats = useCallback(() => {
        return {
            isAuthenticated,
            user,
            isLoading,
            isRefreshing,
            error,
            tokenExpiry,
            cacheSize: cache.size,
            isTokenExpired: isTokenExpired(),
            isAdmin: isAdmin(),
            isModerator: isModerator(),
            lastSync
        };
    }, [isAuthenticated, user, isLoading, isRefreshing, error, tokenExpiry, cache.size, isTokenExpired, isAdmin, isModerator, lastSync]);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    // Función para sincronizar con servidor
    const syncWithServer = useCallback(async () => {
        if (!isAuthenticated) return { success: false, error: 'Not authenticated' };

        setIsLoading(true);
        setError(null);

        try {
            // Verificar si el token está expirado
            if (isTokenExpired()) {
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    return { success: false, error: 'Token refresh failed' };
                }
            }

            // Obtener perfil actualizado
            const profile = await getUserProfile();
            if (profile) {
                setUser(profile);
            }

            setLastSync(Date.now());
            return { success: true, data: profile };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, isTokenExpired, refreshAccessToken, getUserProfile]);

    // Función para exportar datos de autenticación
    const exportAuthData = useCallback((format = 'json') => {
        const data = {
            user,
            isAuthenticated,
            tokenExpiry,
            cacheSize: cache.size,
            lastSync
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
            default:
                return data;
        }
    }, [user, isAuthenticated, tokenExpiry, cache.size, lastSync]);

    // Función para obtener rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            authStats: getAuthStats(),
            cacheStats: {
                size: cache.size,
                keys: Array.from(cache.keys())
            }
        };
    }, [memoryOptimization, getAuthStats, cache]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        authRef,

        // Estados
        user,
        isAuthenticated,
        isLoading,
        isRefreshing,
        error,

        // Tokens
        accessToken,
        refreshToken,
        tokenExpiry,

        // Cache
        cache,
        cacheSize: cache.size,

        // Acciones
        login,
        logout,
        register,
        refreshAccessToken,
        getUserProfile,
        updateProfile,
        syncWithServer,
        clearCache,

        // Utilidades
        isTokenExpired,
        isAdmin,
        isModerator,
        getAuthStats,
        exportAuthData,
        getPerformanceStats,

        // Configuración
        enableCache: true,
        enableAutoRefresh: true,
        enableSync: true
    };
};

export default useOptimizedAuth;