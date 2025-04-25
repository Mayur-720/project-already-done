
import { api } from './api';
import { BroadcastNotification, Post } from '@/types';

// Broadcast notifications
export const sendBroadcastNotification = async (notificationData: Omit<BroadcastNotification, '_id' | 'createdBy' | 'status' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post('/api/admin/broadcast', notificationData);
  return response.data;
};

export const scheduleBroadcastNotification = async (notificationData: Omit<BroadcastNotification, '_id' | 'createdBy' | 'status' | 'createdAt' | 'updatedAt' | 'sentAt'>) => {
  const response = await api.post('/api/admin/broadcast/schedule', notificationData);
  return response.data;
};

export const getBroadcastHistory = async () => {
  const response = await api.get('/api/admin/broadcast/history');
  return response.data;
};

// Pin posts
export const pinPost = async (postId: string, duration: 'day' | 'week' | 'indefinite') => {
  const response = await api.post(`/api/admin/posts/${postId}/pin`, { duration });
  return response.data;
};

export const unpinPost = async (postId: string) => {
  const response = await api.post(`/api/admin/posts/${postId}/unpin`);
  return response.data;
};

// Get all users (admin only)
export const getAllUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};
