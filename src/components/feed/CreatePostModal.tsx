import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createPost } from "@/lib/api";
import { Ghost, ImageIcon, Video, Loader2, X } from "lucide-react";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  ghostCircleId?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  ghostCircleId,
}) => {
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) {
      return toast({
        title: "Content required",
        description: "Please add some text, image, or video to your post.",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);
    let uploadedUrl: string | null = null;

    try {
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

      // Create post with either image or video URL
      await createPost(
        content, 
        ghostCircleId, 
        mediaType === "image" ? uploadedUrl : undefined,
        mediaType === "video" ? uploadedUrl : undefined
      );
      
      setContent("");
      removeMedia();

      toast({
        title: "Post created",
        description: ghostCircleId
          ? "Your anonymous post has been shared in the Ghost Circle."
          : "Your anonymous post has been shared.",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Failed to create post",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-800 text-white border-purple-600">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-300">
            {ghostCircleId ? (
              <>
                <Ghost className="w-5 h-5 text-purple-500" />
                Create Ghost Circle Post
              </>
            ) : (
              "Create Anonymous Post"
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {ghostCircleId
              ? "This post will be visible only within this Ghost Circle."
              : "Your identity will remain hidden."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[120px] bg-gray-700 border-gray-600 focus:border-purple-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

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

          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-purple-300 border-purple-700"
                onClick={() => document.getElementById("media-upload")?.click()}
                disabled={isUploading || isSubmitting}
              >
                {mediaType === "video" ? (
                  <Video className="mr-2 w-4 h-4" />
                ) : (
                  <ImageIcon className="mr-2 w-4 h-4" />
                )}
                {isUploading ? "Uploading..." : "Add Media"}
              </Button>
              <input
                type="file"
                id="media-upload"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleMediaUpload}
              />
            </div>

            <p className="text-xs text-gray-400">
              Post lasts 24h, 1 like = +1h.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={(!content.trim() && !mediaFile) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                "Post Anonymously"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
