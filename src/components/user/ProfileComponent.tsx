
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserPosts, getUserProfile } from '@/lib/api';
import PostCard from '../feed/PostCard';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { recognizeUser } from '@/lib/api';
import { User, Post } from '@/types';

interface ProfileComponentProps {
  userId?: string;
  anonymousAlias?: string;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ userId, anonymousAlias }) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [guessUsername, setGuessUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQuery().queryClient;

  const isOwnProfile = !userId || userId === currentUser?._id;

  const {
    data: profileUser,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });

  // Filter out ghost circle posts client-side as well
  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => getUserPosts(userId || ''),
    enabled: !!userId,
    select: (posts) => posts.filter(post => !post.ghostCircle)
  });

  const handleRecognize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessUsername.trim() || !userId) return;

    setIsSubmitting(true);
    try {
      const result = await recognizeUser(userId, guessUsername);
      
      if (result.correct) {
        toast({
          title: '🎉 Correct!',
          description: `You've successfully recognized ${anonymousAlias} as ${result.user.username}!`,
        });
        refetchProfile();
      } else {
        toast({
          variant: 'destructive',
          title: 'Incorrect guess',
          description: result.message || 'That is not the correct identity.',
        });
      }
    } catch (error) {
      console.error('Recognition error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      setGuessUsername('');
    }
  };

  // Create a display user that conforms to the User interface from @/types
  const displayUser: User = profileUser ? {
    _id: profileUser._id,
    username: profileUser.username,
    fullName: profileUser.fullName,
    email: profileUser.email,
    anonymousAlias: profileUser.anonymousAlias,
    avatarEmoji: profileUser.avatarEmoji,
    bio: profileUser.bio,
    recognizedUsers: profileUser.recognizedUsers || [],
    identityRecognizers: profileUser.identityRecognizers || [],
    friends: profileUser.friends || [],
    ghostCircles: profileUser.ghostCircles || [],
    referralCode: profileUser.referralCode,
    referralCount: profileUser.referralCount,
    referredBy: profileUser.referredBy,
    createdAt: profileUser.createdAt,
    updatedAt: profileUser.updatedAt,
  } : {
    _id: userId || currentUser?._id || '',
    username: '',
    fullName: '',
    email: '',
    anonymousAlias: anonymousAlias || 'Anonymous User',
    avatarEmoji: '🎭',
    recognizedUsers: [],
    identityRecognizers: [],
    friends: [],
    ghostCircles: [],
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="bg-card rounded-lg p-6 shadow-md mb-6 border border-border">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-3xl">
            {displayUser.avatarEmoji}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{displayUser.anonymousAlias}</h1>
            {!isOwnProfile && (
              <form onSubmit={handleRecognize} className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Guess username..."
                  value={guessUsername}
                  onChange={(e) => setGuessUsername(e.target.value)}
                  className="px-3 py-1 rounded-md bg-background border border-input text-sm"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!guessUsername.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Checking...' : 'Guess'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          {isLoadingPosts ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : userPosts && userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post) => {
                // Convert to the format expected by PostCard
                const postForCard = {
                  ...post,
                  user: typeof post.user === 'object' && post.user !== null ? post.user._id : post.user,
                  expiresAt: post.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Add default expiresAt if missing
                };

                return (
                  <PostCard 
                    key={post._id} 
                    post={postForCard} 
                    currentUserId={currentUser?._id}
                    showOptions={true}
                    onRefresh={() => {
                      // Refetch posts when a post is updated or deleted
                      queryClient.invalidateQueries({ queryKey: ['userPosts', userId] });
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No posts found.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <div className="bg-card rounded-lg p-6 shadow-md border border-border">
            {isOwnProfile ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Username:</span> {currentUser?.username}</p>
                  <p><span className="font-medium">Full Name:</span> {currentUser?.fullName}</p>
                  <p><span className="font-medium">Anonymous Alias:</span> {currentUser?.anonymousAlias}</p>
                  <p><span className="font-medium">Avatar Emoji:</span> {currentUser?.avatarEmoji}</p>
                  <p><span className="font-medium">Bio:</span> {currentUser?.bio || 'No bio provided'}</p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Anonymous Profile</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Anonymous Alias:</span> {displayUser.anonymousAlias}</p>
                  <p><span className="font-medium">Avatar Emoji:</span> {displayUser.avatarEmoji}</p>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileComponent;
