import { useState, useCallback } from 'react';

export const useAsyncState = (initialState = {}) => {
    const [state, setState] = useState({
        loading: false,
        error: null,
        data: null,
        ...initialState
    });

    const setLoading = useCallback((loading) => {
        setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
    }, []);

    const setError = useCallback((error) => {
        setState(prev => ({ ...prev, error, loading: false }));
    }, []);

    const setData = useCallback((data) => {
        setState(prev => ({ ...prev, data, loading: false, error: null }));
    }, []);

    const reset = useCallback(() => {
        setState({ loading: false, error: null, data: null, ...initialState });
    }, [initialState]);

    const executeAsync = useCallback(async (asyncFunction, onSuccess, onError) => {
        setLoading(true);
        setError(null);

        try {
            const result = await asyncFunction();
            setData(result);
            if (onSuccess) onSuccess(result);
            return result;
        } catch (error) {
            setError(error);
            if (onError) onError(error);
            throw error;
        }
    }, [setLoading, setError, setData]);

    return {
        ...state,
        setLoading,
        setError,
        setData,
        reset,
        executeAsync
    };
};

export default useAsyncState;
