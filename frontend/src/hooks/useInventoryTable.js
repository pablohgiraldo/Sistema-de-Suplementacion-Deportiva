import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useInventoryTable = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        stock_min: '',
        stock_max: '',
        needs_restock: false,
        search: ''
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        limit: 10,
        totalCount: 0
    });
    const [sorting, setSorting] = useState({
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [actionLoading, setActionLoading] = useState({});

    // Función para obtener inventario
    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                sortBy: sorting.sortBy,
                sortOrder: sorting.sortOrder,
                ...filters
            });

            const response = await api.get(`/inventory?${params}`);

            if (response.data.success) {
                setInventory(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination.totalPages,
                    totalCount: response.data.totalCount
                }));
            } else {
                setError('Error al cargar el inventario');
            }
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError(err.response?.data?.message || 'Error al cargar el inventario');
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, sorting, filters]);

    // Efecto para cargar inventario inicial
    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Función para actualizar filtros
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, []);

    // Función para actualizar paginación
    const updatePagination = useCallback((newPagination) => {
        setPagination(prev => ({ ...prev, ...newPagination }));
    }, []);

    // Función para actualizar ordenamiento
    const updateSorting = useCallback((newSorting) => {
        setSorting(prev => ({ ...prev, ...newSorting }));
    }, []);

    // Función para manejar selección de items
    const toggleItemSelection = useCallback((itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        if (selectedItems.length === inventory.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(inventory.map(item => item._id));
        }
    }, [selectedItems.length, inventory]);

    // Función para ejecutar acciones de stock
    const executeStockAction = useCallback(async (action, itemId, data = {}) => {
        try {
            setActionLoading(prev => ({ ...prev, [itemId]: true }));
            setError(null);

            let response;
            switch (action) {
                case 'restock':
                    response = await api.post(`/inventory/${itemId}/restock`, data);
                    break;
                case 'reserve':
                    response = await api.post(`/inventory/${itemId}/reserve`, data);
                    break;
                case 'release':
                    response = await api.post(`/inventory/${itemId}/release`, data);
                    break;
                case 'sell':
                    response = await api.post(`/inventory/${itemId}/sell`, data);
                    break;
                default:
                    throw new Error('Acción no válida');
            }

            if (response.data.success) {
                // Actualizar la tabla inmediatamente
                await fetchInventory();
                return { success: true, message: response.data.message };
            } else {
                throw new Error(response.data.message || 'Error en la acción');
            }
        } catch (err) {
            console.error(`Error en acción ${action}:`, err);
            const errorMessage = err.response?.data?.message || err.message || `Error al ejecutar ${action}`;
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setActionLoading(prev => ({ ...prev, [itemId]: false }));
        }
    }, [fetchInventory]);

    // Función para refrescar datos
    const refreshData = useCallback(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Función para limpiar errores
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Función para limpiar selección
    const clearSelection = useCallback(() => {
        setSelectedItems([]);
    }, []);

    return {
        // Estado
        inventory,
        loading,
        error,
        filters,
        pagination,
        sorting,
        selectedItems,
        actionLoading,

        // Acciones
        updateFilters,
        updatePagination,
        updateSorting,
        toggleItemSelection,
        toggleSelectAll,
        executeStockAction,
        refreshData,
        clearError,
        clearSelection
    };
};

export default useInventoryTable;
