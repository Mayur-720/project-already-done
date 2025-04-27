
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPostById } from '@/lib/api';
import PostCard from './PostCard';
import AppShell from '../layout/AppShell';
import { Post } from '@/types/user';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPostById(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className='text-2xl flex flex-row min-h-screen justify-center items-center'>Loading...</div>;
  if (error) return <div className='text-red-500 flex flex-row min-h-screen justify-center items-center'>Error loading post</div>;
  if (!post) return <div className='text-red-500 flex flex-row min-h-screen justify-center items-center'>Post not found</div>;

  // Create a compatible post object for PostCard
  const postForCard: Post = {
    ...post,
    user: post.user ? (typeof post.user === 'object' ? post.user._id : post.user) : '',
    // Ensure other required fields are present
    likes: post.likes || [],
    comments: post.comments || [],
    anonymousAlias: post.anonymousAlias || 'Anonymous',
    avatarEmoji: post.avatarEmoji || '🎭',
    content: post.content || '',
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || new Date().toISOString(),
    expiresAt: post.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  return (
    <AppShell>
      <div className="max-w-4xl relative mx-auto mt-4 mb-8 p-4 rounded-lg">
        <PostCard post={postForCard} onRefresh={() => {}} />
      </div>
    </AppShell>
  );
};

export default PostDetail;
