import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      onClose: () => removeNotification(id)
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, options = {}) => {
    addNotification({
      message,
      type: 'success',
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    addNotification({
      message,
      type: 'error',
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    addNotification({
      message,
      type: 'warning',
      duration: 5000,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    addNotification({
      message,
      type: 'info',
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Toast key={notification.id} {...notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
