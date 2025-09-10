import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Cart() {
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
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

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeItem(productId);
            return;
        }

        try {
            setUpdating(true);
            const response = await api.put('/cart/update', {
                productId,
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
            }
        } catch (err) {
            setError('Error al actualizar cantidad');
            console.error('Error updating quantity:', err);
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async (productId) => {
        try {
            setUpdating(true);
            const response = await api.delete(`/cart/remove/${productId}`);

            if (response.data.success) {
                setCartItems(prev => prev.filter(item => item.product._id !== productId));
            }
        } catch (err) {
            setError('Error al eliminar producto');
            console.error('Error removing item:', err);
        } finally {
            setUpdating(false);
        }
    };

    const clearCart = async () => {
        try {
            setUpdating(true);
            const response = await api.delete('/cart/clear');

            if (response.data.success) {
                setCartItems([]);
            }
        } catch (err) {
            setError('Error al vaciar carrito');
            console.error('Error clearing cart:', err);
        } finally {
            setUpdating(false);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    };

    const calculateItemsCount = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso denegado</h1>
                    <p className="text-gray-600">Necesitas iniciar sesión para ver tu carrito</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Cargando carrito...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">Mi Carrito</h1>
                        <p className="text-blue-100">
                            {cartItems.length > 0
                                ? `${calculateItemsCount()} producto${calculateItemsCount() !== 1 ? 's' : ''} en tu carrito`
                                : 'Tu carrito está vacío'
                            }
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        {cartItems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
                                <p className="text-gray-500 mb-6">Agrega algunos productos para comenzar</p>
                                <a
                                    href="/"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    Ir a la tienda
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Cart Items */}
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.product._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={item.product.imageUrl || '/placeholder-product.jpg'}
                                                    alt={item.product.name}
                                                    className="h-20 w-20 object-cover rounded-md"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">{item.product.brand}</p>
                                                <p className="text-lg font-semibold text-green-600">
                                                    ${item.product.price.toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                    disabled={updating}
                                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    disabled={updating}
                                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ${(item.product.price * item.quantity).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => removeItem(item.product._id)}
                                                    disabled={updating}
                                                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Total</h3>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${calculateTotal().toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={clearCart}
                                            disabled={updating}
                                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                                        >
                                            Vaciar carrito
                                        </button>
                                        <button
                                            disabled={updating}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                        >
                                            Proceder al pago
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
