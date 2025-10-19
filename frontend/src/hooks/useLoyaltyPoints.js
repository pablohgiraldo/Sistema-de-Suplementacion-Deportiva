/**
 * Custom Hook: useLoyaltyPoints
 * 
 * Maneja toda la lógica relacionada con puntos de lealtad:
 * - Obtener balance actual
 * - Calcular descuentos
 * - Canjear puntos
 * - Ver historial de transacciones
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useLoyaltyPoints = () => {
    const queryClient = useQueryClient();

    // Obtener balance y resumen de puntos
    const {
        data: loyaltyData,
        isLoading: isLoadingPoints,
        isError: isErrorPoints,
        error: errorPoints,
        refetch: refetchPoints
    } = useQuery({
        queryKey: ['loyalty-points'],
        queryFn: async () => {
            const response = await api.get('/loyalty/me');
            return response.data.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: 2
    });

    // Calcular descuento (preview sin canjear)
    const calculateDiscountMutation = useMutation({
        mutationFn: async (pointsToRedeem) => {
            const response = await api.post('/loyalty/calculate-discount', {
                pointsToRedeem
            });
            return response.data.data;
        }
    });

    // Canjear puntos
    const redeemPointsMutation = useMutation({
        mutationFn: async (pointsToRedeem) => {
            const response = await api.post('/loyalty/redeem', {
                pointsToRedeem
            });
            return response.data.data;
        },
        onSuccess: () => {
            // Invalidar cache para actualizar balance
            queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
            queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
        }
    });

    // Cancelar canje (reversar)
    const cancelRedeemMutation = useMutation({
        mutationFn: async ({ points, reason }) => {
            const response = await api.post('/loyalty/cancel-redeem', {
                points,
                reason
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['loyalty-points'] });
            queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] });
        }
    });

    // Helpers
    const calculateDiscount = async (points) => {
        try {
            const result = await calculateDiscountMutation.mutateAsync(points);
            return result;
        } catch (error) {
            console.error('Error al calcular descuento:', error);
            throw error;
        }
    };

    const redeemPoints = async (points) => {
        try {
            const result = await redeemPointsMutation.mutateAsync(points);
            return result;
        } catch (error) {
            console.error('Error al canjear puntos:', error);
            throw error;
        }
    };

    const cancelRedeem = async (points, reason) => {
        try {
            const result = await cancelRedeemMutation.mutateAsync({ points, reason });
            return result;
        } catch (error) {
            console.error('Error al cancelar canje:', error);
            throw error;
        }
    };

    return {
        // Datos
        loyaltyData,
        currentBalance: loyaltyData?.currentBalance || 0,
        loyaltyLevel: loyaltyData?.loyaltyLevel || 'Bronce',
        valueInDollars: loyaltyData?.valueInDollars || 0,

        // Estados de carga
        isLoadingPoints,
        isErrorPoints,
        errorPoints,

        // Mutaciones
        calculateDiscount,
        redeemPoints,
        cancelRedeem,

        // Estados de mutaciones
        isCalculating: calculateDiscountMutation.isPending,
        isRedeeming: redeemPointsMutation.isPending,
        isCancelling: cancelRedeemMutation.isPending,

        // Errores de mutaciones
        calculateError: calculateDiscountMutation.error,
        redeemError: redeemPointsMutation.error,
        cancelError: cancelRedeemMutation.error,

        // Funciones auxiliares
        refetchPoints
    };
};

export const useLoyaltyTransactions = (page = 1, limit = 20) => {
    const {
        data,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['loyalty-transactions', page, limit],
        queryFn: async () => {
            const response = await api.get(`/loyalty/transactions?page=${page}&limit=${limit}`);
            return response.data.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutos
        retry: 1
    });

    return {
        transactions: data?.transactions || [],
        currentBalance: data?.currentBalance || 0,
        customerCode: data?.customerCode || '',
        loyaltyLevel: data?.loyaltyLevel || 'Bronce',
        pagination: data?.pagination || { total: 0, page: 1, limit, pages: 0 },
        isLoading,
        isError,
        error,
        refetch
    };
};

export default useLoyaltyPoints;

