import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de carrito
 * Implementa cache inteligente, optimistic updates y cleanup automático
 */
const useOptimizedCart = () => {
    const memoryOptimization = useComponentMemoryOptimization('OptimizedCart');
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateQueue, setUpdateQueue] = useState([]);
    const [cache, setCache] = useState(new Map());
    const [lastSync, setLastSync] = useState(null);
    const cartRef = useRef(null);

    // Función para obtener clave de cache
    const getCacheKey = useCallback((endpoint, params = {}) => {
        return `${endpoint}-${JSON.stringify(params)}`;
    }, []);

    // Función para agregar item al carrito
    const addItem = useCallback(async (productId, quantity = 1) => {
        const cacheKey = getCacheKey('cartItem', { productId, quantity });

        // Verificar cache
        if (cache.has(cacheKey)) {
            const cachedItem = cache.get(cacheKey);
            setCartItems(prev => [...prev, cachedItem]);
            return { success: true, data: cachedItem };
        }

        setIsUpdating(true);
        setError(null);

        try {
            // Optimistic update
            const optimisticItem = {
                id: Date.now(),
                productId,
                quantity,
                product: { _id: productId },
                isOptimistic: true
            };

            setCartItems(prev => [...prev, optimisticItem]);

            // Simular llamada a API
            const response = await fetch(`/api/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity })
            });

            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Reemplazar item optimista con datos reales
            setCartItems(prev =>
                prev.map(item =>
                    item.id === optimisticItem.id ? data : item
                )
            );

            return { success: true, data };
        } catch (err) {
            setError(err.message);

            // Revertir optimistic update
            setCartItems(prev =>
                prev.filter(item => item.id !== optimisticItem.id)
            );

            return { success: false, error: err.message };
        } finally {
            setIsUpdating(false);
        }
    }, [cache, getCacheKey]);

    // Función para actualizar cantidad
    const updateQuantity = useCallback(async (productId, quantity) => {
        setIsUpdating(true);
        setError(null);

        try {
            // Optimistic update
            setCartItems(prev =>
                prev.map(item =>
                    item.productId === productId
                        ? { ...item, quantity, isOptimistic: true }
                        : item
                )
            );

            // Simular llamada a API
            const response = await fetch(`/api/cart/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });

            if (!response.ok) {
                throw new Error('Failed to update item quantity');
            }

            const data = await response.json();

            // Actualizar cache
            const cacheKey = getCacheKey('cartItem', { productId, quantity });
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Reemplazar item optimista con datos reales
            setCartItems(prev =>
                prev.map(item =>
                    item.productId === productId ? data : item
                )
            );

            return { success: true, data };
        } catch (err) {
            setError(err.message);

            // Revertir optimistic update
            setCartItems(prev =>
                prev.map(item =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity, isOptimistic: false }
                        : item
                )
            );

            return { success: false, error: err.message };
        } finally {
            setIsUpdating(false);
        }
    }, [getCacheKey]);

    // Función para eliminar item
    const removeItem = useCallback(async (productId) => {
        setIsUpdating(true);
        setError(null);

        try {
            // Optimistic update
            const itemToRemove = cartItems.find(item => item.productId === productId);
            setCartItems(prev => prev.filter(item => item.productId !== productId));

            // Simular llamada a API
            const response = await fetch(`/api/cart/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }

            // Limpiar cache
            setCache(prev => {
                const newCache = new Map(prev);
                for (const [key, value] of newCache.entries()) {
                    if (value.productId === productId) {
                        newCache.delete(key);
                    }
                }
                return newCache;
            });

            return { success: true };
        } catch (err) {
            setError(err.message);

            // Revertir optimistic update
            if (itemToRemove) {
                setCartItems(prev => [...prev, itemToRemove]);
            }

            return { success: false, error: err.message };
        } finally {
            setIsUpdating(false);
        }
    }, [cartItems]);

    // Función para limpiar carrito
    const clearCart = useCallback(async () => {
        setIsUpdating(true);
        setError(null);

        try {
            // Optimistic update
            const itemsToRestore = [...cartItems];
            setCartItems([]);

            // Simular llamada a API
            const response = await fetch('/api/cart', {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to clear cart');
            }

            // Limpiar cache
            setCache(new Map());

            return { success: true };
        } catch (err) {
            setError(err.message);

            // Revertir optimistic update
            setCartItems(itemsToRestore);

            return { success: false, error: err.message };
        } finally {
            setIsUpdating(false);
        }
    }, [cartItems]);

    // Función para obtener totales
    const getTotals = useCallback(() => {
        return cartItems.reduce((totals, item) => {
            const price = item.product?.price || 0;
            const quantity = item.quantity || 0;
            const subtotal = price * quantity;

            return {
                totalItems: totals.totalItems + quantity,
                totalPrice: totals.totalPrice + subtotal,
                totalItemsCount: totals.totalItemsCount + 1
            };
        }, { totalItems: 0, totalPrice: 0, totalItemsCount: 0 });
    }, [cartItems]);

    // Función para obtener estadísticas
    const getCartStats = useCallback(() => {
        const totals = getTotals();
        return {
            ...totals,
            items: cartItems.length,
            isLoading,
            isUpdating,
            error,
            cacheSize: cache.size,
            updateQueueSize: updateQueue.length,
            lastSync
        };
    }, [cartItems, isLoading, isUpdating, error, cache.size, updateQueue.length, lastSync, getTotals]);

    // Función para exportar carrito
    const exportCart = useCallback((format = 'json') => {
        const data = cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            product: item.product
        }));

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                if (data.length === 0) return '';
                const headers = Object.keys(data[0]).join(',');
                const rows = data.map(item => Object.values(item).join(','));
                return [headers, ...rows].join('\n');
            default:
                return data;
        }
    }, [cartItems]);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    // Función para obtener items optimistas
    const getOptimisticItems = useCallback(() => {
        return cartItems.filter(item => item.isOptimistic);
    }, [cartItems]);

    // Función para sincronizar con servidor
    const syncWithServer = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/cart');
            if (!response.ok) {
                throw new Error('Failed to sync cart with server');
            }

            const data = await response.json();
            setCartItems(data.items || []);

            // Actualizar cache
            const newCache = new Map();
            data.items?.forEach(item => {
                const cacheKey = getCacheKey('cartItem', { productId: item.productId, quantity: item.quantity });
                newCache.set(cacheKey, item);
            });
            setCache(newCache);

            setLastSync(Date.now());
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [getCacheKey]);

    // Función para obtener rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            cartStats: getCartStats(),
            cacheStats: {
                size: cache.size,
                keys: Array.from(cache.keys())
            }
        };
    }, [memoryOptimization, getCartStats, cache]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        cartRef,

        // Datos
        items: cartItems,
        totals: getTotals(),

        // Estados
        isLoading,
        isUpdating,
        error,
        lastSync,

        // Cache
        cache,
        cacheSize: cache.size,

        // Acciones
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        syncWithServer,
        clearCache,

        // Utilidades
        getCartStats,
        getOptimisticItems,
        exportCart,
        getPerformanceStats,

        // Configuración
        enableOptimisticUpdates: true,
        enableCache: true,
        enableSync: true
    };
};

export default useOptimizedCart;