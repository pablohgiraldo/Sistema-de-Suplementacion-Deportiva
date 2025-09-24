import { useEffect, useRef, useCallback, useMemo } from 'react';
import useMemoryOptimization from './useMemoryOptimization';

/**
 * Hook para optimización de memoria en componentes
 * Implementa memoización inteligente y cleanup automático
 */
const useComponentMemoryOptimization = (componentName = 'Component') => {
    const memoryOptimization = useMemoryOptimization();
    const renderCount = useRef(0);
    const lastRenderTime = useRef(Date.now());
    const memoryStats = useRef({
        renders: 0,
        averageRenderTime: 0,
        memoryUsage: 0
    });

    // Incrementar contador de renders
    useEffect(() => {
        renderCount.current += 1;
        const currentTime = Date.now();
        const renderTime = currentTime - lastRenderTime.current;

        // Actualizar estadísticas
        memoryStats.current.renders = renderCount.current;
        memoryStats.current.averageRenderTime =
            (memoryStats.current.averageRenderTime * (renderCount.current - 1) + renderTime) / renderCount.current;

        lastRenderTime.current = currentTime;
    });

    // Función para memoizar valores costosos
    const memoizeValue = useCallback((value, dependencies) => {
        return useMemo(() => value, dependencies);
    }, []);

    // Función para memoizar funciones costosas
    const memoizeFunction = useCallback((fn, dependencies) => {
        return useCallback(fn, dependencies);
    }, []);

    // Función para crear un observer de memoria
    const createMemoryObserver = useCallback((callback) => {
        if (!window.performance || !window.performance.memory) {
            console.warn('Memory API not available');
            return () => { };
        }

        const observer = () => {
            const memory = window.performance.memory;
            const memoryInfo = {
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit,
                usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
            };

            memoryStats.current.memoryUsage = memoryInfo.usage;
            callback(memoryInfo);
        };

        const intervalId = memoryOptimization.createInterval(observer, 5000); // Cada 5 segundos
        return () => memoryOptimization.registerCleanup(() => clearInterval(intervalId));
    }, [memoryOptimization]);

    // Función para crear un observer de renders
    const createRenderObserver = useCallback((callback) => {
        const observer = () => {
            callback({
                renderCount: renderCount.current,
                averageRenderTime: memoryStats.current.averageRenderTime,
                memoryUsage: memoryStats.current.memoryUsage
            });
        };

        const intervalId = memoryOptimization.createInterval(observer, 10000); // Cada 10 segundos
        return () => memoryOptimization.registerCleanup(() => clearInterval(intervalId));
    }, [memoryOptimization]);

    // Función para limpiar cache de React Query
    const clearReactQueryCache = useCallback(() => {
        // Esta función se puede usar para limpiar cache cuando sea necesario
        if (window.queryClient) {
            window.queryClient.clear();
        }
    }, []);

    // Función para optimizar imágenes
    const optimizeImage = useCallback((src, options = {}) => {
        const {
            width = 800,
            height = 600,
            quality = 80,
            format = 'webp'
        } = options;

        // Si es una URL de Unsplash, optimizar
        if (src.includes('unsplash.com')) {
            const url = new URL(src);
            url.searchParams.set('w', width.toString());
            url.searchParams.set('h', height.toString());
            url.searchParams.set('q', quality.toString());
            url.searchParams.set('fm', format);
            return url.toString();
        }

        return src;
    }, []);

    // Función para crear un debounced callback
    const createDebouncedCallback = useCallback((callback, delay) => {
        let timeoutId;

        const debouncedFn = (...args) => {
            clearTimeout(timeoutId);
            timeoutId = memoryOptimization.createTimeout(() => callback(...args), delay);
        };

        return debouncedFn;
    }, [memoryOptimization]);

    // Función para crear un throttled callback
    const createThrottledCallback = useCallback((callback, delay) => {
        let lastCall = 0;

        const throttledFn = (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                callback(...args);
            }
        };

        return throttledFn;
    }, []);

    // Función para obtener estadísticas de memoria
    const getMemoryStats = useCallback(() => {
        return {
            ...memoryStats.current,
            componentName,
            timestamp: Date.now()
        };
    }, [componentName]);

    // Cleanup automático al desmontar
    useEffect(() => {
        return () => {
            console.log(`Component ${componentName} unmounted. Total renders: ${renderCount.current}`);
        };
    }, [componentName]);

    return {
        // Estadísticas
        renderCount: renderCount.current,
        memoryStats: memoryStats.current,
        getMemoryStats,

        // Memoización
        memoizeValue,
        memoizeFunction,

        // Observadores
        createMemoryObserver,
        createRenderObserver,

        // Optimizaciones
        clearReactQueryCache,
        optimizeImage,
        createDebouncedCallback,
        createThrottledCallback,

        // Cleanup
        cleanup: memoryOptimization.cleanup
    };
};

export default useComponentMemoryOptimization;
