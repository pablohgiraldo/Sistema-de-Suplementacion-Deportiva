import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../hooks/useOrders';
import PageLoader from '../components/PageLoader';

// Componentes de iconos
const ArrowLeftIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17a2 2 0 100 4 2 2 0 000-4zm0 0c-1.306 0-2.417.835-2.83 2M8 17V7m0 10h8m-8 0H6a2 2 0 01-2-2V7a2 2 0 012-2h2m8 0a2 2 0 012 2v8a2 2 0 01-2 2h-2m0-10V7a2 2 0 00-2-2H8m8 0V5a2 2 0 00-2-2H8a2 2 0 00-2 2v2" />
    </svg>
);

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { data: orderData, isLoading, error } = useOrder(orderId);

    const order = orderData?.data;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
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

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return {
                    icon: ClockIcon,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    label: 'Pendiente'
                };
            case 'processing':
                return {
                    icon: ClockIcon,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    label: 'Procesando'
                };
            case 'shipped':
                return {
                    icon: TruckIcon,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100',
                    label: 'Enviado'
                };
            case 'delivered':
                return {
                    icon: CheckCircleIcon,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    label: 'Entregado'
                };
            case 'cancelled':
                return {
                    icon: XCircleIcon,
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    label: 'Cancelado'
                };
            default:
                return {
                    icon: ClockIcon,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    label: status
                };
        }
    };

    const getPaymentStatusInfo = (paymentStatus) => {
        switch (paymentStatus) {
            case 'pending':
                return {
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-100',
                    label: 'Pendiente'
                };
            case 'paid':
                return {
                    color: 'text-green-600',
                    bgColor: 'bg-green-100',
                    label: 'Pagado'
                };
            case 'failed':
                return {
                    color: 'text-red-600',
                    bgColor: 'bg-red-100',
                    label: 'Fallido'
                };
            default:
                return {
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-100',
                    label: paymentStatus
                };
        }
    };

    if (isLoading) {
        return <PageLoader message="Cargando detalles de la orden..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
                    <p className="text-gray-600 mb-4">{error.message || 'No se pudo cargar la orden'}</p>
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Volver a órdenes
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Orden no encontrada</h1>
                    <p className="text-gray-600 mb-4">La orden que buscas no existe o no tienes permisos para verla.</p>
                    <button
                        onClick={() => navigate('/orders')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Volver a órdenes
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusInfo(order.status);
    const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus);
    const StatusIcon = statusInfo.icon;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" />
                        Volver a órdenes
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Orden #{order.orderNumber || order._id.slice(-8)}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Realizada el {formatDate(order.createdAt)}
                    </p>
                </div>

                {/* Estado de la orden */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
                                <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Estado de la orden</h3>
                                <p className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-lg font-semibold text-gray-900">Estado del pago</h3>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${paymentStatusInfo.color} ${paymentStatusInfo.bgColor}`}>
                                {paymentStatusInfo.label}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Productos */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Productos</h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <span className="text-2xl">📦</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.product?.name || 'Producto'}</h3>
                                            <p className="text-gray-600">Cantidad: {item.quantity}</p>
                                            <p className="text-gray-600">Precio unitario: {formatPrice(item.price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Información de la orden */}
                    <div className="space-y-6">
                        {/* Resumen de precios */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal:</span>
                                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                                </div>
                                {order.shipping && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Envío:</span>
                                        <span className="font-medium">{formatPrice(order.shipping)}</span>
                                    </div>
                                )}
                                {order.tax && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Impuestos:</span>
                                        <span className="font-medium">{formatPrice(order.tax)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-gray-900">Total:</span>
                                        <span className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información de envío */}
                        {order.shippingAddress && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Dirección de envío</h2>
                                <div className="space-y-2">
                                    <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                    {order.shippingAddress.phone && (
                                        <p>Tel: {order.shippingAddress.phone}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Información de pago */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Información de pago</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Método:</span> {order.paymentMethod}</p>
                                {order.paymentDetails && (
                                    <>
                                        {order.paymentDetails.cardLastFour && (
                                            <p><span className="font-medium">Tarjeta:</span> **** **** **** {order.paymentDetails.cardLastFour}</p>
                                        )}
                                        {order.paymentDetails.cardBrand && (
                                            <p><span className="font-medium">Marca:</span> {order.paymentDetails.cardBrand}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
