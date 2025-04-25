
// types/user.ts
import { Post as BasePost } from './index';

export interface User {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    anonymousAlias: string;
    avatarEmoji: string;
    bio?: string;
    role?: 'user' | 'admin'; // Added role field
    referralCount?: number;
    referralCode?: string;
    referredBy?: string;
    identityRecognizers?: string[] | User[]; // Array of user IDs who recognized this user
    recognizedUsers?: string[] | User[]; // Array of user IDs this user recognized
    recognitionAttempts?: number;
    successfulRecognitions?: number;
    recognitionRate?: number;
    claimedRewards?: Array<{
      tierLevel: number;
      rewardType: 'badge' | 'cash' | 'premium';
      claimedAt: string;
      paymentMethod?: 'paypal' | 'venmo' | 'giftcard';
      paymentDetails?: string;
      status: 'pending' | 'completed' | 'failed';
    }>;
    friends?: string[]; // For addFriend feature
    [x: string]: string | number | string[] | Array<{ tierLevel: number; rewardType: 'badge' | 'cash' | 'premium'; claimedAt: string; paymentMethod?: 'paypal' | 'venmo' | 'giftcard'; paymentDetails?: string; status: 'pending' | 'completed' | 'failed'; }> | undefined | User[]; // Permissive index signature
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
