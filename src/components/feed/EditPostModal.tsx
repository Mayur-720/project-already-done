
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageIcon, Video, X } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { updatePost } from "@/lib/api";
import { Post } from "@/types";
import SongSelector from "../music/SongSelector";
import { StaticSong, getSongById } from "@/lib/staticSongs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  onSuccess: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ 
  open, 
  onOpenChange, 
  post,
  onSuccess
}) => {
  const [content, setContent] = useState(post?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">(
    post?.videoUrl ? "video" : post?.imageUrl ? "image" : "none"
  );
  const [mediaPreview, setMediaPreview] = useState<string | null>(post?.videoUrl || post?.imageUrl || null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSong, setSelectedSong] = useState<StaticSong | null>(null);
  const [muteOriginalAudio, setMuteOriginalAudio] = useState(post?.muteOriginalAudio || false);
  const [activeTab, setActiveTab] = useState('content');

  const { toast } = useToast();

  // If post has music, try to find a matching song from our collection
  useEffect(() => {
    if (post?.musicUrl) {
      // Try to find a song with matching previewUrl, but this is just an approximation
      // In a real app, you'd have better mapping between your posts and songs
      for (let i = 1; i <= 5; i++) {
        const song = getSongById(i.toString());
        if (song) {
          setSelectedSong(song);
          break;
        }
      }
    }
  }, [post]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    
    if (!isVideo && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or video file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size limits (5MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for images
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${isVideo ? 'Video' : 'Image'} must be under ${maxSize / (1024 * 1024)}MB.`,
        variant: "destructive",
      });
      return;
    }

    setMediaFile(file);
    setMediaType(isVideo ? "video" : "image");
    
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType("none");
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaType === "none" && !selectedSong) return;
    
    setIsSubmitting(true);
    try {
      let uploadedUrl: string | null = null;

      // If we have a new media file, upload it
      if (mediaFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", mediaFile);
        formData.append("upload_preset", "undercover");

        const res = await fetch("https://api.cloudinary.com/v1_1/ddtqri4py/auto/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        uploadedUrl = data.secure_url;
        setIsUploading(false);
      }

      // Create media array if needed
      const updatedMedia = mediaType !== "none" && uploadedUrl ? 
        [{ 
          type: mediaType as "image" | "video",
          url: uploadedUrl
        }] : 
        undefined;

      const musicUrl = selectedSong?.previewUrl;

      // Update post with content and media
      await updatePost(
        post._id, 
        content,
        updatedMedia,
        musicUrl,
        muteOriginalAudio,
        mediaType === "image" ? uploadedUrl || post.imageUrl : undefined,
        mediaType === "video" ? uploadedUrl || post.videoUrl : undefined
      );
      
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        variant: "destructive",
        title: "Error updating post",
        description: "Could not update your post. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 text-white border-purple-600">
        <DialogHeader>
          <DialogTitle className="text-purple-300">Edit Post</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 bg-gray-700">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Textarea
              placeholder="What's on your mind? Your identity will remain anonymous..."
              className="min-h-[120px] bg-gray-700 border-gray-600 focus:border-purple-500"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </TabsContent>
          
          <TabsContent value="media" className="space-y-4">
            {mediaPreview && (
              <div className="relative mt-3 border border-gray-600 rounded-md overflow-hidden">
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Image Preview"
                    className="w-full max-h-[200px] object-contain"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-[200px] object-contain"
                  />
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 w-8 h-8 opacity-90 hover:opacity-100"
                  onClick={removeMedia}
                >
                  <X size={16} />
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-purple-300 border-purple-700"
                onClick={() => document.getElementById("media-upload-edit")?.click()}
                disabled={isUploading || isSubmitting}
              >
                {mediaType === "video" ? (
                  <Video className="mr-2 w-4 h-4" />
                ) : (
                  <ImageIcon className="mr-2 w-4 h-4" />
                )}
                {isUploading ? "Uploading..." : "Change Media"}
              </Button>
              <input
                type="file"
                id="media-upload-edit"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaUpload}
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
                  <Label htmlFor="mute-audio" className="text-white">Mute original audio (for videos)</Label>
                </div>
              </div>
            )}
          </TabsContent>
        
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
              className="border-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={(!content.trim() && mediaType === "none" && !selectedSong) || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;
