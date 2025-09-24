import { useState, useEffect, useCallback } from 'react';

const useLazyComponent = (importFunction, retryCount = 3) => {
    const [Component, setComponent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryAttempts, setRetryAttempts] = useState(0);

    const loadComponent = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const module = await importFunction();
            const component = module.default || module;
            setComponent(() => component);
            setRetryAttempts(0);
        } catch (err) {
            console.error('Error cargando componente lazy:', err);
            setError(err);

            if (retryAttempts < retryCount) {
                setRetryAttempts(prev => prev + 1);
                // Retry con backoff exponencial
                setTimeout(() => {
                    loadComponent();
                }, Math.pow(2, retryAttempts) * 1000);
            }
        } finally {
            setLoading(false);
        }
    }, [importFunction, retryAttempts, retryCount]);

    useEffect(() => {
        loadComponent();
    }, [loadComponent]);

    const retry = useCallback(() => {
        setRetryAttempts(0);
        loadComponent();
    }, [loadComponent]);

    return {
        Component,
        loading,
        error,
        retry,
        retryAttempts
    };
};

export default useLazyComponent;
