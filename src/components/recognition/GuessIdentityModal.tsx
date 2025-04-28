
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { recognizePostAuthor } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

interface GuessIdentityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPostId: string;
}

const GuessIdentityModal: React.FC<GuessIdentityModalProps> = ({
  open,
  onOpenChange,
  targetPostId
}) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    message: string;
    user?: User;
  } | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a username',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await recognizePostAuthor(targetPostId, username);
      setResult(response);
      if (response.correct) {
        toast({
          title: 'Correct!',
          description: "You successfully guessed the user's identity",
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit guess',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUsername('');
    setResult(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Short delay to reset after animation completes
    setTimeout(() => {
      handleReset();
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Guess User Identity</DialogTitle>
        </DialogHeader>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Enter username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter the real username"
              />
              <p className="text-xs text-muted-foreground">
                Try to guess who is behind this anonymous post
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Guess'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-4 space-y-4">
            <div 
              className={`p-4 rounded-md ${
                result.correct ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <p>{result.message}</p>
            </div>

            {result.correct && result.user && (
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 rounded-full text-2xl">
                  {result.user.avatarEmoji}
                </div>
                <div>
                  <p className="font-medium">@{result.user.username}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              {!result.correct && (
                <Button variant="outline" onClick={handleReset}>
                  Try Again
                </Button>
              )}
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GuessIdentityModal;
