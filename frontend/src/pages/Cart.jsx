import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
    const { isAuthenticated } = useAuth();
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
                                                    disabled={loading}
                                                    className="bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    disabled={loading}
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
                                                    onClick={() => removeFromCart(item.product._id)}
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
