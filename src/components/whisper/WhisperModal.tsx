
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendWhisper } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

interface WhisperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId?: string;
  recipientAlias?: string;
}

const WhisperModal: React.FC<WhisperModalProps> = ({ 
  open, 
  onOpenChange,
  recipientId,
  recipientAlias
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }

    if (!recipientId) {
      toast({
        title: 'Error',
        description: 'Missing recipient information.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await sendWhisper(recipientId, content);
      toast({
        title: 'Whisper sent',
        description: `Your anonymous message has been sent to ${recipientAlias || 'the user'}.`,
      });
      setContent('');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send whisper. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Send Anonymous Whisper 
            {recipientAlias && ` to ${recipientAlias}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your anonymous message..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              The recipient will see your anonymous alias but not your real username.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Whisper"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WhisperModal;
