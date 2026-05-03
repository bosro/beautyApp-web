import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-earnings',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Earnings</h1>
        <select [(ngModel)]="selectedPeriod" (ngModelChange)="loadEarnings()" class="form-input text-sm py-1.5 w-36">
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4 max-w-3xl mx-auto">
        <div class="skeleton h-36 rounded-2xl"></div>
        <div class="skeleton h-48 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-3xl mx-auto space-y-4">

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="stat-card col-span-2 lg:col-span-1">
            <p class="text-xs text-[var(--color-text-muted)] mb-1">Total Earned</p>
            <p class="text-2xl font-black text-[var(--color-primary)]">GH₵ {{ earnings?.totalRevenue | number:'1.0-0' }}</p>
            <p class="text-xs text-green-500 mt-1 flex items-center gap-1">
              <i class="ri-arrow-up-line"></i> {{ earnings?.growthPercent || 0 }}% vs last period
            </p>
          </div>
          <div class="stat-card">
            <p class="text-xs text-[var(--color-text-muted)] mb-1">Bookings</p>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">{{ earnings?.totalBookings || 0 }}</p>
          </div>
          <div class="stat-card">
            <p class="text-xs text-[var(--color-text-muted)] mb-1">Avg per Booking</p>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">GH₵ {{ earnings?.avgBookingValue | number:'1.0-0' }}</p>
          </div>
          <div class="stat-card">
            <p class="text-xs text-[var(--color-text-muted)] mb-1">Pending Payout</p>
            <p class="text-2xl font-bold text-amber-500">GH₵ {{ earnings?.pendingPayout | number:'1.0-0' }}</p>
          </div>
        </div>

        <!-- Top Services -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Top Performing Services</h3>
          <div *ngFor="let svc of earnings?.topServices; let i = index" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="text-[var(--color-text-primary)]">{{ svc.name }}</span>
              <div class="flex items-center gap-3">
                <span class="text-[var(--color-text-muted)]">{{ svc.bookings }} bookings</span>
                <span class="font-semibold text-[var(--color-primary)]">GH₵ {{ svc.revenue | number:'1.0-0' }}</span>
              </div>
            </div>
            <div class="h-1.5 bg-[var(--color-background)] rounded-full overflow-hidden">
              <div class="h-full bg-[var(--color-primary)] rounded-full transition-all"
                [style.width.%]="(svc.revenue / (earnings?.topServices[0]?.revenue || 1)) * 100"></div>
            </div>
          </div>
          <app-empty-state *ngIf="!earnings?.topServices?.length" icon="ri-bar-chart-line" title="No data yet" subtitle=""></app-empty-state>
        </div>

        <!-- Payout History -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Payout History</h3>

          <app-empty-state
            *ngIf="!earnings?.payouts?.length"
            icon="ri-bank-line"
            title="No Payouts Yet"
            subtitle="Payouts are processed weekly.">
          </app-empty-state>

          <div *ngFor="let payout of earnings?.payouts" class="flex items-center gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
            <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <i class="ri-bank-line text-green-500"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ payout.reference }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">{{ payout.createdAt | date:'MMM d, y' }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-green-500">+GH₵ {{ payout.amount | number:'1.2-2' }}</p>
              <span class="text-xs badge badge-success">{{ payout.status }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class EarningsComponent implements OnInit {
  earnings: any = null;
  loading = true;
  selectedPeriod = 'month';

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadEarnings(); }

  loadEarnings() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/beauticians/earnings`, { params: { period: this.selectedPeriod } }).subscribe({
      next: (res) => { this.earnings = res.data; this.loading = false; },
      error: () => this.loading = false
    });
  }
}
