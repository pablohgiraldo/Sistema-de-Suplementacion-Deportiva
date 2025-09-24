import { useState, useEffect } from 'react';
import { useInventoryAlertsSummary } from '../hooks/useInventoryAlerts';

const AlertNotification = () => {
    const { data: alertsSummary } = useInventoryAlertsSummary();
    const [showNotification, setShowNotification] = useState(false);
    const [previousCriticalCount, setPreviousCriticalCount] = useState(0);

    useEffect(() => {
        if (alertsSummary && alertsSummary.criticalAlerts > 0) {
            // Mostrar notificación si hay alertas críticas nuevas
            if (alertsSummary.criticalAlerts > previousCriticalCount && previousCriticalCount > 0) {
                setShowNotification(true);

                // Auto-ocultar después de 5 segundos
                const timer = setTimeout(() => {
                    setShowNotification(false);
                }, 5000);

                return () => clearTimeout(timer);
            }

            setPreviousCriticalCount(alertsSummary.criticalAlerts);
        } else {
            setPreviousCriticalCount(0);
        }
    }, [alertsSummary, previousCriticalCount]);

    const handleCloseNotification = () => {
        setShowNotification(false);
    };

    if (!showNotification || !alertsSummary || alertsSummary.criticalAlerts === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            ¡Alerta Crítica!
                        </h3>
                    </div>
                    <div className="ml-auto">
                        <button
                            onClick={handleCloseNotification}
                            className="text-red-400 hover:text-red-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="px-4 py-3">
                <p className="text-sm text-red-700">
                    Tienes <strong>{alertsSummary.criticalAlerts}</strong> productos con stock crítico o agotado.
                </p>
                <div className="mt-3">
                    <button
                        onClick={() => {
                            // Scroll to alerts section
                            const alertsSection = document.querySelector('[data-section="alerts"]');
                            if (alertsSection) {
                                alertsSection.scrollIntoView({ behavior: 'smooth' });
                            }
                            setShowNotification(false);
                        }}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                    >
                        Ver Alertas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertNotification;
