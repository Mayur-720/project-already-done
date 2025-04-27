
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useNotifications } from '@/context/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface NotificationButtonProps {
  className?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ className }) => {
  const { notificationsEnabled, enableNotifications, disableNotifications, unreadCount, loadNotifications } = useNotifications();

  useEffect(() => {
    // Load notifications on component mount
    loadNotifications();
    // Set up interval to check for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleClick = async () => {
    try {
      if (notificationsEnabled) {
        await disableNotifications();
        toast({
          title: "Notifications disabled",
          description: "You won't receive notifications anymore."
        });
      } else {
        const success = await enableNotifications();
        if (success) {
          toast({
            title: "Notifications enabled",
            description: "You'll now receive notifications."
          });
        } else {
          toast({
            variant: "destructive",
            title: "Permission denied",
            description: "Please allow notifications in your browser settings."
          });
        }
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast({
        variant: "destructive",
        title: "Notification error",
        description: "There was an error with notification permissions."
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={cn("relative", className)}
      title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
    >
      {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationButton;
