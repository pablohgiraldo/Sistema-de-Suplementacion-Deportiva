import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useMultipleInventory, inventoryUtils } from '../hooks/useInventory';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const {
        cartItems,
        loading,
        error,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount
    } = useCart();

    // Debug: Log cart items
    console.log('🛒 Cart.jsx: cartItems recibidos:', cartItems);

    // Obtener inventarios de todos los productos en el carrito
    const productIds = cartItems.map(item => item._id);
    // Temporalmente deshabilitado para evitar loop infinito
    // const { inventories, loading: inventoryLoading } = useMultipleInventory(productIds);
    const inventories = {};
    const inventoryLoading = false;

    // Funciones para validar stock
    const getProductInventory = (productId) => {
        return inventories[productId] || null;
    };

    const canUpdateQuantity = (productId, newQuantity) => {
        // Temporalmente permitir todas las cantidades para evitar bloqueos
        return true;
    };

    const getStockStatus = (productId) => {
        // Temporalmente mostrar estado genérico
        return 'Disponible';
    };

    const getStockStatusColor = (productId) => {
        // Temporalmente mostrar color verde
        return 'bg-green-100 text-green-800';
    };

    const getAvailableStock = (productId) => {
        // Temporalmente mostrar stock genérico
        return 999;
    };

    const handleUpdateQuantityWithValidation = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            await updateQuantity(productId, 0);
            return;
        }

        if (!canUpdateQuantity(productId, newQuantity)) {
            const availableStock = getAvailableStock(productId);
            alert(`Stock insuficiente. Disponible: ${availableStock} unidades`);
            return;
        }

        await updateQuantity(productId, newQuantity);
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
                                ? `${getCartItemCount()} producto${getCartItemCount() !== 1 ? 's' : ''} en tu carrito`
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

                        {/* Banner de verificación temporalmente deshabilitado */}

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
                                    {cartItems.map((item, index) => (
                                        <div key={item._id || `cart-item-${index}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                            <div className="flex-shrink-0 relative overflow-hidden rounded-md bg-gray-100">
                                                <img
                                                    src={item.imageUrl || '/placeholder-product.svg'}
                                                    alt={item.name}
                                                    className="h-20 w-20 object-cover transition-opacity duration-300"
                                                    loading="lazy"
                                                    decoding="async"
                                                    onLoad={(e) => {
                                                        e.target.style.opacity = '1';
                                                    }}
                                                    onError={(e) => {
                                                        // Evitar loop infinito - solo cambiar si no es ya el placeholder
                                                        if (!e.target.src.includes('placeholder-product.svg')) {
                                                            e.target.src = '/placeholder-product.svg';
                                                        }
                                                        e.target.style.opacity = '1';
                                                    }}
                                                    style={{ opacity: 0 }}
                                                />
                                                {/* Placeholder mientras carga */}
                                                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">{item.brand}</p>
                                                <p className="text-lg font-semibold text-green-600">
                                                    ${item.price.toFixed(2)}
                                                </p>

                                                {/* Información de stock */}
                                                <div className="mt-2 flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        Stock: {getAvailableStock(item._id)} unidades
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStockStatusColor(item._id)}`}>
                                                        {getStockStatus(item._id)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleUpdateQuantityWithValidation(item._id, item.quantity - 1)}
                                                    disabled={loading}
                                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantityWithValidation(item._id, item.quantity + 1)}
                                                    disabled={loading || !canUpdateQuantity(item._id, item.quantity + 1)}
                                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        console.log('🗑️ Cart: Eliminando producto:', item._id);
                                                        removeFromCart(item._id);
                                                    }}
                                                    disabled={loading}
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
                                            ${getCartTotal().toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={clearCart}
                                            disabled={loading}
                                            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                                        >
                                            Vaciar carrito
                                        </button>
                                        <button
                                            onClick={() => navigate('/checkout')}
                                            disabled={loading}
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
