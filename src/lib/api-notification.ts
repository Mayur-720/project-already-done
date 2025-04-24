
import { api } from './api';
import { Notification } from '@/types';

// Get VAPID public key
export const getVapidPublicKey = async () => {
  const response = await api.get('/api/notifications/vapid-public-key');
  return response.data;
};

// Save push subscription
export const saveSubscription = async (subscription: PushSubscription) => {
  const response = await api.post('/api/notifications/subscription', { subscription });
  return response.data;
};

// Disable push subscription
export const disableSubscription = async (endpoint: string) => {
  const response = await api.post('/api/notifications/subscription/disable', { endpoint });
  return response.data;
};

// Get user notifications
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/api/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};
