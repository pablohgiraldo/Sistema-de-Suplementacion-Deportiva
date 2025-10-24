import React from 'react';
import { useMaintenanceMode } from '../hooks/useMaintenanceMode';

/**
 * Componente de control de mantenimiento para administradores
 * Permite activar/desactivar el modo mantenimiento desde el panel de administración
 */
const MaintenanceToggle = () => {
    const { isMaintenanceMode, toggleMaintenanceMode } = useMaintenanceMode();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Modo Mantenimiento
                    </h3>
                    <p className="text-sm text-gray-600">
                        {isMaintenanceMode
                            ? 'El sitio está actualmente en modo mantenimiento'
                            : 'El sitio está funcionando normalmente'
                        }
                    </p>
                </div>

                <button
                    onClick={toggleMaintenanceMode}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isMaintenanceMode
                            ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                            : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                        }`}
                >
                    {isMaintenanceMode ? 'Desactivar Mantenimiento' : 'Activar Mantenimiento'}
                </button>
            </div>

            {isMaintenanceMode && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                        <svg className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <p className="text-sm text-yellow-800 font-medium">
                                Advertencia
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                                Los usuarios no podrán acceder al sitio mientras el modo mantenimiento esté activo.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceToggle;
