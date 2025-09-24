import { useState } from 'react';
import { useInventoryAlerts, useInventoryAlertStats } from '../hooks/useInventoryAlerts';
import AlertConfigForm from './AlertConfigForm';

const StockAlerts = () => {
    const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useInventoryAlerts();
    const { data: statsData, isLoading: statsLoading } = useInventoryAlertStats();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showConfigForm, setShowConfigForm] = useState(false);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 border-red-500 text-red-800';
            case 'error':
                return 'bg-orange-100 border-orange-500 text-orange-800';
            case 'warning':
                return 'bg-yellow-100 border-yellow-500 text-yellow-800';
            default:
                return 'bg-gray-100 border-gray-500 text-gray-800';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical':
                return '🚨';
            case 'error':
                return '⚠️';
            case 'warning':
                return '⚠️';
            default:
                return 'ℹ️';
        }
    };

    const handleConfigureAlerts = (product) => {
        setSelectedProduct(product);
        setShowConfigForm(true);
    };

    const handleConfigSuccess = () => {
        setShowConfigForm(false);
        setSelectedProduct(null);
    };

    if (alertsLoading || statsLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="text-lg">Cargando alertas...</div>
            </div>
        );
    }

    if (alertsError) {
        return (
            <div className="p-6">
                <div className="text-red-600 text-center">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{alertsError.message}</p>
                </div>
            </div>
        );
    }

    const alerts = alertsData?.data || [];
    const stats = statsData || {};

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Alertas de Stock</h1>
                <div className="text-sm text-gray-600">
                    Última actualización: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Estadísticas */}
            {stats.alertCounts && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border">
                        <div className="text-2xl font-bold text-blue-600">{stats.alertCounts.total}</div>
                        <div className="text-sm text-gray-600">Total Alertas</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border">
                        <div className="text-2xl font-bold text-yellow-600">{stats.alertCounts.lowStock}</div>
                        <div className="text-sm text-gray-600">Stock Bajo</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border">
                        <div className="text-2xl font-bold text-orange-600">{stats.alertCounts.criticalStock}</div>
                        <div className="text-sm text-gray-600">Stock Crítico</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border">
                        <div className="text-2xl font-bold text-red-600">{stats.alertCounts.outOfStock}</div>
                        <div className="text-sm text-gray-600">Stock Agotado</div>
                    </div>
                </div>
            )}

            {/* Lista de Alertas */}
            {alerts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">
                        ¡Excelente! No hay alertas activas
                    </h2>
                    <p className="text-gray-500">
                        Todos los productos tienen stock suficiente
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert, index) => (
                        <div key={index} className="bg-white rounded-lg shadow border overflow-hidden">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={alert.product.imageUrl || '/placeholder-product.jpg'}
                                            alt={alert.product.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold">{alert.product.name}</h3>
                                            <p className="text-sm text-gray-600">{alert.product.brand}</p>
                                            <p className="text-sm font-medium text-gray-800">
                                                Stock actual: <span className="font-bold">{alert.inventory.currentStock}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleConfigureAlerts(alert.product)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                    >
                                        Configurar Alertas
                                    </button>
                                </div>

                                {/* Alertas específicas */}
                                <div className="space-y-2">
                                    {alert.alerts.map((alertItem, alertIndex) => (
                                        <div
                                            key={alertIndex}
                                            className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alertItem.severity)}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg">
                                                        {getSeverityIcon(alertItem.severity)}
                                                    </span>
                                                    <div>
                                                        <div className="font-medium">
                                                            {alertItem.type === 'low_stock' && 'Stock Bajo'}
                                                            {alertItem.type === 'critical_stock' && 'Stock Crítico'}
                                                            {alertItem.type === 'out_of_stock' && 'Stock Agotado'}
                                                        </div>
                                                        <div className="text-sm">
                                                            Threshold: {alertItem.threshold} |
                                                            Actual: {alertItem.currentStock}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-sm">
                                                    {alertItem.shouldAlert ? (
                                                        <span className="text-green-600 font-medium">✅ Alerta Activa</span>
                                                    ) : (
                                                        <span className="text-gray-500">⏸️ Alerta Pausada</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Información adicional */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Stock Mínimo:</span>
                                            <div className="font-medium">{alert.inventory.minStock}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Stock Máximo:</span>
                                            <div className="font-medium">{alert.inventory.maxStock}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Último Reabastecimiento:</span>
                                            <div className="font-medium">
                                                {new Date(alert.inventory.lastRestocked).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Total Vendido:</span>
                                            <div className="font-medium">{alert.inventory.totalSold}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Configuración */}
            {showConfigForm && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                Configurar Alertas - {selectedProduct.name}
                            </h2>
                            <button
                                onClick={() => setShowConfigForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <AlertConfigForm
                            productId={selectedProduct._id}
                            onClose={() => setShowConfigForm(false)}
                            onSuccess={handleConfigSuccess}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockAlerts;