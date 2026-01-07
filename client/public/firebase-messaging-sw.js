// Firebase Cloud Messaging Service Worker
// This handles push notifications when the app is in background

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY,
  authDomain: self.FIREBASE_AUTH_DOMAIN,
  projectId: self.FIREBASE_PROJECT_ID,
  storageBucket: self.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
  appId: self.FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'La Pulperia';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: payload.data?.tag || 'default',
    data: payload.data,
    vibrate: [200, 100, 200],
    actions: getNotificationActions(payload.data?.type),
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get actions based on notification type
function getNotificationActions(type) {
  switch (type) {
    case 'new_order':
      return [
        { action: 'view', title: 'Ver Pedido' },
        { action: 'accept', title: 'Aceptar' },
      ];
    case 'order_update':
      return [
        { action: 'view', title: 'Ver Detalles' },
      ];
    case 'product_available':
      return [
        { action: 'view', title: 'Ver Producto' },
        { action: 'buy', title: 'Agregar' },
      ];
    default:
      return [];
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const data = event.notification.data || {};
  let url = '/';

  // Determine URL based on action and data
  if (event.action === 'view' || !event.action) {
    if (data.orderId) {
      url = data.isPulperia ? `/manage/orders` : `/order/${data.orderId}`;
    } else if (data.productId) {
      url = `/product/${data.productId}`;
    }
  } else if (event.action === 'accept' && data.orderId) {
    url = `/manage/orders?accept=${data.orderId}`;
  } else if (event.action === 'buy' && data.productId) {
    url = `/product/${data.productId}?addToCart=true`;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// Cache static assets for offline support
const CACHE_NAME = 'lapulperia-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Network-first strategy for API calls, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API calls - network only
  if (url.pathname.startsWith('/api')) return;

  // Static assets - stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetched;
    })
  );
});
