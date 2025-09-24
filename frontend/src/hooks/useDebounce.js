import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debouncing de valores
 * Útil para optimizar búsquedas y evitar llamadas excesivas a la API
 * 
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos
 * @returns {any} Valor debounced
 */
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
