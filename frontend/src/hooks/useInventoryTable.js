import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import usePolling from './usePolling';

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
    const [debouncedFilters, setDebouncedFilters] = useState({
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

            const params = new URLSearchParams();
            params.set('page', pagination.currentPage.toString());
            params.set('limit', pagination.limit.toString());
            params.set('sortBy', sorting.sortBy);
            params.set('sortOrder', sorting.sortOrder);

            Object.entries(debouncedFilters).forEach(([key, value]) => {
                if (key === 'search' && typeof value === 'string') {
                    const trimmed = value.trim();
                    if (trimmed) params.set(key, trimmed);
                    return;
                }

                if (typeof value === 'boolean') {
                    if (value) params.set(key, 'true');
                    return;
                }

                if (value !== '' && value !== null && value !== undefined) {
                    params.set(key, String(value));
                }
            });

            const queryString = params.toString();
            const response = await api.get(`/inventory${queryString ? `?${queryString}` : ''}`);
            console.log('Inventory API response:', response.data);

            if (response.data.success) {
                console.log('Setting inventory data:', response.data.data);
                setInventory(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination.totalPages,
                    totalCount: response.data.totalCount
                }));
            } else {
                console.error('Inventory API returned success: false', response.data);
                setError('Error al cargar el inventario');
            }
        } catch (err) {
            console.error('Error fetching inventory:', err);

            if (err.response?.status === 429) {
                setError('Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.');
            } else {
                setError(err.response?.data?.message || 'Error al cargar el inventario');
            }
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, sorting, debouncedFilters]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 350);

        return () => clearTimeout(handler);
    }, [filters]);

    // Efecto para cargar inventario inicial
    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Listener para actualizaciones de inventario
    useEffect(() => {
        let lastUpdateTime = 0;
        
        const handleInventoryUpdate = (event) => {
            const now = Date.now();
            
            // Throttle: solo actualizar si han pasado al menos 2 segundos desde la última vez
            if (now - lastUpdateTime < 2000) {
                console.log('InventoryTable: Update throttled');
                return;
            }
            
            lastUpdateTime = now;
            console.log('InventoryTable: Inventory update detected:', event.detail);
            
            // Refrescar datos cuando hay actualizaciones
            setTimeout(() => {
                fetchInventory();
            }, 300); // Pequeño delay para evitar conflictos
        };

        window.addEventListener('inventoryUpdated', handleInventoryUpdate);
        
        return () => {
            window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
        };
    }, [fetchInventory]);

    // Polling optimizado con backoff exponencial
    const { pausePolling, resumePolling } = usePolling(fetchInventory, 45000, {
        enabled: true,
        maxRetries: 3,
        backoffMultiplier: 2,
        maxInterval: 300000, // 5 minutos máximo
        pauseOnError: true,
        pauseOnFocus: true
    });

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

            console.log(`Ejecutando acción ${action} para item ${itemId} con datos:`, data);

            let response;
            switch (action) {
                case 'restock':
                    console.log(`Iniciando reabastecimiento con timeout de 10 segundos`);
                    // Volver al endpoint real
                    response = await api.post(`/inventory/${itemId}/restock`, data, {
                        timeout: 10000
                    });
                    console.log(`Respuesta de reabastecimiento recibida:`, response.data);
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
                console.log('Stock action successful, refreshing inventory...');
                
                // Actualizar la tabla inmediatamente - forzar refresh
                setTimeout(async () => {
                    await fetchInventory();
                }, 500);

                // Notificar a otros componentes que se actualicen
                window.dispatchEvent(new CustomEvent('inventoryUpdated', {
                    detail: { action, itemId, data, response: response.data }
                }));

                return { success: true, message: response.data.message };
            } else {
                throw new Error(response.data.message || 'Error en la acción');
            }
        } catch (err) {
            console.error(`Error en acción ${action}:`, err);

            let errorMessage;
            if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                errorMessage = `La operación ${action} está tomando más tiempo del esperado. Por favor, inténtalo de nuevo.`;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            } else {
                errorMessage = `Error al ejecutar ${action}`;
            }

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
