import { useEffect, useRef } from 'react';

/**
 * Hook para manejar polling con backoff exponencial y pausa automática
 * @param {Function} callback - Función a ejecutar en cada poll
 * @param {number} interval - Intervalo base en milisegundos
 * @param {Object} options - Opciones adicionales
 */
export const usePolling = (callback, interval = 30000, options = {}) => {
    const {
        enabled = true,
        maxRetries = 3,
        backoffMultiplier = 2,
        maxInterval = 300000, // 5 minutos máximo
        pauseOnError = true,
        pauseOnFocus = false
    } = options;

    const intervalRef = useRef(null);
    const retryCountRef = useRef(0);
    const currentIntervalRef = useRef(interval);
    const isPausedRef = useRef(false);

    const executeCallback = async () => {
        if (!enabled || isPausedRef.current) return;

        try {
            await callback();
            // Reset retry count on success
            retryCountRef.current = 0;
            currentIntervalRef.current = interval;
        } catch (error) {
            console.error('Polling error:', error);
            retryCountRef.current++;

            if (retryCountRef.current >= maxRetries) {
                console.warn('Max retries reached, pausing polling');
                if (pauseOnError) {
                    isPausedRef.current = true;
                }
                return;
            }

            // Exponential backoff
            currentIntervalRef.current = Math.min(
                currentIntervalRef.current * backoffMultiplier,
                maxInterval
            );
        }
    };

    const startPolling = () => {
        if (intervalRef.current) return;

        const poll = () => {
            executeCallback().finally(() => {
                if (enabled && !isPausedRef.current) {
                    intervalRef.current = setTimeout(poll, currentIntervalRef.current);
                }
            });
        };

        // Execute immediately on first call
        executeCallback();

        // Then start polling
        intervalRef.current = setTimeout(poll, currentIntervalRef.current);
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearTimeout(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const resumePolling = () => {
        isPausedRef.current = false;
        retryCountRef.current = 0;
        currentIntervalRef.current = interval;
        startPolling();
    };

    const pausePolling = () => {
        isPausedRef.current = true;
        stopPolling();
    };

    useEffect(() => {
        if (enabled) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => stopPolling();
    }, [enabled]);

    // Pause/resume on window focus/blur
    useEffect(() => {
        if (!pauseOnFocus) return;

        const handleFocus = () => resumePolling();
        const handleBlur = () => pausePolling();

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, [pauseOnFocus]);

    return {
        startPolling,
        stopPolling,
        resumePolling,
        pausePolling,
        isPaused: isPausedRef.current,
        retryCount: retryCountRef.current
    };
};

export default usePolling;
