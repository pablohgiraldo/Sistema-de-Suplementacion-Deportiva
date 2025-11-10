import { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import SalesChart from '../components/SalesChart';
import useSalesData from '../hooks/useSalesData';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const [dateRange, setDateRange] = useState('30');
    const [chartType, setChartType] = useState('bar');

    const {
        salesData,
        chartData,
        isLoading,
        isError,
        error,
        refetch,
        formatCurrency,
        getRangeLabel,
        startDate,
        endDate
    } = useSalesData(dateRange);

    const formatDateTime = (value) => {
        if (!value) return 'N/A';
        try {
            return new Date(value).toLocaleString('es-CO', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        } catch {
            return value;
        }
    };

    const renderLoadingState = (message = 'Cargando datos...') => (
        <div className="flex items-center justify-center h-64">
            <LoadingSpinner text={message} />
        </div>
    );

    const renderErrorState = () => (
        <div className="text-center py-10">
            <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
                onClick={refetch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Reintentar
            </button>
        </div>
    );

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const renderSalesChart = () => {
        // Debug logging (solo cuando hay datos)
        if (salesData) {
            console.log('🔍 Reports Debug:', {
                hasData: !!salesData,
                totalOrders: salesData.summary?.totalOrders,
                isLoading,
                isError
            });
        }

        if (isLoading) return renderLoadingState('Cargando datos de ventas...');
        if (isError) return renderErrorState();

        // Construir datos para el gráfico de manera más robusta
        let chartDataForDisplay = [];

        if (salesData?.statusBreakdown?.orders && Object.keys(salesData.statusBreakdown.orders).length > 0) {
            chartDataForDisplay = Object.keys(salesData.statusBreakdown.orders).map((status, index) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: Number(salesData.statusBreakdown.orders[status]) || 0,
                fill: COLORS[index % COLORS.length]
            }));
        } else {
            chartDataForDisplay = [
                { name: 'Sin datos', value: 0, fill: '#gray' }
            ];
        }

        // Validar que todos los datos sean válidos
        chartDataForDisplay = chartDataForDisplay.filter(item =>
            item &&
            typeof item.name === 'string' &&
            typeof item.value === 'number' &&
            !isNaN(item.value)
        );


        return (
            <div className="space-y-6">
                {/* Controles */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700">Período:</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="7">Últimos 7 días</option>
                                <option value="30">Últimos 30 días</option>
                                <option value="90">Últimos 90 días</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700">Tipo de gráfico:</label>
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="bar">Barras</option>
                                <option value="line">Líneas</option>
                                <option value="area">Área</option>
                                <option value="pie">Circular</option>
                            </select>
                        </div>

                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* Estadísticas resumen */}
                {salesData && salesData.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Órdenes</p>
                                    <p className="text-2xl font-semibold text-gray-900">{salesData.summary.totalOrders}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
                                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(salesData.summary.totalRevenue)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Promedio por Orden</p>
                                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(salesData.summary.averageOrderValue)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gráfico principal */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Reporte de Ventas - {getRangeLabel(dateRange)}
                    </h3>

                    <div className="h-80">
                        <SalesChart data={chartDataForDisplay} chartType={chartType} />
                    </div>
                </div>

                {/* Órdenes recientes */}
                {salesData?.recentOrders?.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Órdenes recientes</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {salesData.recentOrders.map((order) => (
                                        <tr key={order.orderNumber}>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{order.customer}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(order.total)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 capitalize">{order.status}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 capitalize">{order.paymentStatus}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(order.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Información adicional */}
                {startDate && endDate && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-center text-sm text-gray-500">
                            Período: {startDate} - {endDate}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderProductsTab = () => {
        if (isLoading) return renderLoadingState('Cargando desempeño de productos...');
        if (isError) return renderErrorState();

        const products = salesData?.productPerformance || [];

        if (products.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                    No hay datos de productos disponibles para el período seleccionado.
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top productos por ingresos</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio promedio</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.productId}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{product.totalQuantity.toLocaleString('en-US')}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(product.totalRevenue)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(product.averageItemPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderCustomersTab = () => {
        if (isLoading) return renderLoadingState('Cargando desempeño de clientes...');
        if (isError) return renderErrorState();

        const customers = salesData?.customerPerformance || [];

        if (customers.length === 0) {
            return (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                    No hay datos de clientes disponibles para el período seleccionado.
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Clientes con mayor aporte</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Órdenes</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total gastado</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Última orden</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customers.map((customer) => (
                                <tr key={customer.customerId}>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{customer.totalOrders}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(customer.totalSpent)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatDateTime(customer.lastOrderDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderInventoryTab = () => {
        if (isLoading) return renderLoadingState('Cargando datos de inventario...');
        if (isError) return renderErrorState();

        const summary = salesData?.inventory?.summary || {};
        const lowStock = salesData?.inventory?.lowStock || [];

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Productos monitoreados</p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{summary.totalProducts || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Stock disponible</p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{(summary.totalAvailableStock || 0).toLocaleString('en-US')}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Stock reservado</p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{(summary.totalReservedStock || 0).toLocaleString('en-US')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Productos con stock bajo</p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{summary.lowStockProducts || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-sm font-medium text-gray-500">Productos sin stock</p>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{summary.outOfStockProducts || 0}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Productos con stock crítico</h3>
                    {lowStock.length === 0 ? (
                        <p className="text-gray-600">No hay productos con stock bajo en este momento.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock actual</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock mínimo</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lowStock.map((item) => (
                                        <tr key={`${item.productId}-${item.name}`}>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{item.brand}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{(item.currentStock ?? 0).toLocaleString('en-US')}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{(item.minStock ?? 0).toLocaleString('en-US')}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{(item.availableStock ?? 0).toLocaleString('en-US')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Reportes de Ventas</h1>
                    <p className="mt-2 text-gray-600">
                        Análisis detallado de las ventas y rendimiento del negocio
                    </p>
                </div>

                {/* Tabs de navegación */}
                <div className="mb-8">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('sales')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'sales'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Ventas
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'products'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('customers')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'customers'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Clientes
                        </button>
                        <button
                            onClick={() => setActiveTab('inventory')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventory'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Inventario
                        </button>
                    </nav>
                </div>

                {/* Contenido de las tabs */}
                <div className="mt-8">
                    {activeTab === 'sales' && renderSalesChart()}
                    {activeTab === 'products' && renderProductsTab()}
                    {activeTab === 'customers' && renderCustomersTab()}
                    {activeTab === 'inventory' && renderInventoryTab()}
                </div>
            </div>
        </div>
    );
};

export default Reports;
