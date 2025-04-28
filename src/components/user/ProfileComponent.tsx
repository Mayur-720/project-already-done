
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import EditProfileModal from './EditProfileModal';
import { addFriend, getUserPosts } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Post } from '@/types';
import RecognitionStats from '@/components/recognition/RecognitionStats';
import RecognitionModal from '@/components/recognition/RecognitionModal';
import WhisperModal from '@/components/whisper/WhisperModal';
import { MessageSquare, Image, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProfileComponentProps {
  userId?: string;
  user: User;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ userId, user }) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRecognizeModalOpen, setIsRecognizeModalOpen] = useState(false);
  const [isWhisperModalOpen, setIsWhisperModalOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const isOwnProfile = !userId || userId === authUser?._id;
  const displayUser = isOwnProfile ? authUser : user;

  const handleFriendRequest = async () => {
    if (!displayUser || !displayUser.username) return;

    try {
      setLoadingAction(true);
      await addFriend(displayUser.username);
      toast({
        title: 'Friend request sent',
        description: `A friend request has been sent to ${displayUser.anonymousAlias || displayUser.username}!`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to send friend request',
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const loadUserPosts = async () => {
    if (!userId && !authUser?._id) return;

    try {
      setIsLoadingPosts(true);
      const fetchedPosts = await getUserPosts(userId || authUser?._id || '');
      // Convert imported posts to format that matches our type expectations
      const typedPosts: Post[] = fetchedPosts.map((post: any) => ({
        ...post,
        user: typeof post.user === 'object' ? post.user._id : post.user,
      }));
      setPosts(typedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load posts. Please try again.',
      });
    } finally {
      setIsLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (displayUser && (displayUser._id || displayUser.username)) {
      loadUserPosts();
    }
  }, [displayUser, userId]);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully!',
    });
  };

  const handleViewPost = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  if (!displayUser) {
    return <div className="text-center p-8">User not found</div>;
  }

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full text-4xl">
                {displayUser.avatarEmoji || '🎭'}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {displayUser.anonymousAlias || 'Anonymous User'}
                </h1>
                {isOwnProfile && (
                  <p className="text-sm text-muted-foreground">@{displayUser.username}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isOwnProfile ? (
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="border-undercover-purple text-undercover-purple hover:bg-undercover-purple hover:text-white"
                    onClick={() => setIsWhisperModalOpen(true)}
                  >
                    <MessageSquare size={16} className="mr-2" />
                    Send Whisper
                  </Button>
                  <Button
                    variant="outline"
                    className="border-undercover-purple text-undercover-purple hover:bg-undercover-purple hover:text-white"
                    onClick={() => setIsRecognizeModalOpen(true)}
                  >
                    Guess Identity
                  </Button>
                  <Button
                    variant="default"
                    className="bg-undercover-purple hover:bg-purple-700 text-white"
                    onClick={handleFriendRequest}
                    disabled={loadingAction}
                  >
                    {loadingAction ? 'Adding...' : 'Add Friend'}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Recognition Stats</h2>
            <RecognitionStats 
              recognitionAttempts={displayUser.recognitionAttempts}
              successfulRecognitions={displayUser.successfulRecognitions}
              recognitionRate={(displayUser.successfulRecognitions && displayUser.recognitionAttempts) 
                ? (displayUser.successfulRecognitions / displayUser.recognitionAttempts * 100) 
                : 0}
              recognizedUsers={displayUser.recognizedUsers?.length || 0}
              identityRecognizers={displayUser.identityRecognizers?.length || 0}
            />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Posts</h2>
            {isLoadingPosts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-undercover-purple border-t-transparent rounded-full"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="aspect-square relative overflow-hidden rounded-md cursor-pointer bg-black/10 hover:opacity-80 transition-opacity"
                    onClick={() => handleViewPost(post._id)}
                  >
                    {post.media && post.media.length > 0 ? (
                      post.media[0].type === 'image' ? (
                        <>
                          <img
                            src={post.media[0].url}
                            alt="Post"
                            className="w-full h-full object-cover"
                          />
                          {post.media.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                              +{post.media.length - 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                          <video
                            src={post.media[0].url}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <Video className="absolute text-white/80" size={24} />
                          {post.media.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                              +{post.media.length - 1}
                            </div>
                          )}
                        </div>
                      )
                    ) : post.imageUrl ? (
                      <>
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                        <Image className="absolute text-white/80" size={24} />
                      </>
                    ) : post.videoUrl ? (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <video
                          src={post.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <Video className="absolute text-white/80" size={24} />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="text-gray-500 text-sm p-2 text-center line-clamp-4">
                          {post.content}
                        </span>
                      </div>
                    )}
                    
                    {/* Post info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                      <div className="flex justify-between">
                        <span>{post.likes?.length || 0} likes</span>
                        <span>{getTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {isOwnProfile ? "You haven't posted anything yet" : "This user hasn't posted anything yet"}
              </div>
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          initialData={authUser}
          onSuccess={handleEditSuccess}
        />
      )}

      {!isOwnProfile && (
        <>
          <RecognitionModal
            open={isRecognizeModalOpen}
            onOpenChange={setIsRecognizeModalOpen}
            targetUserId={displayUser._id}
            targetAlias={displayUser.anonymousAlias}
          />

          <WhisperModal
            open={isWhisperModalOpen}
            onOpenChange={setIsWhisperModalOpen}
            recipientId={displayUser._id}
            recipientAlias={displayUser.anonymousAlias}
          />
        </>
      )}
    </div>
  );
};

export default ProfileComponent;
