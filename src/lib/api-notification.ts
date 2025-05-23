
import { Notification } from '@/types';
import { api, urlBase64ToUint8Array } from '@/lib/api';

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
export const markNotificationAsRead = async (id: string): Promise<void> => {
  try {
    await api.put(`/api/notifications/${id}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.put('/api/notifications/read-all');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Enable push notifications
export const enableNotifications = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported in this browser');
      return false;
    }
    
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
    });
    
    const response = await api.post('/api/notifications/subscribe', {
      subscription: JSON.stringify(subscription)
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Failed to enable notifications:', error);
    return false;
  }
};

// Disable push notifications
export const disableSubscription = async (endpoint: string): Promise<void> => {
  try {
    await api.delete('/api/notifications/unsubscribe', {
      data: { endpoint }
    });
  } catch (error) {
    console.error('Failed to disable subscription:', error);
    throw error;
  }
};
