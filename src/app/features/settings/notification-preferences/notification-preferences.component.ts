
// src/app/features/settings/notification-preferences/notification-preferences.component.ts
// Works for BOTH clients and beauticians — same preferences endpoint.

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

interface Preferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  bookingConfirmed: boolean;
  bookingCancelled: boolean;
  bookingReminder: boolean;
  bookingCompleted: boolean;
  paymentReceived: boolean;
  payoutProcessed: boolean;
  reviewReceived: boolean;
  verificationUpdate: boolean;
  promotions: boolean;
}

@Component({
  selector: 'app-notification-preferences',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-28">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3">
        <button onclick="history.back()" class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center">
          <i class="ri-arrow-left-line text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Notification Preferences</h1>
        <span *ngIf="saving" class="ml-auto text-xs text-[var(--color-text-muted)] flex items-center gap-1">
          <i class="ri-loader-4-line animate-spin"></i> Saving...
        </span>
        <span *ngIf="saved && !saving" class="ml-auto text-xs text-green-500 flex items-center gap-1">
          <i class="ri-check-line"></i> Saved
        </span>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-36 rounded-2xl"></div>
        <div class="skeleton h-64 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading && prefs" class="p-4 max-w-2xl mx-auto space-y-5">

        <!-- Channels section -->
        <div class="card overflow-hidden">
          <div class="px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <h3 class="font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">Notification Channels</h3>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Master switches — turning a channel off disables all its notifications</p>
          </div>

          <div *ngFor="let channel of channels; let last = last"
               class="flex items-center justify-between px-4 py-4"
               [class.border-b]="!last"
               [class.border-[var(--color-border)]]="!last">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center" [ngClass]="channel.iconBg">
                <i [class]="channel.icon + ' text-base'" [ngClass]="channel.iconColor"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ channel.label }}</p>
                <p class="text-xs text-[var(--color-text-muted)]">{{ channel.description }}</p>
              </div>
            </div>
            <button (click)="toggleChannel(channel.key)"
                    class="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                    [ngClass]="prefs[channel.key] ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    [ngClass]="prefs[channel.key] ? 'translate-x-6' : 'translate-x-0'"></span>
            </button>
          </div>
        </div>

        <!-- Events section -->
        <div class="card overflow-hidden">
          <div class="px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <h3 class="font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">Notification Events</h3>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Choose which events you want to be notified about</p>
          </div>

          <div *ngFor="let group of eventGroups">
            <!-- Group label -->
            <div class="px-4 py-2 bg-[var(--color-background)]/50">
              <p class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{{ group.label }}</p>
            </div>

            <div *ngFor="let event of group.events; let last = last"
                 class="flex items-center justify-between px-4 py-3.5"
                 [class.border-b]="!last"
                 [class.border-[var(--color-border)]]="!last">
              <div class="flex items-center gap-3">
                <i [class]="event.icon + ' text-[var(--color-primary)] text-lg w-5 text-center'"></i>
                <div>
                  <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ event.label }}</p>
                  <p class="text-xs text-[var(--color-text-muted)]">{{ event.description }}</p>
                </div>
              </div>
              <button (click)="toggleEvent(event.key)"
                      class="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                      [ngClass]="prefs[event.key] ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                      [ngClass]="prefs[event.key] ? 'translate-x-6' : 'translate-x-0'"></span>
              </button>
            </div>

            <!-- Separator between groups -->
            <div class="border-b border-[var(--color-border)]"></div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="flex gap-3">
          <button (click)="enableAll()" class="flex-1 py-3 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors">
            <i class="ri-notification-4-line mr-1"></i> Enable All
          </button>
          <button (click)="disableAll()" class="flex-1 py-3 rounded-xl border border-[var(--color-border)] text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <i class="ri-notification-off-line mr-1"></i> Mute All
          </button>
        </div>

      </div>
    </div>
  `,
})
export class NotificationPreferencesComponent implements OnInit {
  prefs: Preferences | null = null;
  loading = true;
  saving = false;
  saved = false;
  private saveTimer: any;

  channels = [
    {
      key: 'emailEnabled' as keyof Preferences,
      label: 'Email Notifications',
      description: 'Receive updates in your inbox',
      icon: 'ri-mail-line',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-500',
    },
    {
      key: 'smsEnabled' as keyof Preferences,
      label: 'SMS Notifications',
      description: 'Receive text messages to your phone',
      icon: 'ri-message-2-line',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-500',
    },
    {
      key: 'pushEnabled' as keyof Preferences,
      label: 'Push Notifications',
      description: 'Receive alerts on your device',
      icon: 'ri-notification-3-line',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-500',
    },
    {
      key: 'inAppEnabled' as keyof Preferences,
      label: 'In-App Notifications',
      description: 'Show alerts inside the app',
      icon: 'ri-apps-line',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-500',
    },
  ];

  eventGroups = [
    {
      label: 'Bookings',
      events: [
        { key: 'bookingConfirmed' as keyof Preferences, label: 'Booking Confirmed', description: 'When a booking is confirmed', icon: 'ri-calendar-check-line' },
        { key: 'bookingCancelled' as keyof Preferences, label: 'Booking Cancelled', description: 'When a booking is cancelled', icon: 'ri-calendar-close-line' },
        { key: 'bookingReminder' as keyof Preferences, label: 'Booking Reminders', description: 'Reminders before your appointment', icon: 'ri-alarm-line' },
        { key: 'bookingCompleted' as keyof Preferences, label: 'Booking Completed', description: 'When a service is completed', icon: 'ri-checkbox-circle-line' },
      ],
    },
    {
      label: 'Payments',
      events: [
        { key: 'paymentReceived' as keyof Preferences, label: 'Payment Received', description: 'When payment is processed', icon: 'ri-bank-card-line' },
        { key: 'payoutProcessed' as keyof Preferences, label: 'Payout Processed', description: 'When a payout is sent to you', icon: 'ri-money-dollar-circle-line' },
      ],
    },
    {
      label: 'Account',
      events: [
        { key: 'reviewReceived' as keyof Preferences, label: 'New Reviews', description: 'When a customer leaves a review', icon: 'ri-star-line' },
        { key: 'verificationUpdate' as keyof Preferences, label: 'Verification Updates', description: 'Updates on your verification status', icon: 'ri-shield-check-line' },
        { key: 'promotions' as keyof Preferences, label: 'Promotions & Offers', description: 'Deals, tips, and BigLuxx updates', icon: 'ri-gift-2-line' },
      ],
    },
  ];

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/notification-preferences`).subscribe({
      next: res => {
        this.prefs = res.data.preferences;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  toggleChannel(key: keyof Preferences) {
    if (!this.prefs) return;
    (this.prefs as any)[key] = !(this.prefs as any)[key];
    this.scheduleSave();
  }

  toggleEvent(key: keyof Preferences) {
    if (!this.prefs) return;
    (this.prefs as any)[key] = !(this.prefs as any)[key];
    this.scheduleSave();
  }

  enableAll() {
    if (!this.prefs) return;
    (Object.keys(this.prefs) as (keyof Preferences)[]).forEach(k => {
      if (k !== 'id' && k !== 'userId' && k !== 'createdAt' && k !== 'updatedAt') {
        (this.prefs as any)[k] = true;
      }
    });
    this.scheduleSave();
  }

  disableAll() {
    if (!this.prefs) return;
    (Object.keys(this.prefs) as (keyof Preferences)[]).forEach(k => {
      if (k !== 'id' && k !== 'userId' && k !== 'createdAt' && k !== 'updatedAt') {
        (this.prefs as any)[k] = false;
      }
    });
    this.scheduleSave();
  }

  /** Debounced auto-save — 800 ms after last toggle */
  private scheduleSave() {
    this.saved = false;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 800);
  }

  private save() {
    this.saving = true;
    this.http.put<any>(`${environment.apiUrl}/notification-preferences`, this.prefs).subscribe({
      next: res => {
        this.prefs = res.data.preferences;
        this.saving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      },
      error: () => {
        this.saving = false;
        this.toast.error('Failed to save preferences');
      },
    });
  }
}