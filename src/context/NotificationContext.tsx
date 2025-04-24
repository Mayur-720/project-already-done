import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import * as notificationApi from '@/lib/api-notification';

type NotificationContextType = {
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => void;
  unreadCount: number;
  markAllAsRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch notifications to get unread count
  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getUserNotifications,
    enabled: !!user,
  });

  // Update unread count when notifications change
  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter((notif) => !notif.read).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  // Check if notifications are already enabled on mount
  useEffect(() => {
    const checkNotificationPermission = async () => {
      if (!('Notification' in window)) return;

      const permission = await Notification.permission;
      const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
      
      if (permission === 'granted' && serviceWorkerRegistration) {
        const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
        setNotificationsEnabled(!!subscription);
      }
    };

    if (user) {
      checkNotificationPermission();
    }
  }, [user]);

  const subscribeToNotifications = async (registration: ServiceWorkerRegistration) => {
    try {
      // Get VAPID public key
      const { publicKey } = await notificationApi.getVapidPublicKey();
      
      // Convert base64 VAPID key to Uint8Array for subscription
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      
      // Create push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Save subscription on server
      await notificationApi.saveSubscription(subscription);
      
      return true;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return false;
    }
  };

  const enableNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({
        title: 'Push notifications not supported',
        description: 'Your browser does not support push notifications',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permission denied',
          description: 'Please allow notifications in your browser settings',
          variant: 'destructive',
        });
        return false;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        toast({
          title: 'Service Worker not found',
          description: 'Please refresh the page and try again',
          variant: 'destructive',
        });
        return false;
      }

      // Check if we already have a subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe if no existing subscription
        const subscribed = await subscribeToNotifications(registration);
        if (subscribed) {
          setNotificationsEnabled(true);
          toast({
            title: 'Notifications enabled',
            description: 'You will now receive notifications',
          });
          return true;
        } else {
          return false;
        }
      } else {
        // We already have a subscription
        setNotificationsEnabled(true);
        return true;
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: 'Failed to enable notifications',
        description: 'Please try again later',
        variant: 'destructive',
      });
      return false;
    }
  };

  const disableNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return;

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        // Inform server that subscription is no longer active
        await notificationApi.disableSubscription(subscription.endpoint);
      }

      setNotificationsEnabled(false);
      toast({
        title: 'Notifications disabled',
        description: 'You will no longer receive notifications',
      });
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast({
        title: 'Failed to disable notifications',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
      refetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notificationsEnabled, 
        enableNotifications, 
        disableNotifications, 
        unreadCount,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
