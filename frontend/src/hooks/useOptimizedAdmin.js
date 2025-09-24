import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de funcionalidades de administración
 * Implementa cache inteligente, operaciones batch y cleanup automático
 */
const useOptimizedAdmin = () => {
    const memoryOptimization = useComponentMemoryOptimization('OptimizedAdmin');
    const [adminData, setAdminData] = useState({
        users: [],
        products: [],
        inventory: [],
        orders: [],
        stats: {}
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateQueue, setUpdateQueue] = useState([]);
    const [cache, setCache] = useState(new Map());
    const [lastSync, setLastSync] = useState(null);
    const adminRef = useRef(null);

    // Función para obtener clave de cache
    const getCacheKey = useCallback((endpoint, params = {}) => {
        return `${endpoint}-${JSON.stringify(params)}`;
    }, []);

    // Función para obtener estadísticas de admin
    const getAdminStats = useCallback(async () => {
        const cacheKey = getCacheKey('adminStats');

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/stats');
            if (!response.ok) {
                throw new Error('Failed to get admin stats');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setAdminData(prev => ({ ...prev, stats: data }));

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener usuarios
    const getUsers = useCallback(async (filters = {}) => {
        const cacheKey = getCacheKey('users', filters);

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/users?${params}`);
            if (!response.ok) {
                throw new Error('Failed to get users');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setAdminData(prev => ({ ...prev, users: data }));

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener productos
    const getProducts = useCallback(async (filters = {}) => {
        const cacheKey = getCacheKey('products', filters);

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/products?${params}`);
            if (!response.ok) {
                throw new Error('Failed to get products');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setAdminData(prev => ({ ...prev, products: data }));

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener inventario
    const getInventory = useCallback(async (filters = {}) => {
        const cacheKey = getCacheKey('inventory', filters);

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/inventory?${params}`);
            if (!response.ok) {
                throw new Error('Failed to get inventory');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setAdminData(prev => ({ ...prev, inventory: data }));

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener órdenes
    const getOrders = useCallback(async (filters = {}) => {
        const cacheKey = getCacheKey('orders', filters);

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/orders?${params}`);
            if (!response.ok) {
                throw new Error('Failed to get orders');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setAdminData(prev => ({ ...prev, orders: data }));

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para ejecutar acción de stock
    const executeStockAction = useCallback(async (action, itemId, data) => {
        setIsUpdating(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/inventory/${itemId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Failed to execute ${action}`);
            }

            const result = await response.json();

            // Limpiar cache relacionado
            setCache(prev => {
                const newCache = new Map(prev);
                for (const [key] of newCache.entries()) {
                    if (key.includes('inventory') || key.includes('stats')) {
                        newCache.delete(key);
                    }
                }
                return newCache;
            });

            return { success: true, data: result };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsUpdating(false);
        }
    }, []);

    // Función para ejecutar acción de usuario
    const executeUserAction = useCallback(async (action, userId, data) => {
        setIsUpdating(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/users/${userId}/${action}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Failed to execute ${action}`);
            }

            const result = await response.json();

            // Limpiar cache relacionado
            setCache(prev => {
                const newCache = new Map(prev);
                for (const [key] of newCache.entries()) {
                    if (key.includes('users') || key.includes('stats')) {
                        newCache.delete(key);
                    }
                }
                return newCache;
            });

            return { success: true, data: result };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsUpdating(false);
        }
    }, []);

    // Función para sincronizar todos los datos
    const syncAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [stats, users, products, inventory, orders] = await Promise.all([
                getAdminStats(),
                getUsers(),
                getProducts(),
                getInventory(),
                getOrders()
            ]);

            setLastSync(Date.now());
            return { success: true, data: { stats, users, products, inventory, orders } };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [getAdminStats, getUsers, getProducts, getInventory, getOrders]);

    // Función para obtener estadísticas
    const getAdminStats = useCallback(() => {
        return {
            ...adminData,
            isLoading,
            isUpdating,
            error,
            cacheSize: cache.size,
            lastSync,
            updateQueueSize: updateQueue.length
        };
    }, [adminData, isLoading, isUpdating, error, cache.size, lastSync, updateQueue.length]);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    // Función para exportar datos
    const exportData = useCallback((format = 'json') => {
        const data = {
            ...adminData,
            lastSync,
            cacheSize: cache.size
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
            default:
                return data;
        }
    }, [adminData, lastSync, cache.size]);

    // Función para obtener rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            adminStats: getAdminStats(),
            cacheStats: {
                size: cache.size,
                keys: Array.from(cache.keys())
            }
        };
    }, [memoryOptimization, getAdminStats, cache]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        adminRef,

        // Datos
        ...adminData,

        // Estados
        isLoading,
        isUpdating,
        error,
        lastSync,

        // Cache
        cache,
        cacheSize: cache.size,

        // Acciones de datos
        getAdminStats,
        getUsers,
        getProducts,
        getInventory,
        getOrders,
        syncAllData,

        // Acciones de admin
        executeStockAction,
        executeUserAction,

        // Utilidades
        getAdminStats,
        clearCache,
        exportData,
        getPerformanceStats,

        // Configuración
        enableCache: true,
        enableSync: true,
        enableBatchOperations: true
    };
};

export default useOptimizedAdmin;