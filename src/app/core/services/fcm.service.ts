// src/app/core/services/fcm.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private app: FirebaseApp;
  private messaging: Messaging;

  // Your VAPID key from Firebase Console →
  // Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
  private vapidKey = environment.firebaseVapidKey;

  constructor(private http: HttpClient) {
    // Initialize Firebase only once
    if (getApps().length === 0) {
      this.app = initializeApp(environment.firebaseConfig);
    } else {
      this.app = getApps()[0];
    }
    this.messaging = getMessaging(this.app);
  }

  async requestPermissionAndRegister(): Promise<void> {
    // Only run in browser, skip if no service worker support
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (!('serviceWorker' in navigator)) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('[FCM] Notification permission denied');
        return;
      }

      // Register the firebase service worker
      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      );

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        console.log('[FCM] No registration token available');
        return;
      }

      // console.log('[FCM] Web push token:', token);

      // Send to your backend using the same device register endpoint
      this.http.post(`${environment.apiUrl}/notifications/device/register`, {
        pushToken: token,
        platform: 'web',
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
        },
      }).subscribe({
        next: () => console.log(''),
        error: (err) => console.error('[FCM] Failed to register token:', err),
      });

      // Listen for foreground messages (app is open)
      onMessage(this.messaging, (payload) => {
        console.log('[FCM] Foreground message:', payload);
        // Show a browser notification manually since FCM suppresses them in foreground
        if (payload.notification) {
          new Notification(payload.notification.title ?? 'BigLuxx', {
            body: payload.notification.body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/badge-72x72.png',
          });
        }
      });
    } catch (error) {
      console.error('[FCM] Error setting up web push:', error);
    }
  }
}

