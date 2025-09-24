import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import useComponentMemoryOptimization from './useComponentMemoryOptimization';

/**
 * Hook para optimización de notificaciones
 * Implementa queue inteligente, cleanup automático y gestión de memoria
 */
const useOptimizedNotifications = () => {
    const memoryOptimization = useComponentMemoryOptimization('OptimizedNotifications');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [queue, setQueue] = useState([]);
    const [cache, setCache] = useState(new Map());
    const [lastSync, setLastSync] = useState(null);
    const notificationsRef = useRef(null);

    // Función para obtener clave de cache
    const getCacheKey = useCallback((endpoint, params = {}) => {
        return `${endpoint}-${JSON.stringify(params)}`;
    }, []);

    // Función para agregar notificación
    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            ...notification,
            timestamp: Date.now(),
            isRead: false
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Auto-remove después de 5 segundos si es temporal
        if (notification.type === 'success' || notification.type === 'info') {
            const timeoutId = memoryOptimization.createTimeout(() => {
                removeNotification(id);
            }, 5000);

            memoryOptimization.registerCleanup(() => clearTimeout(timeoutId));
        }

        return id;
    }, [memoryOptimization]);

    // Función para remover notificación
    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    // Función para marcar como leída
    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    }, []);

    // Función para marcar todas como leídas
    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, isRead: true }))
        );
    }, []);

    // Función para limpiar todas las notificaciones
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Función para obtener notificaciones del servidor
    const getNotifications = useCallback(async (filters = {}) => {
        const cacheKey = getCacheKey('notifications', filters);

        // Verificar cache
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/notifications?${params}`);
            if (!response.ok) {
                throw new Error('Failed to get notifications');
            }

            const data = await response.json();

            // Actualizar cache
            setCache(prev => new Map(prev).set(cacheKey, data));

            // Actualizar estado
            setNotifications(data);

            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [cache, getCacheKey]);

    // Función para sincronizar con servidor
    const syncWithServer = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getNotifications();
            setLastSync(Date.now());
            return { success: true, data };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [getNotifications]);

    // Función para obtener estadísticas
    const getNotificationStats = useCallback(() => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        const totalCount = notifications.length;

        return {
            totalCount,
            unreadCount,
            readCount: totalCount - unreadCount,
            isLoading,
            isUpdating,
            error,
            cacheSize: cache.size,
            lastSync,
            queueSize: queue.length
        };
    }, [notifications, isLoading, isUpdating, error, cache.size, lastSync, queue.length]);

    // Función para limpiar cache
    const clearCache = useCallback(() => {
        setCache(new Map());
    }, []);

    // Función para exportar datos
    const exportData = useCallback((format = 'json') => {
        const data = {
            notifications,
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
    }, [notifications, lastSync, cache.size]);

    // Función para obtener rendimiento
    const getPerformanceStats = useCallback(() => {
        return {
            ...memoryOptimization.getMemoryStats(),
            notificationStats: getNotificationStats(),
            cacheStats: {
                size: cache.size,
                keys: Array.from(cache.keys())
            }
        };
    }, [memoryOptimization, getNotificationStats, cache]);

    // Función para obtener notificaciones no leídas
    const getUnreadNotifications = useCallback(() => {
        return notifications.filter(notification => !notification.isRead);
    }, [notifications]);

    // Función para obtener notificaciones por tipo
    const getNotificationsByType = useCallback((type) => {
        return notifications.filter(notification => notification.type === type);
    }, [notifications]);

    // Función para obtener notificaciones recientes
    const getRecentNotifications = useCallback((limit = 10) => {
        return notifications
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }, [notifications]);

    // Función para obtener notificaciones por fecha
    const getNotificationsByDate = useCallback((date) => {
        const targetDate = new Date(date);
        return notifications.filter(notification => {
            const notificationDate = new Date(notification.timestamp);
            return notificationDate.toDateString() === targetDate.toDateString();
        });
    }, [notifications]);

    // Función para obtener notificaciones por rango de fechas
    const getNotificationsByDateRange = useCallback((startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        return notifications.filter(notification => {
            const notificationDate = new Date(notification.timestamp);
            return notificationDate >= start && notificationDate <= end;
        });
    }, [notifications]);

    // Cleanup automático
    useEffect(() => {
        return memoryOptimization.cleanup;
    }, [memoryOptimization]);

    return {
        // Referencias
        notificationsRef,

        // Datos
        notifications,

        // Estados
        isLoading,
        isUpdating,
        error,
        lastSync,

        // Cache
        cache,
        cacheSize: cache.size,

        // Acciones
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        getNotifications,
        syncWithServer,
        clearCache,

        // Utilidades
        getNotificationStats,
        exportData,
        getPerformanceStats,
        getUnreadNotifications,
        getNotificationsByType,
        getRecentNotifications,
        getNotificationsByDate,
        getNotificationsByDateRange,

        // Configuración
        enableCache: true,
        enableSync: true,
        enableAutoRemove: true
    };
};

export default useOptimizedNotifications;