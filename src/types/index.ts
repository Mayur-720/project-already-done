

export interface User {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    anonymousAlias: string;
    avatarEmoji: string;
    bio?: string;
    referralCode?: string;
    referralCount?: number;
    referredBy?: string | User;
    ghostCircles?: string[] | GhostCircle[];
    friends?: string[] | User[];
    recognizedUsers?: string[] | User[];
    identityRecognizers?: string[] | User[];
    recognitionAttempts?: number;
    successfulRecognitions?: number;
    recognitionRevocations?: string[] | User[];
    claimedRewards?: {
      tierLevel: number;
      rewardType: string;
      rewardDescription: string;
      paymentDetails: string;
      status: string;
      claimedAt: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Post {
    _id: string;
    user: string | User;
    content?: string;
    imageUrl?: string;
    anonymousAlias: string;
    avatarEmoji: string;
    ghostCircle?: string | GhostCircle;
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
    username?: string;
  }
  
  export interface GhostCircle {
    _id: string;
    name: string;
    description?: string;
    creator: string | User;
    members: { userId: string; anonymousAlias?: string; avatarEmoji?: string; joinedAt: string; }[];
    admins: string[] | User[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Whisper {
    _id: string;
    sender: string | User;
    receiver: string | User;
    content: string;
    senderAlias: string;
    senderEmoji: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
  }

  export interface Notification {
    _id: string;
    user: string | User;
    title: string;
    body: string;
    type: 'like' | 'comment' | 'whisper' | 'system';
    read: boolean;
    resourceId?: string;
    resourceModel?: 'Post' | 'Comment' | 'Whisper';
    sender?: string | User;
    url?: string;
    createdAt: string;
    updatedAt: string;
  }
