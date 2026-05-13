// bookings.component.ts — replace your entire file with this

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { Booking, BookingStatus } from '../../../core/models';
import { environment } from '../../../../environments/environment';

type Tab = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

@Component({
  selector: 'app-bookings',
  template: `
    <div class="bookings-page">

      <!-- Header -->
      <div class="bookings-header">
        <h1 class="bookings-title">My Bookings</h1>
        <p class="bookings-sub">Manage your appointments</p>
      </div>

      <!-- Tabs -->
      <div class="tabs-wrap">
        <div class="tabs-row">
          <button
            *ngFor="let tab of tabs"
            (click)="switchTab(tab.value)"
            class="tab-btn"
            [class.tab-active]="activeTab === tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div *ngIf="loading" class="bookings-list">
        <div *ngFor="let _ of [1,2,3]" class="booking-skeleton">
          <div class="skel-top">
            <div class="skel-line w-24"></div>
            <div class="skel-badge"></div>
          </div>
          <div class="skel-body">
            <div class="skel-img"></div>
            <div class="skel-info">
              <div class="skel-line w-40"></div>
              <div class="skel-line w-28" style="margin-top:6px"></div>
              <div class="skel-line w-20" style="margin-top:6px"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking cards -->
      <div *ngIf="!loading && bookings.length > 0" class="bookings-list">
        <div
          *ngFor="let booking of bookings"
          class="booking-card"
          (click)="goToDetail(booking.id)"
        >
          <!-- Top row: date + status badge -->
          <div class="booking-top">
            <div class="booking-date-wrap">
              <div class="booking-date-icon" [style.background-color]="statusColor(booking.status) + '18'">
                <i class="ri-calendar-event-line" [style.color]="statusColor(booking.status)"></i>
              </div>
              <div>
                <p class="booking-date">{{ booking.date | date:'EEE, MMM d' }}</p>
                <p class="booking-time">{{ booking.time }}</p>
              </div>
            </div>
            <span class="status-badge"
              [style.background-color]="statusColor(booking.status) + '18'"
              [style.color]="statusColor(booking.status)"
            >
              <span class="status-dot" [style.background-color]="statusColor(booking.status)"></span>
              {{ booking.status | titlecase }}
            </span>
          </div>

          <!-- Divider -->
          <div class="booking-divider"></div>

          <!-- Salon row -->
          <div class="salon-row">
            <div class="salon-img">
              <img
                [src]="booking.beautician.profileImage ||
                  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'"
                alt="salon"
              />
            </div>
            <div class="salon-info">
              <p class="salon-name">{{ booking.beautician.businessName || 'Salon' }}</p>
              <p class="salon-address">
                <i class="ri-map-pin-2-line"></i>
                {{ booking.beautician.businessAddress || booking.beautician.city }}
              </p>
              <div class="service-row">
                <span class="service-chip">{{ booking.service.name }}</span>
                <span class="booking-price">GHS {{ booking.price.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Footer: booking number + view -->
          <div class="booking-footer">
            <p class="booking-number">#{{ booking.bookingNumber }}</p>
            <span class="view-link">View details <i class="ri-arrow-right-line"></i></span>
          </div>

          <!-- PENDING actions -->
          <div *ngIf="booking.status === 'PENDING'"
            class="booking-actions"
            (click)="$event.stopPropagation()">
            <button
              (click)="cancel(booking)"
              class="action-btn action-outline"
              [disabled]="actionLoading[booking.id]"
            >
              <i class="ri-close-line"></i> Cancel
            </button>
            <button
              (click)="reschedule(booking)"
              class="action-btn action-dark"
            >
              <i class="ri-calendar-2-line"></i> Reschedule
            </button>
          </div>

          <!-- COMPLETED — leave review -->
          <div *ngIf="booking.status === 'COMPLETED' && !booking.review"
            class="booking-actions"
            (click)="$event.stopPropagation()">
            <button (click)="leaveReview(booking)" class="action-btn action-dark w-full">
              <i class="ri-star-line"></i> Leave a Review
            </button>
          </div>

          <!-- COMPLETED — already reviewed -->
          <div *ngIf="booking.status === 'COMPLETED' && booking.review"
            class="review-done">
            <i class="ri-checkbox-circle-fill"></i>
            <span>Review submitted</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <app-empty-state
        *ngIf="!loading && bookings.length === 0"
        icon="ri-calendar-event-line"
        [title]="'No ' + activeTab.toLowerCase() + ' bookings'"
        subtitle="Your appointments will appear here"
      ></app-empty-state>

      <!-- Cancel modal -->
      <app-confirm-modal
        [visible]="showCancelModal"
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking?"
        type="warning"
        confirmText="Yes, Cancel"
        cancelText="Keep it"
        [showCancel]="true"
        (confirmed)="confirmCancel()"
        (closed)="showCancelModal = false; selectedBooking = null"
      ></app-confirm-modal>

    </div>
  `,
  styles: [`
    .bookings-page {
      min-height: 100vh;
      background-color: var(--color-bg-primary);
      padding-bottom: 100px;
    }

    /* ---- HEADER ---- */
    .bookings-header {
      padding: 20px 20px 4px;
    }
    .bookings-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .bookings-sub {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-top: 2px;
    }

    /* ---- TABS ---- */
    .tabs-wrap {
      padding: 12px 20px 0;
      overflow-x: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .tabs-wrap::-webkit-scrollbar { display: none; }
    .tabs-row {
      display: flex;
      gap: 8px;
      background-color: var(--color-bg-secondary);
      border-radius: 16px;
      padding: 4px;
    }
    .tab-btn {
      flex: 1;
      padding: 10px 8px;
      border-radius: 12px;
      border: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      background: transparent;
      color: var(--color-text-secondary);
      font-family: inherit;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab-active {
      background-color: #1a1a1a;
      color: white;
    }

    /* ---- LIST ---- */
    .bookings-list {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* ---- SKELETON ---- */
    .booking-skeleton {
      border-radius: 20px;
      background-color: var(--color-bg-secondary);
      padding: 16px;
    }
    .skel-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .skel-body { display: flex; gap: 12px; }
    .skel-img {
      width: 72px; height: 72px; border-radius: 14px;
      background: linear-gradient(90deg, #e8e8e8 25%, #d8d8d8 50%, #e8e8e8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
      flex-shrink: 0;
    }
    .skel-info { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 0; }
    .skel-line {
      height: 12px; border-radius: 6px;
      background: linear-gradient(90deg, #e8e8e8 25%, #d8d8d8 50%, #e8e8e8 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s infinite;
    }
    .skel-badge { width: 80px; height: 26px; border-radius: 20px;
      background: linear-gradient(90deg, #e8e8e8 25%, #d8d8d8 50%, #e8e8e8 75%);
      background-size: 200% 100%; animation: shimmer 1.2s infinite;
    }
    .w-24 { width: 96px; }
    .w-28 { width: 112px; }
    .w-40 { width: 160px; }
    .w-20 { width: 80px; }
    @keyframes shimmer { to { background-position: -200% 0; } }

    /* ---- BOOKING CARD ---- */
    .booking-card {
      background-color: var(--color-bg-secondary);
      border-radius: 20px;
      padding: 16px;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .booking-card:active { transform: scale(0.985); }

    /* top row */
    .booking-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .booking-date-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .booking-date-icon {
      width: 38px; height: 38px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .booking-date-icon i { font-size: 18px; }
    .booking-date {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .booking-time {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 1px;
    }

    /* status badge */
    .status-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .status-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* divider */
    .booking-divider {
      height: 1px;
      background-color: var(--color-border-light);
      margin-bottom: 14px;
    }

    /* salon row */
    .salon-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }
    .salon-img {
      width: 72px; height: 72px;
      border-radius: 14px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .salon-img img { width: 100%; height: 100%; object-fit: cover; }

    .salon-info { flex: 1; min-width: 0; }
    .salon-name {
      font-size: 15px;
      font-weight: 700;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .salon-address {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 3px;
    }
    .salon-address i { font-size: 12px; }

    .service-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .service-chip {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 20px;
      background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color: var(--color-primary);
    }
    .booking-price {
      font-size: 14px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-left: auto;
    }

    /* footer */
    .booking-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid var(--color-border-light);
    }
    .booking-number {
      font-size: 12px;
      color: var(--color-text-secondary);
    }
    .view-link {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .view-link i { font-size: 14px; }

    /* actions */
    .booking-actions {
      display: flex;
      gap: 10px;
      margin-top: 14px;
    }
    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 11px 8px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      border: none;
      transition: opacity 0.2s;
    }
    .action-btn:active { opacity: 0.75; }
    .action-btn.w-full { flex: unset; width: 100%; }
    .action-outline {
      background-color: var(--color-bg-primary);
      color: var(--color-text-primary);
      border: 1.5px solid var(--color-border-light);
    }
    .action-dark {
      background-color: #1a1a1a;
      color: white;
    }

    /* reviewed */
    .review-done {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      background-color: rgba(76, 175, 80, 0.08);
      font-size: 13px;
      font-weight: 600;
      color: #4CAF50;
    }
    .review-done i { font-size: 16px; }
  `]
})
export class BookingsComponent implements OnInit {
  activeTab: Tab = 'PENDING';
  loading = true;
  bookings: Booking[] = [];
  showCancelModal = false;
  selectedBooking: Booking | null = null;
  actionLoading: Record<string, boolean> = {};

