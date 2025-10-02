import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useCancelOrder } from '../hooks/useOrders';

// Componentes de iconos simples
const EyeIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const XMarkIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TruckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17a2 2 0 100 4 2 2 0 000-4zm0 0c-1.306 0-2.417.835-2.83 2M8 17V7m0 10h8m-8 0H6a2 2 0 01-2-2V7a2 2 0 012-2h2m8 0a2 2 0 012 2v8a2 2 0 01-2 2h-2m0-10V7a2 2 0 00-2-2H8m8 0V5a2 2 0 00-2-2H8a2 2 0 00-2 2v2" />
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

const ExclamationTriangleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

const Orders = () => {
    const [filters, setFilters] = useState({
        status: '',
        page: 1,
        limit: 10
    });

    const { data: ordersData, isLoading, error, refetch } = useOrders(filters);
    const cancelOrderMutation = useCancelOrder();

    const orders = ordersData?.data || [];
    const pagination = ordersData?.pagination || {};

    const handleStatusFilter = (status) => {
        setFilters(prev => ({
            ...prev,
            status: status === prev.status ? '' : status,
            page: 1
        }));
    };

    const handleCancelOrder = async (orderId) => {
        if (window.confirm('¿Estás seguro de que quieres cancelar esta orden?')) {
            try {
                await cancelOrderMutation.mutateAsync({
                    orderId,
                    reason: 'Cancelado por el usuario'
                });
                refetch();
            } catch (error) {
                console.error('Error al cancelar orden:', error);
            }
        }
    };

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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'processing':
                return <TruckIcon className="h-5 w-5 text-blue-500" />;
            case 'shipped':
                return <TruckIcon className="h-5 w-5 text-purple-500" />;
            case 'delivered':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'cancelled':
                return <XMarkIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        const statusMap = {
            'pending': 'Pendiente',
            'processing': 'Procesando',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status) => {
        const colorMap = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colorMap[status] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar las órdenes</h1>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <button
                        onClick={() => refetch()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
                    <p className="text-gray-600">Gestiona y revisa el estado de tus pedidos</p>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Estado</h2>
                    <div className="flex flex-wrap gap-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filters.status === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {getStatusText(status)}
                            </button>
                        ))}
                        {filters.status && (
                            <button
                                onClick={() => handleStatusFilter('')}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de órdenes */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {filters.status ? `No hay órdenes ${getStatusText(filters.status).toLowerCase()}` : 'No tienes pedidos aún'}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {filters.status
                                ? 'Intenta cambiar el filtro o realizar una nueva compra.'
                                : 'Comienza a comprar productos para ver tus pedidos aquí.'
                            }
                        </p>
                        <Link
                            to="/products"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                        >
                            Ver Productos
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        {getStatusIcon(order.status)}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Orden #{order.orderNumber}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {formatPrice(order.total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Productos */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Productos:</h4>
                                    <div className="space-y-2">
                                        {order.items?.slice(0, 3).map((item, index) => (
                                            <div key={index} className="flex items-center space-x-3 text-sm">
                                                <img
                                                    src={item.product?.imageUrl || '/placeholder-product.jpg'}
                                                    alt={item.product?.name || 'Producto'}
                                                    className="h-8 w-8 object-cover rounded"
                                                />
                                                <span className="text-gray-900">
                                                    {item.product?.name || 'Producto'}
                                                </span>
                                                <span className="text-gray-500">
                                                    x{item.quantity}
                                                </span>
                                                <span className="text-gray-600">
                                                    {formatPrice(item.price)}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items?.length > 3 && (
                                            <p className="text-sm text-gray-500">
                                                y {order.items.length - 3} producto(s) más...
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Método de pago:</span>
                                        <p className="font-medium text-gray-900">
                                            {order.paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' :
                                                order.paymentMethod === 'paypal' ? 'PayPal' :
                                                    order.paymentMethod === 'pse' ? 'PSE' : order.paymentMethod}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Dirección:</span>
                                        <p className="font-medium text-gray-900">
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Estado de pago:</span>
                                        <p className="font-medium text-gray-900">
                                            {order.paymentStatus === 'pending' ? 'Pendiente' :
                                                order.paymentStatus === 'paid' ? 'Pagado' :
                                                    order.paymentStatus === 'failed' ? 'Fallido' :
                                                        order.paymentStatus === 'refunded' ? 'Reembolsado' : order.paymentStatus}
                                        </p>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">Ver detalles</span>
                                        </Link>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                disabled={cancelOrderMutation.isLoading}
                                                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                                <span className="text-sm font-medium">Cancelar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={filters.page === 1}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>

                            <span className="px-4 py-2 text-sm text-gray-700">
                                Página {filters.page} de {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={filters.page === pagination.totalPages}
                                className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
