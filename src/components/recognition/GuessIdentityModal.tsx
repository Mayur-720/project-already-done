
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { recognizePostAuthor } from '@/lib/api';
import { User } from '@/types';

interface GuessIdentityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: User;
  onSuccess?: () => void;
}

const GuessIdentityModal: React.FC<GuessIdentityModalProps> = ({
  open,
  onOpenChange,
  targetUser,
  onSuccess
}) => {
  const [guess, setGuess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleGuess = async () => {
    if (!guess.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Implement the recognition logic here
      // For now, we'll just simulate a successful recognition
      toast({
        title: "Success!",
        description: "You've correctly guessed the identity!",
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Incorrect",
        description: error.message || "That's not the right username.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Guess Identity</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="mb-4">
            Think you know who <span className="font-bold">{targetUser?.anonymousAlias}</span> really is? 
            Enter their username to verify.
          </p>
          
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
            />
            
            <Button 
              onClick={handleGuess} 
              className="w-full"
              disabled={isSubmitting || !guess.trim()}
            >
              {isSubmitting ? 'Verifying...' : 'Verify Identity'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuessIdentityModal;
