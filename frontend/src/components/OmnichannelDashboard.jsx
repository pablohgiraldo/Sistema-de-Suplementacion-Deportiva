import React from 'react';
import { useOmnichannelDashboard, useRealTimeMetrics, useExecutiveSummary } from '../hooks/useOmnichannelDashboard';
import LoadingSpinner from './LoadingSpinner';

const OmnichannelDashboard = () => {
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useOmnichannelDashboard();
  const { data: realtimeData, isLoading: realtimeLoading } = useRealTimeMetrics();
  const { data: executiveData, isLoading: executiveLoading } = useExecutiveSummary();

  if (dashboardLoading) {
    return <LoadingSpinner text="Cargando dashboard omnicanal..." />;
  }

  if (dashboardError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800">Error al cargar el dashboard omnicanal</span>
        </div>
      </div>
    );
  }

  const dashboard = dashboardData?.data;
  const realtime = realtimeData?.data;
  const executive = executiveData?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Omnicanal</h2>
            <p className="text-gray-600">Vista consolidada de todos los canales de venta</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Tiempo real</span>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas Totales */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${dashboard?.sales?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Órdenes Totales */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Órdenes Totales</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboard?.sales?.totalOrders?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Físico */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Stock Físico</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboard?.inventory?.summary?.totalPhysicalStock?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Digital */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Stock Digital</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboard?.inventory?.summary?.totalDigitalStock?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ventas por Canal */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ventas por Canal</h3>
          <p className="text-sm text-gray-500">Distribución de ingresos por canal de venta</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dashboard?.sales?.channelBreakdown?.map((channel) => (
              <div key={channel._id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    channel._id === 'online' ? 'bg-blue-500' :
                    channel._id === 'physical_store' ? 'bg-green-500' :
                    channel._id === 'mobile_app' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {channel._id === 'physical_store' ? 'Tienda Física' : 
                     channel._id === 'mobile_app' ? 'App Móvil' : channel._id}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${channel.totalRevenue?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {channel.totalOrders} órdenes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas de Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stock Bajo General */}
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
              <p className="text-sm font-medium text-gray-500">Stock Bajo General</p>
              <p className="text-2xl font-semibold text-red-600">
                {dashboard?.inventory?.lowStock?.general || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Bajo Físico */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Stock Bajo Físico</p>
              <p className="text-2xl font-semibold text-orange-600">
                {dashboard?.inventory?.lowStock?.physical || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Stock Bajo Digital */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Stock Bajo Digital</p>
              <p className="text-2xl font-semibold text-purple-600">
                {dashboard?.inventory?.lowStock?.digital || '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancias de Sincronización */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Estado de Sincronización</h3>
          <p className="text-sm text-gray-500">Monitoreo de discrepancias entre canales</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {dashboard?.inventory?.discrepancies?.count || '0'}
              </div>
              <div className="text-sm text-gray-600">Discrepancias</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {dashboard?.inventory?.discrepancies?.pendingSync || '0'}
              </div>
              <div className="text-sm text-gray-600">Pendientes Sync</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {dashboard?.inventory?.discrepancies?.syncErrors || '0'}
              </div>
              <div className="text-sm text-gray-600">Errores Sync</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas en Tiempo Real */}
      {realtime && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Métricas en Tiempo Real</h3>
            <p className="text-sm text-gray-500">Actualizado cada 30 segundos</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {realtime.activeUsers || '0'}
                </div>
                <div className="text-sm text-gray-600">Usuarios Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {realtime.pendingOrders || '0'}
                </div>
                <div className="text-sm text-gray-600">Órdenes Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {realtime.processingOrders || '0'}
                </div>
                <div className="text-sm text-gray-600">En Proceso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {realtime.lowStockCount || '0'}
                </div>
                <div className="text-sm text-gray-600">Stock Bajo</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recomendaciones Ejecutivas */}
      {executive?.recommendations && executive.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recomendaciones</h3>
            <p className="text-sm text-gray-500">Sugerencias basadas en análisis de datos</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {executive.recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.severity === 'high' ? 'bg-red-50 border-red-400' :
                  rec.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      rec.severity === 'high' ? 'bg-red-500' :
                      rec.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {rec.severity === 'high' ? '!' : rec.severity === 'medium' ? '⚠' : 'i'}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {rec.type} - {rec.severity === 'high' ? 'Alta Prioridad' : 
                         rec.severity === 'medium' ? 'Prioridad Media' : 'Baja Prioridad'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {rec.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OmnichannelDashboard;
