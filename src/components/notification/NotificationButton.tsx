
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useNotifications } from '@/context/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationButtonProps {
  className?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ className }) => {
  const { notificationsEnabled, enableNotifications, disableNotifications, unreadCount } = useNotifications();

  const handleClick = async () => {
    if (notificationsEnabled) {
      disableNotifications();
    } else {
      await enableNotifications();
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
