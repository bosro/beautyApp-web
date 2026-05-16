
// booking-details.component.ts
// NEW — mirrors mobile BeauticianBookingDetailsScreen exactly.
// API:
//   GET  /bookings/:id          → { data: { booking } }  (useBooking)
//   GET  /beauticians/customers/:id → { data: { stats } } (useCustomer for clientHistory)
//   PUT  /bookings/:id/status   → { status, cancellationReason? }

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-booking-details',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-32 lg:pb-8">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3">
        <button (click)="router.navigate(['/beautician/bookings'])"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]">
          <i class="ri-arrow-left-line text-xl text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Booking Details</h1>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-12 rounded-xl"></div>
        <div class="skeleton h-48 rounded-2xl"></div>
        <div class="skeleton h-36 rounded-2xl"></div>
      </div>

      <!-- Error -->
      <div *ngIf="!loading && !booking" class="flex flex-col items-center justify-center py-24 gap-3">
        <i class="ri-error-warning-line text-4xl text-[var(--color-text-muted)]"></i>
        <p class="text-[var(--color-text-secondary)]">Failed to load booking</p>
        <button (click)="load()" class="btn-primary text-sm px-4 py-2">Retry</button>
      </div>

      <div *ngIf="!loading && booking" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- Status banner — mirrors mobile statusBanner -->
        <div class="rounded-xl py-3 text-center font-bold text-sm"
          [ngStyle]="{ background: statusBg(booking.status), color: statusColor(booking.status) }">
          {{ booking.status }}
        </div>

        <!-- Client Information — mirrors mobile "Client Information" card -->
        <div class="card p-4 space-y-4">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Client Information</h3>

          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[var(--color-primary)]/10 flex items-center justify-center">
              <img *ngIf="booking.customer?.avatar" [src]="booking.customer.avatar" class="w-full h-full object-cover" />
              <i *ngIf="!booking.customer?.avatar" class="ri-user-line text-2xl text-[var(--color-primary)]"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-[var(--color-text-primary)]">{{ booking.customer?.name || 'Customer' }}</p>
              <p *ngIf="booking.customer?.phone" class="text-sm text-[var(--color-text-secondary)]">{{ booking.customer.phone }}</p>
              <p *ngIf="booking.customer?.email" class="text-sm text-[var(--color-text-secondary)]">{{ booking.customer.email }}</p>
            </div>
          </div>

          <!-- Contact action row — mirrors mobile contactActions -->
          <div class="flex gap-2">
            <a *ngIf="booking.customer?.phone" [href]="'tel:' + booking.customer.phone"
              class="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors">
              <i class="ri-phone-line text-[var(--color-primary)]"></i> Call
            </a>
            <a *ngIf="booking.customer?.phone" [href]="'sms:' + booking.customer.phone"
              class="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors">
              <i class="ri-message-line text-[var(--color-primary)]"></i> Message
            </a>
            <button (click)="viewClientProfile()"
              class="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors">
              <i class="ri-user-line text-[var(--color-primary)]"></i> Profile
            </button>
          </div>

          <!-- Client history stats — mirrors mobile clientHistoryContainer -->
          <div *ngIf="customerStats" class="flex items-center rounded-xl p-3 bg-[var(--color-background)]">
            <div class="flex-1 text-center">
              <p class="font-bold text-[var(--color-primary)]">{{ customerStats.totalVisits || 0 }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">Total Visits</p>
            </div>
            <div class="w-px h-8 bg-[var(--color-border)]"></div>
            <div class="flex-1 text-center">
              <p class="font-bold text-[var(--color-primary)]">GH₵ {{ (customerStats.totalSpent || 0) | number:'1.0-0' }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">Total Spent</p>
            </div>
            <div class="w-px h-8 bg-[var(--color-border)]"></div>
            <div class="flex-1 text-center">
              <p class="text-sm font-bold text-[var(--color-primary)]">{{ customerStats.lastVisit ? (customerStats.lastVisit | date:'MMM d') : 'N/A' }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">Last Visit</p>
            </div>
          </div>
        </div>

        <!-- Service Details — mirrors mobile "Service Details" card -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Service Details</h3>

          <div class="flex items-center gap-3" *ngFor="let row of serviceRows">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style="background: color-mix(in srgb, var(--color-primary) 12%, transparent)">
              <i [class]="row.icon + ' text-[var(--color-primary)]'"></i>
            </div>
            <div>
              <p class="text-xs text-[var(--color-text-secondary)]">{{ row.label }}</p>
              <p class="text-sm font-medium"
                [ngClass]="row.primary ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-text-primary)]'">
                {{ row.value }}
              </p>
            </div>
          </div>
        </div>

        <!-- Booking meta — mirrors mobile bookingNumberRow -->
        <div class="card p-4 space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-secondary)]">Booking Number</span>
            <span class="text-sm font-semibold text-[var(--color-primary)]">#{{ booking.bookingNumber }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-[var(--color-text-secondary)]">Booked On</span>
            <span class="text-sm text-[var(--color-text-primary)]">{{ booking.createdAt | date:'MMM d, y' }}</span>
          </div>
        </div>

        <!-- Special notes -->
        <div *ngIf="booking.note" class="card p-4">
          <h3 class="font-semibold text-[var(--color-text-primary)] mb-3">Special Notes</h3>
          <div class="flex gap-2 p-3 rounded-xl"
            style="background: color-mix(in srgb, #FF9800 12%, transparent)">
            <i class="ri-sticky-note-line text-amber-500 flex-shrink-0 mt-0.5"></i>
            <p class="text-sm text-[var(--color-text-primary)]">{{ booking.note }}</p>
          </div>
        </div>

        <!-- Payment breakdown — mirrors mobile "Payment Information" card -->
        <div class="card p-4 space-y-2">
          <h3 class="font-semibold text-[var(--color-text-primary)] mb-3">Payment Information</h3>
          <div class="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span class="text-sm text-[var(--color-text-secondary)]">Earnings</span>
            <span class="text-sm font-semibold text-[var(--color-primary)]">GH₵ {{ booking.beauticianEarnings | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span class="text-sm text-[var(--color-text-secondary)]">Commission</span>
            <span class="text-sm text-[var(--color-text-secondary)]">GH₵ {{ booking.commission | number:'1.2-2' }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-sm text-[var(--color-text-secondary)]">Total Price</span>
            <span class="text-sm font-semibold text-[var(--color-text-primary)]">GH₵ {{ booking.price | number:'1.2-2' }}</span>
          </div>
        </div>

        <!-- Cancellation info -->
        <div *ngIf="booking.status === 'CANCELLED' && booking.cancellationReason"
          class="card p-4 border-l-4 border-red-400">
          <h3 class="font-semibold text-red-500 mb-2">Cancellation Reason</h3>
          <p class="text-sm text-[var(--color-text-primary)]">{{ booking.cancellationReason }}</p>
          <p *ngIf="booking.cancelledAt" class="text-xs text-[var(--color-text-muted)] mt-2 italic">
            Cancelled on {{ booking.cancelledAt | date:'MMM d, y' }}
          </p>
        </div>
      </div>

      <!-- Sticky action footer — mirrors mobile actionButtonsContainer -->
      <div *ngIf="booking && (booking.status === 'PENDING' || booking.status === 'CONFIRMED')"
        class="fixed bottom-0 left-0 right-0 z-10 p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:max-w-2xl lg:mx-auto lg:mt-4">

        <!-- PENDING actions -->
        <div *ngIf="booking.status === 'PENDING'" class="flex gap-3">
          <button
            (click)="showCancelModal = true"
            [disabled]="updating"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-400 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
            <i class="ri-close-line"></i> Decline
          </button>
          <button
            (click)="showAcceptModal = true"
            [disabled]="updating"
            class="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-50">
            <i class="ri-check-line"></i> Accept
          </button>
        </div>

        <!-- CONFIRMED action -->
        <button
          *ngIf="booking.status === 'CONFIRMED'"
          (click)="showCompleteModal = true"
          [disabled]="updating"
          class="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
          <i *ngIf="updating" class="ri-loader-4-line animate-spin"></i>
          Mark as Completed
        </button>
      </div>

      <!-- Modals -->
      <app-confirm-modal *ngIf="showAcceptModal"
        title="Accept Booking"
        message="Confirm this booking?"
        confirmText="Accept"
        type="success"
        [loading]="updating"
        (confirmed)="updateStatus('CONFIRMED')"
        (cancelled)="showAcceptModal = false">
      </app-confirm-modal>

      <app-confirm-modal *ngIf="showCompleteModal"
        title="Complete Booking"
        message="Mark this booking as completed?"
        confirmText="Complete"
        type="success"
        [loading]="updating"
        (confirmed)="updateStatus('COMPLETED')"
        (cancelled)="showCompleteModal = false">
      </app-confirm-modal>

      <app-confirm-modal *ngIf="showCancelModal"
        title="Decline Booking"
        message="Are you sure you want to decline this booking? The client will be notified."
        confirmText="Decline Booking"
        type="error"
        [loading]="updating"
        (confirmed)="updateStatus('CANCELLED')"
        (cancelled)="showCancelModal = false">
      </app-confirm-modal>
    </div>
  `,
})
export class BookingDetailsComponent implements OnInit {
  bookingId = '';
  booking: any = null;
  customerStats: any = null;
  loading = true;
  updating = false;

  showAcceptModal = false;
  showCompleteModal = false;
  showCancelModal = false;

  get serviceRows() {
    if (!this.booking) return [];
    return [
      { icon: 'ri-scissors-2-line', label: 'Service', value: this.booking.service?.name || 'Service', primary: false },
      { icon: 'ri-calendar-line', label: 'Date', value: new Date(this.booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), primary: false },
      { icon: 'ri-time-line', label: 'Time', value: `${this.booking.time} (${this.booking.service?.duration || 0} mins)`, primary: false },
      { icon: 'ri-money-dollar-circle-line', label: 'Price', value: `GH₵ ${(this.booking.price || 0).toFixed(2)}`, primary: true },
    ];
  }

  constructor(
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load() {
    this.loading = true;
    // Matches mobile useBooking: GET /bookings/:id → { data: { booking } }
    this.http.get<any>(`${environment.apiUrl}/bookings/${this.bookingId}`).subscribe({
      next: (res) => {
        this.booking = res.data?.booking;
        this.loading = false;
        // Fetch customer stats if we have a customerId — mirrors mobile useCustomer
        if (this.booking?.customerId) {
          this.http.get<any>(`${environment.apiUrl}/beauticians/customers/${this.booking.customerId}`)
            .subscribe({ next: (r) => this.customerStats = r.data?.stats });
        }
      },
      error: () => {
        this.toast.error('Failed to load booking');
        this.loading = false;
      },
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: '#FF9800', CONFIRMED: '#2196F3', COMPLETED: '#4CAF50', CANCELLED: '#F44336',
    };
    return map[status] || 'var(--color-text-secondary)';
  }

  statusBg(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'rgba(255,152,0,0.12)',
      CONFIRMED: 'rgba(33,150,243,0.12)',
      COMPLETED: 'rgba(76,175,80,0.12)',
      CANCELLED: 'rgba(244,67,54,0.12)',
    };
    return map[status] || 'var(--color-background-secondary)';
  }

  updateStatus(status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') {
    this.updating = true;
    const body: any = { status };
    if (status === 'CANCELLED') body.cancellationReason = 'Declined by beautician';

    // Matches mobile: PUT /bookings/:id/status
    this.http.put<any>(`${environment.apiUrl}/bookings/${this.bookingId}/status`, body).subscribe({
      next: () => {
        this.booking.status = status;
        this.updating = false;
        this.showAcceptModal = false;
        this.showCompleteModal = false;
        this.showCancelModal = false;

        const messages: Record<string, string> = {
          CONFIRMED: 'Booking confirmed',
          COMPLETED: 'Booking marked as completed',
          CANCELLED: 'Booking declined',
        };
        this.toast.success(messages[status]);

        if (status === 'COMPLETED' || status === 'CANCELLED') {
          setTimeout(() => this.router.navigate(['/beautician/bookings']), 1200);
        }
      },
      error: (err) => {
        this.updating = false;
        this.toast.error(err.error?.message || 'Failed to update booking');
      },
    });
  }

  viewClientProfile() {
    if (this.booking?.customerId) {
      this.router.navigate(['/beautician/clients', this.booking.customerId]);
    }
  }
}