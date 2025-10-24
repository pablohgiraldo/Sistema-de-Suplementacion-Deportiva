import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar el estado de mantenimiento
 * Permite activar/desactivar el modo mantenimiento desde localStorage
 */
export const useMaintenanceMode = () => {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

    useEffect(() => {
        // Verificar si el modo mantenimiento está activado en localStorage
        const maintenanceMode = localStorage.getItem('maintenanceMode');
        if (maintenanceMode === 'true') {
            setIsMaintenanceMode(true);
        }
    }, []);

    const enableMaintenanceMode = () => {
        localStorage.setItem('maintenanceMode', 'true');
        setIsMaintenanceMode(true);
    };

    const disableMaintenanceMode = () => {
        localStorage.removeItem('maintenanceMode');
        setIsMaintenanceMode(false);
    };

    const toggleMaintenanceMode = () => {
        if (isMaintenanceMode) {
            disableMaintenanceMode();
        } else {
            enableMaintenanceMode();
        }
    };

    return {
        isMaintenanceMode,
        enableMaintenanceMode,
        disableMaintenanceMode,
        toggleMaintenanceMode
    };
};

export default useMaintenanceMode;
