import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Hook para obtener órdenes del usuario
export const useOrders = (filters = {}) => {
    return useQuery({
        queryKey: ['orders', filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filters.status) params.append('status', filters.status);
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.page) params.append('page', filters.page);

            const response = await api.get(`/orders?${params.toString()}`);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
    });
};

// Hook para obtener una orden específica
export const useOrder = (orderId) => {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        },
        enabled: !!orderId,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });
};

// Hook para crear una orden
export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (orderData) => {
            const response = await api.post('/orders', orderData);
            return response.data;
        },
        onSuccess: (data) => {
            // Invalidar la caché de órdenes para refrescar la lista
            queryClient.invalidateQueries(['orders']);

            // Agregar la nueva orden a la caché
            queryClient.setQueryData(['order', data.data._id], data);
        },
        onError: (error) => {
            console.error('Error al crear orden:', error);
        }
    });
};

// Hook para cancelar una orden
export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, reason }) => {
            const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
            return response.data;
        },
        onSuccess: (data, variables) => {
            // Actualizar la caché de la orden específica
            queryClient.setQueryData(['order', variables.orderId], data);

            // Invalidar la lista de órdenes
            queryClient.invalidateQueries(['orders']);
        },
        onError: (error) => {
            console.error('Error al cancelar orden:', error);
        }
    });
};

// Hook para obtener estadísticas de órdenes (admin)
export const useOrderStats = (filters = {}) => {
    return useQuery({
        queryKey: ['orderStats', filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/orders/reports/stats?${params.toString()}`);
            return response.data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutos
        cacheTime: 5 * 60 * 1000, // 5 minutos
    });
};

// Hook para obtener ventas por período (admin)
export const useSalesByPeriod = (period, filters = {}) => {
    return useQuery({
        queryKey: ['salesByPeriod', period, filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            params.append('period', period);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/orders/reports/sales-by-period?${params.toString()}`);
            return response.data;
        },
        staleTime: 2 * 60 * 1000,
        cacheTime: 5 * 60 * 1000,
    });
};

// Hook para obtener productos más vendidos (admin)
export const useTopSellingProducts = (filters = {}) => {
    return useQuery({
        queryKey: ['topSellingProducts', filters],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (filters.limit) params.append('limit', filters.limit);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await api.get(`/orders/reports/top-products?${params.toString()}`);
            return response.data;
        },
        staleTime: 2 * 60 * 1000,
        cacheTime: 5 * 60 * 1000,
    });
};

export default {
    useOrders,
    useOrder,
    useCreateOrder,
    useCancelOrder,
    useOrderStats,
    useSalesByPeriod,
    useTopSellingProducts
};
