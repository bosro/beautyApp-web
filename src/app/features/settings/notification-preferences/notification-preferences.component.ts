// src/app/features/settings/notification-preferences/notification-preferences.component.ts

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

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
  selector: "app-notification-preferences",
  standalone: false,
  template: `
    <div
      class="min-h-screen pb-28"
      style="background-color: var(--color-background)"
    >
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
        style="background-color: var(--color-surface); border-color: var(--color-border)"
      >
        <button
          (click)="back()"
          class="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style="background-color: var(--color-background)"
        >
          <i
            class="ri-arrow-left-s-line text-lg text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1
          class="flex-1 text-base font-bold text-[var(--color-text-primary)] tracking-tight"
        >
          Notifications
        </h1>
        <!-- Auto-save indicator -->
        <span
          *ngIf="saving"
          class="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]"
        >
          <i class="ri-loader-4-line animate-spin"></i> Saving…
        </span>
        <span
          *ngIf="saved && !saving"
          class="flex items-center gap-1.5 text-xs text-green-500"
        >
          <i class="ri-check-line"></i> Saved
        </span>
      </div>

      <!-- ── Skeleton ── -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-36 rounded-2xl"></div>
        <div class="skeleton h-64 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading && prefs" class="p-4 max-w-2xl mx-auto space-y-5">
        <!-- ── Channels ── -->
        <p class="section-label">Channels</p>
        <div class="menu-list">
          <div
            *ngFor="let ch of channels; let last = last"
            class="menu-row"
            [ngClass]="last ? 'no-border' : ''"
          >
            <div class="menu-row-left">
              <div class="menu-icon-wrap" [ngStyle]="{ background: ch.bg }">
                <i [class]="ch.icon" [ngStyle]="{ color: ch.color }"></i>
              </div>
              <div>
                <p class="text-sm font-medium text-[var(--color-text-primary)]">
                  {{ ch.label }}
                </p>
                <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {{ ch.description }}
                </p>
              </div>
            </div>
            <button
              class="toggle-btn"
              [class.toggle-on]="prefs[ch.key]"
              (click)="toggle(ch.key)"
            >
              <span
                class="toggle-knob"
                [class.toggle-knob-on]="prefs[ch.key]"
              ></span>
            </button>
          </div>
        </div>

        <!-- ── Event groups ── -->
        <ng-container *ngFor="let group of eventGroups">
          <p class="section-label">{{ group.label }}</p>
          <div class="menu-list">
            <div
              *ngFor="let ev of group.events; let last = last"
              class="menu-row"
              [ngClass]="last ? 'no-border' : ''"
            >
              <div class="menu-row-left">
                <div
                  class="menu-icon-wrap"
                  style="background-color: var(--color-background)"
                >
                  <i [class]="ev.icon" style="color: var(--color-primary)"></i>
                </div>
                <div>
                  <p
                    class="text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    {{ ev.label }}
                  </p>
                  <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {{ ev.description }}
                  </p>
                </div>
              </div>
              <button
                class="toggle-btn"
                [class.toggle-on]="prefs[ev.key]"
                (click)="toggle(ev.key)"
              >
                <span
                  class="toggle-knob"
                  [class.toggle-knob-on]="prefs[ev.key]"
                ></span>
              </button>
            </div>
          </div>
        </ng-container>

        <!-- ── Quick actions ── -->
        <div class="flex gap-3 pt-1">
          <button
            (click)="enableAll()"
            class="flex-1 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            style="background-color: var(--color-surface); color: var(--color-text-primary); border: 1px solid var(--color-border)"
          >
            <i class="ri-notification-4-line"></i> Enable All
          </button>
          <button
            (click)="disableAll()"
            class="flex-1 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors bg-red-50 text-red-500 border border-red-100"
            style="dark:background: rgba(239,68,68,0.1)"
          >
            <i class="ri-notification-off-line"></i> Mute All
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .section-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0 4px;
        margin-bottom: 8px;
      }

      .menu-list {
        background-color: var(--color-surface);
        border-radius: 20px;
        overflow: hidden;
      }

      .menu-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 13px 16px;
        border-bottom: 1px solid var(--color-border);
      }
      .menu-row.no-border {
        border-bottom: none;
      }

      .menu-row-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .menu-icon-wrap {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 18px;
      }

      /* Toggle */
      .toggle-btn {
        position: relative;
        width: 46px;
        height: 26px;
        border-radius: 13px;
        background-color: var(--color-border);
        border: none;
        cursor: pointer;
        flex-shrink: 0;
        transition: background-color 0.2s;
      }
      .toggle-btn.toggle-on {
        background-color: var(--color-primary);
      }
      .toggle-knob {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s;
      }
      .toggle-knob.toggle-knob-on {
        transform: translateX(20px);
      }
    `,
  ],
})
export class NotificationPreferencesComponent implements OnInit {
  prefs: Preferences | null = null;
  loading = true;
  saving = false;
  saved = false;
  private saveTimer: any;

