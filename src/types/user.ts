
// types/user.ts
import { User as IUser, Post as BasePost, GhostCircle } from './index';

// Re-export the User interface from index.ts
export type User = IUser;

// Create an explicit Post type that has user as string
export interface Post {
  _id: string;
  user: string; // This is explicitly a string ID, not a User object
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  anonymousAlias: string;
  avatarEmoji: string;
  ghostCircle?: string;
  likes: { user: string; anonymousAlias: string; }[];
  comments: {
    _id: string;
    user: string;
    content: string;
    anonymousAlias: string;
    avatarEmoji: string;
    replies: {
      _id: string;
      user: string;
      content: string;
      anonymousAlias: string;
      avatarEmoji: string;
      createdAt: string;
    }[];
    createdAt: string;
  }[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  shareCount?: number;
  unreadCount?: number;
  userId?: string;
  isAdminPost?: boolean;
  isPinned?: boolean;
  pinnedUntil?: string;
}

export interface Recognition {
  stats: {
    recognitionRate: number;
    totalRecognized: number;
    totalRecognizers: number;
    successfulRecognitions: number;
    recognitionAttempts: number;
  };
  recognized?: User[];
  recognizers?: User[];
}
