import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api';
import {
    LazyInventoryTable,
    LazyInventoryStats,
    LazyStockAlerts,
    LazyNotificationContainer
} from '../components/LazyComponents';
import LoadingSpinner from '../components/LoadingSpinner';
import useNotifications from '../hooks/useNotifications';
import { useInventoryAlertsSummary } from '../hooks/useInventoryAlerts';
import AlertNotification from '../components/AlertNotification';

const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const { notifications, removeNotification, showWarning, showError } = useNotifications();
    const { data: alertsSummary } = useInventoryAlertsSummary();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        lowStockProducts: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        if (isAuthenticated && user?.rol === 'admin') {
            fetchAdminStats();
        }
    }, [isAuthenticated, user]);

    const fetchAdminStats = async () => {
        try {
            setLoading(true);

            // Obtener estadísticas de usuarios
            const usersResponse = await api.get('/users');
            const totalUsers = usersResponse.data.success ? usersResponse.data.data.length : 0;

            // Obtener estadísticas de productos
            const productsResponse = await api.get('/products');
            const totalProducts = productsResponse.data.success ? productsResponse.data.data.length : 0;

            // Obtener estadísticas de inventario
            const inventoryResponse = await api.get('/inventory');
            const inventoryData = inventoryResponse.data.success ? inventoryResponse.data.data : [];
            const lowStockProducts = inventoryData.filter(item => item.stock < 10).length;

            setStats({
                totalUsers,
                totalProducts,
                totalOrders: 0, // TODO: Implementar cuando tengamos órdenes
                lowStockProducts
            });
        } catch (err) {
            console.error('Error fetching admin stats:', err);
            setError('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    // Verificar si el usuario es administrador
    if (!isAuthenticated || user?.rol !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
                    <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={fetchAdminStats}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header del Dashboard */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Administración</h1>
                        <p className="mt-2 text-gray-600">
                            Bienvenido, {user?.nombre}. Gestiona tu tienda SuperGains desde aquí.
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Alertas Críticas */}
                {alertsSummary && alertsSummary.criticalAlerts > 0 && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    ¡Atención! Tienes {alertsSummary.criticalAlerts} alertas críticas
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>
                                        {alertsSummary.criticalAlerts} productos tienen stock agotado o crítico.
                                        Revisa la sección de alertas para más detalles.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resumen de Alertas */}
                {alertsSummary && alertsSummary.totalAlerts > 0 && (
                    <div className="mb-8 bg-white rounded-lg shadow border">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Resumen de Alertas</h3>
                            <p className="text-sm text-gray-500">Estado actual del inventario</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{alertsSummary.totalAlerts}</div>
                                    <div className="text-sm text-gray-600">Total Alertas</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{alertsSummary.criticalAlerts}</div>
                                    <div className="text-sm text-gray-600">Críticas</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{alertsSummary.errorAlerts}</div>
                                    <div className="text-sm text-gray-600">Errores</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{alertsSummary.warningAlerts}</div>
                                    <div className="text-sm text-gray-600">Advertencias</div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <span className="text-sm text-gray-500">
                                    Última actualización: {new Date(alertsSummary.lastUpdated).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total de Usuarios */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total de Productos */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Productos</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total de Pedidos */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Pedidos</p>
                                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
                            </div>
                        </div>
                    </div>

                    {/* Productos con Stock Bajo */}
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
                                <p className="text-sm font-medium text-gray-500">Alertas Activas</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {alertsSummary ? alertsSummary.totalAlerts : stats.lowStockProducts}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secciones de Gestión */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Gestión de Inventario */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Gestión de Inventario</h3>
                            <p className="text-sm text-gray-500">Administra el stock de productos</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Alertas activas</span>
                                    <span className="text-sm font-medium text-red-600">
                                        {alertsSummary ? alertsSummary.totalAlerts : stats.lowStockProducts}
                                    </span>
                                </div>
                                {alertsSummary && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Alertas críticas</span>
                                            <span className="text-sm font-medium text-red-600">{alertsSummary.criticalAlerts}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Alertas de error</span>
                                            <span className="text-sm font-medium text-orange-600">{alertsSummary.errorAlerts}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Alertas de advertencia</span>
                                            <span className="text-sm font-medium text-yellow-600">{alertsSummary.warningAlerts}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total de productos</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.totalProducts}</span>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                    Ver Inventario Completo
                                </button>
                                <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                                    Ver Alertas Detalladas
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Gestión de Usuarios */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
                            <p className="text-sm text-gray-500">Administra usuarios y permisos</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total de usuarios</span>
                                    <span className="text-sm font-medium text-gray-900">{stats.totalUsers}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Usuarios activos</span>
                                    <span className="text-sm font-medium text-green-600">{stats.totalUsers}</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                    Ver Usuarios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas de Inventario */}
                <div className="mt-8">
                    <Suspense fallback={<LoadingSpinner text="Cargando estadísticas..." />}>
                        <LazyInventoryStats />
                    </Suspense>
                </div>

                {/* Alertas de Stock */}
                <div className="mt-8" data-section="alerts">
                    <Suspense fallback={<LoadingSpinner text="Cargando alertas..." />}>
                        <LazyStockAlerts />
                    </Suspense>
                </div>

                {/* Tabla de Inventario */}
                <div className="mt-8">
                    <Suspense fallback={<LoadingSpinner text="Cargando tabla de inventario..." />}>
                        <LazyInventoryTable />
                    </Suspense>
                </div>

                {/* Acciones Rápidas */}
                <div className="mt-8 bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
                        <p className="text-sm text-gray-500">Accesos directos a funciones comunes</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Agregar Producto</span>
                            </button>

                            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Ver Reportes</span>
                            </button>

                            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Configuración</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenedor de Notificaciones */}
            <Suspense fallback={null}>
                <LazyNotificationContainer
                    notifications={notifications}
                    onRemove={removeNotification}
                />
            </Suspense>

            {/* Notificación de Alertas Críticas */}
            <AlertNotification />
        </div>
    );
};

export default AdminDashboard;
