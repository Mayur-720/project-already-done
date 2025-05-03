
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  Copy, 
  Eye, 
  Music,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { incrementShareCount, likePost, updatePost, deletePost } from '@/lib/api';
import { Post, User, Comment } from '@/types';
import EditPostModal from '@/components/feed/EditPostModal';
import CommentItem from '@/components/feed/CommentItem';
import DeletePostDialog from '@/components/feed/DeletePostDialog';
import GuessIdentityModal from '@/components/recognition/GuessIdentityModal';
import { useQuery } from '@tanstack/react-query';
import { StaticSong } from '@/lib/staticSongs';

export interface PostCardProps {
  postId?: string;
  post?: Post;
  onRefresh?: () => void;
}

// Define props interfaces that were causing errors
interface DeletePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
  isLoading: boolean;
}

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onRefresh?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ postId, post: initialPost, onRefresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isShowingComments, setIsShowingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showGuessDialog, setShowGuessDialog] = useState(false);
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [selectedSong, setSelectedSong] = useState<StaticSong | null>(null);

  // Initial post fetch if postId is provided but no post
  const { data: fetchedPost, isLoading: isPostLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8900/api'}/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch post');
        return await response.json();
      } catch (error) {
        console.error('Error fetching post:', error);
        return null;
      }
    },
    enabled: !!postId && !initialPost,
  });

  React.useEffect(() => {
    if (fetchedPost) {
      setPost(fetchedPost);
    }
  }, [fetchedPost]);

  React.useEffect(() => {
    if (post) {
      setLikesCount(post.likes?.length || 0);
      setIsLiked(
        post.likes?.some(
          (like: any) => like.user === user?._id
        ) || false
      );
    }
  }, [post, user]);

  if (isPostLoading || !post) {
    return (
      <Card className="w-full mb-4 bg-gray-900/40 border-purple-800/30 text-gray-200 shadow-md overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-700" />
              <div className="flex-1">
                <div className="h-3 w-1/3 bg-gray-700 rounded mb-2" />
                <div className="h-2 w-1/4 bg-gray-700 rounded" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleLike = async () => {
    setIsLoading(true);
    try {
      const result = await likePost(post._id);
      setLikesCount(result.likes || 0);
      setIsLiked(!isLiked);

      if (!isLiked) {
        toast({
          title: "Post liked!",
          description: "You've added 1 hour to its lifespan.",
        });
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        variant: "destructive",
        title: "Failed to like post",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      // Increment share count in the backend
      await incrementShareCount(post._id);
      
      // Copy post URL to clipboard
      const postUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(postUrl);
      
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard.",
      });
    } catch (error) {
      console.error("Error sharing post:", error);
      toast({
        variant: "destructive",
        title: "Failed to share post",
        description: "Please try again later.",
      });
    }
  };

  const handleEdit = async (data: {
    content: string;
    musicUrl: string;
    muteOriginalAudio: boolean;
  }) => {
    setIsLoading(true);
    try {
      const updatedPost = await updatePost(
        post._id,
        data.content,
        post.media,
        data.musicUrl,
        data.muteOriginalAudio
      );
      setPost({ ...post, ...updatedPost });
      toast({
        title: "Post updated",
        description: "Your changes have been saved.",
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        variant: "destructive",
        title: "Failed to update post",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deletePost(post._id);
      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted.",
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete post",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    setIsLoading(true);
    try {
      // Add your comment submission logic here
      // For now, let's just mock it
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
      setCommentInput('');
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        variant: "destructive",
        title: "Failed to post comment",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMusicPlayback = () => {
    if (audioRef) {
      if (isPlaying) {
        audioRef.pause();
      } else {
        audioRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  React.useEffect(() => {
    if (post.musicUrl) {
      const audio = new Audio(post.musicUrl);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      
      setAudioRef(audio);
      
      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [post.musicUrl]);

  const formatTimestamp = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  // Compute author object from post
  const postAuthor: User = {
    _id: typeof post.user === 'string' ? post.user : post.user._id,
    username: post.username || '',
    anonymousAlias: post.anonymousAlias || 'Anonymous',
    avatarEmoji: post.avatarEmoji || '😎',
    email: '',
    fullName: ''
  };

  const isOwnPost = typeof post.user === 'string' 
    ? post.user === user?._id 
    : post.user._id === user?._id;

  const handleGuessSuccess = () => {
    toast({
      title: "Identity Revealed!",
      description: "You've successfully recognized this user.",
    });
    
    if (onRefresh) {
      onRefresh();
    }
  };

  const renderMediaContent = () => {
    if (post.imageUrl) {
      return (
        <img 
          src={post.imageUrl} 
          alt="Post" 
          className="w-full h-auto rounded-md mb-3" 
        />
      );
    } else if (post.videoUrl) {
      return (
        <video 
          src={post.videoUrl} 
          controls 
          className="w-full h-auto rounded-md mb-3"
        />
      );
    }
    return null;
  };

  return (
    <Card className="w-full mb-4 bg-gray-900/40 border-purple-800/30 text-gray-200 shadow-md overflow-hidden">
      <CardHeader className="p-4 border-b border-purple-800/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="bg-purple-800/40 h-10 w-10 mr-3 text-lg">
              <AvatarFallback>{postAuthor.avatarEmoji}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-purple-300">
                  {postAuthor.anonymousAlias}
                </h3>
                {post.recognized && (
                  <CheckCircle className="h-4 w-4 ml-1 text-green-500" aria-label="You've recognized this user" />
                )}
              </div>
              <p className="text-xs text-gray-400">
                {formatTimestamp(post.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            {!isOwnPost && (
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
                onClick={() => setShowGuessDialog(true)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Guess
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreHorizontal className="h-5 w-5 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-purple-800/40 text-gray-200">
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer hover:bg-purple-900/30"
                  onClick={handleShare}
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                
                {isOwnPost && (
                  <>
                    <DropdownMenuSeparator className="bg-purple-800/20" />
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer hover:bg-purple-900/30 text-blue-400"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Post</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="flex items-center gap-2 cursor-pointer hover:bg-purple-900/30 text-red-400"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Post</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-3">
        {/* Post content */}
        <Link to={`/post/${post._id}`} className="block">
          <div className="mb-3">
            {post.content && (
              <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
            )}
            {renderMediaContent()}
          </div>
        </Link>
        
        {/* Music player */}
        {post.musicUrl && (
          <div className="mb-3 bg-purple-900/20 rounded-md p-2 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-full text-purple-300 ${isPlaying ? 'bg-purple-700/50' : 'bg-purple-900/40'}`}
                onClick={handleMusicPlayback}
              >
                <Music className="h-4 w-4" />
              </Button>
              <div className="ml-2">
                <p className="text-xs text-purple-300">Music</p>
                <p className="text-xs text-gray-400">Click to {isPlaying ? 'pause' : 'play'}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-0">
        <div className="w-full border-t border-purple-800/20">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center text-sm ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                onClick={handleLike}
                disabled={isLoading}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-red-500' : ''}`} />
                <span>{likesCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-sm text-gray-400 ml-2"
                onClick={() => setIsShowingComments(!isShowingComments)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{post.comments?.length || 0}</span>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-sm text-gray-400"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>{post.shareCount || 0}</span>
            </Button>
          </div>
          
          {isShowingComments && (
            <div className="p-2 border-t border-purple-800/20">
              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {post.comments.map((comment: Comment) => (
                    <CommentItem 
                      key={comment._id} 
                      comment={comment} 
                      postId={post._id}
                      onRefresh={onRefresh}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-3">No comments yet. Be the first to comment!</p>
              )}
              
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-800/50 border border-purple-800/30 rounded p-2 text-sm"
                />
                <Button 
                  type="submit" 
                  variant="secondary" 
                  size="sm"
                  disabled={isLoading || !commentInput.trim()}
                  className="bg-purple-700 hover:bg-purple-600"
                >
                  Post
                </Button>
              </form>
            </div>
          )}
        </div>
      </CardFooter>
      
      {/* Modal components */}
      {isEditing && (
        <EditPostModal 
          open={isEditing}
          onOpenChange={setIsEditing}
          post={post}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
      
      <DeletePostDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
      
      <GuessIdentityModal
        open={showGuessDialog}
        onOpenChange={setShowGuessDialog}
        targetUser={postAuthor}
        postId={post._id}
        onSuccess={handleGuessSuccess}
      />
    </Card>
  );
};

export default PostCard;
