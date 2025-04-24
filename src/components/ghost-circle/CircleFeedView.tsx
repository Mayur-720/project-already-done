
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ghost, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/feed/CreatePostModal";
import { getGhostCirclePosts, getGhostCircleById } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Post } from "@/types"; // Ensure this import is using the correct type

interface CircleFeedViewProps {
  circleId: string;
  onBack?: () => void;
}

const CircleFeedView: React.FC<CircleFeedViewProps> = ({ circleId, onBack }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();

  const handleAliasClick = (userId: string, alias: string) => {
    navigate(`/profile/${userId}`, { state: { anonymousAlias: alias } });
  };

  const { data: circleDetails, isLoading: isLoadingCircle } = useQuery({
    queryKey: ["circleDetails", circleId],
    queryFn: () => getGhostCircleById(circleId),
  });
  console.log(circleDetails);

  const {
    data: posts = [],
    isLoading: isLoadingPosts,
    refetch,
  } = useQuery({
    queryKey: ["circlePosts", circleId],
    queryFn: () => getGhostCirclePosts(circleId),
  });

  const handlePostSuccess = () => {
    refetch();
    setIsCreateModalOpen(false);
  };

  const isLoading = isLoadingCircle || isLoadingPosts;

  if (isLoading) {
    return (
      <div className="space-y-2 sm:space-y-4 p-2 sm:p-4">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Skeleton className="h-6 sm:h-8 w-6 sm:w-8 rounded-full" />
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
        </div>

        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border p-2 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Skeleton className="h-6 sm:h-8 w-6 sm:w-8 rounded-full" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
            </div>
            <Skeleton className="h-3 sm:h-4 w-full mb-1 sm:mb-2" />
            <Skeleton className="h-3 sm:h-4 w-2/3 mb-2 sm:mb-4" />
            <Skeleton className="h-32 sm:h-40 w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky p-2 sm:p-4 mx-2 sm:mx-4 top-0 z-10 bg-background border-b border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-8">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="sm:mb-0 md:hidden"
            >
            </Button>
          )}
          <h2 className="text-lg sm:text-xl font-medium flex items-center gap-2">
            <Ghost className="h-4 sm:h-5 w-4 sm:w-5 text-purple-500" />
            {circleDetails?.name || "Circle Feed"}
          </h2>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-sm sm:text-base py-1 sm:py-2 px-2 sm:px-4"
          >
            Create Post
          </Button>
        </div>

        {circleDetails && (
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
            <div className="flex items-center gap-1 mb-2 sm:mb-0">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{circleDetails.members?.length || 0} members</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Button
                variant={activeTab === "posts" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("posts")}
                className="text-xs sm:text-sm"
              >
                Posts
              </Button>
              <Button
                variant={activeTab === "about" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("about")}
                className="text-xs sm:text-sm"
              >
                About
              </Button>
              <Button
                variant={activeTab === "members" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("members")}
                className="text-xs sm:text-sm"
              >
                Members
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 p-2 sm:p-4 overflow-auto">
        {activeTab === "posts" && (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-4 sm:py-12 bg-card rounded-lg border border-dashed">
                <Ghost className="mx-auto h-8 sm:h-12 w-8 sm:w-12 text-gray-300 mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
                  No posts yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                  Be the first to share something in this circle!
                </p>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
                >
                  Create First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-4">
                {posts.map((post: Post) => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    onRefresh={refetch}
                    currentUserId={circleDetails?.creator?._id || ""}
                    showOptions={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && circleDetails && (
          <div className="bg-card p-2 sm:p-6 rounded-lg border">
            <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">About this Circle</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
              {circleDetails.description || "No description provided."}
            </p>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Created {new Date(circleDetails.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {activeTab === "members" && circleDetails && (
          <div className="bg-card rounded-lg border">
            <h3 className="p-2 sm:p-4 border-b font-medium text-base sm:text-lg">
              Members ({circleDetails.members?.length || 0})
            </h3>
            <div className="divide-y">
              {circleDetails.members?.map((member) => (
                <div
                  key={member._id}
                  className="p-2 sm:p-4 flex items-center hover:cursor-pointer"
                  onClick={() => handleAliasClick(member.userId, member.anonymousAlias)}
                >
                  <div className="h-6 sm:h-8 w-6 sm:w-8 rounded-full bg-undercover-dark flex items-center justify-center mr-2 sm:mr-3">
                    {member.avatarEmoji || "🎭"}
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-medium">{member.anonymousAlias}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handlePostSuccess}
        ghostCircleId={circleId}
      />
    </div>
  );
};

export default CircleFeedView;
