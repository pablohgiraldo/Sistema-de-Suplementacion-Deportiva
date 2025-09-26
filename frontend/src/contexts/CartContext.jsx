import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api';

export const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, user } = useAuth();

    // Cargar el carrito cuando el usuario se autentique
    useEffect(() => {
        if (isAuthenticated && user) {
            loadCartFromBackend();
        } else {
            // Limpiar carrito cuando el usuario se desautentica
            setCartItems([]);
            setError(null);
        }
    }, [isAuthenticated, user]);

    const loadCartFromBackend = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/cart');
            if (response.data.success) {
                const backendItems = response.data.data.items || [];
                setCartItems(backendItems);
                // Limpiar localStorage cuando se carga desde el backend
                localStorage.removeItem('supergains_cart');
            }
        } catch (error) {
            console.error('Error loading cart from backend:', error);
            setError('Error al cargar el carrito');

            // Si es error 401, el usuario no está autenticado
            if (error.response?.status === 401) {
                setCartItems([]);
                localStorage.removeItem('supergains_cart');
                return;
            }
            // Si es error 429, esperar un poco antes de reintentar
            if (error.response?.status === 429) {
                console.log('Rate limited, waiting before retry...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return;
            }
            // Fallback a localStorage para otros errores
            const savedCart = localStorage.getItem('supergains_cart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Solo guardar en localStorage cuando el carrito cambie por acciones del usuario
    // No guardar cuando se carga desde el backend
    useEffect(() => {
        // Solo guardar si el carrito no está vacío y no es la carga inicial
        if (cartItems.length > 0) {
            localStorage.setItem('supergains_cart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = async (product) => {
        if (!isAuthenticated) {
            setError('Debes iniciar sesión para agregar productos al carrito');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/cart/add', {
                productId: product._id,
                quantity: 1
            });

            if (response.data.success) {
                // Actualizar estado local inmediatamente para mejor UX
                setCartItems(prevItems => {
                    const existingItem = prevItems.find(item => item._id === product._id);

                    if (existingItem) {
                        return prevItems.map(item =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        );
                    } else {
                        return [...prevItems, { ...product, quantity: 1 }];
                    }
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            setError('Error al agregar producto al carrito');

            // Si es error 401, el usuario no está autenticado
            if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente');
                return;
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId) => {
        if (!isAuthenticated) return;

        console.log('🗑️ Intentando eliminar producto del carrito:', productId);
        console.log('🔍 Tipo de productId:', typeof productId);
        console.log('🔍 Valor de productId:', productId);

        setLoading(true);
        setError(null);

        try {
            const response = await api.delete(`/cart/item/${productId}`);
            console.log('✅ Respuesta del servidor:', response.data);
            if (response.data.success) {
                // Actualizar estado local inmediatamente
                setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
            }
        } catch (error) {
            console.error('❌ Error removing from cart:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            setError('Error al eliminar producto del carrito');

            if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.put(`/cart/item/${productId}`, { quantity });
            if (response.data.success) {
                // Actualizar estado local inmediatamente
                setCartItems(prevItems =>
                    prevItems.map(item =>
                        item._id === productId
                            ? { ...item, quantity }
                            : item
                    )
                );
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            setError('Error al actualizar cantidad');

            if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente');
            }
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.delete('/cart/clear');
            if (response.data.success) {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            setError('Error al vaciar carrito');

            if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente');
            }
        } finally {
            setLoading(false);
        }
    };

    const getCartItemsCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const isInCart = (productId) => {
        return cartItems.some(item => item._id === productId);
    };

    const getCartItemQuantity = (productId) => {
        const item = cartItems.find(item => item._id === productId);
        return item ? item.quantity : 0;
    };

    // Alias para compatibilidad
    const getCartItemCount = getCartItemsCount;

    const value = {
        cartItems,
        isCartOpen,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItemsCount,
        getCartItemCount, // Alias
        getCartTotal,
        openCart,
        closeCart,
        isInCart,
        getCartItemQuantity,
        loadCartFromBackend // Exponer la función para cargar el carrito
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};