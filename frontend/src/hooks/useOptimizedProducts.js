import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de productos
 * Implementa cache inteligente, filtrado optimizado y cleanup automático
 */
const useOptimizedProducts = () => {
    const memoryOptimization = useComponentMemoryOptimization('OptimizedProducts');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [cache, setCache] = useState(new Map());
    const [lastSync, setLastSync] = useState(null);
    const productsRef = useRef(null);

    // Función para obtener clave de cache
    const getCacheKey = useCallback((endpoint, params = {}) => {
        return `${endpoint}-${JSON.stringify(params)}`;
    }, []);

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
            const response = await fetch(`/api/products?${params}`);
            if (!response.ok) {
                throw new Error('Failed to get products');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setProducts(data);

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener categorías
    const getCategories = useCallback(async () => {
        const cacheKey = getCacheKey('categories');

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/products/categories');
            if (!response.ok) {
                throw new Error('Failed to get categories');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setCategories(data);

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener marcas
    const getBrands = useCallback(async () => {
        const cacheKey = getCacheKey('brands');

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/products/brands');
            if (!response.ok) {
                throw new Error('Failed to get brands');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setBrands(data);

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener producto por ID
    const getProductById = useCallback(async (productId) => {
        const cacheKey = getCacheKey('product', { id: productId });

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to get product');
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
    }, [cache, getCacheKey]);

    // Función para buscar productos
    const searchProducts = useCallback(async (query, filters = {}) => {
        const cacheKey = getCacheKey('search', { query, ...filters });

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ q: query, ...filters });
            const response = await fetch(`/api/products/search?${params}`);
            if (!response.ok) {
                throw new Error('Failed to search products');
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
    }, [cache, getCacheKey]);

    // Función para obtener productos relacionados
    const getRelatedProducts = useCallback(async (productId) => {
        const cacheKey = getCacheKey('related', { productId });

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/products/${productId}/related`);
            if (!response.ok) {
                throw new Error('Failed to get related products');
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
    }, [cache, getCacheKey]);

    // Función para obtener productos destacados
    const getFeaturedProducts = useCallback(async () => {
        const cacheKey = getCacheKey('featured');

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/products/featured');
            if (!response.ok) {
                throw new Error('Failed to get featured products');
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
    }, [cache, getCacheKey]);

    // Función para sincronizar todos los datos
    const syncAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [productsData, categoriesData, brandsData] = await Promise.all([
                getProducts(),
                getCategories(),
                getBrands()
            ]);

            setLastSync(Date.now());
            return { success: true, data: { products: productsData, categories: categoriesData, brands: brandsData } };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [getProducts, getCategories, getBrands]);

    // Función para obtener estadísticas
    const getProductsStats = useCallback(() => {
        return {
            products: products.length,
            categories: categories.length,
            brands: brands.length,
            isLoading,
            isUpdating,
            error,
            cacheSize: cache.size,
            lastSync
        };
    }, [products.length, categories.length, brands.length, isLoading, isUpdating, error, cache.size, lastSync]);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    // Función para exportar datos
    const exportData = useCallback((format = 'json') => {
        const data = {
            products,
            categories,
            brands,
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
    }, [products, categories, brands, lastSync, cache.size]);

    // Función para obtener rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            productsStats: getProductsStats(),
            cacheStats: {
                size: cache.size,
                keys: Array.from(cache.keys())
            }
        };
    }, [memoryOptimization, getProductsStats, cache]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        productsRef,

        // Datos
        products,
        categories,
        brands,

        // Estados
        isLoading,
        isUpdating,
        error,
        lastSync,

        // Cache
        cache,
        cacheSize: cache.size,

        // Acciones de datos
        getProducts,
        getCategories,
        getBrands,
        getProductById,
        searchProducts,
        getRelatedProducts,
        getFeaturedProducts,
        syncAllData,

        // Utilidades
        getProductsStats,
        clearCache,
        exportData,
        getPerformanceStats,

        // Configuración
        enableCache: true,
        enableSync: true,
        enableSearch: true
    };
};

export default useOptimizedProducts;