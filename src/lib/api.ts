
import axios from 'axios';

// Create and export the API instance so other modules can use it directly
export const api = axios.create({
  // Use import.meta.env for Vite instead of process.env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8900/api',
  withCredentials: true,
});

// Helper to get token from either localStorage or sessionStorage
const getStoredToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Add an interceptor to include the auth token in every request
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      console.error('API Error Data:', error.response.data);
      console.error('API Error Status:', error.response.status);
      
      // Handle token expiration or unauthorized
      if (error.response.status === 401) {
        console.log('Authorization failed - clearing token');
        // Don't clear token on initial load as it prevents retries
        // Only clear if we're in a user-initiated action
        if (document.readyState === 'complete') {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
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

// Alias for getGhostCircles for components expecting getMyGhostCircles
export const getMyGhostCircles = getGhostCircles;

export const createGhostCircle = async (circleData: any) => {
  const response = await api.post('/ghost-circles', circleData);
  return response.data;
};

export const getGhostCircle = async (circleId: string) => {
  const response = await api.get(`/ghost-circles/${circleId}`);
  return response.data;
};

// Alias for getGhostCircle for components expecting getGhostCircleById
export const getGhostCircleById = getGhostCircle;

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

// Alias for addMemberToGhostCircle for components expecting inviteToGhostCircle
export const inviteToGhostCircle = addMemberToGhostCircle;

export const removeMemberFromGhostCircle = async (circleId: string, userId: string) => {
  const response = await api.post(`/ghost-circles/${circleId}/remove-member`, { userId });
  return response.data;
};

export const leaveGhostCircle = async (circleId: string) => {
  const response = await api.post(`/ghost-circles/${circleId}/leave`);
  return response.data;
};

export const getGhostCirclePosts = async (circleId: string) => {
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

// Alias for getWhispers for components expecting getMyWhispers
export const getMyWhispers = getWhispers;

export const getWhisper = async (whisperId: string) => {
    const response = await api.get(`/whispers/${whisperId}`);
    return response.data;
};

export const getWhisperConversation = async (partnerId: string) => {
  const response = await api.get(`/whispers/conversation/${partnerId}`);
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

export const recognizePostAuthor = async (idParam: string, guessUsername: string) => {
  // Determine if it's a post ID or user ID based on the context
  const endpoint = idParam.length > 20 
    ? `/posts/${idParam}/recognize` // it's likely a post ID
    : `/users/${idParam}/recognize`; // it's likely a user ID
    
  const response = await api.post(endpoint, { guessUsername });
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

// Missing functions based on error messages
export const deletePost = async (postId: string) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const updatePost = async (
  postId: string, 
  content?: string, 
  media?: Array<{type: 'image' | 'video', url: string}>,
  musicUrl?: string, 
  muteOriginalAudio?: boolean,
  imageUrl?: string,
  videoUrl?: string
) => {
  const response = await api.put(`/posts/${postId}`, {
    content,
    media,
    musicUrl,
    muteOriginalAudio,
    imageUrl,
    videoUrl
  });
  return response.data;
};

export const getPostById = async (postId: string) => {
  const response = await api.get(`/posts/${postId}`);
  return response.data;
};

export const incrementShareCount = async (postId: string) => {
  const response = await api.put(`/posts/${postId}/share`);
  return response.data;
};

export const joinGhostCircle = async (inviteCode: string) => {
  const response = await api.post(`/ghost-circles/join`, { inviteCode });
  return response.data;
};

// Socket initialization function
export const initSocket = () => {
  // This will be a placeholder since we don't have the actual WebSocket logic
  // You'll need to replace this with your actual socket initialization logic
  console.log('Socket initialization placeholder - replace with actual implementation');
  return {
    on: (event: string, callback: any) => {
      console.log(`Registered listener for ${event}`);
    },
    emit: (event: string, data: any, callback?: any) => {
      console.log(`Emitted ${event} with data`, data);
      if (callback) callback({ status: 'success' });
    },
    disconnect: () => {
      console.log('Socket disconnected');
    }
  } as any;
};

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
