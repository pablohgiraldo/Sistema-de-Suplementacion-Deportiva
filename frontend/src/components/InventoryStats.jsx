import { useState, useEffect } from 'react';
import api from '../services/api';
import usePolling from '../hooks/usePolling';

const InventoryStats = () => {
    const [stats, setStats] = useState({
        general: {
            totalProducts: 0,
            totalStock: 0,
            totalReserved: 0,
            totalAvailable: 0,
            totalSold: 0,
            avgStock: 0,
            minStock: 0,
            maxStock: 0
        },
        statusBreakdown: [],
        alerts: {
            lowStock: 0,
            outOfStock: 0
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/inventory/stats');

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching inventory stats:', err);
            setError('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Polling optimizado para estadísticas
    usePolling(fetchStats, 60000, {
        enabled: true,
        maxRetries: 3,
        backoffMultiplier: 2,
        maxInterval: 300000,
        pauseOnError: true,
        pauseOnFocus: true
    });

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-sm">{error}</div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Productos */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Productos</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.general.totalProducts}</p>
                    </div>
                </div>
            </div>

            {/* Stock Total */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Stock Total</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.general.totalStock}</p>
                    </div>
                </div>
            </div>

            {/* Stock Disponible */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Stock Disponible</p>
                        <p className="text-2xl font-semibold text-gray-900">{stats.general.totalAvailable}</p>
                    </div>
                </div>
            </div>

            {/* Alertas */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Alertas</p>
                        <div className="flex space-x-2">
                            <span className="text-lg font-semibold text-red-600">{stats.alerts.outOfStock}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-lg font-semibold text-yellow-600">{stats.alerts.lowStock}</span>
                        </div>
                        <p className="text-xs text-gray-500">Agotados | Bajo Stock</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryStats;
