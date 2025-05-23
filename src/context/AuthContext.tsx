/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getMe, updateProfile } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, fullName: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Improved token persistence check
  const getStoredToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Function to save token with option for persistence
  const saveToken = (token: string, rememberMe: boolean = true) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
      // Clear sessionStorage token to avoid conflicts
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', token);
      // Clear localStorage token to avoid conflicts
      localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          console.log('Attempting to fetch user profile with token...');
          const userData = await getMe();
          console.log('User profile fetched successfully:', userData);
          setUser(userData);
          setIsAdmin(userData.role === 'admin');
        } catch (error) {
          console.error('Auth token invalid', error);
          // Clear token from both storage options
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        console.log('No token found in storage');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      setIsLoading(true);
      
      const data = await loginUser({ email, password });
      
      saveToken(data.token, rememberMe);
      setUser(data);
      setIsAdmin(data.role === 'admin');
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.username}!`,
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Login failed', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid email or password',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, fullName: string, email: string, password: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      console.log('Registering user with data:', { username, fullName, email, referralCode });
      const userData = { username, fullName, email, password, referralCode };
      const data = await registerUser(userData);
      console.log('Registration successful, data received:', data);

      saveToken(data.token, true);
      setUser(data);
      toast({
        title: 'Registration successful',
        description: `Welcome, ${data.anonymousAlias}! Your anonymous identity has been created.`,
      });
      if (referralCode) {
        toast({
          title: 'Referral Applied',
          description: 'The referral code has been successfully applied.',
        });
      }
      navigate('/');
    } catch (error: any) {
      console.error('Registration failed', error);

      let errorMessage = 'Registration failed';
      if (error.response) {
        errorMessage = error.response.data?.message || 'Server error: ' + error.response.status;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }

      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: errorMessage,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      const updatedUser = await updateProfile(userData);
      setUser(prev => (prev ? { ...prev, ...updatedUser } : null));
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      return;
    } catch (error: any) {
      console.error('Update profile failed', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.response?.data?.message || 'Failed to update profile',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile: updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
