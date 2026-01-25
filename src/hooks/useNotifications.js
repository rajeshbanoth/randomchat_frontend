import { useState, useCallback } from 'react';
import { NOTIFICATION_TYPES } from '../utils/constants';

export const useNotifications = (initialNotifications = []) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addSuccess = useCallback((message, duration = 4000) => {
    return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  }, [addNotification]);

  const addError = useCallback((message, duration = 4000) => {
    return addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  }, [addNotification]);

  const addWarning = useCallback((message, duration = 4000) => {
    return addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  }, [addNotification]);

  const addInfo = useCallback((message, duration = 4000) => {
    return addNotification(message, NOTIFICATION_TYPES.INFO, duration);
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    addSuccess,
    addError,
    addWarning,
    addInfo
  };
};