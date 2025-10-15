import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';

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

    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Costos de envío (simulados, puedes conectarlos a tu lógica)
    const shippingCost = cartItems.length > 0 ? 5000 : 0;
    const subtotal = getCartTotal();
    const total = subtotal + shippingCost;

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) {
            await removeFromCart(productId);
            return;
        }
        await updateQuantity(productId, newQuantity);
    };

    const handleClearCart = () => {
        clearCart();
        setShowClearConfirm(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Acceso requerido</h2>
                    <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tu carrito de compras</p>
                    <Link
                        to="/login"
                        className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando tu carrito...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🛒 Mi Carrito
                    </h1>
                    <p className="text-gray-600">
                        {cartItems.length > 0
                            ? `${getCartItemCount()} producto${getCartItemCount() !== 1 ? 's' : ''} en tu carrito`
                            : 'Tu carrito está vacío'
                        }
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {cartItems.length === 0 ? (
                    /* Carrito Vacío */
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Tu carrito está vacío</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            ¡Descubre nuestros increíbles productos y comienza a llenar tu carrito!
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Explorar productos
                        </Link>
                    </div>
                ) : (
                    /* Carrito con productos */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna izquierda: Productos */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item._id}
                                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                                >
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Imagen del producto */}
                                        <div className="flex-shrink-0">
                                            <div className="relative w-full sm:w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden group">
                                                <img
                                                    src={item.imageUrl || '/placeholder-product.svg'}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        if (!e.target.src.includes('placeholder-product.svg')) {
                                                            e.target.src = '/placeholder-product.svg';
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Información del producto */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item._id)}
                                                    disabled={loading}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                                    title="Eliminar del carrito"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Precio y cantidad */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
                                                <div>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        ${item.price.toLocaleString('es-CO')}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Precio unitario</p>
                                                </div>

                                                {/* Control de cantidad */}
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-600 font-medium">Cantidad:</span>
                                                    <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                            disabled={loading}
                                                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 font-bold"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="px-6 py-2 font-bold text-gray-900 bg-white border-x border-gray-200">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                            disabled={loading}
                                                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 font-bold"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Subtotal del producto */}
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-gray-900">
                                                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Subtotal</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Botón vaciar carrito */}
                            {!showClearConfirm ? (
                                <button
                                    onClick={() => setShowClearConfirm(true)}
                                    disabled={loading}
                                    className="w-full bg-white text-gray-600 border-2 border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Vaciar carrito
                                </button>
                            ) : (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                    <p className="text-red-800 font-medium mb-3 text-center">
                                        ¿Estás seguro de vaciar el carrito?
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowClearConfirm(false)}
                                            className="flex-1 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleClearCart}
                                            disabled={loading}
                                            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                        >
                                            Sí, vaciar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha: Resumen */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                                    Resumen del pedido
                                </h2>

                                {/* Desglose de costos */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Subtotal ({getCartItemCount()} productos)</span>
                                        <span className="font-semibold text-gray-900">
                                            ${subtotal.toLocaleString('es-CO')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 flex items-center gap-1">
                                            Envío
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            ${shippingCost.toLocaleString('es-CO')}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-900">Total</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                                ${total.toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón de checkout */}
                                <button
                                    onClick={() => navigate('/checkout')}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Proceder al pago
                                </button>

                                {/* Seguir comprando */}
                                <Link
                                    to="/"
                                    className="block w-full text-center text-blue-600 hover:text-blue-700 font-medium mt-4 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    ← Seguir comprando
                                </Link>

                                {/* Información adicional */}
                                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Pago seguro y protegido</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        <span>Envío a todo el país</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                        <span>Devoluciones fáciles</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
