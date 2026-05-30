import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { environment } from '@environments/environment';

// TypeScript's built-in NotificationOptions doesn't include actions/vibrate/image
// because those only exist on ServiceWorkerRegistration.showNotification(), not
// the Notification constructor. We define the full shape here.
interface ServiceWorkerNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  vibrate?: number[];
  data?: any;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

type NotifType = 'booking' | 'payment' | 'verification' | 'review' | 'message' | 'general';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private app: FirebaseApp;
  private messaging: Messaging;
  private vapidKey = environment.firebaseVapidKey;

  constructor(private http: HttpClient) {
    this.app = getApps().length === 0
      ? initializeApp(environment.firebaseConfig)
      : getApps()[0];
    this.messaging = getMessaging(this.app);
  }

  async requestPermissionAndRegister(): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (!('serviceWorker' in navigator)) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        { scope: '/' }
      );

      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (!token) return;

      this.http.post(`${environment.apiUrl}/notifications/device/register`, {
        pushToken: token,
        platform: 'web',
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
        },
      }).subscribe({
        error: (err) => console.error('[FCM] Failed to register token:', err),
      });

      // Foreground messages — use SW showNotification so action buttons work
      onMessage(this.messaging, (payload) => {
        if (!payload.notification) return;

        const type = (payload.data?.['type'] as NotifType) || 'general';
        const config = this.getNotifConfig(type, payload.data);

        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(
            payload.notification!.title ?? 'BigLuxx',
            {
              body:               payload.notification!.body,
              icon:               config.icon,
              badge:              '/assets/icons/badge-72x72.png',
              tag:                `bigluxx-${type}`,
              renotify:           true,
              requireInteraction: config.requireInteraction,
              data:               payload.data,
              // Cast needed because TS lib typing omits these SW-only fields
              ...({ vibrate: config.vibrate, actions: config.actions, image: payload.data?.['imageUrl'] } as any),
            } as NotificationOptions
          );
        });
      });
    } catch (error) {
      console.error('[FCM] Error setting up web push:', error);
    }
  }

  private getNotifConfig(type: NotifType, data?: Record<string, string>): {
    icon: string;
    vibrate: number[];
    actions: Array<{ action: string; title: string }>;
    requireInteraction: boolean;
  } {
    const base = '/assets/icons';

    const configs: Record<NotifType, ReturnType<FcmService['getNotifConfig']>> = {
      booking: {
        icon:               `${base}/icon-192x192.png`,
        vibrate:            [200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'view_booking', title: 'View Booking' },
          { action: 'dismiss',      title: 'Dismiss'      },
        ],
      },
      payment: {
        icon:               `${base}/icon-192x192.png`,
        vibrate:            [300, 100, 300, 100, 300],
        requireInteraction: true,
        actions: [
          { action: 'view_payment', title: 'View Details' },
          { action: 'dismiss',      title: 'Dismiss'      },
        ],
      },
      verification: {
        icon:               `${base}/icon-192x192.png`,
        vibrate:            [100, 50, 100, 50, 500],
        requireInteraction: false,
        actions: [
          { action: 'view_profile', title: 'View Profile' },
        ],
      },
      review: {
        icon:               `${base}/icon-192x192.png`,
        vibrate:            [200, 100, 200],
        requireInteraction: false,
        actions: [
          { action: 'view_review', title: 'See Review' },
          { action: 'reply',       title: 'Reply'      },
        ],
      },
      message: {
        icon:               `${base}/icon-192x192.png`,
        vibrate:            [150, 75, 150],
        requireInteraction: false,
        actions: [
          { action: 'reply',   title: 'Reply'   },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      },
      general: {
        icon:               `${base}/icon-192x192.png`,
        vibrate:            [200],
        requireInteraction: false,
        actions:            [],
      },
    };

    return configs[type] ?? configs.general;
  }
}