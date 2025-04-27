
// types/user.ts
import { Post as BasePost, GhostCircle } from './index';

export interface User {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    anonymousAlias: string;
    avatarEmoji: string;
    bio?: string;
    referralCount?: number;
    referralCode?: string;
    referredBy?: string | User;
    identityRecognizers?: string[] | User[]; // Array of user IDs who recognized this user
    recognizedUsers?: string[] | User[]; // Array of user IDs this user recognized
    recognitionAttempts?: number;
    successfulRecognitions?: number;
    recognitionRate?: number;
    ghostCircles?: string[] | GhostCircle[]; // Explicitly define as array type
    friends?: string[] | User[];
    claimedRewards?: Array<{
      tierLevel: number;
      rewardType: 'badge' | 'cash' | 'premium';
      claimedAt: string;
      paymentMethod?: 'paypal' | 'venmo' | 'giftcard';
      paymentDetails?: string;
      status: 'pending' | 'completed' | 'failed';
    }>;
    createdAt?: string;
    updatedAt?: string;
    role?: 'user' | 'admin';
}

// Re-export the Post type from index.ts
export type Post = BasePost;

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
