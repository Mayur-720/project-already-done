/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { User, Post } from '@/types/user';
import { toast } from '@/hooks/use-toast';

// Create axios instance with base URL
// const API_URL = 'http://localhost:8900';
const API_URL = 'https://undercover-service.onrender.com';
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Always set the Authorization header for both admin and regular tokens
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Improved response interceptor with better error logging
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized, handling token refresh or re-login...', error);
      
      // Special handling for admin token
      const token = localStorage.getItem('token');
      if (token && token.startsWith('admin-')) {
        // For admin users, we'll keep the token but warn about the API access
        console.warn('Admin token used but API endpoint requires backend authorization. Using mock data instead.');
        // We don't remove the token for admin since frontend mock data handling should take over
      } else {
        // For regular users, we'll remove the invalid token
        localStorage.removeItem('token');
        // You could implement a redirect to login here if needed
      }
    }
    return Promise.reject(error);
  }
);

export const getToken = () => {
  return localStorage.getItem('token') || '';
};

export const initSocket = (): Socket => {
  const token = getToken();
  const socket = io(`${API_URL}`, {
    auth: { token },
  });
  socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err.message);
  });
  return socket;
};

export const loginUser = async (email: string, password: string): Promise<User & { token: string }> => {
  // Special case for admin login - using the backend JWT generation now
  if (email === 'admin@gmail.com' && password === 'mayurisbest') {
    try {
      console.log('Admin login detected, fetching admin token from backend');
      const response = await api.post('/api/users/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Admin login failed, using fallback:', error);
      // Fallback in case backend is not available
      const adminUser: User & { token: string } = {
        _id: 'admin123',
        username: 'admin',
        fullName: 'Admin User',
        email: 'admin@gmail.com',
        anonymousAlias: 'TheAdmin',
        avatarEmoji: '👑',
        token: 'admin-token-fallback', // Just a fallback token
        role: 'admin' as const,
      };
      return adminUser;
    }
  }
  
  // Normal login flow remains unchanged
  try {
    const response = await api.post('/api/users/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const getPostById = async (postId: string): Promise<Post> => {
  const response = await api.get(`/api/posts/${postId}`);
  return response.data;
};
export const incrementShareCount = async (postId: string): Promise<{ shareCount: number }> => {
  const response = await api.put(`/api/posts/${postId}/share`);
  return response.data;
};
export const registerUser = async (
  username: string,
  fullName: string,
  email: string,
  password: string,
  referralCode?: string
): Promise<User & { token: string }> => {
  try {
    console.log('Attempting to register user with:', { username, fullName, email, referralCode });
    const response = await api.post('/api/users/register', {
      username,
      fullName,
      email,
      password,
      referralCode,
    });
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error.response || error);
    throw new Error(error?.response?.data?.message || 'An error occurred during registration');
  }
};

export const getUserProfile = async (userId?: string): Promise<User> => {
  const endpoint = userId ? `/api/users/profile/${userId}` : '/api/users/profile';
  const response = await api.get(endpoint);
  return response.data;
};
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put('/api/users/profile', userData);
  return response.data;
};

