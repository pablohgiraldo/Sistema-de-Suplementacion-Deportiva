import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para optimización de memoria
 * Implementa cleanup automático y prevención de memory leaks
 */
const useMemoryOptimization = () => {
    const cleanupFunctions = useRef(new Set());
    const intervals = useRef(new Set());
    const timeouts = useRef(new Set());
    const eventListeners = useRef(new Set());

    // Función para registrar cleanup
    const registerCleanup = useCallback((cleanupFn) => {
        cleanupFunctions.current.add(cleanupFn);
        return () => cleanupFunctions.current.delete(cleanupFn);
    }, []);

    // Función para registrar interval
    const registerInterval = useCallback((intervalId) => {
        intervals.current.add(intervalId);
        return () => intervals.current.delete(intervalId);
    }, []);

    // Función para registrar timeout
    const registerTimeout = useCallback((timeoutId) => {
        timeouts.current.add(timeoutId);
        return () => timeouts.current.delete(timeoutId);
    }, []);

    // Función para registrar event listener
    const registerEventListener = useCallback((element, event, handler, options) => {
        const listener = { element, event, handler, options };
        eventListeners.current.add(listener);
        element.addEventListener(event, handler, options);

        return () => {
            eventListeners.current.delete(listener);
            element.removeEventListener(event, handler, options);
        };
    }, []);

    // Función para limpiar todo
    const cleanup = useCallback(() => {
        // Ejecutar funciones de cleanup
        cleanupFunctions.current.forEach(cleanupFn => {
            try {
                cleanupFn();
            } catch (error) {
                console.warn('Error en cleanup function:', error);
            }
        });
        cleanupFunctions.current.clear();

        // Limpiar intervals
        intervals.current.forEach(intervalId => {
            clearInterval(intervalId);
        });
        intervals.current.clear();

        // Limpiar timeouts
        timeouts.current.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        timeouts.current.clear();

        // Limpiar event listeners
        eventListeners.current.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        eventListeners.current.clear();
    }, []);

    // Cleanup automático al desmontar
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    // Función para crear interval con cleanup automático
    const createInterval = useCallback((callback, delay) => {
        const intervalId = setInterval(callback, delay);
        registerInterval(intervalId);
        return intervalId;
    }, [registerInterval]);

    // Función para crear timeout con cleanup automático
    const createTimeout = useCallback((callback, delay) => {
        const timeoutId = setTimeout(callback, delay);
        registerTimeout(timeoutId);
        return timeoutId;
    }, [registerTimeout]);

    // Función para crear event listener con cleanup automático
    const createEventListener = useCallback((element, event, handler, options) => {
        return registerEventListener(element, event, handler, options);
    }, [registerEventListener]);

    return {
        registerCleanup,
        registerInterval,
        registerTimeout,
        registerEventListener,
        createInterval,
        createTimeout,
        createEventListener,
        cleanup
    };
};

export default useMemoryOptimization;
