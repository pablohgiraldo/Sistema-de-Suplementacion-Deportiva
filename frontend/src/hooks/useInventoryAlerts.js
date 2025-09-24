import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Query keys para alertas de inventario
export const inventoryAlertKeys = {
    all: ['inventory-alerts'],
    list: (filters) => [...inventoryAlertKeys.all, 'list', filters],
    stats: () => [...inventoryAlertKeys.all, 'stats'],
};

// Hook para obtener alertas de inventario
export function useInventoryAlerts(filters = {}) {
    return useQuery({
        queryKey: inventoryAlertKeys.list(filters),
        queryFn: async () => {
            const params = new URLSearchParams();

            // Agregar filtros a los parámetros
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value);
                }
            });

            const response = await api.get(`/inventory/alerts?${params.toString()}`);
            return response.data;
        },
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
        refetchInterval: 60 * 1000, // Refetch cada minuto
    });
}

// Hook para obtener estadísticas de alertas de inventario
export function useInventoryAlertStats() {
    return useQuery({
        queryKey: inventoryAlertKeys.stats(),
        queryFn: async () => {
            const response = await api.get('/inventory/alerts');
            return response.data.statistics;
        },
        staleTime: 1 * 60 * 1000, // 1 minuto
        gcTime: 3 * 60 * 1000, // 3 minutos
        refetchInterval: 60 * 1000, // Refetch cada minuto
    });
}

// Hook para alertas críticas únicamente
export function useCriticalInventoryAlerts() {
    return useQuery({
        queryKey: inventoryAlertKeys.list({ severity: 'critical' }),
        queryFn: async () => {
            const response = await api.get('/inventory/alerts?severity=critical');
            return response.data;
        },
        staleTime: 15 * 1000, // 15 segundos (más frecuente para alertas críticas)
        gcTime: 1 * 60 * 1000, // 1 minuto
        refetchInterval: 30 * 1000, // Refetch cada 30 segundos
    });
}

// Hook para alertas de stock bajo únicamente
export function useLowStockAlerts() {
    return useQuery({
        queryKey: inventoryAlertKeys.list({ severity: 'warning' }),
        queryFn: async () => {
            const response = await api.get('/inventory/alerts?severity=warning');
            return response.data;
        },
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
        refetchInterval: 60 * 1000, // Refetch cada minuto
    });
}

// Hook para alertas de stock agotado únicamente
export function useOutOfStockAlerts() {
    return useQuery({
        queryKey: inventoryAlertKeys.list({ severity: 'critical' }),
        queryFn: async () => {
            const response = await api.get('/inventory/alerts?severity=critical');
            return response.data;
        },
        staleTime: 15 * 1000, // 15 segundos
        gcTime: 1 * 60 * 1000, // 1 minuto
        refetchInterval: 30 * 1000, // Refetch cada 30 segundos
    });
}

// Hook para operaciones de alertas de inventario
export function useInventoryAlertMutations() {
    const queryClient = useQueryClient();

    const refreshAlertsMutation = useMutation({
        mutationFn: async () => {
            // Invalidar todas las queries de alertas para forzar refetch
            await queryClient.invalidateQueries({ queryKey: inventoryAlertKeys.all });
            return { success: true };
        },
        onSuccess: () => {
            // Mostrar notificación de éxito
            console.log('Alertas de inventario actualizadas');
        },
    });

    const markAlertAsReadMutation = useMutation({
        mutationFn: async ({ alertId, productId }) => {
            // Aquí podrías implementar lógica para marcar alertas como leídas
            // Por ahora solo invalidamos las queries
            await queryClient.invalidateQueries({ queryKey: inventoryAlertKeys.all });
            return { success: true };
        },
        onSuccess: () => {
            console.log('Alerta marcada como leída');
        },
    });

    return {
        refreshAlerts: refreshAlertsMutation,
        markAsRead: markAlertAsReadMutation,
    };
}

// Hook para obtener alertas con filtros avanzados
export function useFilteredInventoryAlerts(filters = {}) {
    return useQuery({
        queryKey: inventoryAlertKeys.list(filters),
        queryFn: async () => {
            const params = new URLSearchParams();

            // Filtros disponibles
            const {
                severity,
                includeInactive = false,
                limit = 50,
                page = 1,
                sortBy = 'severity',
                sortOrder = 'desc'
            } = filters;

            if (severity) params.append('severity', severity);
            if (includeInactive) params.append('includeInactive', 'true');
            if (limit) params.append('limit', limit.toString());
            if (page) params.append('page', page.toString());
            if (sortBy) params.append('sortBy', sortBy);
            if (sortOrder) params.append('sortOrder', sortOrder);

            const response = await api.get(`/inventory/alerts?${params.toString()}`);
            return response.data;
        },
        staleTime: 30 * 1000,
        gcTime: 2 * 60 * 1000,
    });
}

// Hook para obtener resumen de alertas (para dashboard)
export function useInventoryAlertsSummary() {
    return useQuery({
        queryKey: inventoryAlertKeys.stats(),
        queryFn: async () => {
            const response = await api.get('/inventory/alerts');
            const data = response.data;

            return {
                totalAlerts: data.totalCount,
                criticalAlerts: data.statistics.alertCounts.outOfStock,
                errorAlerts: data.statistics.alertCounts.criticalStock,
                warningAlerts: data.statistics.alertCounts.lowStock,
                activeAlerts: data.statistics.activeAlerts,
                lastUpdated: data.statistics.lastUpdated
            };
        },
        staleTime: 30 * 1000,
        gcTime: 2 * 60 * 1000,
        refetchInterval: 60 * 1000,
    });
}
