import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import useDebounce from './useDebounce';

/**
 * Hook optimizado para búsqueda de productos
 * Implementa debouncing, cache inteligente y filtros avanzados
 */
const useOptimizedProductSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        inStock: true
    });
    const [sortBy, setSortBy] = useState('relevance');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);

    // Debounce la búsqueda para evitar llamadas excesivas
    const debouncedQuery = useDebounce(searchQuery, 300);

    // Función para buscar productos
    const searchProducts = useCallback(async () => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: pageSize.toString(),
            sortBy,
            sortOrder,
            ...(debouncedQuery && { q: debouncedQuery }),
            ...(filters.category && { category: filters.category }),
            ...(filters.brand && { brand: filters.brand }),
            ...(filters.minPrice && { minPrice: filters.minPrice }),
            ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
            ...(filters.inStock !== undefined && { inStock: filters.inStock.toString() })
        });

        const response = await api.get(`/products/search?${params}`);
        return response.data;
    }, [debouncedQuery, page, pageSize, sortBy, sortOrder, filters]);

    // Query de búsqueda de productos
    const {
        data: searchResults,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['productSearch', debouncedQuery, page, pageSize, sortBy, sortOrder, filters],
        queryFn: searchProducts,
        enabled: !!debouncedQuery.trim() || Object.values(filters).some(filter => filter !== ''),
        staleTime: 1000 * 60 * 2, // 2 minutos
        gcTime: 1000 * 60 * 5, // 5 minutos
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000)
    });

    // Función para obtener sugerencias de búsqueda
    const fetchSearchSuggestions = useCallback(async (query) => {
        if (!query.trim() || query.length < 2) {
            return { data: [] };
        }

        const response = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
        return response.data;
    }, []);

    // Query de sugerencias de búsqueda
    const {
        data: suggestionsData,
        isLoading: isSuggestionsLoading,
        error: suggestionsError
    } = useQuery({
        queryKey: ['searchSuggestions', debouncedQuery],
        queryFn: () => fetchSearchSuggestions(debouncedQuery),
        enabled: !!debouncedQuery.trim() && debouncedQuery.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos
        retry: 1
    });

    // Función para obtener productos relacionados
    const fetchRelatedProducts = useCallback(async (productId) => {
        const response = await api.get(`/products/${productId}/related`);
        return response.data;
    }, []);

    // Query de productos relacionados
    const {
        data: relatedProductsData,
        isLoading: isRelatedLoading,
        error: relatedError
    } = useQuery({
        queryKey: ['relatedProducts'],
        queryFn: () => fetchRelatedProducts,
        enabled: false, // Solo se ejecuta cuando se llama explícitamente
        staleTime: 1000 * 60 * 10, // 10 minutos
        gcTime: 1000 * 60 * 15, // 15 minutos
        retry: 1
    });

    // Función para actualizar la búsqueda
    const updateSearch = useCallback((query) => {
        setSearchQuery(query);
        setPage(1); // Reset page when search changes
    }, []);

    // Función para actualizar filtros
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPage(1); // Reset page when filters change
    }, []);

    // Función para actualizar ordenamiento
    const updateSorting = useCallback((newSortBy, newSortOrder) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setPage(1); // Reset page when sorting changes
    }, []);

    // Función para cambiar página
    const changePage = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    // Función para cambiar tamaño de página
    const changePageSize = useCallback((newPageSize) => {
        setPageSize(newPageSize);
        setPage(1); // Reset page when page size changes
    }, []);

    // Función para limpiar búsqueda
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setFilters({
            category: '',
            brand: '',
            minPrice: '',
            maxPrice: '',
            inStock: true
        });
        setPage(1);
    }, []);

    // Función para obtener productos relacionados
    const getRelatedProducts = useCallback(async (productId) => {
        try {
            const result = await fetchRelatedProducts(productId);
            return { success: true, data: result.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }, [fetchRelatedProducts]);

    return {
        // Datos de búsqueda
        searchQuery,
        debouncedQuery,
        searchResults: searchResults?.data || [],
        pagination: searchResults?.pagination || {},
        totalResults: searchResults?.total || 0,

        // Sugerencias
        suggestions: suggestionsData?.data || [],

        // Productos relacionados
        relatedProducts: relatedProductsData?.data || [],

        // Filtros y ordenamiento
        filters,
        sortBy,
        sortOrder,
        page,
        pageSize,

        // Estados de carga
        isLoading,
        isSuggestionsLoading,
        isRelatedLoading,

        // Errores
        error,
        suggestionsError,
        relatedError,

        // Acciones
        updateSearch,
        updateFilters,
        updateSorting,
        changePage,
        changePageSize,
        clearSearch,
        getRelatedProducts,
        refetch
    };
};

export default useOptimizedProductSearch;