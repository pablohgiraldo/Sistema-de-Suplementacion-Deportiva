import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import api from '../services/api';

export const CartContext = createContext();

// Hook seguro que nunca falla
export const useCartSafe = () => {
    try {
        const context = useContext(CartContext);
        if (!context) {
            return {
                cartItems: [],
                isCartOpen: false,
                loading: false,
                error: null,
                addToCart: () => { },
                removeFromCart: () => { },
                updateQuantity: () => { },
                clearCart: () => { },
                getCartItemsCount: () => 0,
                getCartItemCount: () => 0,
                getCartTotal: () => 0,
                openCart: () => { },
                closeCart: () => { },
                isInCart: () => false,
                getCartItemQuantity: () => 0,
                loadCartFromBackend: () => { }
            };
        }
        return context;
    } catch (error) {
        console.warn('Error en useCartSafe:', error);
        return {
            cartItems: [],
            isCartOpen: false,
            loading: false,
            error: null,
            addToCart: () => { },
            removeFromCart: () => { },
            updateQuantity: () => { },
            clearCart: () => { },
            getCartItemsCount: () => 0,
            getCartItemCount: () => 0,
            getCartTotal: () => 0,
            openCart: () => { },
            closeCart: () => { },
            isInCart: () => false,
            getCartItemQuantity: () => 0,
            loadCartFromBackend: () => { }
        };
    }
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        // Retornar valores por defecto en lugar de lanzar error
        console.warn('useCart está siendo usado fuera de CartProvider, retornando valores por defecto');
        return {
            cartItems: [],
            isCartOpen: false,
            loading: false,
            error: null,
            addToCart: () => console.warn('addToCart no disponible fuera de CartProvider'),
            removeFromCart: () => console.warn('removeFromCart no disponible fuera de CartProvider'),
            updateQuantity: () => console.warn('updateQuantity no disponible fuera de CartProvider'),
            clearCart: () => console.warn('clearCart no disponible fuera de CartProvider'),
            getCartItemsCount: () => 0,
            getCartItemCount: () => 0,
            getCartTotal: () => 0,
            openCart: () => console.warn('openCart no disponible fuera de CartProvider'),
            closeCart: () => console.warn('closeCart no disponible fuera de CartProvider'),
            isInCart: () => false,
            getCartItemQuantity: () => 0,
            loadCartFromBackend: () => console.warn('loadCartFromBackend no disponible fuera de CartProvider')
        };
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const { isAuthenticated, user } = useAuth();

    // Cargar el carrito cuando el usuario se autentique
    useEffect(() => {
        if (isAuthenticated && user) {
            loadCartFromBackend();
        } else {
            // Limpiar carrito cuando el usuario se desautentica
            setCartItems([]);
            setError(null);
            // Limpiar localStorage también
            localStorage.removeItem('supergains_cart');
            localStorage.removeItem('supergains_auth');
        }
    }, [isAuthenticated, user]);

    const loadCartFromBackend = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.get('/cart');
            console.log('🛒 CartContext: Respuesta completa del backend:', response.data);
            if (response.data.success) {
                const backendItems = response.data.data.items || [];
                console.log('🛒 CartContext: Items del backend:', backendItems);

                // Transformar items si tienen estructura anidada
                const transformedItems = backendItems.map(item => {
                    // Si tiene estructura anidada (product: {...})
                    if (item.product && item.product._id) {
                        return {
                            _id: item.product._id,
                            name: item.product.name,
                            price: item.product.price,
                            imageUrl: item.product.imageUrl,
                            brand: item.product.brand,
                            quantity: item.quantity
                        };
                    }
                    // Si ya tiene estructura plana
                    return item;
                });

                console.log('🛒 CartContext: Items transformados:', transformedItems);
                console.log('🛒 CartContext: ¿Tienen nombres?', transformedItems.map(item => ({
                    id: item._id,
                    name: item.name,
                    hasName: !!item.name
                })));

                setCartItems(transformedItems);
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
            // NO usar localStorage como fallback - mantener carrito vacío
            console.log('🚫 CartContext: No usando localStorage como fallback');
        } finally {
            setLoading(false);
            // Marcar que la carga inicial ha terminado
            setIsInitialLoad(false);
        }
    }, [isAuthenticated]);

    // NO guardar en localStorage - solo usar el backend como fuente de verdad
    // useEffect(() => {
    //     // Comentado para evitar problemas de sincronización
    // }, [cartItems]);

    const addToCart = async (product, quantity = 1) => {
        if (!isAuthenticated) {
            setError('Debes iniciar sesión para agregar productos al carrito');
            return { success: false, error: 'Debes iniciar sesión para agregar productos al carrito' };
        }

        console.log('➕ CartContext: Agregando producto al carrito:', product, 'Cantidad:', quantity);

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/cart/add', {
                productId: product._id,
                quantity: quantity
            });

            if (response.data.success) {
                // Actualizar estado local inmediatamente para mejor UX
                setCartItems(prevItems => {
                    const existingItem = prevItems.find(item => item._id === product._id);

                    if (existingItem) {
                        return prevItems.map(item =>
                            item._id === product._id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    } else {
                        return [...prevItems, { ...product, quantity: quantity }];
                    }
                });
                // Marcar que ya no es carga inicial después de agregar producto
                setIsInitialLoad(false);

                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.data.error || 'Error desconocido' };
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            setError('Error al agregar producto al carrito');

            // Si es error 401, el usuario no está autenticado
            if (error.response?.status === 401) {
                setError('Sesión expirada. Por favor, inicia sesión nuevamente');
                return { success: false, error: 'Sesión expirada' };
            }

            return { success: false, error: error.response?.data?.error || 'Error al agregar al carrito' };
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