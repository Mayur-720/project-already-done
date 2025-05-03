
// Import Post from index.ts not from this same file to avoid circular reference
import { Post } from '@/types/index';

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  // Required fields for components that depend on these
  anonymousAlias: string;
  avatarEmoji: string;
  // Optional fields
  profilePicture?: string;
  bio?: string;
  followers?: User[];
  following?: User[];
  posts?: Post[];
  ghostCircles?: any[];
  isAdmin?: boolean;
  recognitionAttempts?: number;
  successfulRecognitions?: number;
  recognizedUsers?: { userId: string; recognizedAt: string }[];
  identityRecognizers?: { userId: string; recognizedAt: string }[];
  referralCode?: string;
  referralCount?: number;
  rewardPoints?: number;
  referralTier?: number;
  registrationDate?: string;
  verified?: boolean;
}

export interface Like {
  user: string;
  anonymousAlias: string;
  createdAt?: string;
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
