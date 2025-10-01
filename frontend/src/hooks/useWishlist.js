import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const useWishlist = () => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    // Obtener wishlist
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['wishlist'],
        queryFn: async () => {
            const response = await api.get('/wishlist');
            return response.data.data;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    // Agregar producto a wishlist
    const addMutation = useMutation({
        mutationFn: async (productId) => {
            const response = await api.post('/wishlist/add', { productId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['wishlist']);
        },
    });

    // Remover producto de wishlist
    const removeMutation = useMutation({
        mutationFn: async (productId) => {
            const response = await api.delete(`/wishlist/remove/${productId}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['wishlist']);
        },
    });

    // Limpiar wishlist
    const clearMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete('/wishlist/clear');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['wishlist']);
        },
    });

    // Verificar si un producto está en la wishlist
    const isInWishlist = (productId) => {
        if (!data || !data.items) return false;
        return data.items.some(item => item.product._id === productId);
    };

    // Alternar producto en wishlist
    const toggleWishlist = async (productId) => {
        if (isInWishlist(productId)) {
            return await removeMutation.mutateAsync(productId);
        } else {
            return await addMutation.mutateAsync(productId);
        }
    };

    return {
        wishlist: data,
        items: data?.items || [],
        itemCount: data?.itemCount || 0,
        isLoading,
        isError,
        error,
        addToWishlist: addMutation.mutateAsync,
        removeFromWishlist: removeMutation.mutateAsync,
        clearWishlist: clearMutation.mutateAsync,
        toggleWishlist,
        isInWishlist,
        isAddingOrRemoving: addMutation.isPending || removeMutation.isPending,
    };
};

export default useWishlist;

