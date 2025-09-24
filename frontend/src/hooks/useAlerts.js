import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Query keys para alertas
export const alertKeys = {
    all: ['alerts'],
    configs: () => [...alertKeys.all, 'configs'],
    config: (productId) => [...alertKeys.configs(), productId],
    lowStock: () => [...alertKeys.all, 'low-stock'],
    stats: () => [...alertKeys.all, 'stats'],
};

// Hook para obtener todas las configuraciones de alertas
export function useAlertConfigs(filters = {}) {
    return useQuery({
        queryKey: alertKeys.configs(),
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value);
                }
            });

            const response = await api.get(`/alerts?${params.toString()}`);
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutos
        gcTime: 5 * 60 * 1000, // 5 minutos
    });
}

// Hook para obtener configuración de alertas por producto
export function useAlertConfig(productId) {
    return useQuery({
        queryKey: alertKeys.config(productId),
        queryFn: async () => {
            const response = await api.get(`/alerts/product/${productId}`);
            return response.data;
        },
        enabled: !!productId,
        staleTime: 5 * 60 * 1000, // 5 minutos
        gcTime: 10 * 60 * 1000, // 10 minutos
    });
}

// Hook para obtener alertas de stock bajo
export function useLowStockAlerts(filters = {}) {
    return useQuery({
        queryKey: alertKeys.lowStock(),
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value);
                }
            });

            const response = await api.get(`/alerts/low-stock?${params.toString()}`);
            return response.data;
        },
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 2 * 60 * 1000, // 2 minutos
        refetchInterval: 60 * 1000, // Refetch cada minuto
    });
}

// Hook para obtener estadísticas de alertas
export function useAlertStats() {
    return useQuery({
        queryKey: alertKeys.stats(),
        queryFn: async () => {
            const response = await api.get('/alerts/stats');
            return response.data;
        },
        staleTime: 1 * 60 * 1000, // 1 minuto
        gcTime: 3 * 60 * 1000, // 3 minutos
        refetchInterval: 60 * 1000, // Refetch cada minuto
    });
}

// Hook para operaciones de configuración de alertas
export function useAlertConfigMutations() {
    const queryClient = useQueryClient();

    const createConfigMutation = useMutation({
        mutationFn: async ({ productId, configData }) => {
            const response = await api.post(`/alerts/product/${productId}`, configData);
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: alertKeys.configs() });
            queryClient.invalidateQueries({ queryKey: alertKeys.config(variables.productId) });
            queryClient.invalidateQueries({ queryKey: alertKeys.stats() });
        },
    });

    const updateConfigMutation = useMutation({
        mutationFn: async ({ productId, configData }) => {
            const response = await api.put(`/alerts/product/${productId}`, configData);
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: alertKeys.configs() });
            queryClient.invalidateQueries({ queryKey: alertKeys.config(variables.productId) });
            queryClient.invalidateQueries({ queryKey: alertKeys.lowStock() });
            queryClient.invalidateQueries({ queryKey: alertKeys.stats() });
        },
    });

    const deleteConfigMutation = useMutation({
        mutationFn: async (productId) => {
            const response = await api.delete(`/alerts/product/${productId}`);
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: alertKeys.configs() });
            queryClient.invalidateQueries({ queryKey: alertKeys.config(variables) });
            queryClient.invalidateQueries({ queryKey: alertKeys.stats() });
        },
    });

    const createDefaultConfigMutation = useMutation({
        mutationFn: async (productId) => {
            const response = await api.post(`/alerts/product/${productId}/default`);
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: alertKeys.configs() });
            queryClient.invalidateQueries({ queryKey: alertKeys.config(variables) });
            queryClient.invalidateQueries({ queryKey: alertKeys.stats() });
        },
    });

    return {
        createConfig: createConfigMutation,
        updateConfig: updateConfigMutation,
        deleteConfig: deleteConfigMutation,
        createDefaultConfig: createDefaultConfigMutation,
    };
}
