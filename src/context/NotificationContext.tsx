import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as notificationApi from '@/lib/api-notification';
import { useQuery } from '@tanstack/react-query';
import { Notification } from '@/types';

interface NotificationContextType {
  notificationsEnabled: boolean;
  unreadCount: number;
  enableNotifications: () => Promise<void>;
  setNotificationsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  markAllAsRead: () => Promise<void>;
  notifications: Notification[] | undefined;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Fetch notifications data
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getUserNotifications,
    enabled: !!user,
  });

  // Update unread count when notifications data changes
  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter((notif) => !notif.read).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  useEffect(() => {
    const subscribeToNotifications = async () => {
      if (notificationsEnabled && user) {
        try {
          await notificationApi.subscribeToNotifications();
        } catch (error) {
          console.error('Failed to subscribe to notifications:', error);
          setNotificationsEnabled(false);
        }
      } else {
        try {
          await notificationApi.unsubscribeFromNotifications();
        } catch (error) {
          console.error('Failed to unsubscribe from notifications:', error);
        }
      }
    };

    subscribeToNotifications();
  }, [notificationsEnabled, user]);

  const enableNotifications = async () => {
    try {
      await notificationApi.enableNotifications();
      setNotificationsEnabled(true);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllNotificationsAsRead();
      setUnreadCount(0);
      refetch();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        unreadCount,
        enableNotifications,
        setNotificationsEnabled,
        markAllAsRead,
        notifications,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
