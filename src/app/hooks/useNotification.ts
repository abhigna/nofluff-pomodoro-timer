'use client';

import { useCallback, useState, useEffect } from 'react';

export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker when the component mounts
  useEffect(() => {
    // This will only run on the client side
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported in this environment');
      return;
    }

    // Set initial permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Register service worker
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        setSwRegistration(registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this environment');
      return false;
    }

    try {
      // Always request permission directly
      const result = await Notification.requestPermission();
      console.log('Notification permission result:', result);
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    console.log('Attempting to send notification:', title, body);

    // First, play sound regardless of notification method
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.warn('Could not play notification sound:', e));
    } catch (e) {
      console.warn('Audio playback not supported');
    }
    
    // Check permission
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }
    
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      requestPermission().then(granted => {
        if (granted) sendNotification(title, body); // Try again if permission was just granted
      });
      return;
    }

    // Try to use service worker for notification (preferred method)
    if (navigator.serviceWorker && navigator.serviceWorker.controller && swRegistration) {
      console.log('Sending notification through Service Worker');
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        icon: '/icons/icon-192x192.png'
      });
    } 
    // Fallback to direct Notification API
    else if ('Notification' in window) {
      console.log('Falling back to direct Notification API');
      try {
        const notification = new Notification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: 'pomodoro-notification'
        });
        
        // Close notification after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    } else {
      console.warn('No notification method available');
    }
  }, [swRegistration, requestPermission]);

  return { permission, requestPermission, sendNotification };
};