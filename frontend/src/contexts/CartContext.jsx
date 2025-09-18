import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

    // No cargar el carrito automáticamente - se cargará cuando el usuario se autentique

    const loadCartFromBackend = useCallback(async () => {
        try {
            // Agregar un pequeño delay para evitar solicitudes excesivas
            await new Promise(resolve => setTimeout(resolve, 100));

            const response = await api.get('/cart');
            if (response.data.success) {
                const backendItems = response.data.data.items || [];
                setCartItems(backendItems);
                // Limpiar localStorage cuando se carga desde el backend
                localStorage.removeItem('supergains_cart');
            }
        } catch (error) {
            console.error('Error loading cart from backend:', error);
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
        }
    }, []); // Sin dependencias para que sea estable

    // Solo guardar en localStorage cuando el carrito cambie por acciones del usuario
    // No guardar cuando se carga desde el backend
    useEffect(() => {
        // Solo guardar si el carrito no está vacío y no es la carga inicial
        if (cartItems.length > 0) {
            localStorage.setItem('supergains_cart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = async (product) => {
        try {
            const response = await api.post('/cart/add', {
                productId: product._id,
                quantity: 1
            });

            if (response.data.success) {
                // Actualizar el estado local
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
            // Fallback a localStorage si falla la API
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
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await api.delete(`/cart/item/${productId}`);
            if (response.data.success) {
                setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            // Fallback a actualización local
            setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const response = await api.put(`/cart/item/${productId}`, { quantity });
            if (response.data.success) {
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
            // Fallback a actualización local
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item._id === productId
                        ? { ...item, quantity }
                        : item
                )
            );
        }
    };

    const clearCart = async () => {
        try {
            const response = await api.delete('/cart/clear');
            if (response.data.success) {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            // Fallback a actualización local
            setCartItems([]);
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