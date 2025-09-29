import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import LoadingSpinner from './LoadingSpinner';
import useSalesData from '../hooks/useSalesData';

const SalesChart = () => {
    const [dateRange, setDateRange] = useState('7'); // Últimos 7 días por defecto

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

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner text="Cargando datos de ventas..." />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
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
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Header del gráfico */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Reporte de Ventas</h3>
                        <p className="text-sm text-gray-500">{getRangeLabel()}</p>
                    </div>
                    <div className="flex space-x-2">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="7">Últimos 7 días</option>
                            <option value="30">Últimos 30 días</option>
                            <option value="90">Últimos 90 días</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Resumen de métricas */}
            {salesData && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {salesData.summary.totalOrders}
                            </div>
                            <div className="text-sm text-gray-600">Total Órdenes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {formatCurrency(salesData.summary.totalRevenue)}
                            </div>
                            <div className="text-sm text-gray-600">Ingresos Totales</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {formatCurrency(salesData.summary.averageOrderValue)}
                            </div>
                            <div className="text-sm text-gray-600">Promedio por Orden</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gráfico */}
            <div className="p-6">
                {chartData && chartData.length > 0 ? (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 12 }}
                                    stroke="#6b7280"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="#6b7280"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(value, name) => [value, 'Órdenes']}
                                />
                                <Legend />
                                <Bar
                                    dataKey="Órdenes"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin datos de ventas</h3>
                            <p className="text-gray-600">No hay órdenes en el período seleccionado</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Información adicional */}
            {startDate && endDate && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="text-center text-sm text-gray-500">
                        Período: {startDate} - {endDate}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesChart;
