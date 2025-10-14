import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PaymentConfirmation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState('loading');
    const [orderDetails, setOrderDetails] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const processPaymentResponse = async () => {
            try {
                // Obtener parámetros de la URL
                const referenceCode = searchParams.get('ref') || searchParams.get('referenceCode');
                const transactionState = searchParams.get('state') || searchParams.get('transactionState');
                const lapTransactionState = searchParams.get('lapState') || searchParams.get('lapTransactionState');
                const message = searchParams.get('message');
                const txValue = searchParams.get('value') || searchParams.get('TX_VALUE');
                const currency = searchParams.get('currency');

                // Determinar el estado del pago
                const state = transactionState || lapTransactionState;

                if (!referenceCode) {
                    setError('No se encontró información de la orden');
                    setPaymentStatus('error');
                    return;
                }

                // Obtener detalles de la orden
                try {
                    const response = await api.get(`/payments/order/${referenceCode}/status`);
                    setOrderDetails(response.data.data);
                } catch (err) {
                    console.error('Error al obtener detalles de la orden:', err);
                }

                // Estados de PayU:
                // 4 = Aprobada
                // 6 = Rechazada
                // 7 = Pendiente
                // 5 = Expirada
                // 104 = Error

                switch (state) {
                    case '4':
                        setPaymentStatus('approved');
                        break;
                    case '6':
                        setPaymentStatus('rejected');
                        setError(message || 'El pago fue rechazado');
                        break;
                    case '7':
                        setPaymentStatus('pending');
                        break;
                    case '5':
                        setPaymentStatus('expired');
                        setError('La transacción ha expirado');
                        break;
                    case '104':
                        setPaymentStatus('error');
                        setError(message || 'Ocurrió un error en el pago');
                        break;
                    default:
                        setPaymentStatus('unknown');
                        setError('Estado de pago desconocido');
                }

            } catch (err) {
                console.error('Error al procesar respuesta de pago:', err);
                setError('Error al procesar la confirmación del pago');
                setPaymentStatus('error');
            }
        };

        processPaymentResponse();
    }, [searchParams]);

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'approved':
                return (
                    <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'rejected':
            case 'expired':
            case 'error':
                return (
                    <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'pending':
                return (
                    <svg className="w-20 h-20 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'loading':
                return (
                    <div className="w-20 h-20 mx-auto mb-4">
                        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-500"></div>
                    </div>
                );
            default:
                return (
                    <svg className="w-20 h-20 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getStatusTitle = () => {
        switch (paymentStatus) {
            case 'approved':
                return '¡Pago Exitoso!';
            case 'rejected':
                return 'Pago Rechazado';
            case 'pending':
                return 'Pago Pendiente';
            case 'expired':
                return 'Pago Expirado';
            case 'error':
                return 'Error en el Pago';
            case 'loading':
                return 'Procesando...';
            default:
                return 'Estado Desconocido';
        }
    };

    const getStatusMessage = () => {
        switch (paymentStatus) {
            case 'approved':
                return 'Tu pago ha sido procesado exitosamente. Recibirás un email de confirmación en breve.';
            case 'rejected':
                return error || 'Tu pago fue rechazado. Por favor verifica los datos de tu tarjeta e intenta nuevamente.';
            case 'pending':
                return 'Tu pago está siendo procesado. Te notificaremos cuando se complete la transacción.';
            case 'expired':
                return 'La transacción ha expirado. Por favor intenta realizar el pago nuevamente.';
            case 'error':
                return error || 'Ocurrió un error al procesar tu pago. Por favor contacta con soporte.';
            case 'loading':
                return 'Estamos verificando tu pago...';
            default:
                return 'No pudimos determinar el estado de tu pago.';
        }
    };

    const handleContinue = () => {
        if (paymentStatus === 'approved') {
            navigate('/orders');
        } else {
            navigate('/cart');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white shadow-lg rounded-lg p-8">
                    {/* Icono de estado */}
                    {getStatusIcon()}

                    {/* Título */}
                    <h1 className={`text-2xl font-bold text-center mb-4 ${
                        paymentStatus === 'approved' ? 'text-green-600' :
                        paymentStatus === 'pending' ? 'text-yellow-600' :
                        paymentStatus === 'loading' ? 'text-blue-600' :
                        'text-red-600'
                    }`}>
                        {getStatusTitle()}
                    </h1>

                    {/* Mensaje */}
                    <p className="text-gray-600 text-center mb-6">
                        {getStatusMessage()}
                    </p>

                    {/* Detalles de la orden */}
                    {orderDetails && (
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-3">Detalles de la Orden</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Número de Orden:</span>
                                    <span className="font-medium">{orderDetails.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-medium">
                                        ${orderDetails.total?.toLocaleString('es-CO')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Método de Pago:</span>
                                    <span className="font-medium">{orderDetails.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estado de Pago:</span>
                                    <span className={`font-medium ${
                                        orderDetails.paymentStatus === 'Pagado' ? 'text-green-600' :
                                        orderDetails.paymentStatus === 'Pendiente' ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                        {orderDetails.paymentStatus}
                                    </span>
                                </div>
                                {orderDetails.transactionId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">ID Transacción:</span>
                                        <span className="font-mono text-xs">{orderDetails.transactionId.slice(0, 20)}...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="space-y-3">
                        {paymentStatus === 'approved' && (
                            <>
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Ver Mis Órdenes
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Seguir Comprando
                                </button>
                            </>
                        )}

                        {paymentStatus === 'pending' && (
                            <>
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                                >
                                    Ver Estado de Mi Orden
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Volver al Inicio
                                </button>
                            </>
                        )}

                        {(paymentStatus === 'rejected' || paymentStatus === 'expired' || paymentStatus === 'error') && (
                            <>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Intentar Nuevamente
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Volver al Inicio
                                </button>
                            </>
                        )}

                        {paymentStatus === 'unknown' && (
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Volver al Inicio
                            </button>
                        )}
                    </div>

                    {/* Información adicional */}
                    {paymentStatus === 'approved' && (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Hemos enviado los detalles de tu compra a tu correo electrónico.
                            </p>
                        </div>
                    )}

                    {(paymentStatus === 'rejected' || paymentStatus === 'error') && (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                ¿Necesitas ayuda? <a href="/contact" className="text-blue-600 hover:underline">Contáctanos</a>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmation;

