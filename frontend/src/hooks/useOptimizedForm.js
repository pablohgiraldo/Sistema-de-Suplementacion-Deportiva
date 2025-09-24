import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de formularios
 * Implementa validación debounced, cleanup automático y optimización de memoria
 */
const useOptimizedForm = (initialValues = {}, options = {}) => {
    const {
        validateOnChange = true,
        validateOnBlur = true,
        debounceMs = 300,
        maxHistorySize = 10
    } = options;

    const memoryOptimization = useComponentMemoryOptimization('OptimizedForm');
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [history, setHistory] = useState([initialValues]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [cache, setCache] = useState(new Map());
    const [lastSync, setLastSync] = useState(null);
    const formRef = useRef(null);

    // Función para obtener clave de cache
    const getCacheKey = useCallback((endpoint, params = {}) => {
        return `${endpoint}-${JSON.stringify(params)}`;
    }, []);

    // Función para validar campo individual
    const validateField = useCallback((name, value, allValues) => {
        // Implementar validaciones específicas según el campo
        const validations = {
            email: (val) => {
                if (!val) return 'Email es requerido';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Email inválido';
                return null;
            },
            password: (val) => {
                if (!val) return 'Contraseña es requerida';
                if (val.length < 6) return 'Contraseña debe tener al menos 6 caracteres';
                if (!/[a-z]/.test(val)) return 'Contraseña debe contener al menos una letra minúscula';
                if (!/[A-Z]/.test(val)) return 'Contraseña debe contener al menos una letra mayúscula';
                if (!/\d/.test(val)) return 'Contraseña debe contener al menos un número';
                return null;
            },
            nombre: (val) => {
                if (!val) return 'Nombre es requerido';
                if (val.length < 2) return 'Nombre debe tener al menos 2 caracteres';
                return null;
            },
            telefono: (val) => {
                if (val && !/^\+?[\d\s-()]+$/.test(val)) return 'Teléfono inválido';
                return null;
            }
        };

        const validator = validations[name];
        return validator ? validator(value) : null;
    }, []);

    // Función para validar formulario completo
    const validateForm = useCallback((formValues) => {
        const newErrors = {};
        let isValid = true;

        Object.keys(formValues).forEach(field => {
            const error = validateField(field, formValues[field], formValues);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        return { errors: newErrors, isValid };
    }, [validateField]);

    // Función para actualizar valor con validación
    const updateValue = useCallback((name, value) => {
        setValues(prev => {
            const newValues = { ...prev, [name]: value };

            // Agregar al historial si es diferente
            if (JSON.stringify(newValues) !== JSON.stringify(prev)) {
                setHistory(prevHistory => {
                    const newHistory = [...prevHistory.slice(0, historyIndex + 1), newValues];
                    if (newHistory.length > maxHistorySize) {
                        return newHistory.slice(-maxHistorySize);
                    }
                    return newHistory;
                });
                setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
            }

            return newValues;
        });

        // Validación debounced
        if (validateOnChange) {
            const timeoutId = memoryOptimization.createTimeout(() => {
                setIsValidating(true);
                const { errors: newErrors } = validateForm({ ...values, [name]: value });
                setErrors(prev => ({ ...prev, [name]: newErrors[name] || null }));
                setIsValidating(false);
            }, debounceMs);

            memoryOptimization.registerCleanup(() => clearTimeout(timeoutId));
        }
    }, [validateOnChange, debounceMs, validateForm, values, historyIndex, maxHistorySize, memoryOptimization]);

    // Función para manejar cambio de campo
    const handleChange = useCallback((name, value) => {
        updateValue(name, value);
    }, [updateValue]);

    // Función para manejar blur de campo
    const handleBlur = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));

        if (validateOnBlur) {
            const { errors: newErrors } = validateForm(values);
            setErrors(prev => ({ ...prev, [name]: newErrors[name] || null }));
        }
    }, [validateOnBlur, validateForm, values]);

    // Función para manejar submit
    const handleSubmit = useCallback(async (onSubmit) => {
        setIsSubmitting(true);

        try {
            // Validar formulario completo
            const { errors: newErrors, isValid } = validateForm(values);
            setErrors(newErrors);

            if (!isValid) {
                // Marcar todos los campos como touched
                const allTouched = Object.keys(values).reduce((acc, key) => {
                    acc[key] = true;
                    return acc;
                }, {});
                setTouched(allTouched);
                return;
            }

            // Ejecutar submit
            await onSubmit(values);
        } catch (error) {
            console.error('Form submit error:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm]);

    // Función para resetear formulario
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setHistory([initialValues]);
        setHistoryIndex(0);
    }, [initialValues]);

    // Función para deshacer
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setValues(history[newIndex]);
        }
    }, [historyIndex, history]);

    // Función para rehacer
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setValues(history[newIndex]);
        }
    }, [historyIndex, history]);

    // Función para obtener estadísticas
    const getFormStats = useCallback(() => {
        return {
            values,
            errors,
            touched,
            isSubmitting,
            isValidating,
            historySize: history.length,
            historyIndex,
            hasErrors: Object.values(errors).some(error => error !== null),
            isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
            cacheSize: cache.size,
            lastSync
        };
    }, [values, errors, touched, isSubmitting, isValidating, history, historyIndex, initialValues, cache.size, lastSync]);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    // Función para exportar datos
    const exportData = useCallback((format = 'json') => {
        const data = {
            values,
            errors,
            touched,
            history,
            lastSync,
            cacheSize: cache.size
        };

        switch (format) {
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'csv':
                return Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
            default:
                return data;
        }
    }, [values, errors, touched, history, lastSync, cache.size]);

    // Función para obtener rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            formStats: getFormStats(),
            cacheStats: {
                size: cache.size,
                keys: Array.from(cache.keys())
            }
        };
    }, [memoryOptimization, getFormStats, cache]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        formRef,

        // Estados
        values,
        errors,
        touched,
        isSubmitting,
        isValidating,

        // Historial
        history,
        historyIndex,

        // Cache
        cache,
        cacheSize: cache.size,

        // Acciones
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        undo,
        redo,
        clearCache,

        // Utilidades
        getFormStats,
        exportData,
        getPerformanceStats,

        // Configuración
        validateOnChange,
        validateOnBlur,
        debounceMs,
        maxHistorySize
    };
};

export default useOptimizedForm;