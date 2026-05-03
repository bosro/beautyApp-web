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
    <div class="page-enter px-4 lg:px-6 py-4">
      <!-- Header -->
      <div class="mb-5">
        <h1 class="text-2xl font-bold mb-0.5" style="color: var(--color-text-primary)">My Bookings</h1>
        <p class="text-sm" style="color: var(--color-text-secondary)">Manage your appointments</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-5 overflow-x-auto pb-1">
        <button
          *ngFor="let tab of tabs"
          (click)="switchTab(tab.value)"
          class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          [style.background-color]="activeTab === tab.value ? '#1a1a1a' : 'var(--color-bg-secondary)'"
          [style.color]="activeTab === tab.value ? 'white' : 'var(--color-text-secondary)'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="space-y-3">
        <div class="skeleton h-36 rounded-xl" *ngFor="let _ of [1,2,3]"></div>
      </div>

      <!-- Booking cards -->
      <div *ngIf="!loading" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          *ngFor="let booking of bookings"
          class="rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
          style="background-color: var(--color-bg-secondary)"
          (click)="goToDetail(booking.id)"
        >
          <!-- Status + Date -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span
                class="w-2 h-2 rounded-full"
                [style.background-color]="statusColor(booking.status)"
              ></span>
              <span class="text-xs font-medium" style="color: var(--color-text-secondary)">
                {{ booking.date | date:'MMM d' }} · {{ booking.time }}
              </span>
            </div>
            <span
              class="badge text-xs"
              [style.background-color]="statusColor(booking.status) + '20'"
              [style.color]="statusColor(booking.status)"
            >
              {{ booking.status | titlecase }}
            </span>
          </div>

          <!-- Salon info -->
          <div class="flex gap-3">
            <div class="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden">
              <img
                [src]="'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'"
                alt="salon"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-sm truncate" style="color: var(--color-text-primary)">
                {{ booking.beautician.businessName || 'Salon' }}
              </p>
              <p class="text-xs mt-0.5 truncate" style="color: var(--color-text-secondary)">
                <i class="ri-map-pin-2-line"></i>
                {{ booking.beautician.businessAddress }}
              </p>
              <p class="text-xs mt-1" style="color: var(--color-primary)">
                {{ booking.service.name }}
              </p>
              <p class="text-sm font-bold mt-1" style="color: var(--color-text-primary)">
                GHS {{ booking.price.toFixed(2) }}
              </p>
            </div>
          </div>

          <!-- Booking number -->
          <div class="mt-3 pt-3 border-t flex items-center justify-between"
            style="border-color: var(--color-border-light)">
            <p class="text-xs" style="color: var(--color-text-secondary)">
              #{{ booking.bookingNumber }}
            </p>
            <span class="text-xs font-medium" style="color: var(--color-primary)">
              View details →
            </span>
          </div>

          <!-- Actions for PENDING -->
          <div *ngIf="booking.status === 'PENDING'"
            class="mt-3 grid grid-cols-2 gap-2" (click)="$event.stopPropagation()">
            <button
              (click)="cancel(booking)"
              class="py-2 rounded-xl text-xs font-semibold border transition-all"
              style="border-color: var(--color-primary); color: var(--color-primary)"
              [disabled]="actionLoading[booking.id]"
            >
              <span class="spinner" *ngIf="actionLoading[booking.id]"></span>
              Cancel
            </button>
            <button
              (click)="reschedule(booking)"
              class="py-2 rounded-xl text-xs font-semibold text-white"
              style="background-color: #1a1a1a"
            >
              Reschedule
            </button>
          </div>

          <!-- Leave review for COMPLETED -->
          <div *ngIf="booking.status === 'COMPLETED' && !booking.review"
            class="mt-3" (click)="$event.stopPropagation()">
            <button
              (click)="leaveReview(booking)"
              class="w-full py-2 rounded-xl text-xs font-semibold text-white"
              style="background-color: #1a1a1a"
            >
              <i class="ri-star-line mr-1"></i>Leave Review
            </button>
          </div>

          <div *ngIf="booking.status === 'COMPLETED' && booking.review"
            class="mt-3 flex items-center gap-2 p-2 rounded-lg"
            style="background-color: color-mix(in srgb, var(--color-success) 10%, transparent)">
            <i class="ri-checkbox-circle-fill text-green-500 text-sm"></i>
            <span class="text-xs font-medium text-green-600">Review submitted</span>
          </div>
        </div>
      </div>

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

      <div class="h-8"></div>
    </div>
  `,
})
export class BookingsComponent implements OnInit {
  activeTab: Tab = 'PENDING';
  loading = true;
  bookings: Booking[] = [];
  showCancelModal = false;
  selectedBooking: Booking | null = null;
  actionLoading: Record<string, boolean> = {};

  tabs = [
    { label: 'Pending', value: 'PENDING' as Tab },
    { label: 'Confirmed', value: 'CONFIRMED' as Tab },
    { label: 'Completed', value: 'COMPLETED' as Tab },
    { label: 'Cancelled', value: 'CANCELLED' as Tab },
  ];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

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
      PENDING: '#FF9800',
      CONFIRMED: '#2196F3',
      COMPLETED: '#4CAF50',
      CANCELLED: '#F44336',
    };
    return map[status] || '#666';
  }

  goToDetail(id: string): void {
    this.router.navigate(['/client/bookings', id]);
  }

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
