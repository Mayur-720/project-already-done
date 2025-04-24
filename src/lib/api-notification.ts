
import { api } from './api';

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
export const getUserNotifications = async () => {
  const response = await api.get('/api/notifications');
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.put('/api/notifications/read-all');
  return response.data;
};
