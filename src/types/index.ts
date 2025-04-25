
// types/index.ts
import { User } from './user';

export interface Post {
  _id: string;
  user: string | User;
  content: string;
  imageUrl?: string;
  anonymousAlias: string;
  avatarEmoji: string;
  ghostCircle?: string | GhostCircle;
  likes: Array<{ user: string; anonymousAlias: string; createdAt: string }>;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  shareCount?: number;
  isPinned?: boolean;
  pinnedUntil?: string;
  pinnedBy?: string;
}

export interface Comment {
  _id: string;
  user: string;
  anonymousAlias: string;
  avatarEmoji: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
}

export interface GhostCircle {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: CircleMember[];
  posts: string[];
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CircleMember {
  _id: string;
  userId: string;
  anonymousAlias: string;
  avatarEmoji: string;
  joinedAt: string;
  role?: 'member' | 'admin';
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  body: string;
  type: 'like' | 'comment' | 'whisper' | 'system' | 'broadcast';
  read: boolean;
  resourceId?: string;
  resourceModel?: string;
  sender?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastNotification {
  _id?: string;
  title: string;
  body: string;
  targetGroup: 'all' | 'specific';
  targetUsers?: string[];
  scheduledFor?: string;
  sentAt?: string;
  status: 'scheduled' | 'sent' | 'failed';
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
