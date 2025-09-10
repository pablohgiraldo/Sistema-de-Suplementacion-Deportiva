import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Cargar carrito cuando el usuario se autentica
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            // Limpiar carrito cuando el usuario se desautentica
            setCartItems([]);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get('/cart');

            if (response.data.success) {
                setCartItems(response.data.data.items || []);
            }
        } catch (err) {
            setError('Error al cargar el carrito');
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.post('/cart/add', {
                productId,
                quantity
            });

            if (response.data.success) {
                // Actualizar el carrito local inmediatamente
                setCartItems(prev => {
                    const existingItem = prev.find(item => item.product._id === productId);
                    if (existingItem) {
                        return prev.map(item =>
                            item.product._id === productId
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    } else {
                        // Si no existe, necesitamos obtener los datos del producto
                        // Por ahora, agregamos un placeholder que se actualizará con fetchCart
                        return [...prev, { product: { _id: productId }, quantity }];
                    }
                });

                // Refrescar el carrito completo para obtener datos actualizados
                setTimeout(() => fetchCart(), 100);
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al agregar al carrito';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            return removeFromCart(productId);
        }

        try {
            setLoading(true);
            setError('');
            const response = await api.put(`/cart/item/${productId}`, {
                quantity: newQuantity
            });

            if (response.data.success) {
                setCartItems(prev =>
                    prev.map(item =>
                        item.product._id === productId
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
                );
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al actualizar cantidad';
            setError(errorMessage);
            console.error('Error updating quantity:', err);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.delete(`/cart/item/${productId}`);

            if (response.data.success) {
                setCartItems(prev => prev.filter(item => item.product._id !== productId));
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al eliminar producto';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.delete('/cart/clear');

            if (response.data.success) {
                setCartItems([]);
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al vaciar carrito';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const getCartItemCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    const isInCart = (productId) => {
        return cartItems.some(item => item.product && item.product._id === productId);
    };

    const getCartItemQuantity = (productId) => {
        const item = cartItems.find(item => item.product && item.product._id === productId);
        return item ? item.quantity : 0;
    };

    const value = {
        cartItems,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        getCartItemCount,
        getCartTotal,
        isInCart,
        getCartItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}
