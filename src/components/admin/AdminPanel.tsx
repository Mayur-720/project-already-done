
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { createPost } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { PinIcon, SendIcon } from 'lucide-react';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      setIsSubmitting(true);
      // Add isAdminPost=true flag to mark this as an admin post
      await createPost(postContent, undefined, imageUrl);
      setPostContent('');
      setImageUrl('');
      toast({
        title: 'Post created',
        description: 'Your admin post has been created successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create post. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        className="fixed bottom-6 right-6 bg-purple-700 hover:bg-purple-800 z-50 shadow-lg"
        onClick={togglePanel}
      >
        {isOpen ? 'Close Admin Panel' : 'Admin Panel'}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center overflow-y-auto">
          <Card className="w-full max-w-lg m-4 bg-background border-purple-700 shadow-purple-500/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👑</span> Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold mb-2">Create Admin Post</h3>
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <Textarea
                    placeholder="Write your announcement here..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Input
                    placeholder="Image URL (optional)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    disabled={!postContent.trim() || isSubmitting}
                    className="bg-purple-700 hover:bg-purple-800"
                  >
                    <SendIcon className="w-4 h-4 mr-2" />
                    Post as Admin
                  </Button>
                </form>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Pin Posts</h3>
                <p className="text-sm text-muted-foreground">
                  You can pin posts from the feed by clicking the three dots menu on any post and selecting "Pin Post".
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AdminPanel;
