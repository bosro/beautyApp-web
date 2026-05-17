// src/app/core/services/fcm.service.ts
import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { firebaseConfig } from '@environments/firebase.config';

@Injectable({ providedIn: 'root' })
export class FcmService {
  private messaging = getMessaging(initializeApp(firebaseConfig));

  // Your VAPID key — find in Firebase Console → Project Settings
  // → Cloud Messaging → Web Push certificates → Key pair
  private vapidKey = 'YOUR_VAPID_KEY_HERE';

  constructor(private http: HttpClient) {}

  async requestPermissionAndRegister(): Promise<void> {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const token = await getToken(this.messaging, { vapidKey: this.vapidKey });
      if (!token) return;

      // Register with your backend
      await this.http.post(`${environment.apiUrl}/notifications/device/register`, {
        pushToken: token,
        platform: 'web',
      }).toPromise();

      console.log('FCM web push token registered');
    } catch (error) {
      console.error('FCM registration error:', error);
    }
  }

  // Listen for foreground messages
  onMessage(callback: (payload: any) => void): void {
    onMessage(this.messaging, callback);
  }
}