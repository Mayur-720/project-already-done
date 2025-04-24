
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationContext';
import { useState, useEffect } from 'react';

const NotificationPromptBanner = () => {
  const { notificationsEnabled, enableNotifications } = useNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [permissionState, setPermissionState] = useState<string>('default');

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) return;
    
    // Check initial permission state
    setPermissionState(Notification.permission);

    // Only show banner if notifications are not enabled and not previously denied
    const shouldShowBanner = 
      !notificationsEnabled && 
      Notification.permission !== 'denied' &&
      !localStorage.getItem('notificationBannerDismissed');
    
    if (shouldShowBanner) {
      // Delay showing the banner for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notificationsEnabled]);

  const handleEnable = async () => {
    const result = await enableNotifications();
    if (result) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('notificationBannerDismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 inset-x-4 md:max-w-md md:mx-auto bg-card border border-border shadow-lg rounded-lg p-4 z-50 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="bg-purple-100 p-2 rounded-full">
          <Bell size={20} className="text-purple-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Enable notifications</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Get notified about new likes, comments, and whispers in real-time.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleEnable} className="h-8 bg-purple-600 hover:bg-purple-700">
              Enable
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss} className="h-8">
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPromptBanner;
