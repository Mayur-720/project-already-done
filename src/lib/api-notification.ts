
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

// Subscribe to notifications
export const subscribeToNotifications = async () => {
  // This is handled client-side with the service worker
  console.log('Subscribing to notifications');
  return { success: true };
};

// Unsubscribe from notifications
export const unsubscribeFromNotifications = async () => {
  // This is handled client-side with the service worker
  console.log('Unsubscribing from notifications');
  return { success: true };
};

// Enable notifications
export const enableNotifications = async () => {
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Register service worker if needed
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.info('Service Worker registered with scope:', registration.scope);
      
      // Get VAPID key
      const { publicKey } = await getVapidPublicKey();
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });
      
      // Save subscription on server
      await saveSubscription(subscription);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to enable notifications:', error);
    return false;
  }
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
export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/api/notifications/read-all');
  return response.data;
};
