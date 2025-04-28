
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Music,
  Image,
  Video,
  Volume2,
  VolumeX,
  ArrowUpCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/context/AuthContext';
import {
  likePost,
  deletePost,
  updatePost,
  getPostById,
  incrementShareCount
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import SpotifyMusicSelector from '../spotify/SpotifyMusicSelector';
import { SpotifyTrack, Post } from '@/types';
import { AspectRatio } from '../ui/aspect-ratio';
import AvatarGenerator from '../user/AvatarGenerator';
import GuessIdentityModal from '../recognition/GuessIdentityModal';
import { User } from '@/types';

// Interface for loading states
interface LoadingStates {
  share: boolean;
  like: boolean;
  comment: boolean;
  delete: boolean;
  report: boolean;
  update: boolean;
  [key: string]: boolean;
}

interface PostUpdateData {
  content: string;
  musicUrl?: string;
  muteOriginalAudio?: boolean;
}

export interface PostCardProps {
  postId?: string;
  post?: Post;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
  onRecognitionSuccess?: () => void;
  onRefresh?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  postId, 
  post: initialPost, 
  onPostDeleted, 
  onPostUpdated, 
  onRecognitionSuccess, 
  onRefresh 
}) => {
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [isLoading, setIsLoading] = useState(!initialPost);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const [isRecognized, setIsRecognized] = useState(false);
  const [isMuteOriginalAudio, setIsMuteOriginalAudio] = useState(false);
  const [isSpotifySelectorOpen, setIsSpotifySelectorOpen] = useState(false);

  // Consolidated loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    share: false,
    like: false,
    comment: false,
    delete: false,
    report: false,
    update: false,
  });

  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch post data if postId is provided but no initialPost
  useEffect(() => {
    const fetchPostData = async () => {
      if (!postId) return;
      
      try {
        setIsLoading(true);
        const postData = await getPostById(postId);
        
        setPost(postData);
        
        // Initialize post-related states
        if (postData) {
          setEditedContent(postData.content || '');
          setLikeCount(postData.likes?.length || 0);
          setCommentCount(postData.comments?.length || 0);
          setShareCount(postData.shareCount || 0);
          
          // Check if current user has liked the post
          setIsLiked(postData.likes?.some((like: any) => 
            like.user === user?._id || like.user?._id === user?._id) || false);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          variant: "destructive",
          title: "Error loading post",
          description: "Failed to load the post. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (postId && !initialPost) {
      fetchPostData();
    } else if (initialPost) {
      setEditedContent(initialPost.content || '');
      setLikeCount(initialPost.likes?.length || 0);
      setCommentCount(initialPost.comments?.length || 0);
      setShareCount(initialPost.shareCount || 0);
      setIsLiked(initialPost.likes?.some((like: any) => 
        like.user === user?._id || like.user?._id === user?._id) || false);
    }
  }, [postId, initialPost, user?._id, toast]);

  // Handler for liking a post
  const handleLike = async () => {
    if (!user || loadingStates.like) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, like: true }));
      
      if (post) {
        await likePost(post._id);
      } else if (postId) {
        await likePost(postId);
      }
      
      // Update UI optimistically
      setIsLiked(prevIsLiked => !prevIsLiked);
      setLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "Could not like/unlike the post. Please try again.",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, like: false }));
    }
  };

  // Handler for sharing a post
  const handleShare = async () => {
    if (loadingStates.share) return;
    
    setLoadingStates(prev => ({ ...prev, share: true }));
    setIsShareSheetOpen(true);
    
    try {
      if (post) {
        await incrementShareCount(post._id);
      } else if (postId) {
        await incrementShareCount(postId);
      }
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Error sharing post:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, share: false }));
    }
  };

  // Handler for deleting a post
  const handleDelete = async () => {
    if (loadingStates.delete) return;
    
    setLoadingStates(prev => ({ ...prev, delete: true }));
    
    try {
      if (post) {
        await deletePost(post._id);
      } else if (postId) {
        await deletePost(postId);
      }
      
      toast({
        title: "Post Deleted",
        description: "Your post has been deleted successfully.",
      });
      
      if (onPostDeleted) {
        onPostDeleted();
      }
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the post. Please try again.",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, delete: false }));
    }
  };

  // Handler for updating a post
  const handleUpdate = async () => {
    if (loadingStates.update || !editedContent.trim()) return;
    
    setLoadingStates(prev => ({ ...prev, update: true }));
    
    try {
      const postUpdateData: PostUpdateData = {
        content: editedContent,
      };
      
      if (selectedTrack && selectedTrack.preview_url) {
        postUpdateData.musicUrl = selectedTrack.preview_url;
      }
      
      postUpdateData.muteOriginalAudio = isMuteOriginalAudio;
      
      if (post) {
        await updatePost(post._id, JSON.stringify(postUpdateData));
      } else if (postId) {
        await updatePost(postId, JSON.stringify(postUpdateData));
      }
      
      // Update local state
      setPost(prev => prev ? {
        ...prev,
        content: editedContent,
        ...(selectedTrack && selectedTrack.preview_url ? { musicUrl: selectedTrack.preview_url } : {}),
        muteOriginalAudio: isMuteOriginalAudio,
      } : null);
      
      setIsEditMode(false);
      
      toast({
        title: "Post Updated",
        description: "Your post has been updated successfully.",
      });
      
      if (onPostUpdated) {
        onPostUpdated();
      }
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the post. Please try again.",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, update: false }));
    }
  };

  // Handler for comment submission
  const handleCommentSubmit = () => {
    // Comment submission logic would go here
    toast({
      title: "Feature Not Implemented",
      description: "The commenting feature is not yet implemented.",
    });
  };

  // Handler for toggling mute state
  const handleToggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Handler for recognition success
  const handleRecognitionSuccess = () => {
    setIsRecognized(true);
    setIsGuessModalOpen(false);
    
    if (onRecognitionSuccess) {
      onRecognitionSuccess();
    }
    
    toast({
      title: "Recognition Successful!",
      description: "You have successfully recognized this user!",
    });
  };

  // Handler for selecting a Spotify track
  const handleTrackSelect = (track: SpotifyTrack | null) => {
    setSelectedTrack(track);
    setIsSpotifySelectorOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full p-4 text-center">
        <p>Post not found.</p>
      </div>
    );
  }

  return (
    <Card className="w-full bg-white shadow-md overflow-hidden">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <AvatarGenerator
                emoji={post.avatarEmoji || '🎭'}
                nickname={post.anonymousAlias || 'Anonymous'}
                size="md"
              />
            </div>
            <div>
              <p className="font-medium">{post.anonymousAlias || 'Anonymous'}</p>
              <p className="text-xs text-gray-500">
                {post.createdAt && formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isRecognized && (
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                onClick={() => setIsGuessModalOpen(true)}
                title="Guess identity"
              >
                <Eye size={18} />
                <span className="sr-only">Recognize</span>
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal size={18} />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {post.user === user?._id && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditMode(true)}>
                      Edit Post
                    </DropdownMenuItem>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          Delete Post
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Once deleted, you will not be able to recover this post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete}>
                            {loadingStates.delete ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Delete"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                
                <DropdownMenuItem onClick={() => navigate(`/post/${post._id}`)}>
                  View Details
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  className="text-red-600 hover:text-red-800 hover:bg-red-100"
                >
                  Report Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Post Content */}
        {isEditMode ? (
          <div className="mb-3 space-y-3">
            <Input
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full"
              placeholder="Update your post..."
            />
            
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSpotifySelectorOpen(true)}
                className="text-purple-600"
              >
                <Music size={16} className="mr-1" />
                {selectedTrack ? 'Change Music' : 'Add Music'}
              </Button>
              
              <div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditMode(false);
                    setEditedContent(post.content || '');
                  }}
                  className="mr-2"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleUpdate}
                  disabled={loadingStates.update || !editedContent.trim()}
                >
                  {loadingStates.update ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 mb-3">{post.content}</p>
        )}
        
        {/* Media Content */}
        {post.imageUrl && (
          <div className="mb-3">
            <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden rounded-md">
              <img
                src={post.imageUrl}
                alt="Post attachment"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
        )}
        
        {post.videoUrl && (
          <div className="mb-3">
            <AspectRatio ratio={16 / 9} className="bg-gray-100 overflow-hidden rounded-md">
              <video
                src={post.videoUrl}
                className="object-cover w-full h-full"
                controls
                muted={isMuted}
              />
            </AspectRatio>
          </div>
        )}
        
        {/* Music Player */}
        {post.musicUrl && (
          <div className="mb-3 p-2 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Music size={18} className="text-purple-500 mr-2" />
                <span className="text-sm font-medium">Music Attached</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleMute}
                className="h-8 w-8 p-0"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-gray-500" />
                ) : (
                  <Volume2 size={18} className="text-purple-500" />
                )}
              </Button>
            </div>
            <audio
              src={post.musicUrl}
              className="w-full mt-2 h-8"
              controls
              autoPlay={!isMuted}
              muted={isMuted}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 py-3 border-t bg-gray-50 flex flex-wrap items-center justify-between">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 text-gray-700 hover:text-purple-600 hover:bg-purple-100",
              isLiked && "text-purple-600"
            )}
            onClick={handleLike}
            disabled={loadingStates.like}
          >
            {isLiked ? (
              <Heart className="w-4 h-4 fill-purple-600 text-purple-600" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
            <span>{likeCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600 hover:bg-blue-100"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentCount}</span>
          </Button>
          
          <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-700 hover:text-green-600 hover:bg-green-100"
                onClick={handleShare}
                disabled={loadingStates.share}
              >
                <Share2 className="w-4 h-4" />
                <span>{shareCount}</span>
              </Button>
            </SheetTrigger>
            
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Share Post</SheetTitle>
                <SheetDescription>
                  Share this post with your friends
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-4">
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Post Link</p>
                  <div className="flex items-center">
                    <Input
                      readOnly
                      value={`${window.location.origin}/post/${post._id}`}
                    />
                    <Button
                      variant="ghost"
                      className="ml-2"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
                        toast({
                          title: "Link Copied",
                          description: "Post link copied to clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="relative flex-grow mt-2 sm:mt-0 sm:ml-4">
          <Input
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="pr-12 rounded-full bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800"
            onClick={handleCommentSubmit}
            disabled={!commentText.trim()}
          >
            <ArrowUpCircle className="w-5 h-5" />
          </Button>
        </div>
      </CardFooter>

      {/* Music Selector Modal */}
      <Sheet open={isSpotifySelectorOpen} onOpenChange={setIsSpotifySelectorOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Select Music</SheetTitle>
            <SheetDescription>
              Choose a song to add to your post
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4">
            <SpotifyMusicSelector
              selectedTrack={selectedTrack}
              onSelectTrack={handleTrackSelect}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Identity Guessing Modal */}
      {post.user && (
        <GuessIdentityModal
          open={isGuessModalOpen}
          onOpenChange={setIsGuessModalOpen}
          targetUser={{
            _id: typeof post.user === 'string' ? post.user : post.user._id,
            username: "",
            anonymousAlias: post.anonymousAlias || 'Anonymous',
            email: '',
            fullName: '',
            avatarEmoji: post.avatarEmoji || '🎭',
          }}
          onSuccess={handleRecognitionSuccess}
        />
      )}
    </Card>
  );
};

export default PostCard;