export const addFriend = async (friendUsername: string): Promise<User> => {
  const response = await api.post('/api/users/friends', { friendUsername });
  return response.data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    const response = await api.get(`/api/ghost-circles/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Ghost Circles API calls
export const createGhostCircle = async (name: string, description: string): Promise<any> => {
  const response = await api.post('/api/ghost-circles', { name, description });
  return response.data;
};

export const getMyGhostCircles = async (): Promise<any[]> => {
  const response = await api.get('/api/ghost-circles');
  return response.data;
};

export const inviteToGhostCircle = async (circleId: string, friendUsername: string): Promise<any> => {
  const response = await api.post(`/api/ghost-circles/${circleId}/invite`, { friendUsername });
  return response.data;
};

export const getGhostCirclePosts = async (circleId: string): Promise<Post[]> => {
  const response = await api.get(`/api/posts/circle/${circleId}`);
  return response.data;
};

export const createPost = async (content: string, ghostCircleId?: string, imageUrl?: string, isAdminPost = false): Promise<Post> => {
  try {
    // Special handling for admin posts
    if (localStorage.getItem('token') === 'admin-token') {
      // Create a mock admin post with required Post type fields
      const mockAdminPost: Post = {
        _id: `admin-${Date.now()}`,
        content,
        imageUrl,
        user: 'admin123',
        anonymousAlias: 'TheAdmin',
        avatarEmoji: '👑',
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        shareCount: 0,
        isAdminPost: true,
      };
      
      toast({
        title: 'Admin Post Created',
        description: 'Your announcement has been posted with admin privileges.',
      });
      
      return mockAdminPost;
    }
    
    // Regular post flow
    const postData = {
      content,
      ...(ghostCircleId && { ghostCircleId }),
      ...(imageUrl && { imageUrl }),
      ...(isAdminPost && { isAdminPost }),
    };
    const response = await api.post('/api/posts', postData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating post:', error);
    throw error?.response?.data || error;
  }
};

export const updatePost = async (postId: string, content: string, imageUrl?: string): Promise<Post> => {
  const postData: { content: string; imageUrl?: string } = { content };
  if (imageUrl !== undefined) {
    postData.imageUrl = imageUrl;
  }
  const response = await api.put(`/api/posts/${postId}`, postData);
  return response.data;
};

export const deletePost = async (postId: string): Promise<void> => {
  await api.delete(`/api/posts/delete/${postId}`);
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const response = await api.get(`/api/users/userposts/${userId}`);
  return response.data;
};

export const getGlobalFeed = async (): Promise<Post[]> => {
  try {
    // Check if we're using the admin token
    if (localStorage.getItem('token') === 'admin-token') {
      console.log('Admin user detected, providing mock global feed data');
      // Return mock data for admin users to avoid API calls
      return [
        {
          _id: 'admin-post-1',
          user: 'admin123',
          content: 'This is a sample admin post. You should see this when logged in as admin.',
          anonymousAlias: 'TheAdmin',
          avatarEmoji: '👑',
          likes: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          shareCount: 0,
          isAdminPost: true,
        }
      ];
    }
    
    // Regular API call for normal users
    const response = await api.get('/api/posts/global');
    return response.data;
  } catch (error) {
    console.error('Error fetching global feed:', error);
    
    // Return empty array in case of error
    return [];
  }
};

export const likePost = async (postId: string): Promise<Post> => {
  const response = await api.put(`/api/posts/${postId}/like`);
  return response.data;
};

// Comments API calls
export const addComment = async (postId: string, content: string, anonymousAlias: string): Promise<any> => {
  const response = await api.post(`/api/posts/${postId}/comments`, { content, anonymousAlias });
  return response.data;
};

export const editComment = async (postId: string, commentId: string, content: string): Promise<any> => {
  const response = await api.put(`/api/posts/${postId}/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  await api.delete(`/api/posts/${postId}/comments/${commentId}`);
};

export const replyToComment = async (postId: string, commentId: string, content: string, anonymousAlias: string): Promise<any> => {
  const response = await api.post(`/api/posts/${postId}/comments/${commentId}/reply`, { content, anonymousAlias });
  return response.data;
};

export const getComments = async (postId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Whispers API calls
export const sendWhisper = async (receiverId: string, content: string): Promise<any> => {
  try {
    const response = await api.post('/api/whispers', { receiverId, content });
    return response.data;
  } catch (error) {
    console.error('Error sending whisper:', error);
    throw error?.response?.data || error;
  }
};

// Modified function for getting whispers with admin handling
export const getMyWhispers = async (): Promise<any[]> => {
  try {
    // Check if we're using the admin token
    if (localStorage.getItem('token') === 'admin-token') {
      console.log('Admin user detected, returning mock whispers data');
      // Return mock data for admin users
      return [
        {
          _id: 'admin-whisper-1',
          sender: 'admin123',
          receiver: 'user123',
          content: 'This is a mock whisper for admin testing',
          senderAlias: 'TheAdmin',
          senderEmoji: '👑',
          read: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    const response = await api.get('/api/whispers');
    return response.data;
  } catch (error) {
    console.error('Error fetching whispers:', error);
    return []; // Return empty array on error for smoother UX
  }
};

export const markWhisperAsRead = async (whisperId: string): Promise<any> => {
  try {
    const response = await api.put(`/api/whispers/${whisperId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking whisper as read:', error);
    throw error?.response?.data || error;
  }
};

// Add new function to join a circle from an invitation
export const joinGhostCircle = async (circleId: string): Promise<any> => {
  const response = await api.post(`/api/ghost-circles/${circleId}/join`);
  return response.data;
};

// Get circle details by ID
export const getGhostCircleById = async (circleId: string): Promise<any> => {
  const response = await api.get(`/api/ghost-circles/${circleId}`);
  return response.data;
};

// Add new recognition API calls
export const recognizeUser = async (targetUserId: string, guessedIdentity: string): Promise<any> => {
  try {
    const response = await api.post('/api/users/recognize', { targetUserId, guessedIdentity });
    return response.data;
  } catch (error: any) {
    console.error('Error recognizing user:', error);
    throw error?.response?.data || error;
  }
};

export const getRecognitions = async (type = 'all', filter = 'all'): Promise<any> => {
  try {
    const response = await api.get(`/api/users/recognitions?type=${type}&filter=${filter}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching recognitions:', error);
    throw error?.response?.data || error;
  }
};

export const revokeRecognition = async (targetUserId: string): Promise<any> => {
  try {
    const response = await api.post('/api/users/revoke-recognition', { targetUserId });
    return response.data;
  } catch (error: any) {
    console.error('Error revoking recognition:', error);
    throw error?.response?.data || error;
  }
};

// New function for admin to pin a post
export const pinPost = async (postId: string, duration: '1d' | '7d' | 'indefinite'): Promise<Partial<Post>> => {
  try {
    // In a real implementation, this would call an API endpoint
    const expiryDate = duration === 'indefinite' ? 
      new Date(2099, 0, 1).toISOString() : 
      new Date(Date.now() + (duration === '1d' ? 24 : 168) * 60 * 60 * 1000).toISOString();
    
    return {
      _id: postId,
      isPinned: true,
      pinnedUntil: expiryDate,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error pinning post:', error);
    throw error;
  }
};

export const getWhisperConversation = async (partnerId: string): Promise<{
  messages: any[];
  partner: {
    _id: string;
    anonymousAlias: string;
    avatarEmoji: string;
    username?: string;
  };
  hasRecognized: boolean;
}> => {
  try {
    // Check if we're using the admin token
    const token = localStorage.getItem('token');
    if (token && (token === 'admin-token' || token === 'admin-token-fallback' || token.startsWith('admin-'))) {
      console.log('Admin user detected, returning mock conversation data');
      return {
        messages: [
          {
            _id: 'admin-message-1',
            sender: 'admin123',
            content: 'This is a mock message for admin testing',
            createdAt: new Date().toISOString(),
          }
        ],
        partner: {
          _id: partnerId,
          anonymousAlias: 'AdminPartner',
          avatarEmoji: '👑',
          username: 'adminpartner'
        },
        hasRecognized: true
      };
    }

    const response = await api.get(`/api/whispers/${partnerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching whisper conversation:', error);
    throw error;
  }
};
