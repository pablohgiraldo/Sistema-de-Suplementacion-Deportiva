import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Componentes de iconos simples
const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17a2 2 0 100 4 2 2 0 000-4zm0 0c-1.306 0-2.417.835-2.83 2M8 17V7m0 10h8m-8 0H6a2 2 0 01-2-2V7a2 2 0 012-2h2m8 0a2 2 0 012 2v8a2 2 0 01-2 2h-2m0-10V7a2 2 0 00-2-2H8m8 0V5a2 2 0 00-2-2H8a2 2 0 00-2 2v2" />
    </svg>
);

const CreditCardIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);

const MapPinIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obtener datos de la orden desde el estado de navegación
        if (location.state?.orderData) {
            setOrderData(location.state.orderData);
            setLoading(false);
        } else {
            // Si no hay datos, redirigir al carrito
            navigate('/cart');
        }
    }, [location.state, navigate]);

    const handleContinueShopping = () => {
        navigate('/products');
    };

    const handleViewOrders = () => {
        navigate('/orders');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No se encontraron datos de la orden</h1>
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Volver al carrito
                    </button>
                </div>
            </div>
        );
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header de confirmación */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <CheckCircleIcon className="h-16 w-16 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ¡Pedido Confirmado!
                    </h1>
                    <p className="text-lg text-gray-600">
                        Tu pedido ha sido procesado exitosamente
                    </p>
                </div>

                {/* Información de la orden */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Detalles del Pedido
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Número de orden */}
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                <CreditCardIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Número de Orden</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {orderData.orderNumber || orderData.metadata?.orderNumber}
                                </p>
                            </div>
                        </div>

                        {/* Fecha de pedido */}
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg mr-4">
                                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fecha del Pedido</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatDate(orderData.createdAt || orderData.metadata?.createdAt)}
                                </p>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                <CreditCardIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Pagado</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatPrice(orderData.total || orderData.metadata?.total)}
                                </p>
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="flex items-center">
                            <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                <TruckIcon className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estado</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {orderData.status === 'pending' ? 'Pendiente' : orderData.status}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen de productos */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Productos Pedidos
                    </h2>

                    <div className="space-y-4">
                        {orderData.items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                                <div className="flex items-center">
                                    <img
                                        src={item.product?.imageUrl || '/placeholder-product.jpg'}
                                        alt={item.product?.name || 'Producto'}
                                        className="h-16 w-16 object-cover rounded-lg mr-4"
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {item.product?.name || 'Producto'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {item.product?.brand || 'Marca'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Cantidad: {item.quantity}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        {formatPrice(item.price)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Subtotal: {formatPrice(item.subtotal)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen de costos */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">{formatPrice(orderData.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Impuestos (IVA 19%):</span>
                                <span className="font-medium">{formatPrice(orderData.tax)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Envío:</span>
                                <span className="font-medium">
                                    {orderData.shipping > 0 ? formatPrice(orderData.shipping) : 'Gratis'}
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                                <span>Total:</span>
                                <span>{formatPrice(orderData.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información de envío */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Información de Envío
                    </h2>

                    <div className="flex items-start">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <MapPinIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                {orderData.shippingAddress?.firstName} {orderData.shippingAddress?.lastName}
                            </p>
                            <p className="text-gray-600">
                                {orderData.shippingAddress?.street}
                            </p>
                            <p className="text-gray-600">
                                {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state}
                            </p>
                            <p className="text-gray-600">
                                {orderData.shippingAddress?.zipCode}, {orderData.shippingAddress?.country}
                            </p>
                            <p className="text-gray-600 mt-2">
                                Teléfono: {orderData.shippingAddress?.phone}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información de pago */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Información de Pago
                    </h2>

                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                            <CreditCardIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">
                                Método de Pago: {orderData.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' :
                                    orderData.paymentMethod === 'paypal' ? 'PayPal' :
                                        orderData.paymentMethod === 'pse' ? 'PSE' : orderData.paymentMethod}
                            </p>
                            {orderData.paymentDetails?.cardLastFour && (
                                <p className="text-gray-600">
                                    Tarjeta terminada en: ****{orderData.paymentDetails.cardLastFour}
                                </p>
                            )}
                            <p className="text-gray-600">
                                Estado del Pago: {orderData.paymentStatus === 'pending' ? 'Pendiente' : orderData.paymentStatus}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Estimación de entrega */}
                {orderData.metadata?.estimatedDelivery && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <TruckIcon className="h-6 w-6 text-blue-600 mr-3" />
                            <div>
                                <h3 className="font-medium text-blue-900">
                                    Tiempo Estimado de Entrega
                                </h3>
                                <p className="text-blue-700">
                                    Tu pedido será entregado aproximadamente el{' '}
                                    {formatDate(orderData.metadata.estimatedDelivery)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notas del pedido */}
                {orderData.notes && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Notas del Pedido
                        </h2>
                        <p className="text-gray-600">{orderData.notes}</p>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleContinueShopping}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Continuar Comprando
                    </button>
                    <button
                        onClick={handleViewOrders}
                        className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Ver Mis Pedidos
                    </button>
                </div>

                {/* Información adicional */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Recibirás un correo electrónico de confirmación con todos los detalles de tu pedido.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Si tienes alguna pregunta, no dudes en contactarnos.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