  tabs = [
    { label: 'Pending',   value: 'PENDING'   as Tab },
    { label: 'Confirmed', value: 'CONFIRMED' as Tab },
    { label: 'Completed', value: 'COMPLETED' as Tab },
    { label: 'Cancelled', value: 'CANCELLED' as Tab },
  ];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadBookings(); }

  switchTab(tab: Tab): void {
    this.activeTab = tab;
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/bookings/my-bookings`, {
      params: { status: this.activeTab, limit: '50' },
    }).subscribe({
      next: (res) => {
        this.bookings = res?.data?.bookings || [];
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  statusColor(status: BookingStatus): string {
    const map: Record<string, string> = {
      PENDING:   '#FF9800',
      CONFIRMED: '#2196F3',
      COMPLETED: '#4CAF50',
      CANCELLED: '#F44336',
    };
    return map[status] || '#666';
  }

  goToDetail(id: string): void { this.router.navigate(['/client/bookings', id]); }

  cancel(booking: Booking): void {
    this.selectedBooking = booking;
    this.showCancelModal = true;
  }

  confirmCancel(): void {
    if (!this.selectedBooking) return;
    const id = this.selectedBooking.id;
    this.actionLoading[id] = true;
    this.showCancelModal = false;
    this.http.put(`${environment.apiUrl}/bookings/${id}/status`, {
      status: 'CANCELLED',
      cancellationReason: 'Cancelled by customer',
    }).subscribe({
      next: () => {
        this.toast.success('Booking cancelled');
        this.actionLoading[id] = false;
        this.loadBookings();
      },
      error: (err) => {
        this.actionLoading[id] = false;
        this.toast.error(err?.error?.message || 'Failed to cancel');
      },
    });
  }

  reschedule(booking: Booking): void {
    this.router.navigate(['/client/salon', booking.beauticianId]);
  }

  leaveReview(booking: Booking): void {
    this.router.navigate(['/client/salon', booking.beauticianId], {
      queryParams: { review: booking.id },
    });
  }
}