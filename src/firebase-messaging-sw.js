// src/firebase-messaging-sw.js
// This MUST be at the root of your domain (served as /firebase-messaging-sw.js)
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSy...",          // same values as firebaseConfig above
  authDomain: "bigluxx.firebaseapp.com",
  projectId: "bigluxx",
  storageBucket: "bigluxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
  });
});