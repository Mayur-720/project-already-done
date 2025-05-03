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
  recognizedUsers?: { userId: string; recognizedAt: string }[];
  identityRecognizers?: { userId: string; recognizedAt: string }[];
  recognitionAttempts?: number;
  successfulRecognitions?: number;
  recognitionRate?: number;
  recognitionRevocations?: string[] | User[];
  role?: 'user' | 'admin';
  posts?: Post[];
  profilePicture?: string;
  verified?: boolean;
  rewardPoints?: number;
  isAdmin?: boolean;
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
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  media?: Array<{type: 'image' | 'video', url: string}>;
  musicUrl?: string;
  muteOriginalAudio?: boolean;
  anonymousAlias: string;
  avatarEmoji: string;
  ghostCircle?: string | GhostCircle;
  likes: { user: string; anonymousAlias: string }[];
  comments: {
    _id: string;
    user: string | User;
    content: string;
    anonymousAlias: string;
    avatarEmoji: string;
    replies?: {
      _id: string;
      user: string | User;
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

export interface GhostCircle {
  _id: string;
  name: string;
  description?: string;
  creator: string | User;
  members: { userId: string; joinedAt: string; anonymousAlias?: string; avatarEmoji?: string; }[];
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
  unreadCount?: number;
}

export interface Notification {
  _id: string;
  user: string;
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

export interface Recognition {
  recognized?: User[];
  recognizers?: User[];
  stats: {
    totalRecognized: number;
    totalRecognizers: number;
    recognitionRate: number;
    recognitionAttempts: number;
    successfulRecognitions: number;
  };
}

// Replace SpotifyTrack with StaticSong from our staticSongs.ts file
export interface StaticSong {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumImage: string;
  previewUrl: string;
}
