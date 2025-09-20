import { useState, useCallback } from 'react';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            message,
            type,
            duration,
            show: true
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const showSuccess = useCallback((message, duration = 5000) => {
        return addNotification(message, 'success', duration);
    }, [addNotification]);

    const showError = useCallback((message, duration = 7000) => {
        return addNotification(message, 'error', duration);
    }, [addNotification]);

    const showWarning = useCallback((message, duration = 6000) => {
        return addNotification(message, 'warning', duration);
    }, [addNotification]);

    const showInfo = useCallback((message, duration = 5000) => {
        return addNotification(message, 'info', duration);
    }, [addNotification]);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
};

export default useNotifications;
