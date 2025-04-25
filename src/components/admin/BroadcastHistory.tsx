
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBroadcastHistory } from '@/lib/api-admin';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  User
} from 'lucide-react';
import { BroadcastNotification } from '@/types';

const BroadcastHistory: React.FC = () => {
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['broadcast-history'],
    queryFn: getBroadcastHistory,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-700">
        <p className="font-medium">Failed to load broadcast history</p>
        <p className="text-sm">Please try again later</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No broadcast notifications sent yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Recent Broadcasts</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {notifications.map((notification: BroadcastNotification) => (
          <div key={notification._id} className="p-4 rounded-lg border bg-card">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{notification.title}</h4>
              <StatusBadge status={notification.status} />
            </div>
            <p className="text-sm text-muted-foreground mb-2">{notification.body}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-3">
              <div className="flex items-center">
                {notification.targetGroup === 'all' ? 
                  <Users className="h-3.5 w-3.5 mr-1" /> : 
                  <User className="h-3.5 w-3.5 mr-1" />
                }
                <span>
                  {notification.targetGroup === 'all' 
                    ? 'All users' 
                    : `${notification.targetUsers?.length || 0} specific users`}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>
                  {notification.sentAt 
                    ? `Sent ${format(new Date(notification.sentAt), 'PPp')}` 
                    : notification.scheduledFor 
                      ? `Scheduled for ${format(new Date(notification.scheduledFor), 'PPp')}`
                      : 'Not sent yet'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'sent':
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Sent
        </Badge>
      );
    case 'scheduled':
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Clock className="h-3 w-3 mr-1" />
          Scheduled
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export default BroadcastHistory;
