import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useNotifications from '../hooks/useNotifications';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentConfirmation = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { showSuccess, showError } = useNotifications();
    
    const [paymentStatus, setPaymentStatus] = useState('loading');
    const [paymentData, setPaymentData] = useState(null);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        const processPaymentResponse = async () => {
            try {
                // Obtener parámetros de PayU
                const referenceCode = searchParams.get('ref');
                const state = searchParams.get('state');
                const lapState = searchParams.get('lapState');
                const message = searchParams.get('message');
                const value = searchParams.get('value');
                const currency = searchParams.get('currency');

                console.log('📋 Parámetros de PayU recibidos:', {
                    referenceCode,
                    state,
                    lapState,
                    message,
                    value,
                    currency
                });

                // Determinar estado del pago
                const finalState = state || lapState;
                let status = 'error';
                let statusMessage = message || 'Estado desconocido';

                switch (finalState) {
                    case '4': // Aprobada
                        status = 'success';
                        statusMessage = '¡Pago aprobado exitosamente!';
                        break;
                    case '6': // Rechazada
                        status = 'error';
                        statusMessage = 'Pago rechazado';
                        break;
                    case '5': // Expirada
                        status = 'error';
                        statusMessage = 'Transacción expirada';
                        break;
                    case '7': // Pendiente
                        status = 'pending';
                        statusMessage = 'Pago pendiente de confirmación';
                        break;
                    default:
                        status = 'error';
                        statusMessage = message || 'Error en el procesamiento del pago';
                }

                setPaymentStatus(status);
                setPaymentData({
                    referenceCode,
                    state: finalState,
                    message: statusMessage,
                    value: value ? parseFloat(value) : null,
                    currency: currency || 'COP'
                });

                // Si el pago fue exitoso, obtener datos de la orden
                if (status === 'success' && referenceCode) {
                    try {
                        const orderResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/orders/${referenceCode}`, {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                            }
                        });

                        if (orderResponse.ok) {
                            const orderResult = await orderResponse.json();
                            setOrderData(orderResult.data);
                            console.log('✅ Datos de orden obtenidos:', orderResult.data);
                        }
                    } catch (orderError) {
                        console.warn('⚠️ No se pudieron obtener datos de la orden:', orderError);
                    }
                }

                // Mostrar notificación según el estado
                if (status === 'success') {
                    showSuccess('¡Pago procesado exitosamente!');
                } else if (status === 'error') {
                    showError(statusMessage);
                }

            } catch (error) {
                console.error('❌ Error procesando respuesta de pago:', error);
                setPaymentStatus('error');
                setPaymentData({
                    message: 'Error al procesar la respuesta del pago'
                });
                showError('Error al procesar la respuesta del pago');
            }
        };

        processPaymentResponse();
    }, [searchParams, showSuccess, showError]);

    const handleContinueShopping = () => {
        navigate('/');
    };

    const handleViewOrder = () => {
        if (orderData) {
            navigate(`/orders/${orderData._id}`);
        } else {
            navigate('/orders');
        }
    };

    const handleRetryPayment = () => {
        navigate('/cart');
    };

    // Formatear precio
    const formatPrice = (price, currency = 'COP') => {
        if (currency === 'COP') {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(price);
        } else {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(price);
        }
    };

    if (paymentStatus === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <h2 className="text-xl font-semibold text-gray-900 mt-4">
                        Procesando respuesta del pago...
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Por favor espera mientras verificamos el estado de tu transacción.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    {/* Header según estado */}
                    <div className="text-center mb-8">
                        {paymentStatus === 'success' && (
                            <>
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-green-600 mb-2">
                                    ¡Pago Exitoso!
                                </h1>
                                <p className="text-gray-600">
                                    Tu pedido ha sido procesado correctamente
                                </p>
                            </>
                        )}

                        {paymentStatus === 'error' && (
                            <>
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-red-600 mb-2">
                                    Pago No Procesado
                                </h1>
                                <p className="text-gray-600">
                                    Hubo un problema con tu pago
                                </p>
                            </>
                        )}

                        {paymentStatus === 'pending' && (
                            <>
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h1 className="text-3xl font-bold text-yellow-600 mb-2">
                                    Pago Pendiente
                                </h1>
                                <p className="text-gray-600">
                                    Tu pago está siendo procesado
                                </p>
                            </>
                        )}
                    </div>

                    {/* Detalles del pago */}
                    {paymentData && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Detalles de la Transacción
                            </h2>
                            <div className="space-y-3">
                                {paymentData.referenceCode && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Referencia:</span>
                                        <span className="font-medium">{paymentData.referenceCode}</span>
                                    </div>
                                )}
                                {paymentData.value && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monto:</span>
                                        <span className="font-medium">
                                            {formatPrice(paymentData.value, paymentData.currency)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estado:</span>
                                    <span className={`font-medium ${
                                        paymentStatus === 'success' ? 'text-green-600' :
                                        paymentStatus === 'error' ? 'text-red-600' :
                                        'text-yellow-600'
                                    }`}>
                                        {paymentData.message}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detalles de la orden si está disponible */}
                    {orderData && (
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Detalles del Pedido
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Número de orden:</span>
                                    <span className="font-medium">{orderData.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-medium">
                                        {formatPrice(orderData.total, 'USD')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estado:</span>
                                    <span className="font-medium">{orderData.statusFormatted}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Fecha:</span>
                                    <span className="font-medium">
                                        {new Date(orderData.createdAt).toLocaleDateString('es-CO')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje informativo */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    {paymentStatus === 'success' && (
                                        <>
                                            Te hemos enviado un email de confirmación con todos los detalles de tu pedido. 
                                            Recibirás una notificación cuando tu pedido sea enviado.
                                        </>
                                    )}
                                    {paymentStatus === 'error' && (
                                        <>
                                            No se ha realizado ningún cargo a tu cuenta. Puedes intentar el pago nuevamente 
                                            o contactar a nuestro soporte si el problema persiste.
                                        </>
                                    )}
                                    {paymentStatus === 'pending' && (
                                        <>
                                            Tu pago está siendo procesado. Te notificaremos por email una vez que sea confirmado.
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {paymentStatus === 'success' && (
                            <>
                                <button
                                    onClick={handleViewOrder}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                    Ver Pedido
                                </button>
                                <button
                                    onClick={handleContinueShopping}
                                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                >
                                    Continuar Comprando
                                </button>
                            </>
                        )}

                        {paymentStatus === 'error' && (
                            <>
                                <button
                                    onClick={handleRetryPayment}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                    Intentar Nuevamente
                                </button>
                                <button
                                    onClick={handleContinueShopping}
                                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                                >
                                    Continuar Comprando
                                </button>
                            </>
                        )}

                        {paymentStatus === 'pending' && (
                            <button
                                onClick={handleContinueShopping}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                Continuar Comprando
                            </button>
                        )}
                    </div>

                    {/* Información de contacto */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            ¿Necesitas ayuda?{' '}
                            <a href="/contact" className="text-blue-600 hover:underline">
                                Contáctanos
                            </a>{' '}
                            o llama al{' '}
                            <a href="tel:+573001234567" className="text-blue-600 hover:underline">
                                +57 300 123 4567
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;