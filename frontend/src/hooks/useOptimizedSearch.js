import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de búsqueda
 * Implementa debouncing, cache inteligente y cleanup automático
 */
const useOptimizedSearch = () => {
    const memoryOptimization = useComponentMemoryOptimization('OptimizedSearch');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [searchHistory, setSearchHistory] = useState([]);
    const [cache, setCache] = useState(new Map());
    const [lastSearch, setLastSearch] = useState(null);
    const searchRef = useRef(null);

    // Función para obtener clave de cache
    const getCacheKey = useCallback((endpoint, params = {}) => {
        return `${endpoint}-${JSON.stringify(params)}`;
    }, []);

    // Función para buscar
    const search = useCallback(async (query, filters = {}) => {
        if (!query.trim()) {
            setSearchResults([]);
            return { success: true, data: [] };
        }

        const cacheKey = getCacheKey('search', { query, ...filters });

        // Verificar cache
        if (cache.has(cacheKey)) {
            const cachedResults = cache.get(cacheKey);
            setSearchResults(cachedResults);
            return { success: true, data: cachedResults };
        }

        setIsSearching(true);
        setError(null);

        try {
            const params = new URLSearchParams({ q: query, ...filters });
            const response = await fetch(`/api/search?${params}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setSearchResults(data);
            setLastSearch(Date.now());

            // Agregar a historial
            setSearchHistory(prev => {
                const newHistory = [query, ...prev.filter(item => item !== query)];
                return newHistory.slice(0, 10); // Mantener solo 10 búsquedas recientes
            });

            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsSearching(false);
        }
    }, [cache, getCacheKey]);

    // Función para obtener sugerencias
    const getSuggestions = useCallback(async (query) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([]);
            return [];
        }

        const cacheKey = getCacheKey('suggestions', { query });

        // Verificar cache
        if (cache.has(cacheKey)) {
            const cachedSuggestions = cache.get(cacheKey);
            setSuggestions(cachedSuggestions);
            return cachedSuggestions;
        }

        try {
            const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Failed to get suggestions');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setSuggestions(data);

            return data;
        } catch (err) {
            console.warn('Failed to get suggestions:', err);
            return [];
        }
    }, [cache, getCacheKey]);

    // Función para buscar con debounce
    const debouncedSearch = useCallback((query, filters = {}) => {
        const timeoutId = memoryOptimization.createTimeout(() => {
            search(query, filters);
        }, 300); // 300ms debounce

        return () => memoryOptimization.registerCleanup(() => clearTimeout(timeoutId));
    }, [search, memoryOptimization]);

    // Función para buscar con debounce para sugerencias
    const debouncedSuggestions = useCallback((query) => {
        const timeoutId = memoryOptimization.createTimeout(() => {
            getSuggestions(query);
        }, 200); // 200ms debounce para sugerencias

        return () => memoryOptimization.registerCleanup(() => clearTimeout(timeoutId));
    }, [getSuggestions, memoryOptimization]);

    // Función para actualizar búsqueda
    const updateSearch = useCallback((query, filters = {}) => {
        setSearchQuery(query);

        if (query.trim()) {
            debouncedSearch(query, filters);
            debouncedSuggestions(query);
        } else {
            setSearchResults([]);
            setSuggestions([]);
        }
    }, [debouncedSearch, debouncedSuggestions]);

    // Función para limpiar búsqueda
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults([]);
        setSuggestions([]);
    }, []);

    // Función para limpiar historial
    const clearHistory = useCallback(() => {
        setSearchHistory([]);
    }, []);

    // Función para obtener estadísticas
    const getSearchStats = useCallback(() => {
        return {
            searchQuery,
            resultsCount: searchResults.length,
            suggestionsCount: suggestions.length,
            historyCount: searchHistory.length,
            isSearching,
            error,
            cacheSize: cache.size,
            lastSearch
        };
    }, [searchQuery, searchResults.length, suggestions.length, searchHistory.length, isSearching, error, cache.size, lastSearch]);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    // Función para exportar datos
    const exportData = useCallback((format = 'json') => {
        const data = {
            searchQuery,
            searchResults,
            suggestions,
            searchHistory,
            lastSearch,
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
    }, [searchQuery, searchResults, suggestions, searchHistory, lastSearch, cache.size]);

    // Función para obtener rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            searchStats: getSearchStats(),
            cacheStats: {
                size: cache.size,
                keys: Array.from(cache.keys())
            }
        };
    }, [memoryOptimization, getSearchStats, cache]);

    // Función para obtener búsquedas populares
    const getPopularSearches = useCallback(() => {
        // Simular búsquedas populares basadas en historial
        const popularSearches = searchHistory.slice(0, 5);
        return popularSearches;
    }, [searchHistory]);

    // Función para obtener búsquedas recientes
    const getRecentSearches = useCallback(() => {
        return searchHistory.slice(0, 10);
    }, [searchHistory]);

    // Función para obtener búsquedas relacionadas
    const getRelatedSearches = useCallback((query) => {
        // Simular búsquedas relacionadas basadas en la query actual
        const relatedSearches = searchHistory.filter(item =>
            item.toLowerCase().includes(query.toLowerCase()) && item !== query
        );
        return relatedSearches.slice(0, 5);
    }, [searchHistory]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        searchRef,

        // Datos
        searchQuery,
        searchResults,
        suggestions,
        searchHistory,

        // Estados
        isSearching,
        error,
        lastSearch,

        // Cache
        cache,
        cacheSize: cache.size,

        // Acciones
        search,
        getSuggestions,
        updateSearch,
        clearSearch,
        clearHistory,
        clearCache,

        // Utilidades
        getSearchStats,
        exportData,
        getPerformanceStats,
        getPopularSearches,
        getRecentSearches,
        getRelatedSearches,

        // Configuración
        enableCache: true,
        enableDebouncing: true,
        enableHistory: true
    };
};

export default useOptimizedSearch;