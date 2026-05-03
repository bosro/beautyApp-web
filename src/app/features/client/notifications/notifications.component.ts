import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-notifications',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Notifications</h1>
        <button *ngIf="unreadCount > 0" (click)="markAllRead()" class="text-sm text-[var(--color-primary)] font-medium">Mark all read</button>
      </div>

      <div *ngIf="loading" class="p-4 space-y-3">
        <div *ngFor="let i of [1,2,3,4,5]" class="skeleton h-20 rounded-xl"></div>
      </div>

      <app-empty-state
        *ngIf="!loading && notifications.length === 0"
        icon="ri-notification-off-line"
        title="No Notifications"
        subtitle="You're all caught up! Check back later.">
      </app-empty-state>

      <div *ngIf="!loading && notifications.length > 0" class="divide-y divide-[var(--color-border)]">
        <div *ngFor="let notif of notifications"
          class="flex gap-3 p-4 transition-colors cursor-pointer"
          [ngClass]="notif.isRead ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-primary)]/5'"
          (click)="markRead(notif)">

          <!-- Icon -->
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            [ngClass]="getIconBg(notif.type)">
            <i [ngClass]="getIcon(notif.type)" class="text-lg"></i>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[var(--color-text-primary)]" [ngClass]="{'font-semibold': !notif.isRead}">{{ notif.title }}</p>
            <p class="text-sm text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{{ notif.message }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-1">{{ notif.createdAt | date:'MMM d, h:mm a' }}</p>
          </div>

          <!-- Unread dot -->
          <div *ngIf="!notif.isRead" class="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0 mt-1.5"></div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading = true;

  get unreadCount() { return this.notifications.filter(n => !n.isRead).length; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/notifications`).subscribe({
      next: (res) => { this.notifications = res.data || []; this.loading = false; },
      error: () => this.loading = false
    });
  }

  markRead(notif: any) {
    if (notif.isRead) return;
    this.http.patch(`${environment.apiUrl}/notifications/${notif.id}/read`, {}).subscribe();
    notif.isRead = true;
  }

  markAllRead() {
    this.http.patch(`${environment.apiUrl}/notifications/read-all`, {}).subscribe();
    this.notifications.forEach(n => n.isRead = true);
  }

  getIcon(type: string) {
    const map: any = {
      BOOKING_CONFIRMED: 'ri-calendar-check-line text-green-500',
      BOOKING_CANCELLED: 'ri-calendar-close-line text-red-500',
      BOOKING_REMINDER: 'ri-alarm-line text-amber-500',
      PROMOTION: 'ri-coupon-line text-purple-500',
      REVIEW: 'ri-star-line text-amber-500',
      PAYMENT: 'ri-money-dollar-circle-line text-green-500',
      SYSTEM: 'ri-information-line text-blue-500',
    };
    return map[type] || 'ri-notification-line text-[var(--color-primary)]';
  }

  getIconBg(type: string) {
    const map: any = {
      BOOKING_CONFIRMED: 'bg-green-100 dark:bg-green-900/30',
      BOOKING_CANCELLED: 'bg-red-100 dark:bg-red-900/30',
      BOOKING_REMINDER: 'bg-amber-100 dark:bg-amber-900/30',
      PROMOTION: 'bg-purple-100 dark:bg-purple-900/30',
      REVIEW: 'bg-amber-100 dark:bg-amber-900/30',
      PAYMENT: 'bg-green-100 dark:bg-green-900/30',
      SYSTEM: 'bg-blue-100 dark:bg-blue-900/30',
    };
    return map[type] || 'bg-[var(--color-primary)]/10';
  }
}