  channels = [
    {
      key: "emailEnabled" as keyof Preferences,
      label: "Email",
      description: "Updates sent to your inbox",
      icon: "ri-mail-line",
      bg: "#EFF6FF",
      color: "#3B82F6",
    },
    {
      key: "smsEnabled" as keyof Preferences,
      label: "SMS",
      description: "Text messages to your phone",
      icon: "ri-message-2-line",
      bg: "#F0FDF4",
      color: "#22C55E",
    },
    {
      key: "pushEnabled" as keyof Preferences,
      label: "Push",
      description: "Alerts on your device",
      icon: "ri-notification-3-line",
      bg: "#FDF4FF",
      color: "#A855F7",
    },
    {
      key: "inAppEnabled" as keyof Preferences,
      label: "In-App",
      description: "Alerts inside the app",
      icon: "ri-apps-line",
      bg: "#FFFBEB",
      color: "#F59E0B",
    },
  ];

  eventGroups = [
    {
      label: "Bookings",
      events: [
        {
          key: "bookingConfirmed" as keyof Preferences,
          label: "Booking Confirmed",
          description: "When a booking is confirmed",
          icon: "ri-calendar-check-line",
        },
        {
          key: "bookingCancelled" as keyof Preferences,
          label: "Booking Cancelled",
          description: "When a booking is cancelled",
          icon: "ri-calendar-close-line",
        },
        {
          key: "bookingReminder" as keyof Preferences,
          label: "Booking Reminders",
          description: "Reminders before your appointment",
          icon: "ri-alarm-line",
        },
        {
          key: "bookingCompleted" as keyof Preferences,
          label: "Booking Completed",
          description: "When a service is completed",
          icon: "ri-checkbox-circle-line",
        },
      ],
    },
    {
      label: "Payments",
      events: [
        {
          key: "paymentReceived" as keyof Preferences,
          label: "Payment Received",
          description: "When payment is processed",
          icon: "ri-bank-card-line",
        },
        {
          key: "payoutProcessed" as keyof Preferences,
          label: "Payout Processed",
          description: "When a payout is sent to you",
          icon: "ri-money-dollar-circle-line",
        },
      ],
    },
    {
      label: "Account",
      events: [
        {
          key: "reviewReceived" as keyof Preferences,
          label: "New Reviews",
          description: "When a customer leaves a review",
          icon: "ri-star-line",
        },
        {
          key: "verificationUpdate" as keyof Preferences,
          label: "Verification Updates",
          description: "Updates on your verification status",
          icon: "ri-shield-check-line",
        },
        {
          key: "promotions" as keyof Preferences,
          label: "Promotions & Offers",
          description: "Deals, tips, and Bigluxx updates",
          icon: "ri-gift-2-line",
        },
      ],
    },
  ];

  constructor(
    private http: HttpClient,
    private location: Location,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.http
      .get<any>(`${environment.apiUrl}/notification-preferences`)
      .subscribe({
        next: (res) => {
          this.prefs = res.data.preferences;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  back() {
    this.location.back();
  }

  toggle(key: keyof Preferences) {
    if (!this.prefs) return;
    (this.prefs as any)[key] = !(this.prefs as any)[key];
    this.scheduleSave();
  }

  enableAll() {
    if (!this.prefs) return;
    (Object.keys(this.prefs) as (keyof Preferences)[]).forEach((k) => {
      this.prefs![k] = true;
    });
    this.scheduleSave();
  }

  disableAll() {
    if (!this.prefs) return;
    (Object.keys(this.prefs) as (keyof Preferences)[]).forEach((k) => {
      this.prefs![k] = false;
    });
    this.scheduleSave();
  }

  private scheduleSave() {
    this.saved = false;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 800);
  }

  private save() {
    this.saving = true;
    this.http
      .put<any>(`${environment.apiUrl}/notification-preferences`, this.prefs)
      .subscribe({
        next: (res) => {
          this.prefs = res.data.preferences;
          this.saving = false;
          this.saved = true;
          setTimeout(() => (this.saved = false), 3000);
        },
        error: () => {
          this.saving = false;
          this.toast.error("Failed to save preferences");
        },
      });
  }
}
