import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Query keys para el carrito
export const cartKeys = {
    all: ['cart'],
    items: () => [...cartKeys.all, 'items'],
    count: () => [...cartKeys.all, 'count'],
};

// Hook para obtener items del carrito
export function useCartItems() {
    return useQuery({
        queryKey: cartKeys.items(),
        queryFn: async () => {
            const response = await api.get('/cart');
            return response.data;
        },
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 5 * 60 * 1000, // 5 minutos
    });
}

// Hook para obtener conteo del carrito
export function useCartCount() {
    return useQuery({
        queryKey: cartKeys.count(),
        queryFn: async () => {
            const response = await api.get('/cart');
            return response.data?.items?.length || 0;
        },
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
    });
}

// Hook para operaciones del carrito
export function useCartMutations() {
    const queryClient = useQueryClient();

    const addToCartMutation = useMutation({
        mutationFn: async (product) => {
            const response = await api.post('/cart/add', { productId: product._id, quantity: 1 });
            return response.data;
        },
        onSuccess: () => {
            // Invalidar queries del carrito
            queryClient.invalidateQueries({ queryKey: cartKeys.items() });
            queryClient.invalidateQueries({ queryKey: cartKeys.count() });
        },
    });

    const updateQuantityMutation = useMutation({
        mutationFn: async ({ productId, quantity }) => {
            const response = await api.put('/cart/update', { productId, quantity });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.items() });
            queryClient.invalidateQueries({ queryKey: cartKeys.count() });
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: async (productId) => {
            const response = await api.delete(`/cart/remove/${productId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.items() });
            queryClient.invalidateQueries({ queryKey: cartKeys.count() });
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete('/cart/clear');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });

    return {
        addToCart: addToCartMutation,
        updateQuantity: updateQuantityMutation,
        removeFromCart: removeFromCartMutation,
        clearCart: clearCartMutation,
    };
}
