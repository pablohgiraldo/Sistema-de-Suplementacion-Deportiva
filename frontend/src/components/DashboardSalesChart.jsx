import React from 'react';
import useSalesData from '../hooks/useSalesData';
import SalesChart from './SalesChart';

const DashboardSalesChart = () => {
    const {
        salesData,
        isLoading,
        isError,
        error,
        refetch,
        formatCurrency,
        getRangeLabel,
        startDate,
        endDate
    } = useSalesData('30'); // Últimos 30 días por defecto

    // Construir datos para el gráfico de manera más robusta
    let chartDataForDisplay = [];

    if (salesData?.statusBreakdown?.orders && Object.keys(salesData.statusBreakdown.orders).length > 0) {
        chartDataForDisplay = Object.keys(salesData.statusBreakdown.orders).map((status, index) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: Number(salesData.statusBreakdown.orders[status]) || 0,
            fill: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]
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

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gráfico de Ventas</h3>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p>Cargando datos de ventas...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gráfico de Ventas</h3>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center text-red-500">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={refetch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Gráfico de Ventas</h3>
                <div className="text-sm text-gray-500">
                    {getRangeLabel('30')}
                </div>
            </div>

            {/* Estadísticas resumen */}
            {salesData && salesData.summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-blue-600">Total Órdenes</p>
                                <p className="text-xl font-semibold text-gray-900">{salesData.summary.totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-600">Ingresos Totales</p>
                                <p className="text-xl font-semibold text-gray-900">{formatCurrency(salesData.summary.totalRevenue)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-purple-600">Valor Promedio</p>
                                <p className="text-xl font-semibold text-gray-900">{formatCurrency(salesData.summary.averageOrderValue)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gráfico */}
            <div className="h-64">
                <SalesChart data={chartDataForDisplay} chartType="bar" />
            </div>

            {/* Información adicional */}
            {startDate && endDate && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    Período: {startDate} - {endDate}
                </div>
            )}
        </div>
    );
};

export default DashboardSalesChart;
