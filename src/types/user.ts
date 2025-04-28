
export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  // Required fields for components that depend on these
  anonymousAlias: string;
  // Optional fields
  profilePicture?: string;
  avatarEmoji?: string;
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

export interface Post {
  _id: string;
  user: string;
  content: string;
  anonymousAlias: string;
  avatarEmoji: string;
  imageUrl?: string;
  videoUrl?: string;
  media?: Array<{type: 'image' | 'video', url: string}>;
  musicUrl?: string;
  muteOriginalAudio?: boolean;
  likes: Like[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  shareCount?: number;
  ghostCircle?: string;
  // Additional fields
  isAdminPost?: boolean;
  isPinned?: boolean;
  pinnedUntil?: string;
  username?: string;
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
