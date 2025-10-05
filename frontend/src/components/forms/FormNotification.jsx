import React, { useState, useEffect } from 'react';
import FormToast from './FormToast';

const FormNotification = ({
    notifications = [],
    onRemove,
    position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
    maxNotifications = 5,
    className = ''
}) => {
    const [displayedNotifications, setDisplayedNotifications] = useState([]);

    useEffect(() => {
        // Limitar el número de notificaciones mostradas
        const limitedNotifications = notifications.slice(-maxNotifications);
        setDisplayedNotifications(limitedNotifications);
    }, [notifications, maxNotifications]);

    const getPositionStyles = () => {
        const baseStyles = "fixed z-50 space-y-2";

        switch (position) {
            case 'top-right':
                return `${baseStyles} top-4 right-4`;
            case 'top-left':
                return `${baseStyles} top-4 left-4`;
            case 'bottom-right':
                return `${baseStyles} bottom-4 right-4`;
            case 'bottom-left':
                return `${baseStyles} bottom-4 left-4`;
            case 'top-center':
                return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
            case 'bottom-center':
                return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
            default:
                return `${baseStyles} top-4 right-4`;
        }
    };

    const handleRemove = (id) => {
        onRemove?.(id);
    };

    if (displayedNotifications.length === 0) {
        return null;
    }

    return (
        <div className={`${getPositionStyles()} ${className}`}>
            {displayedNotifications.map((notification) => (
                <FormToast
                    key={notification.id}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    duration={notification.duration}
                    onClose={() => handleRemove(notification.id)}
                    show={true}
                />
            ))}
        </div>
    );
};

export default FormNotification;
