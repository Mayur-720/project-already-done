import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { createPost } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Image, Music, Plus, Video, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import SongSelector from '../music/SongSelector';
import { StaticSong } from '@/lib/staticSongs';

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
  const [selectedSong, setSelectedSong] = useState<StaticSong | null>(null);
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      if (media.length + files.length > 10) {
        toast({
          title: "Too many files",
          description: "You can upload a maximum of 10 media files per post",
          variant: "destructive"
        });
        return;
      }
      
      const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      const oversizedFiles = files.filter(file => file.size > maxSize);
      
      if (oversizedFiles.length > 0) {
        toast({
          title: "Files too large",
          description: `${type === 'video' ? 'Videos' : 'Images'} must be under ${maxSize / (1024 * 1024)}MB each`,
          variant: "destructive"
        });
        return;
      }
      
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

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
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

      const uploadPromises = media.map(async (item) => {
        if (!item.file) return item;
        
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("upload_preset", "undercover");

        const res = await fetch("https://api.cloudinary.com/v1_1/ddtqri4py/auto/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        return {
          type: item.type,
          url: data.secure_url
        };
      });

      const uploadedMedia = await Promise.all(uploadPromises);

      const musicUrl = selectedSong?.previewUrl || undefined;

      await createPost({
        content,
        ghostCircleId,
        media: uploadedMedia,
        musicUrl,
        muteOriginalAudio
      });

      toast({
        title: "Post created",
        description: "Your post has been published anonymously!"
      });
      
      setContent('');
      setMedia([]);
      setSelectedSong(null);
      setMuteOriginalAudio(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();

    } catch (error) {
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
                    Upload images or videos for your post (max 10 files)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Images must be under 5MB each, videos under 50MB each
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
              <SongSelector
                onSelectSong={setSelectedSong}
                selectedSong={selectedSong}
              />
              
              {selectedSong && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mute-audio" 
                      checked={muteOriginalAudio}
                      onCheckedChange={(checked) => setMuteOriginalAudio(checked === true)}
                    />
                    <Label htmlFor="mute-audio">Mute original audio (for videos)</Label>
                  </div>
                </div>
              )}
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
