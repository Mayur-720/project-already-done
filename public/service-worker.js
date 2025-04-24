// Service Worker for Web Push Notifications
self.addEventListener('push', function(event) {
  try {
    const data = event.data.json();
    console.log('Push notification received:', data);
    
    const options = {
      body: data.body,
      icon: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
      badge: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
      data: data.url || '/',
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'close', title: 'Close' }
      ],
      tag: data.title, // Group similar notifications
      renotify: true // Notify each time even if same tag
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'New Notification', options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
    // Fall back to a generic notification if JSON parsing fails
    event.waitUntil(
      self.registration.showNotification('New Notification', {
        body: 'You have a new notification',
        icon: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // The URL to open - either from notification data or default to the root
  const url = event.notification.data || '/';
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      // Notify any open clients about the notification click
      clientList.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_CLICKED',
          url: url
        });
      });
      
      // Try to focus an existing window/tab or open a new one
      if (clientList.length > 0) {
        const client = clientList[0];
        client.navigate(url);
        return client.focus();
      } else {
        return clients.openWindow(url);
      }
    })
  );
});

// Force the waiting service worker to become active
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for fetch events (helps keep the service worker alive)
self.addEventListener('fetch', function(event) {
  // Do nothing special, just ensure the service worker stays active
});
