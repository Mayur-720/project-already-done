import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { updatePost } from '@/lib/api';
import { Post } from '@/types/user';
import { X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  onSuccess: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ open, onOpenChange, post, onSuccess }) => {
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(post.imageUrl || '');
  const [videoPreview, setVideoPreview] = useState<string>(post.videoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const hasImage = !!imagePreview;
  const hasVideo = !!videoPreview;

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (type === 'image' && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }
    if (type === 'video' && !isVideo) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for images
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${isVideo ? 'Video' : 'Image'} must be under ${maxSize / (1024 * 1024)}MB.`,
        variant: "destructive",
      });
      return;
    }

    if (type === 'image') {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setVideo(null);
      setVideoPreview('');
    } else {
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setImage(null);
      setImagePreview('');
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "undercover");

    const res = await fetch("https://api.cloudinary.com/v1_1/ddtqri4py/auto/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.secure_url) {
      throw new Error("Upload failed");
    }
    return data.secure_url;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let updatedImageUrl = imagePreview;
    let updatedVideoUrl = videoPreview;

    try {
      if (image) {
        setIsUploading(true);
        updatedImageUrl = await uploadToCloudinary(image);
        setIsUploading(false);
      }
      if (video) {
        setIsUploading(true);
        updatedVideoUrl = await uploadToCloudinary(video);
        setIsUploading(false);
      }

      await updatePost(post._id, content, updatedImageUrl || undefined, updatedVideoUrl || undefined);
      toast({
        title: 'Post updated',
        description: 'Your post has been successfully updated.',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the post. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95%] sm:max-w-[500px] p-4 sm:p-6 glassmorphism animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">
            Edit Post
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Content Section */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-foreground mb-2">
              Post Content
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[120px] sm:min-h-[150px] text-sm sm:text-base rounded-lg border border-input bg-card text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Media Section */}
          {(hasImage || hasVideo) ? (
            <div className="space-y-4">
              {hasImage && (
                <div className="relative w-full max-w-[300px] sm:max-w-[400px] mx-auto border border-muted rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    className="w-full h-auto max-h-[200px] sm:max-h-[250px] object-contain"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-destructive text-destructive-foreground rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:bg-destructive/80 opacity-90 hover:opacity-100"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <label className="bg-primary text-primary-foreground rounded-full h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center cursor-pointer hover:bg-primary/80 opacity-90 hover:opacity-100">
                      <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleMediaUpload(e, 'image')}
                        ref={imageInputRef}
                      />
                    </label>
                  </div>
                </div>
              )}
              {hasVideo && (
                <div className="relative w-full max-w-[300px] sm:max-w-[400px] mx-auto border border-muted rounded-md overflow-hidden">
                  <video
                    controls
                    className="w-full h-auto max-h-[200px] sm:max-h-[250px] object-contain"
                  >
                    <source src={videoPreview} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-destructive text-destructive-foreground rounded-full h-8 w-8 sm:h-9 sm:w-9 hover:bg-destructive/80 opacity-90 hover:opacity-100"
                      onClick={removeVideo}
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <label className="bg-primary text-primary-foreground rounded-full h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center cursor-pointer hover:bg-primary/80 opacity-90 hover:opacity-100">
                      <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                      <Input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleMediaUpload(e, 'video')}
                        ref={videoInputRef}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm sm:text-base font-medium text-foreground mb-2">
                Add Media (optional)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 flex flex-col items-center justify-center h-32 sm:h-40 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Add an image
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e, 'image')}
                    ref={imageInputRef}
                  />
                </label>
                <label className="flex-1 flex flex-col items-center justify-center h-32 sm:h-40 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Video className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Add a video
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e, 'video')}
                    ref={videoInputRef}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-sm sm:text-base border-secondary text-secondary-foreground hover:bg-secondary/20"
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading || !content.trim()}
            className="w-full sm:w-auto text-sm sm:text-base bg-primary text-primary-foreground hover:bg-primary/80 glow-effect"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;