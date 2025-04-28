
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Image, Music, Plus, Video, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  ghostCircleId?: string;
}

const CreatePostModal = ({ open, onOpenChange, onSuccess, ghostCircleId }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [media, setMedia] = useState<Array<{type: 'image' | 'video', url: string, file?: File}>>([]);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      // Check if we would exceed the limit with these new files
      if (media.length + files.length > 10) {
        toast({
          title: "Too many files",
          description: "You can upload a maximum of 10 media files per post",
          variant: "destructive"
        });
        return;
      }
      
      // Process each file
      files.forEach(file => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          if (event.target?.result) {
            setMedia(prev => [
              ...prev, 
              { 
                type, 
                url: event.target!.result as string,
                file
              }
            ]);
          }
        };
        fileReader.readAsDataURL(file);
      });
    }
  };
  
  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMusicFile(file);
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target?.result) {
          // You could set a music preview URL here if needed
        }
      };
      fileReader.readAsDataURL(file);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const removeMusic = () => {
    setMusicFile(null);
    setMuteOriginalAudio(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!content && media.length === 0) {
      toast({
        title: "Empty post",
        description: "Please add some content or media to your post",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);

      // First, we need to process any files
      const processedMedia = media.map(item => ({
        type: item.type,
        url: item.url
      }));

      // For now, just use the local URLs - in a real app, you'd upload to server
      await createPost(
        content, 
        processedMedia, 
        musicFile ? URL.createObjectURL(musicFile) : undefined, 
        muteOriginalAudio,
        ghostCircleId
      );

      toast({
        title: "Post created",
        description: "Your post has been published anonymously!"
      });
      
      setContent('');
      setMedia([]);
      setMusicFile(null);
      setMuteOriginalAudio(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();

    } catch (error: any) {
      console.error('Create post error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media ({media.length})</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <TabsContent value="content" className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="resize-none min-h-[100px]"
              />
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              {media.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1">
                  {media.map((item, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden border border-border">
                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={`Upload ${index}`} 
                          className="w-full h-32 object-cover" 
                        />
                      ) : (
                        <video 
                          src={item.url} 
                          className="w-full h-32 object-cover" 
                          controls={false}
                          muted
                          loop
                        />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                        onClick={() => removeMedia(index)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload images or videos for your post
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={media.length >= 10}
                >
                  <Image size={16} className="mr-2" />
                  Add Images
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => document.getElementById('video-upload')?.click()}
                  disabled={media.length >= 10}
                >
                  <Video size={16} className="mr-2" />
                  Add Videos
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMediaChange(e, 'image')}
                  className="hidden"
                />
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleMediaChange(e, 'video')}
                  className="hidden"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="music" className="space-y-4">
              {musicFile ? (
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music size={16} />
                      <span className="text-sm truncate max-w-[200px]">{musicFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={removeMusic}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={muteOriginalAudio}
                        onChange={() => setMuteOriginalAudio(!muteOriginalAudio)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">Mute original audio (for videos)</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Music size={24} className="mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Add background music to your post
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('music-upload')?.click()}
                    >
                      <Plus size={16} className="mr-2" />
                      Select Music
                    </Button>
                  </div>
                </div>
              )}
              
              <input
                id="music-upload"
                type="file"
                accept="audio/*"
                onChange={handleMusicChange}
                className="hidden"
              />
            </TabsContent>
            
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-undercover-purple hover:bg-purple-700"
                disabled={isSubmitting || (!content && media.length === 0)}
              >
                {isSubmitting ? "Posting..." : "Post Anonymously"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
