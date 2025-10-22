import React, { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { useCancelOrder } from '../hooks/useOrders';
import PageLoader from '../components/PageLoader';

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

const AdminOrders = () => {
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 20
    });

    const { data: ordersData, isLoading, error, refetch } = useOrders(filters);
    const cancelOrderMutation = useCancelOrder();

    // Debug: verificar qué está devolviendo el hook
    console.log('AdminOrders - ordersData:', ordersData);
    console.log('AdminOrders - isLoading:', isLoading);
    console.log('AdminOrders - error:', error);

    const orders = ordersData?.data || [];
    const pagination = ordersData?.pagination || {};

    console.log('AdminOrders - orders:', orders);
    console.log('AdminOrders - pagination:', pagination);

    const handleStatusFilter = (status) => {
        setFilters(prev => ({
            ...prev,
            status: status === prev.status ? '' : status,
            page: 1
        }));
    };

    const handlePaymentStatusFilter = (paymentStatus) => {
        setFilters(prev => ({
            ...prev,
            paymentStatus: paymentStatus === prev.paymentStatus ? '' : paymentStatus,
            page: 1
        }));
    };

    const handleDateFilter = (startDate, endDate) => {
        setFilters(prev => ({
            ...prev,
            startDate,
            endDate,
            page: 1
        }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({
            ...prev,
            page
        }));
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (paymentStatus) => {
        switch (paymentStatus) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return <PageLoader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="text-center text-red-600">
                    <h2 className="text-xl font-bold mb-2">Error al cargar las órdenes</h2>
                    <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Órdenes</h1>
                    <p className="mt-2 text-gray-600">Administra todas las órdenes del sistema</p>
                </div>

                {/* Filtros */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Filtro por estado */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado de la Orden
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Todos los estados</option>
                                <option value="pending">Pendiente</option>
                                <option value="processing">Procesando</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>

                        {/* Filtro por estado de pago */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estado de Pago
                            </label>
                            <select
                                value={filters.paymentStatus}
                                onChange={(e) => handlePaymentStatusFilter(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="">Todos los estados de pago</option>
                                <option value="paid">Pagado</option>
                                <option value="pending">Pendiente</option>
                                <option value="failed">Fallido</option>
                            </select>
                        </div>

                        {/* Filtro por fecha inicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleDateFilter(e.target.value, filters.endDate)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        {/* Filtro por fecha fin */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleDateFilter(filters.startDate, e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ClockIcon className="h-8 w-8 text-yellow-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {orders.filter(o => o.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TruckIcon className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Procesando</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {orders.filter(o => o.status === 'processing').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Entregados</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {orders.filter(o => o.status === 'delivered').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Cancelados</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {orders.filter(o => o.status === 'cancelled').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de órdenes */}
                <div className="bg-white shadow-sm rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Órdenes ({pagination.total || 0})
                        </h3>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <TruckIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg">No hay órdenes que coincidan con los filtros</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Orden
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pago
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getStatusIcon(order.status)}
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            #{order.orderNumber}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.items.length} producto(s)
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {order.user?.nombre || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.user?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatPrice(order.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900 flex items-center"
                                                        title="Ver detalles"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    {order.status === 'pending' && (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm('¿Estás seguro de cancelar esta orden?')) {
                                                                    cancelOrderMutation.mutate({
                                                                        orderId: order._id,
                                                                        reason: 'Cancelado por administrador'
                                                                    });
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900 flex items-center"
                                                            title="Cancelar orden"
                                                        >
                                                            <XMarkIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    {[...Array(pagination.totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium ${pagination.page === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
