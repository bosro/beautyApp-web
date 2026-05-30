importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDsRfhkyEHzHawjE2-DT4MuNnFIew_J3Og",
  authDomain: "big-lux.firebaseapp.com",
  projectId: "big-lux",
  storageBucket: "big-lux.firebasestorage.app",
  messagingSenderId: "494853091341",
  appId: "1:494853091341:web:6abe15334c065d5f0f2544"
});

const messaging = firebase.messaging();

function getNotifConfig(type, data) {
  const base = '/assets/icons';

  const configs = {
    booking: {
      icon: `${base}/icon-192x192.png`,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      actions: [
        { action: 'view_booking', title: 'View Booking' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      resolveUrl: (d) => d?.bookingId ? `/client/bookings/${d.bookingId}` : '/client/bookings',
      actionUrls: {
        view_booking: (d) => d?.bookingId ? `/client/bookings/${d.bookingId}` : '/client/bookings',
        dismiss: null,
      },
    },
    payment: {
      icon: `${base}/icon-192x192.png`,
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true,
      actions: [
        { action: 'view_payment', title: 'View Details' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      resolveUrl: () => '/client/bookings',
      actionUrls: {
        view_payment: () => '/client/bookings',
        dismiss: null,
      },
    },
    verification: {
      icon: `${base}/icon-192x192.png`,
      vibrate: [100, 50, 100, 50, 500],
      requireInteraction: false,
      actions: [
        { action: 'view_profile', title: 'View Profile' },
      ],
      resolveUrl: () => '/beautician/verification',
      actionUrls: {
        view_profile: () => '/beautician/verification',
      },
    },
    review: {
      icon: `${base}/icon-192x192.png`,
      vibrate: [200, 100, 200],
      requireInteraction: false,
      actions: [
        { action: 'view_review', title: 'See Review' },
        { action: 'reply', title: 'Reply' },
      ],
      resolveUrl: () => '/beautician/reviews',
      actionUrls: {
        view_review: () => '/beautician/reviews',
        reply: () => '/beautician/reviews',
      },
    },
    message: {
      icon: `${base}/icon-192x192.png`,
      vibrate: [150, 75, 150],
      requireInteraction: false,
      actions: [
        { action: 'reply', title: 'Reply' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      resolveUrl: () => '/messages',
      actionUrls: {
        reply: () => '/messages',
        dismiss: null,
      },
    },
  };

  return configs[type] || {
    icon: `${base}/icon-192x192.png`,
    vibrate: [200],
    requireInteraction: false,
    actions: [],
    resolveUrl: () => '/',
    actionUrls: {},
  };
}

messaging.onBackgroundMessage((payload) => {
  const type = payload.data?.type || 'general';
  const config = getNotifConfig(type, payload.data);
  const title = payload.notification?.title ?? 'BigLuxx';
  const body = payload.notification?.body ?? '';

  self.registration.showNotification(title, {
    body,
    icon: config.icon,
    badge: '/assets/icons/badge-72x72.png',
    vibrate: config.vibrate,
    actions: config.actions,
    data: { ...payload.data, type },
    tag: `bigluxx-${type}`,
    renotify: true,
    requireInteraction: config.requireInteraction,
    ...(payload.data?.imageUrl && { image: payload.data.imageUrl }),
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const type = data.type || 'general';
  const config = getNotifConfig(type, data);

  let url;
  if (event.action && config.actionUrls[event.action] !== undefined) {
    const resolver = config.actionUrls[event.action];
    url = resolver ? resolver(data) : null;
  } else {
    url = config.resolveUrl(data);
  }

  if (!url) return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});