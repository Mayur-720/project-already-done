import axios from 'axios';
import { Post, User } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('API Error Data:', error.response.data);
      console.error('API Error Status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (userData: any) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const loginUser = async (userData: any) => {
  const response = await api.post('/users/login', userData);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/users/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateProfile = async (profileData: any) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const uploadProfilePicture = async (formData: FormData) => {
  const response = await api.post('/users/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createPost = async (postData: any) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const getGlobalFeed = async () => {
  const response = await api.get('/posts/global');
  return response.data;
};

export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/users/profile/${userId}`);
  return response.data;
};

export const getUserPosts = async (userId: string) => {
  const response = await api.get(`/users/${userId}/posts`);
  return response.data;
};

export const addFriend = async (username: string) => {
    const response = await api.post('/users/add-friend', { username });
    return response.data;
};

export const searchUsers = async (searchTerm: string) => {
  const response = await api.get(`/users/search?searchTerm=${searchTerm}`);
  return response.data;
};

export const getGhostCircles = async () => {
  const response = await api.get('/ghost-circles');
  return response.data;
};

export const createGhostCircle = async (circleData: any) => {
  const response = await api.post('/ghost-circles', circleData);
  return response.data;
};

export const getGhostCircle = async (circleId: string) => {
  const response = await api.get(`/ghost-circles/${circleId}`);
  return response.data;
};

export const updateGhostCircle = async (circleId: string, circleData: any) => {
  const response = await api.put(`/ghost-circles/${circleId}`, circleData);
  return response.data;
};

export const deleteGhostCircle = async (circleId: string) => {
  const response = await api.delete(`/ghost-circles/${circleId}`);
  return response.data;
};

export const addMemberToGhostCircle = async (circleId: string, username: string) => {
  const response = await api.post(`/ghost-circles/${circleId}/add-member`, { username });
  return response.data;
};

export const removeMemberFromGhostCircle = async (circleId: string, userId: string) => {
  const response = await api.post(`/ghost-circles/${circleId}/remove-member`, { userId });
  return response.data;
};

export const leaveGhostCircle = async (circleId: string) => {
  const response = await api.post(`/ghost-circles/${circleId}/leave`);
  return response.data;
};

export const getCirclePosts = async (circleId: string) => {
  const response = await api.get(`/posts/circle/${circleId}`);
  return response.data;
};

export const likePost = async (postId: string) => {
  const response = await api.put(`/posts/${postId}/like`);
  return response.data;
};

export const sendWhisper = async (recipientId: string, content: string) => {
  const response = await api.post('/whispers', { recipient: recipientId, content });
  return response.data;
};

export const getWhispers = async () => {
  const response = await api.get('/whispers');
  return response.data;
};

export const getWhisper = async (whisperId: string) => {
    const response = await api.get(`/whispers/${whisperId}`);
    return response.data;
};

export const markWhisperAsRead = async (whisperId: string) => {
  const response = await api.put(`/whispers/${whisperId}/read`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const searchSpotifyTracks = async (query: string) => {
  const response = await api.get(`/spotify/search?query=${query}`);
  return response.data;
};

// Recognition functions
export const recognizePostAuthor = async (postId: string, guessUsername: string) => {
  const response = await api.post(`/posts/${postId}/recognize`, { guessUsername });
  return response.data;
};

export const getRecognitions = async (type: string = 'recognized', filter: string = 'all', userId?: string) => {
  const queryParams = new URLSearchParams();
  if (type) queryParams.append('type', type);
  if (filter) queryParams.append('filter', filter);
  if (userId) queryParams.append('userId', userId);
  
  const response = await api.get(`/users/recognitions?${queryParams.toString()}`);
  return response.data;
};

export const revokeRecognition = async (userId: string) => {
  const response = await api.post(`/users/revoke-recognition`, { userId });
  return response.data;
};
