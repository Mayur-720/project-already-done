
// Service Worker for Web Push Notifications
self.addEventListener('push', function(event) {
  const data = event.data.json();
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
