'use client';

import { useCallback, useState, useEffect } from 'react';

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported in this environment');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }

    return false;
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window) || permission !== 'granted') {
      return;
    }

    // Use the Notification API directly
    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
    });

    // Close notification after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }, [permission]);

  return { permission, requestPermission, sendNotification };
}; 