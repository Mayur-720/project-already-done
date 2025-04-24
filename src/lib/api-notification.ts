
import { api } from './api';
import { Notification } from '@/types';
import { toast } from '@/hooks/use-toast';

// Get VAPID public key
export const getVapidPublicKey = async () => {
  try {
    const response = await api.get('/api/notifications/vapid-public-key');
    return response.data;
  } catch (error) {
    console.error('Error fetching VAPID key:', error);
    throw error;
  }
};

// Save push subscription
export const saveSubscription = async (subscription: PushSubscription) => {
  try {
    const response = await api.post('/api/notifications/subscription', { subscription });
    return response.data;
  } catch (error) {
    console.error('Error saving subscription:', error);
    toast({
      title: 'Notification Error',
      description: 'Failed to save notification settings',
      variant: 'destructive'
    });
    throw error;
  }
};

// Disable push subscription
export const disableSubscription = async (endpoint: string) => {
  try {
    const response = await api.post('/api/notifications/subscription/disable', { endpoint });
    return response.data;
  } catch (error) {
    console.error('Error disabling subscription:', error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/api/notifications');
    
    // Check if response has proper data structure
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error('Invalid notifications response format:', response.data);
      return [];
    }
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
