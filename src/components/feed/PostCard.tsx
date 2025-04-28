import React, { useState, useRef, useEffect } from 'react';
import { User, Post } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Heart, Share2, MessageCircle, MoreHorizontal, ChevronLeft, ChevronRight, Play, Pause, Music, Volume2, VolumeX } from 'lucide-react';
import { likePost, incrementShareCount } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import DeletePostDialog from './DeletePostDialog';
import EditPostModal from './EditPostModal';
import GuessIdentityModal from '@/components/recognition/GuessIdentityModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MediaCarouselProps {
  media: Array<{type: 'image' | 'video', url: string}>;
  musicUrl?: string;
  muteOriginalAudio?: boolean;
}

interface PostCardProps {
  post: Post;
  onRefresh: () => void;
}

// Create a custom carousel component
const MediaCarousel: React.FC<MediaCarouselProps> = ({ media, musicUrl, muteOriginalAudio = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(muteOriginalAudio);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize video refs array
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, media.length);
  }, [media.length]);

  // Autoplay videos when they become active
  useEffect(() => {
    const currentMedia = media[currentIndex];
    if (currentMedia?.type === 'video') {
      const videoElement = videoRefs.current[currentIndex];
      if (videoElement) {
        if (isPlaying) {
          videoElement.muted = isMuted;
          videoElement.play().catch(error => console.error('Error playing video:', error));
        } else {
          videoElement.pause();
        }
      }
    }

    // Handle background music
    if (musicUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error('Error playing audio:', error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying, isMuted, media, musicUrl]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? media.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === media.length - 1 ? 0 : prevIndex + 1
    );
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (media.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Media display */}
      <div className="relative overflow-hidden w-full rounded-lg aspect-square">
        {media.map((item, index) => (
          <div 
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={`Post media ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={(el) => { videoRefs.current[index] = el; }}
                src={item.url}
                loop
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
                onClick={togglePlayPause}
              />
            )}
          </div>
        ))}

        {/* Play/pause overlay for videos */}
        {media[currentIndex]?.type === 'video' && (
          <div 
            className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 transition-opacity duration-300 ${
              isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
            }`}
            onClick={togglePlayPause}
          >
            <div className="rounded-full bg-black bg-opacity-50 p-3">
              {isPlaying ? (
                <Pause className="h-10 w-10 text-white" />
              ) : (
                <Play className="h-10 w-10 text-white" />
              )}
            </div>
          </div>
        )}

        {/* Background music */}
        {musicUrl && (
          <audio
            ref={audioRef}
            src={musicUrl}
            loop
            className="hidden"
          />
        )}

        {/* Navigation arrows if more than one media item */}
        {media.length > 1 && (
          <>
            <button 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 z-20"
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 z-20"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        {/* Pagination indicators */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-20">
            {media.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Media controls */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-20">
          {musicUrl && (
            <button
              className="bg-black bg-opacity-50 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Music className="h-4 w-4 text-white" />
            </button>
          )}
          
          {media[currentIndex]?.type === 'video' && (
            <button
              className="bg-black bg-opacity-50 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main PostCard component
const PostCard: React.FC<PostCardProps> = ({ post, onRefresh }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGuessIdentityOpen, setIsGuessIdentityOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const { mutate: like, isLoading: isLikeLoading } = useMutation(
    () => likePost(post._id),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['posts']);
        queryClient.invalidateQueries(['post', post._id]);
        toast({
          title: 'Post liked',
          description: 'You have liked this post',
        });
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to like post. Please try again.',
        });
      },
    }
  );

  const { mutate: share, isLoading: isShareLoading } = useMutation(
    () => incrementShareCount(post._id),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['posts']);
        queryClient.invalidateQueries(['post', post._id]);
        toast({
          title: 'Post shared',
          description: 'You have shared this post',
        });
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to share post. Please try again.',
        });
      },
    }
  );

  const handleViewPost = () => {
    navigate(`/post/${post._id}`);
  };

  const isOwnPost = typeof post.user === 'object' && user?._id === post.user._id;

  // Modify the render method to use our new MediaCarousel component
  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full text-2xl">
            {post.avatarEmoji || '🎭'}
          </div>
          <div>
            <h3 className="font-semibold">{post.anonymousAlias || 'Anonymous'}</h3>
            <p className="text-xs text-gray-500">{getTimeAgo(post.createdAt)}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleViewPost}>View Post</DropdownMenuItem>
            {isOwnPost && (
              <>
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                  Delete
                </DropdownMenuItem>
              </>
            )}
            {!isOwnPost && (
              <DropdownMenuItem onClick={() => setIsGuessIdentityOpen(true)}>
                Guess Identity
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

    {/* Replace media rendering with our new carousel */}
    {post.media && post.media.length > 0 ? (
      <div className="mb-4">
        <MediaCarousel 
          media={post.media} 
          musicUrl={post.musicUrl} 
          muteOriginalAudio={post.muteOriginalAudio}
        />
      </div>
    ) : post.imageUrl ? (
      <div className="mb-4">
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full h-auto rounded-lg"
        />
        {post.musicUrl && (
          <audio 
            src={post.musicUrl} 
            autoPlay 
            loop 
            className="hidden"
          />
        )}
      </div>
    ) : post.videoUrl ? (
      <div className="mb-4 relative">
        <video
          ref={videoRef}
          src={post.videoUrl}
          className="w-full h-auto rounded-lg"
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlayPause}
          autoPlay
        />
        
        {/* Play/pause overlay for videos */}
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 transition-opacity duration-300 ${
            isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
          }`}
        >
          <div className="rounded-full bg-black bg-opacity-50 p-3">
            {isPlaying ? (
              <Pause className="h-10 w-10 text-white" />
            ) : (
              <Play className="h-10 w-10 text-white" />
            )}
          </div>
        </div>

        {post.musicUrl && (
          <audio 
            ref={audioRef}
            src={post.musicUrl} 
            loop 
            className="hidden"
          />
        )}
        
        {/* Video controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {post.videoUrl && (
            <button
              className="bg-black bg-opacity-50 rounded-full p-2"
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          )}
        </div>
      </div>
    ) : null}

      <div className="p-4">
        {post.content && <p className="mb-4">{post.content}</p>}

        <div className="flex justify-between items-center text-gray-500">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                like();
              }}
              disabled={isLikeLoading}
              className="hover:text-primary transition-colors"
            >
              <Heart className="h-5 w-5" fill={post.likes?.some((like) => typeof like.user === 'string' ? like.user === user?._id : like.user._id === user?._id) ? 'currentColor' : 'none'} />
            </button>
            <span>{post.likes?.length || 0}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                share();
              }}
              disabled={isShareLoading}
              className="hover:text-primary transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <span>{post.shareCount || 0}</span>
          </div>

          <button
            onClick={handleViewPost}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      <DeletePostDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        postId={post._id}
        onSuccess={onRefresh}
      />

      <EditPostModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        post={post}
        onSuccess={onRefresh}
      />

      <GuessIdentityModal
        open={isGuessIdentityOpen}
        onOpenChange={setIsGuessIdentityOpen}
        postId={post._id}
      />
    </div>
  );
};

export default PostCard;
