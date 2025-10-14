import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderStatus();
        // Actualizar cada 30 segundos
        const interval = setInterval(fetchOrderStatus, 30000);
        return () => clearInterval(interval);
    }, [orderId]);

    const fetchOrderStatus = async () => {
        try {
            const response = await api.get(`/orders/${orderId}/status`);
            setTracking(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error al obtener estado de orden:', err);
            setError(err.response?.data?.error || 'Error al cargar el estado de la orden');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'processing':
                return (
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'shipped':
                return (
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                );
            case 'delivered':
                return (
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'cancelled':
                return (
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'processing':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'shipped':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'delivered':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'cancelled':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/orders" className="text-blue-600 hover:underline">
                        ← Volver a Mis Órdenes
                    </Link>
                </div>
            </div>
        );
    }

    if (!tracking) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link to="/orders" className="text-blue-600 hover:underline flex items-center mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a Mis Órdenes
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Seguimiento de Pedido
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Orden #{tracking.orderNumber}
                    </p>
                </div>

                {/* Estado Actual */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            {getStatusIcon(tracking.currentStatus.toLowerCase().replace(' ', '_'))}
                            <div className="ml-4">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {tracking.currentStatus}
                                </h2>
                                <p className="text-sm text-gray-600">{tracking.customerMessage}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full border ${getStatusColor(tracking.currentStatus.toLowerCase().replace(' ', '_'))}`}>
                            <span className="font-medium">{tracking.progress}% Completado</span>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div
                            className={`h-2 rounded-full transition-all duration-500 ${tracking.currentStatus === 'Cancelada' ? 'bg-red-500' :
                                    tracking.currentStatus === 'Entregada' ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                            style={{ width: `${tracking.progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Información de Tracking */}
                {tracking.trackingNumber && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Envío</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Número de Seguimiento</p>
                                <p className="text-lg font-medium text-gray-900">{tracking.trackingNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Transportadora</p>
                                <p className="text-lg font-medium text-gray-900">{tracking.carrier || 'Por asignar'}</p>
                            </div>
                            {tracking.estimatedDeliveryDate && (
                                <div>
                                    <p className="text-sm text-gray-600">Fecha Estimada de Entrega</p>
                                    <p className="text-lg font-medium text-gray-900">
                                        {new Date(tracking.estimatedDeliveryDate).toLocaleDateString('es-CO', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                            {tracking.trackingUrl && (
                                <div>
                                    <p className="text-sm text-gray-600">Seguimiento en Línea</p>
                                    <a
                                        href={tracking.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center"
                                    >
                                        Ver en {tracking.carrier}
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Historial de Estados */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Seguimiento</h3>
                    <div className="space-y-4">
                        {tracking.statusHistory.slice().reverse().map((entry, index) => (
                            <div key={index} className="flex">
                                <div className="flex-shrink-0 mr-4">
                                    <div className={`w-3 h-3 rounded-full mt-2 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}></div>
                                    {index < tracking.statusHistory.length - 1 && (
                                        <div className="w-0.5 h-full bg-gray-300 ml-1 mt-1"></div>
                                    )}
                                </div>
                                <div className="flex-grow pb-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {entry.statusFormatted}
                                            </p>
                                            <p className="text-sm text-gray-600">{entry.notes}</p>
                                            {entry.location && (
                                                <p className="text-sm text-gray-500">📍 {entry.location}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                Por {entry.updatedBy}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">
                                                {new Date(entry.timestamp).toLocaleDateString('es-CO')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(entry.timestamp).toLocaleTimeString('es-CO')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Productos */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos ({tracking.items.length})</h3>
                    <div className="space-y-4">
                        {tracking.items.map((item, index) => (
                            <div key={index} className="flex items-center border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                                <img
                                    src={item.imageUrl || 'https://via.placeholder.com/80'}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="ml-4 flex-grow">
                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                    <p className="text-sm text-gray-600">{item.brand}</p>
                                    <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        ${item.price.toLocaleString('es-CO')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-gray-900">
                                ${tracking.total.toLocaleString('es-CO')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dirección de Envío */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección de Envío</h3>
                    <div className="text-gray-700">
                        <p className="font-medium">{tracking.shippingAddress.fullName}</p>
                        <p>{tracking.shippingAddress.street}</p>
                        <p>{tracking.shippingAddress.city}, {tracking.shippingAddress.state}</p>
                        <p>{tracking.shippingAddress.zipCode}</p>
                        <p className="mt-2 text-sm">
                            <span className="font-medium">Teléfono:</span> {tracking.shippingAddress.phone}
                        </p>
                    </div>
                </div>

                {/* Próximo Estado */}
                {tracking.nextStatus && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-blue-900">Próximo Estado</p>
                                <p className="text-sm text-blue-700">{tracking.nextStatus}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Ver Todas Mis Órdenes
                    </button>
                    <button
                        onClick={fetchOrderStatus}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualizar Estado
                    </button>
                </div>

                {/* Nota de actualización automática */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    ℹ️ El estado se actualiza automáticamente cada 30 segundos
                </p>
            </div>
        </div>
    );
};

export default OrderTracking;

