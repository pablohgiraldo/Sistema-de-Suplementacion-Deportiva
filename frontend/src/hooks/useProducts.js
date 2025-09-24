import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Query keys para mantener consistencia
export const productKeys = {
    all: ['products'],
    lists: () => [...productKeys.all, 'list'],
    list: (filters) => [...productKeys.lists(), { filters }],
    details: () => [...productKeys.all, 'detail'],
    detail: (id) => [...productKeys.details(), id],
    inventory: (id) => [...productKeys.all, 'inventory', id],
    stats: () => [...productKeys.all, 'stats'],
    alerts: () => [...productKeys.all, 'alerts'],
};

// Hook para obtener productos con filtros
export function useProducts(filters = {}) {
    return useQuery({
        queryKey: productKeys.list(filters),
        queryFn: async () => {
            const params = new URLSearchParams();

            // Agregar filtros a los parámetros
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value);
                }
            });

            const response = await api.get(`/products?${params.toString()}`);
            return response.data;
        },
        // Los productos se consideran frescos por 2 minutos
        staleTime: 2 * 60 * 1000,
        // Mantener en cache por 5 minutos
        gcTime: 5 * 60 * 1000,
    });
}

// Hook para obtener un producto específico
export function useProduct(productId) {
    return useQuery({
        queryKey: productKeys.detail(productId),
        queryFn: async () => {
            const response = await api.get(`/products/${productId}`);
            return response.data;
        },
        enabled: !!productId, // Solo ejecutar si hay un ID
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
    });
}

// Hook para obtener inventario de un producto
export function useProductInventory(productId) {
    return useQuery({
        queryKey: productKeys.inventory(productId),
        queryFn: async () => {
            const response = await api.get(`/inventory?product=${productId}`);
            return response.data;
        },
        enabled: !!productId,
        staleTime: 30 * 1000, // 30 segundos (inventario cambia frecuentemente)
        gcTime: 2 * 60 * 1000, // 2 minutos
        // Refetch cada 30 segundos para mantener datos actualizados
        refetchInterval: 30 * 1000,
    });
}

// Hook para estadísticas de inventario
export function useInventoryStats() {
    return useQuery({
        queryKey: productKeys.stats(),
        queryFn: async () => {
            const response = await api.get('/inventory/stats');
            return response.data;
        },
        staleTime: 1 * 60 * 1000, // 1 minuto
        gcTime: 3 * 60 * 1000, // 3 minutos
        refetchInterval: 60 * 1000, // Refetch cada minuto
    });
}

// Hook para alertas de stock
export function useStockAlerts() {
    return useQuery({
        queryKey: productKeys.alerts(),
        queryFn: async () => {
            const [lowStockResponse, outOfStockResponse] = await Promise.all([
                api.get('/inventory/low-stock'),
                api.get('/inventory/out-of-stock')
            ]);

            return {
                lowStock: lowStockResponse.data,
                outOfStock: outOfStockResponse.data,
            };
        },
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
        refetchInterval: 30 * 1000, // Refetch cada 30 segundos
    });
}

// Hook para operaciones de inventario (mutations)
export function useInventoryMutations() {
    const queryClient = useQueryClient();

    const restockMutation = useMutation({
        mutationFn: async ({ itemId, quantity, notes }) => {
            const response = await api.post(`/inventory/${itemId}/restock`, {
                quantity,
                notes
            });
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas para refrescar datos
            queryClient.invalidateQueries({ queryKey: productKeys.inventory(variables.itemId) });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
            queryClient.invalidateQueries({ queryKey: productKeys.alerts() });

            // Disparar evento personalizado para actualizaciones en tiempo real
            window.dispatchEvent(new CustomEvent('inventoryUpdated', {
                detail: { action: 'restock', itemId: variables.itemId, data }
            }));
        },
    });

    const reserveMutation = useMutation({
        mutationFn: async ({ itemId, quantity }) => {
            const response = await api.post(`/inventory/${itemId}/reserve`, { quantity });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.inventory(variables.itemId) });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
        },
    });

    const releaseMutation = useMutation({
        mutationFn: async ({ itemId, quantity }) => {
            const response = await api.post(`/inventory/${itemId}/release`, { quantity });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.inventory(variables.itemId) });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
        },
    });

    const sellMutation = useMutation({
        mutationFn: async ({ itemId, quantity }) => {
            const response = await api.post(`/inventory/${itemId}/sell`, { quantity });
            return response.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.inventory(variables.itemId) });
            queryClient.invalidateQueries({ queryKey: productKeys.stats() });
            queryClient.invalidateQueries({ queryKey: productKeys.alerts() });
        },
    });

    return {
        restock: restockMutation,
        reserve: reserveMutation,
        release: releaseMutation,
        sell: sellMutation,
    };
}
