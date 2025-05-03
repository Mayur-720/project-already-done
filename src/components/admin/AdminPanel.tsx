
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { createPost } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { SendIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaticSong, getRandomSong } from '@/lib/staticSongs';
import SongSelector from '../music/SongSelector';

const AdminPanel: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSong, setSelectedSong] = useState<StaticSong | null>(null);
  const [activeTab, setActiveTab] = useState('content');

  if (!isAdmin) {
    return null;
  }

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !selectedSong) return;

    try {
      setIsSubmitting(true);
      
      await createPost({
        content: postContent,
        musicUrl: selectedSong?.previewUrl,
        isAdminPost: true
      });
      
      setPostContent('');
      setSelectedSong(null);
      
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
  
  const handleAddRandomSong = () => {
    setSelectedSong(getRandomSong());
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
                <h3 className="font-semibold mb-2">Create Post</h3>
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="content">Content</TabsTrigger>
                      <TabsTrigger value="music">Music</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="content" className="space-y-4">
                      <Textarea
                        placeholder="Write your announcement here..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </TabsContent>
                    
                    <TabsContent value="music" className="space-y-4">
                      <SongSelector
                        onSelectSong={setSelectedSong}
                        selectedSong={selectedSong}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleAddRandomSong}
                      >
                        Add Random Song
                      </Button>
                    </TabsContent>
                  </Tabs>
                  
                  <Button 
                    type="submit" 
                    disabled={(!postContent.trim() && !selectedSong) || isSubmitting}
                    className="bg-purple-700 hover:bg-purple-800"
                  >
                    <SendIcon className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AdminPanel;
