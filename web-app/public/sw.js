const CACHE_NAME = 'rashtrackr-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    try {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const response = await fetch(event.request);
        if (!response || !(response instanceof Response)) {
          return new Response('', { status: 503, statusText: 'Service Unavailable' });
        }
        if (response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      } catch (err) {
        if (event.request.mode === 'navigate') {
          const offline = await caches.match('/offline.html');
          return offline || new Response('', { status: 503, statusText: 'Offline' });
        }
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      }
    } catch (err) {
      return new Response('', { status: 500, statusText: 'Service Worker Error' });
    }
  })().catch(() => new Response('', { status: 500, statusText: 'Service Worker Error' })));
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline reports
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from RashTrackr',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Report',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('RashTrackr', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

let lastSyncTime = 0;
const MIN_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Background sync function
async function doBackgroundSync() {
  const now = Date.now();
  if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
    // Too soon since last sync, skip
    return;
  }
  lastSyncTime = now;
  try {
    // Get offline reports from IndexedDB
    const offlineReports = await getOfflineReports();
    
    for (const report of offlineReports) {
      try {
        // Attempt to sync with server
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${report.token}`
          },
          body: JSON.stringify(report.data)
        });
        
        if (response.ok) {
          // Remove from offline storage
          await removeOfflineReport(report.id);
        }
      } catch (error) {
        console.error('Failed to sync report:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// IndexedDB functions for offline storage
async function getOfflineReports() {
  // This would be implemented with IndexedDB
  // For now, return empty array
  return [];
}

async function removeOfflineReport(id) {
  // This would be implemented with IndexedDB
  // For now, just log
  console.log('Removing offline report:', id);
} 