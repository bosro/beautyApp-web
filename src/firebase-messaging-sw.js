// src/firebase-messaging-sw.js
// This file MUST be served from the root of your domain: /firebase-messaging-sw.js
// Place it in your Angular project's src/ folder and register it in angular.json assets

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// These values must match your environment.firebaseConfig exactly
firebase.initializeApp({
  apiKey: "AIzaSyDsRfhkyEHzHawjE2-DT4MuNnFIew_J3Og",
  authDomain: "big-lux.firebaseapp.com",
  projectId: "big-lux",
  storageBucket: "big-lux.firebasestorage.app",
  messagingSenderId: "494853091341",
  appId: "1:494853091341:web:6abe15334c065d5f0f2544"
});

const messaging = firebase.messaging();

// Handle background messages (app is closed or in background tab)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationTitle = payload.notification?.title ?? 'BigLuxx';
  const notificationOptions = {
    body: payload.notification?.body ?? '',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    data: payload.data,
    // Show action buttons based on notification type
    actions: payload.data?.type === 'booking'
      ? [{ action: 'view', title: 'View Booking' }]
      : [],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — navigate to the right screen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (data?.type === 'booking' && data?.bookingId) {
    url = `/client/bookings/${data.bookingId}`;
  } else if (data?.type === 'payment') {
    url = `/client/bookings`;
  } else if (data?.type === 'verification') {
    url = `/beautician/verification`;
  } else if (data?.type === 'review') {
    url = `/beautician/reviews`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});