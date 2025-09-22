import { useState, useEffect } from 'react';
import api from '../services/api';
import usePolling from '../hooks/usePolling';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState({
        lowStock: [],
        outOfStock: [],
        criticalStock: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const [lowStockResponse, outOfStockResponse] = await Promise.all([
                api.get('/inventory/low-stock'),
                api.get('/inventory/out-of-stock')
            ]);

            const lowStock = lowStockResponse.data.success ? lowStockResponse.data.data : [];
            const outOfStock = outOfStockResponse.data.success ? outOfStockResponse.data.data : [];

            // Clasificar alertas por criticidad
            const criticalStock = lowStock.filter(item =>
                item.currentStock <= (item.minStock * 0.5) || item.currentStock === 0
            );

            setAlerts({
                lowStock: lowStock.filter(item => !criticalStock.includes(item)),
                outOfStock,
                criticalStock
            });
        } catch (err) {
            console.error('Error fetching stock alerts:', err);
            setError('Error al cargar alertas de stock');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    // Escuchar eventos de actualización de inventario
    useEffect(() => {
        const handleInventoryUpdate = () => {
            console.log('StockAlerts: Recibida notificación de actualización de inventario');
            fetchAlerts();
        };

        window.addEventListener('inventoryUpdated', handleInventoryUpdate);

        return () => {
            window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
        };
    }, []);

    // Polling optimizado para alertas
    usePolling(fetchAlerts, 60000, {
        enabled: true,
        maxRetries: 3,
        backoffMultiplier: 2,
        maxInterval: 300000,
        pauseOnError: true,
        pauseOnFocus: true
    });

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical':
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'low':
                return (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'out':
                return (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getAlertColor = (type) => {
        switch (type) {
            case 'critical':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'low':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'out':
                return 'bg-red-100 border-red-300 text-red-900';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getAlertTitle = (type) => {
        switch (type) {
            case 'critical':
                return 'Stock Crítico';
            case 'low':
                return 'Stock Bajo';
            case 'out':
                return 'Producto Agotado';
            default:
                return 'Alerta de Stock';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
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

    const totalAlerts = alerts.criticalStock.length + alerts.lowStock.length + alerts.outOfStock.length;

    if (totalAlerts === 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-medium text-green-800">¡Excelente!</h3>
                        <p className="text-green-600">No hay alertas de stock pendientes</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Alertas de Stock</h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">{totalAlerts} alertas</span>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Stock Crítico */}
                {alerts.criticalStock.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-red-800 flex items-center">
                            {getAlertIcon('critical')}
                            <span className="ml-2">Stock Crítico ({alerts.criticalStock.length})</span>
                        </h4>
                        <div className="space-y-2">
                            {alerts.criticalStock.map((item) => (
                                <div key={item._id} className={`p-3 rounded-lg border ${getAlertColor('critical')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{item.product?.name || 'Producto no encontrado'}</p>
                                            <p className="text-sm opacity-75">
                                                Stock: {item.currentStock} | Mínimo: {item.minStock}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold">CRÍTICO</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Productos Agotados */}
                {alerts.outOfStock.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-red-800 flex items-center">
                            {getAlertIcon('out')}
                            <span className="ml-2">Productos Agotados ({alerts.outOfStock.length})</span>
                        </h4>
                        <div className="space-y-2">
                            {alerts.outOfStock.map((item) => (
                                <div key={item._id} className={`p-3 rounded-lg border ${getAlertColor('out')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{item.product?.name || 'Producto no encontrado'}</p>
                                            <p className="text-sm opacity-75">
                                                Stock: {item.currentStock} | Mínimo: {item.minStock}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold">AGOTADO</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Stock Bajo */}
                {alerts.lowStock.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-yellow-800 flex items-center">
                            {getAlertIcon('low')}
                            <span className="ml-2">Stock Bajo ({alerts.lowStock.length})</span>
                        </h4>
                        <div className="space-y-2">
                            {alerts.lowStock.map((item) => (
                                <div key={item._id} className={`p-3 rounded-lg border ${getAlertColor('low')}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{item.product?.name || 'Producto no encontrado'}</p>
                                            <p className="text-sm opacity-75">
                                                Stock: {item.currentStock} | Mínimo: {item.minStock}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold">BAJO</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockAlerts;
