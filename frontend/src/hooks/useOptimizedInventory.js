import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de inventario
 * Implementa cache inteligente, operaciones batch y cleanup automático
 */
const useOptimizedInventory = () => {
    const memoryOptimization = useComponentMemoryOptimization('OptimizedInventory');
    const [inventory, setInventory] = useState([]);
    const [stats, setStats] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateQueue, setUpdateQueue] = useState([]);
    const [cache, setCache] = useState(new Map());
    const [lastSync, setLastSync] = useState(null);
    const inventoryRef = useRef(null);

    // Función para obtener clave de cache
    const getCacheKey = useCallback((endpoint, params = {}) => {
        return `${endpoint}-${JSON.stringify(params)}`;
    }, []);

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
            const response = await fetch(`/api/inventory?${params}`);
            if (!response.ok) {
                throw new Error('Failed to get inventory');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setInventory(data);

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener estadísticas de inventario
    const getInventoryStats = useCallback(async () => {
        const cacheKey = getCacheKey('inventoryStats');

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/inventory/stats');
            if (!response.ok) {
                throw new Error('Failed to get inventory stats');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setStats(data);

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener alertas de stock
    const getStockAlerts = useCallback(async () => {
        const cacheKey = getCacheKey('stockAlerts');

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/inventory/alerts');
            if (!response.ok) {
                throw new Error('Failed to get stock alerts');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setAlerts(data);

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
            const response = await fetch(`/api/inventory/${itemId}/${action}`, {
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
                    if (key.includes('inventory') || key.includes('stats') || key.includes('alerts')) {
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

    // Función para reabastecer inventario
    const restockInventory = useCallback(async (itemId, quantity, notes = '') => {
        return executeStockAction('restock', itemId, { quantity, notes });
    }, [executeStockAction]);

    // Función para reservar stock
    const reserveStock = useCallback(async (itemId, quantity) => {
        return executeStockAction('reserve', itemId, { quantity });
    }, [executeStockAction]);

    // Función para liberar stock
    const releaseStock = useCallback(async (itemId, quantity) => {
        return executeStockAction('release', itemId, { quantity });
    }, [executeStockAction]);

    // Función para vender stock
    const sellStock = useCallback(async (itemId, quantity) => {
        return executeStockAction('sell', itemId, { quantity });
    }, [executeStockAction]);

    // Función para sincronizar todos los datos
    const syncAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [inventoryData, statsData, alertsData] = await Promise.all([
                getInventory(),
                getInventoryStats(),
                getStockAlerts()
            ]);

            setLastSync(Date.now());
            return { success: true, data: { inventory: inventoryData, stats: statsData, alerts: alertsData } };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [getInventory, getInventoryStats, getStockAlerts]);

    // Función para obtener estadísticas
    const getInventoryStats = useCallback(() => {
        return {
            inventory: inventory.length,
            stats,
            alerts: alerts.length,
            isLoading,
            isUpdating,
            error,
            cacheSize: cache.size,
            lastSync,
            updateQueueSize: updateQueue.length
        };
    }, [inventory.length, stats, alerts.length, isLoading, isUpdating, error, cache.size, lastSync, updateQueue.length]);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    // Función para exportar datos
    const exportData = useCallback((format = 'json') => {
        const data = {
            inventory,
            stats,
            alerts,
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
    }, [inventory, stats, alerts, lastSync, cache.size]);

    // Función para obtener rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            inventoryStats: getInventoryStats(),
            cacheStats: {
                size: cache.size,
                keys: Array.from(cache.keys())
            }
        };
    }, [memoryOptimization, getInventoryStats, cache]);

    // Función para obtener productos con stock bajo
    const getLowStockProducts = useCallback(() => {
        return inventory.filter(item => item.currentStock <= item.minStock);
    }, [inventory]);

    // Función para obtener productos sin stock
    const getOutOfStockProducts = useCallback(() => {
        return inventory.filter(item => item.currentStock === 0);
    }, [inventory]);

    // Función para obtener productos que necesitan reabastecimiento
    const getProductsNeedingRestock = useCallback(() => {
        return inventory.filter(item => item.currentStock <= item.minStock);
    }, [inventory]);

    // Función para obtener valor total del inventario
    const getTotalInventoryValue = useCallback(() => {
        return inventory.reduce((total, item) => {
            const price = item.product?.price || 0;
            return total + (price * item.currentStock);
        }, 0);
    }, [inventory]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        inventoryRef,

        // Datos
        inventory,
        stats,
        alerts,

        // Estados
        isLoading,
        isUpdating,
        error,
        lastSync,

        // Cache
        cache,
        cacheSize: cache.size,

        // Acciones de datos
        getInventory,
        getInventoryStats,
        getStockAlerts,
        syncAllData,

        // Acciones de stock
        executeStockAction,
        restockInventory,
        reserveStock,
        releaseStock,
        sellStock,

        // Utilidades
        getInventoryStats,
        clearCache,
        exportData,
        getPerformanceStats,
        getLowStockProducts,
        getOutOfStockProducts,
        getProductsNeedingRestock,
        getTotalInventoryValue,

        // Configuración
        enableCache: true,
        enableSync: true,
        enableBatchOperations: true
    };
};

export default useOptimizedInventory;