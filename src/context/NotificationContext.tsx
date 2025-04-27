
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getUserNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/api-notification';
import { enableNotifications as enableNotificationsAPI, disableSubscription } from '@/lib/api-notification';
import { User } from '@/types';

interface Notification {
  _id: string;
  user: string;
  title: string;
  body: string;
  type: 'like' | 'comment' | 'whisper' | 'system';
  read: boolean;
  resourceId?: string;
  resourceModel?: 'Post' | 'Comment' | 'Whisper';
  sender?: string | User;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextProps {
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  unreadCount: number;
  loadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = JSON.parse(localStorage.getItem('auth') || '{}');

  useEffect(() => {
    const storedNotificationsEnabled = localStorage.getItem('notificationsEnabled');
    if (storedNotificationsEnabled === 'true') {
      setNotificationsEnabled(true);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const notifications = await getUserNotifications();
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  const enableNotifications = async () => {
    try {
      const success = await enableNotificationsAPI();
      if (success) {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        loadNotifications();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      return false;
    }
  };

  const disableNotifications = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await disableSubscription(subscription.endpoint);
          await subscription.unsubscribe();
        }
      }
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prevUnreadCount => Math.max(0, prevUnreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const contextValue = {
    notificationsEnabled,
    enableNotifications,
    disableNotifications,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadCount,
    loadNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
