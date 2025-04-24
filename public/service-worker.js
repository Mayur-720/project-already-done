
// Service Worker for Web Push Notifications
self.addEventListener('push', function(event) {
  try {
    const data = event.data.json();
    console.log('Push notification received:', data);
    
    const options = {
      body: data.body,
      icon: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
      badge: '/lovable-uploads/3284e0d6-4a6b-4a45-9681-a18bf2a0f69f.png',
      data: data.url,
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'close', title: 'Close' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error handling push notification:', error);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      const url = event.notification.data || '/';
      if (clientList.length > 0) {
        const client = clientList[0];
        client.navigate(url);
        client.focus();
      } else {
        clients.openWindow(url);
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
