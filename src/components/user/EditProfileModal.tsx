import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { updateProfile } from '@/lib/api';
import AvatarGenerator from './AvatarGenerator';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: User;
  onSuccess?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onOpenChange,
  initialData,
  onSuccess
}) => {
  const [username, setUsername] = useState(initialData?.username || '');
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [avatarEmoji, setAvatarEmoji] = useState(initialData?.avatarEmoji || '🎭');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || '');
      setFullName(initialData.fullName || '');
      setBio(initialData.bio || '');
      setAvatarEmoji(initialData.avatarEmoji || '🎭');
    }
  }, [initialData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updatedData: Partial<User> = {
        username,
        fullName,
        bio,
        avatarEmoji,
      };
      
      await updateProfile(updatedData);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not update profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right text-sm font-medium leading-none text-right">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3 h-10"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="fullName" className="text-right text-sm font-medium leading-none text-right">
              Full Name
            </label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="col-span-3 h-10"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="bio" className="text-right text-sm font-medium leading-none text-right">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium leading-none text-right">
              Avatar
            </label>
            <div className="col-span-3 flex items-center space-x-4">
              <AvatarGenerator
                emoji={avatarEmoji}
                nickname={username || 'Preview'}
                onChange={setAvatarEmoji}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
