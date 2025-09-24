import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de listas
 * Implementa paginación, filtrado, ordenamiento y cleanup automático
 */
const useOptimizedList = (items, options = {}) => {
    const {
        pageSize = 20,
        maxItems = 1000,
        enableVirtualization = false,
        enablePagination = true,
        enableFiltering = true,
        enableSorting = true
    } = options;

    const memoryOptimization = useComponentMemoryOptimization('OptimizedList');
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const listRef = useRef(null);

    // Función para filtrar items
    const filterItems = useCallback((itemsToFilter, filtersToApply, searchQueryToApply) => {
        let filtered = [...itemsToFilter];

        // Aplicar filtros
        if (enableFiltering && Object.keys(filtersToApply).length > 0) {
            filtered = filtered.filter(item => {
                return Object.entries(filtersToApply).every(([key, value]) => {
                    if (!value) return true;
                    const itemValue = item[key];
                    if (typeof itemValue === 'string') {
                        return itemValue.toLowerCase().includes(value.toLowerCase());
                    }
                    return itemValue === value;
                });
            });
        }

        // Aplicar búsqueda
        if (enableFiltering && searchQueryToApply) {
            filtered = filtered.filter(item => {
                return Object.values(item).some(value => {
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(searchQueryToApply.toLowerCase());
                    }
                    return false;
                });
            });
        }

        return filtered;
    }, [enableFiltering]);

    // Función para ordenar items
    const sortItems = useCallback((itemsToSort, sortByField, sortOrderField) => {
        if (!enableSorting || !sortByField) return itemsToSort;

        return [...itemsToSort].sort((a, b) => {
            const aValue = a[sortByField];
            const bValue = b[sortByField];

            if (aValue < bValue) return sortOrderField === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrderField === 'asc' ? 1 : -1;
            return 0;
        });
    }, [enableSorting]);

    // Función para paginar items
    const paginateItems = useCallback((itemsToPaginate, page, size) => {
        if (!enablePagination) return itemsToPaginate;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        return itemsToPaginate.slice(startIndex, endIndex);
    }, [enablePagination]);

    // Items procesados
    const processedItems = useMemo(() => {
        setIsLoading(true);
        setError(null);

        try {
            // Filtrar
            let filtered = filterItems(items, filters, searchQuery);

            // Ordenar
            let sorted = sortItems(filtered, sortBy, sortOrder);

            // Limitar tamaño máximo
            if (sorted.length > maxItems) {
                sorted = sorted.slice(0, maxItems);
            }

            // Paginar
            let paginated = paginateItems(sorted, currentPage, pageSize);

            setIsLoading(false);
            return {
                items: paginated,
                totalItems: sorted.length,
                totalPages: Math.ceil(sorted.length / pageSize),
                hasNextPage: currentPage < Math.ceil(sorted.length / pageSize),
                hasPreviousPage: currentPage > 1
            };
        } catch (err) {
            setError(err);
            setIsLoading(false);
            return {
                items: [],
                totalItems: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false
            };
        }
    }, [items, filters, searchQuery, sortBy, sortOrder, currentPage, pageSize, maxItems, filterItems, sortItems, paginateItems]);

    // Función para actualizar filtros
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setCurrentPage(1); // Reset page when filters change
    }, []);

    // Función para actualizar búsqueda
    const updateSearch = useCallback((query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset page when search changes
    }, []);

    // Función para actualizar ordenamiento
    const updateSorting = useCallback((field, order) => {
        setSortBy(field);
        setSortOrder(order);
        setCurrentPage(1); // Reset page when sorting changes
    }, []);

    // Función para cambiar página
    const changePage = useCallback((page) => {
        setCurrentPage(page);
    }, []);

    // Función para ir a la siguiente página
    const nextPage = useCallback(() => {
        if (processedItems.hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    }, [processedItems.hasNextPage]);

    // Función para ir a la página anterior
    const previousPage = useCallback(() => {
        if (processedItems.hasPreviousPage) {
            setCurrentPage(prev => prev - 1);
        }
    }, [processedItems.hasPreviousPage]);

    // Función para limpiar filtros
    const clearFilters = useCallback(() => {
        setFilters({});
        setSearchQuery('');
        setCurrentPage(1);
    }, []);

    // Función para obtener estadísticas
    const getListStats = useCallback(() => {
        return {
            totalItems: processedItems.totalItems,
            currentPage,
            totalPages: processedItems.totalPages,
            pageSize,
            hasNextPage: processedItems.hasNextPage,
            hasPreviousPage: processedItems.hasPreviousPage,
            filters,
            searchQuery,
            sortBy,
            sortOrder,
            isLoading,
            error
        };
    }, [processedItems, currentPage, pageSize, filters, searchQuery, sortBy, sortOrder, isLoading, error]);

    // Función para exportar datos
    const exportData = useCallback((format = 'json') => {
        const data = processedItems.items;

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
    }, [processedItems.items]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        listRef,

        // Datos
        items: processedItems.items,
        totalItems: processedItems.totalItems,
        totalPages: processedItems.totalPages,

        // Estados
        currentPage,
        filters,
        searchQuery,
        sortBy,
        sortOrder,
        isLoading,
        error,

        // Navegación
        hasNextPage: processedItems.hasNextPage,
        hasPreviousPage: processedItems.hasPreviousPage,

        // Acciones
        updateFilters,
        updateSearch,
        updateSorting,
        changePage,
        nextPage,
        previousPage,
        clearFilters,
        getListStats,
        exportData,

        // Configuración
        pageSize,
        maxItems,
        enableVirtualization,
        enablePagination,
        enableFiltering,
        enableSorting
    };
};

export default useOptimizedList;
