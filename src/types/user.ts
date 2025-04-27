
// types/user.ts
import { User as IUser, Post as BasePost, GhostCircle } from './index';

// Re-export the User interface from index.ts
export type User = IUser;

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
