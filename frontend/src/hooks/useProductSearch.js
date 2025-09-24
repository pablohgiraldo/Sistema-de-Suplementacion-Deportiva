import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import useDebounce from './useDebounce';

/**
 * Hook optimizado para búsqueda de productos con debouncing
 * Reduce las llamadas a la API y mejora el rendimiento
 */
const useProductSearch = (initialQuery = '') => {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [isSearching, setIsSearching] = useState(false);

    // Debounce la búsqueda para evitar llamadas excesivas
    const debouncedQuery = useDebounce(searchQuery, 300);

    // Función para buscar productos
    const searchProducts = useCallback(async (query) => {
        if (!query.trim()) {
            return { data: [] };
        }

        try {
            const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }, []);

    // Query de React Query para la búsqueda
    const {
        data: searchResults,
        isLoading: isSearchLoading,
        error: searchError,
        refetch: refetchSearch
    } = useQuery({
        queryKey: ['productSearch', debouncedQuery],
        queryFn: () => searchProducts(debouncedQuery),
        enabled: !!debouncedQuery.trim(),
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // 10 minutos
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000)
    });

    // Función para actualizar la búsqueda
    const updateSearch = useCallback((query) => {
        setSearchQuery(query);
        setIsSearching(!!query.trim());
    }, []);

    // Función para limpiar la búsqueda
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setIsSearching(false);
    }, []);

    // Efecto para manejar el estado de búsqueda
    useEffect(() => {
        setIsSearching(!!debouncedQuery.trim());
    }, [debouncedQuery]);

    return {
        searchQuery,
        debouncedQuery,
        searchResults: searchResults?.data || [],
        isSearching,
        isSearchLoading,
        searchError,
        updateSearch,
        clearSearch,
        refetchSearch
    };
};

export default useProductSearch;
