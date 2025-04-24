
import React, { useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserNotifications, markNotificationAsRead } from '@/lib/api-notification';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import AvatarGenerator from '@/components/user/AvatarGenerator';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types';
import { toast } from '@/hooks/use-toast';

interface NotificationsDropdownProps {
  className?: string;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ className }) => {
  const { unreadCount, markAllAsRead, setUnreadCount, refreshNotifications } = useNotifications();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: getUserNotifications,
    refetchInterval: 15000, // Poll for new notifications more frequently
  });

  // Refresh notifications when dropdown opens
  const handleDropdownOpen = () => {
    refreshNotifications();
  };

  // Calculate unread count whenever notifications change
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const unread = notifications.filter((notif: Notification) => !notif.read).length;
      setUnreadCount(unread);
    }
  }, [notifications, setUnreadCount]);

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      refreshNotifications();
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification._id);
    }
    
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
    toast({
      title: "Success",
      description: "All notifications marked as read",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'whisper':
        return '🔒';
      default:
        return '📢';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          onClick={handleDropdownOpen}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs h-7"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {notifications && notifications.length > 0 ? (
              notifications.map((notification: Notification) => (
                <DropdownMenuItem 
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start p-3 cursor-pointer",
                    !notification.read && "bg-purple-500/10"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {notification.sender ? (
                        <AvatarGenerator
                          emoji={typeof notification.sender === 'string' ? '🎭' : notification.sender.avatarEmoji || "🎭"}
                          nickname={typeof notification.sender === 'string' ? 'Anonymous' : notification.sender.anonymousAlias || 'Anonymous'}
                          color="#6E59A5"
                          size="sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {notification.body}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
