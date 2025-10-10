import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import customerService from '../services/customerService';
import LoadingSpinner from '../components/LoadingSpinner';
import useNotifications from '../hooks/useNotifications';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import {
    UsersIcon,
    DiamondIcon,
    MoneyIcon,
    AlertIcon,
    RefreshIcon,
    TargetIcon,
    getSegmentIcon
} from '../components/icons/CRMIcons';

const AdminCustomers = () => {
    const { user, isAuthenticated } = useAuth();
    const { notifications, removeNotification, showSuccess, showError, showWarning } = useNotifications();

    const [dashboardData, setDashboardData] = useState(null);
    const [segmentationAnalysis, setSegmentationAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [resegmenting, setResegmenting] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user?.rol === 'admin') {
            fetchDashboardData();
        }
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [dashboard, analysis] = await Promise.all([
                customerService.getCRMDashboard(),
                customerService.getSegmentationAnalysis()
            ]);

            setDashboardData(dashboard.data);
            setSegmentationAnalysis(analysis.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setError(error.response?.data?.error || 'Error al cargar el dashboard');
            showError('Error al cargar los datos del CRM');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        try {
            setSyncing(true);
            const response = await customerService.syncCustomersWithOrders();
            showSuccess(`Sincronización completada: ${response.results.success}/${response.results.total} exitosos`);
            await fetchDashboardData();
        } catch (error) {
            console.error('Error syncing:', error);
            showError('Error al sincronizar customers');
        } finally {
            setSyncing(false);
        }
    };

    const handleResegment = async () => {
        try {
            setResegmenting(true);
            const response = await customerService.resegmentAllCustomers();

            const changesText = Object.entries(response.results.changes)
                .map(([change, count]) => `${change}: ${count}`)
                .join(', ');

            showSuccess(
                `Re-segmentación completada: ${response.results.success}/${response.results.total} exitosos. ` +
                (changesText ? `Cambios: ${changesText}` : '')
            );

            await fetchDashboardData();
        } catch (error) {
            console.error('Error resegmenting:', error);
            showError('Error al re-segmentar customers');
        } finally {
            setResegmenting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-semibold">Error</h3>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const overview = dashboardData?.overview || {};
    const revenue = dashboardData?.revenue || {};
    const segmentDistribution = dashboardData?.segmentDistribution || [];
    const topCustomers = dashboardData?.topCustomers || [];
    const analysisData = segmentationAnalysis || {};
    const recommendations = analysisData.recommendations || [];

    // Función para obtener el color del segmento
    const getSegmentColor = (segment) => {
        const colors = {
            'VIP': 'from-purple-500 to-purple-700',
            'Frecuente': 'from-green-500 to-green-700',
            'Ocasional': 'from-blue-500 to-blue-700',
            'Nuevo': 'from-yellow-500 to-yellow-700',
            'En Riesgo': 'from-orange-500 to-orange-700',
            'Inactivo': 'from-gray-500 to-gray-700'
        };
        return colors[segment] || 'from-gray-500 to-gray-700';
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Notificaciones */}
            {notifications.map((notification) => (
                <Alert
                    key={notification.id}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => removeNotification(notification.id)}
                    className="mb-4"
                />
            ))}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Dashboard</h1>
                    <p className="text-gray-600">Gestión y análisis de clientes</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <Button
                        onClick={handleSync}
                        disabled={syncing}
                        loading={syncing}
                        variant="primary"
                        icon={!syncing && <RefreshIcon className="w-5 h-5" />}
                    >
                        {syncing ? 'Sincronizando...' : 'Sincronizar Órdenes'}
                    </Button>
                    <Button
                        onClick={handleResegment}
                        disabled={resegmenting}
                        loading={resegmenting}
                        variant="purple"
                        icon={!resegmenting && <TargetIcon className="w-5 h-5" />}
                    >
                        {resegmenting ? 'Re-segmentando...' : 'Re-segmentar'}
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Customers"
                    value={overview.totalCustomers || 0}
                    subtitle={`${overview.activeCustomers || 0} activos`}
                    icon={<UsersIcon className="w-10 h-10" />}
                    iconColor="text-blue-400"
                />
                <StatCard
                    title="Alto Valor"
                    value={overview.highValueCustomers || 0}
                    subtitle={`${overview.totalCustomers > 0 ? ((overview.highValueCustomers / overview.totalCustomers) * 100).toFixed(1) : 0}% del total`}
                    icon={<DiamondIcon className="w-10 h-10" />}
                    iconColor="text-purple-400"
                    valueColor="text-purple-600"
                />
                <StatCard
                    title="Revenue Total"
                    value={`$${(revenue.totalRevenue || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
                    subtitle={`LTV Promedio: $${(revenue.avgLifetimeValue || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
                    icon={<MoneyIcon className="w-10 h-10" />}
                    iconColor="text-green-400"
                    valueColor="text-green-600"
                />
                <StatCard
                    title="En Riesgo"
                    value={overview.churnRiskCount || 0}
                    subtitle="Requieren atención"
                    icon={<AlertIcon className="w-10 h-10" />}
                    iconColor="text-orange-400"
                    valueColor="text-orange-600"
                />
            </div>

            {/* Distribución por Segmentos */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Distribución por Segmentos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {segmentDistribution.map((segment) => (
                            <div
                                key={segment._id}
                                className={`bg-gradient-to-br ${getSegmentColor(segment._id)} rounded-lg p-6 text-white cursor-pointer hover:shadow-lg transition-shadow`}
                                onClick={() => setSelectedSegment(segment._id)}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-white">
                                        {getSegmentIcon(segment._id)}
                                    </div>
                                    <span className="text-2xl font-bold">{segment.count}</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{segment._id}</h3>
                                <div className="space-y-1 text-sm opacity-90">
                                    <p>Revenue: ${(segment.totalRevenue || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
                                    <p>LTV Avg: ${(segment.avgLifetimeValue || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top 5 Customers */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Top 5 Customers por Valor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segmento</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LTV</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Órdenes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topCustomers.map((customer, index) => (
                                    <tr key={customer._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{customer.user?.nombre}</div>
                                            <div className="text-sm text-gray-500">{customer.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {customer.customerCode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={
                                                customer.segment === 'VIP' ? 'purple' :
                                                    customer.segment === 'Frecuente' ? 'success' :
                                                        'primary'
                                            }>
                                                {customer.segment}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                            ${(customer.lifetimeValue || 0).toLocaleString('es-CO')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {customer.metrics?.totalOrders || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={
                                                customer.loyaltyLevel === 'Diamante' ? 'purple' :
                                                    customer.loyaltyLevel === 'Platino' ? 'default' :
                                                        customer.loyaltyLevel === 'Oro' ? 'warning' :
                                                            customer.loyaltyLevel === 'Plata' ? 'gray' :
                                                                'orange'
                                            }>
                                                {customer.loyaltyLevel}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => window.location.href = `/admin/customers/${customer._id}/recommendations`}
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                Recomendaciones
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Recomendaciones */}
            {recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recomendaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recommendations.map((rec, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg border-l-4 ${rec.priority === 'Alta' ? 'border-red-500 bg-red-50' :
                                        rec.priority === 'Media' ? 'border-yellow-500 bg-yellow-50' :
                                            'border-blue-500 bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={
                                                    rec.priority === 'Alta' ? 'danger' :
                                                        rec.priority === 'Media' ? 'warning' :
                                                            'primary'
                                                } size="sm">
                                                    {rec.priority}
                                                </Badge>
                                                <span className="text-sm font-medium text-gray-900">{rec.segment}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">
                                                <strong>Situación:</strong> {rec.issue}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <strong>Acción:</strong> {rec.action}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminCustomers;

