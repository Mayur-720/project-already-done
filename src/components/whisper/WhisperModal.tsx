import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a Whisper</DialogTitle>
        </DialogHeader>
        <div>
          {recipientAlias ? (
            <p>Send a whisper to {recipientAlias}?</p>
          ) : (
            <p>Select a user to whisper to.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhisperModal;
