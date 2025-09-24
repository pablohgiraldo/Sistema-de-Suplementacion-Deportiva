import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Query keys para admin
export const adminKeys = {
    all: ['admin'],
    users: () => [...adminKeys.all, 'users'],
    inventory: () => [...adminKeys.all, 'inventory'],
    inventoryList: (filters) => [...adminKeys.inventory(), 'list', { filters }],
    stats: () => [...adminKeys.all, 'stats'],
    alerts: () => [...adminKeys.all, 'alerts'],
};

// Hook para obtener usuarios (solo admin)
export function useUsers() {
    return useQuery({
        queryKey: adminKeys.users(),
        queryFn: async () => {
            const response = await api.get('/users');
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
    });
}

// Hook para obtener inventario con filtros
export function useInventory(filters = {}) {
    return useQuery({
        queryKey: adminKeys.inventoryList(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value);
                }
            });

            const response = await api.get(`/inventory?${params.toString()}`);
            return response.data;
        },
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
        refetchInterval: 30 * 1000, // Refetch cada 30 segundos
    });
}

// Hook para estadísticas de admin
export function useAdminStats() {
    return useQuery({
        queryKey: adminKeys.stats(),
        queryFn: async () => {
            const [usersResponse, inventoryResponse] = await Promise.all([
                api.get('/users'),
                api.get('/inventory/stats')
            ]);

            return {
                users: usersResponse.data,
                inventory: inventoryResponse.data,
            };
        },
        staleTime: 1 * 60 * 1000, // 1 minuto
        gcTime: 3 * 60 * 1000, // 3 minutos
        refetchInterval: 60 * 1000, // Refetch cada minuto
    });
}

// Hook para alertas de stock
export function useAdminAlerts() {
    return useQuery({
        queryKey: adminKeys.alerts(),
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
export function useAdminMutations() {
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
            // Invalidar todas las queries relacionadas
            queryClient.invalidateQueries({ queryKey: adminKeys.inventory() });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
            queryClient.invalidateQueries({ queryKey: adminKeys.alerts() });

            // Disparar evento personalizado
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.inventory() });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
        },
    });

    const releaseMutation = useMutation({
        mutationFn: async ({ itemId, quantity }) => {
            const response = await api.post(`/inventory/${itemId}/release`, { quantity });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.inventory() });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
        },
    });

    const sellMutation = useMutation({
        mutationFn: async ({ itemId, quantity }) => {
            const response = await api.post(`/inventory/${itemId}/sell`, { quantity });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.inventory() });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
            queryClient.invalidateQueries({ queryKey: adminKeys.alerts() });
        },
    });

    return {
        restock: restockMutation,
        reserve: reserveMutation,
        release: releaseMutation,
        sell: sellMutation,
    };
}
