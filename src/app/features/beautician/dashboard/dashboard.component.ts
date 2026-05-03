import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-beautician-dashboard',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <!-- Header -->
      <div class="p-4 lg:p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-[var(--color-text-muted)]">Good {{ greeting }},</p>
            <h1 class="text-xl font-bold text-[var(--color-text-primary)] mt-0.5">{{ user?.businessName || user?.firstName }} 👋</h1>
          </div>
          <div class="text-right">
            <p class="text-xs text-[var(--color-text-muted)]">Today</p>
            <p class="text-sm font-semibold text-[var(--color-text-primary)]">{{ today | date:'EEE, MMM d' }}</p>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div *ngFor="let i of [1,2,3,4]" class="skeleton h-24 rounded-2xl"></div>
        </div>
        <div class="skeleton h-48 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 space-y-5">

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                <i class="ri-calendar-check-line text-[var(--color-primary)] text-xl"></i>
              </div>
              <span class="badge badge-success text-xs">Today</span>
            </div>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">{{ stats?.todayBookings || 0 }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Bookings Today</p>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <i class="ri-time-line text-amber-500 text-xl"></i>
              </div>
              <span class="badge badge-warning text-xs">Pending</span>
            </div>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">{{ stats?.pendingBookings || 0 }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Awaiting Confirm</p>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i class="ri-money-dollar-circle-line text-green-500 text-xl"></i>
              </div>
            </div>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">GH₵ {{ stats?.monthRevenue || 0 | number:'1.0-0' }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">This Month</p>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <i class="ri-star-line text-amber-500 text-xl"></i>
              </div>
            </div>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">{{ stats?.averageRating | number:'1.1-1' }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Avg. Rating</p>
          </div>
        </div>

        <!-- Desktop grid: main + sidebar -->
        <div class="lg:grid lg:grid-cols-3 lg:gap-5 space-y-5 lg:space-y-0">

          <!-- Left: Today's Bookings -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-[var(--color-text-primary)]">Today's Schedule</h2>
              <button (click)="router.navigate(['/beautician/bookings'])" class="text-sm text-[var(--color-primary)] font-medium">View all</button>
            </div>

            <app-empty-state
              *ngIf="todayBookings.length === 0"
              icon="ri-calendar-line"
              title="No Bookings Today"
              subtitle="Your schedule is clear. Enjoy your day!">
            </app-empty-state>

            <div *ngFor="let booking of todayBookings" class="card p-4 flex gap-3">
              <!-- Time -->
              <div class="w-16 text-center flex-shrink-0">
                <p class="text-sm font-bold text-[var(--color-primary)]">{{ booking.startTime }}</p>
                <p class="text-xs text-[var(--color-text-muted)]">{{ booking.endTime }}</p>
              </div>
              <div class="w-px bg-[var(--color-border)]"></div>
              <!-- Client -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <img
                    [src]="booking.client?.avatar || 'https://ui-avatars.com/api/?name=' + booking.client?.firstName"
                    class="w-7 h-7 rounded-full object-cover"
                  />
                  <p class="text-sm font-semibold text-[var(--color-text-primary)]">{{ booking.client?.firstName }} {{ booking.client?.lastName }}</p>
                </div>
                <p class="text-xs text-[var(--color-text-secondary)]">{{ getServiceNames(booking.services) }}</p>
                <p class="text-xs font-semibold text-[var(--color-primary)] mt-1">GH₵ {{ booking.totalAmount | number:'1.2-2' }}</p>
              </div>
              <!-- Status + action -->
              <div class="flex flex-col items-end gap-2">
                <span class="badge" [ngClass]="getStatusClass(booking.status)">{{ booking.status }}</span>
                <button *ngIf="booking.status === 'PENDING'" (click)="confirmBooking(booking)"
                  class="text-xs text-green-600 font-medium hover:underline">Confirm</button>
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="space-y-4">

            <!-- Quick Stats -->
            <div class="card p-4 space-y-3">
              <h3 class="font-semibold text-[var(--color-text-primary)]">This Month</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--color-text-secondary)]">Total Bookings</span>
                  <span class="font-semibold text-[var(--color-text-primary)]">{{ stats?.monthBookings || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--color-text-secondary)]">Completed</span>
                  <span class="font-semibold text-green-500">{{ stats?.completedBookings || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--color-text-secondary)]">Cancelled</span>
                  <span class="font-semibold text-red-500">{{ stats?.cancelledBookings || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--color-text-secondary)]">New Clients</span>
                  <span class="font-semibold text-[var(--color-primary)]">{{ stats?.newClients || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Recent Reviews -->
            <div class="card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-[var(--color-text-primary)]">Latest Reviews</h3>
                <button (click)="router.navigate(['/beautician/reviews'])" class="text-xs text-[var(--color-primary)]">See all</button>
              </div>
              <div *ngFor="let review of recentReviews" class="pb-3 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                <div class="flex items-center gap-2 mb-1">
                  <img [src]="review.client?.avatar || 'https://ui-avatars.com/api/?name=' + review.client?.firstName" class="w-6 h-6 rounded-full" />
                  <p class="text-xs font-semibold text-[var(--color-text-primary)]">{{ review.client?.firstName }}</p>
                  <div class="flex items-center gap-0.5 ml-auto">
                    <i *ngFor="let s of [1,2,3,4,5]" class="text-xs"
                       [ngClass]="s <= review.rating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'"></i>
                  </div>
                </div>
                <p class="text-xs text-[var(--color-text-secondary)] line-clamp-2">{{ review.comment }}</p>
              </div>
              <app-empty-state *ngIf="!recentReviews.length" icon="ri-star-line" title="No reviews yet" subtitle=""></app-empty-state>
            </div>

          </div>
        </div>

      </div>
    </div>
  `,
})
export class BeauticianDashboardComponent implements OnInit {
  stats: any = null;
  todayBookings: any[] = [];
  recentReviews: any[] = [];
  loading = true;
  today = new Date();
  user: any = null;

  get greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  constructor(private http: HttpClient, public router: Router) {}

  ngOnInit() {
    const userStr = localStorage.getItem('beautyHub_user');
    if (userStr) this.user = JSON.parse(userStr);

    this.http.get<any>(`${environment.apiUrl}/beauticians/dashboard`).subscribe({
      next: (res) => {
        this.stats = res.data?.stats;
        this.todayBookings = res.data?.todayBookings || [];
        this.recentReviews = res.data?.recentReviews || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getStatusClass(s: string) {
    const m: any = { PENDING: 'badge-warning', CONFIRMED: 'badge-info', COMPLETED: 'badge-success', CANCELLED: 'badge-error' };
    return m[s] || '';
  }

  confirmBooking(booking: any) {
    this.http.patch(`${environment.apiUrl}/bookings/${booking.id}/confirm`, {}).subscribe({
      next: () => booking.status = 'CONFIRMED'
    });
  }

  getServiceNames(services: any[]): string {
  return (services || [])
    .map(s => s?.service?.name || s?.name || '')
    .filter(Boolean)
    .join(' + ');
}
}
