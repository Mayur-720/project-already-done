
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGlobalFeed } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import PostCard from "@/components/feed/PostCard";
import { Loader, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreatePostModal from "@/components/feed/CreatePostModal";
import { toast } from "@/hooks/use-toast";

const GlobalFeed = () => {
  const { user } = useAuth();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  
  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ['globalFeed'],
    queryFn: getGlobalFeed,
    meta: {
      onError: (error) => {
        console.error("Error fetching posts:", error);
        toast({
          variant: "destructive",
          title: "Error loading posts",
          description: "Could not load the latest posts. Please try again later."
        });
      }
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  const handlePostCreated = () => {
    setIsCreatePostOpen(false);
    refetch();
    toast({
      title: "Post created",
      description: "Your post has been published anonymously!"
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl p-4 text-center">
        <p className="text-red-400">Failed to load posts. Please try again later.</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-300">Global Feed</h2>
        <Button 
          variant="secondary" 
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setIsCreatePostOpen(true)}
        >
          <Plus size={16} className="mr-1" />
          New Post
        </Button>
      </div>
      
      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <PostCard 
              key={post._id} 
              post={post} 
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No posts found. Be the first to post something!</p>
      )}

      <CreatePostModal 
        open={isCreatePostOpen} 
        onOpenChange={setIsCreatePostOpen}
        onSuccess={handlePostCreated}
      />
    </div>
  );
};

export default GlobalFeed;
