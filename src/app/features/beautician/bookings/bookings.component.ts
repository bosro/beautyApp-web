import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-beautician-bookings",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 space-y-3"
      >
        <div class="flex items-center justify-between">
          <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
            Manage Bookings
          </h1>
          <div class="flex items-center gap-2">
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterBookings()"
              type="text"
              placeholder="Search client..."
              class="form-input text-sm py-2 px-3 w-40"
            />
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-[var(--color-background)] p-1 rounded-xl">
          <button
            *ngFor="let tab of tabs"
            (click)="setActiveTab(tab.value)"
            class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
            [ngClass]="
              activeTab === tab.value
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)]'
            "
          >
            {{ tab.label }}
            <span *ngIf="getCount(tab.value)" class="ml-1 text-[10px]"
              >({{ getCount(tab.value) }})</span
            >
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="p-4 space-y-3">
        <div
          *ngFor="let i of [1, 2, 3, 4]"
          class="skeleton h-36 rounded-xl"
        ></div>
      </div>

      <app-empty-state
        *ngIf="!loading && filteredBookings.length === 0"
        icon="ri-calendar-line"
        [title]="'No ' + activeTab.toLowerCase() + ' bookings'"
        [subtitle]="'Your ' + activeTab.toLowerCase() + ' bookings will appear here.'"
      >
      </app-empty-state>

      <div
        *ngIf="!loading && filteredBookings.length > 0"
        class="p-4 space-y-3"
      >
        <div *ngFor="let booking of filteredBookings" class="card p-4">
          <!-- Header: client + status -->
          <div class="flex gap-3 mb-3">
            <img
              [src]="
                booking.customer?.avatar ||
                'https://ui-avatars.com/api/?name=' + (booking.customer?.name || 'C')
              "
              class="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            />

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p
                  class="font-semibold text-[var(--color-text-primary)] truncate"
                >
                  {{ booking.customer?.name || 'Customer' }}
                </p>
                <span
                  class="badge badge-sm flex-shrink-0"
                  [ngClass]="getStatusClass(booking.status)"
                  >{{ booking.status }}</span
                >
              </div>
              <p *ngIf="booking.customer?.phone" class="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {{ booking.customer.phone }}
              </p>
            </div>
          </div>

          <!-- Service + price -->
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-medium text-[var(--color-text-primary)]">
              {{ booking.service?.name || 'Service' }}
            </p>
            <p class="text-sm font-bold text-[var(--color-primary)]">
              GH₵ {{ booking.price | number: "1.2-2" }}
            </p>
          </div>

          <!-- Date + time -->
          <p class="text-xs text-[var(--color-text-secondary)] mb-2">
            <i class="ri-calendar-line mr-1"></i>{{ booking.date | date: "EEE, MMM d, y" }}
            &nbsp;·&nbsp;
            <i class="ri-time-line mr-1"></i>{{ booking.time }}
          </p>

          <!-- Note -->
          <div
            *ngIf="booking.note"
            class="mt-2 mb-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20"
          >
            <p class="text-xs text-[var(--color-text-muted)] italic">
              "{{ booking.note }}"
            </p>
          </div>

          <!-- Actions: PENDING -->
          <div *ngIf="booking.status === 'PENDING'" class="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
            <button
              (click)="openActionModal(booking, 'decline')"
              [disabled]="updating[booking.id]"
              class="flex-1 text-sm py-2 border border-red-400 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Decline
            </button>
            <button
              (click)="openActionModal(booking, 'accept')"
              [disabled]="updating[booking.id]"
              class="flex-1 text-sm py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <span *ngIf="!updating[booking.id]">Accept</span>
              <span *ngIf="updating[booking.id]" class="flex items-center justify-center gap-1">
                <i class="ri-loader-4-line animate-spin text-xs"></i> Accepting...
              </span>
            </button>
          </div>

          <!-- Actions: CONFIRMED -->
          <div *ngIf="booking.status === 'CONFIRMED'" class="flex gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
            <button
              (click)="openActionModal(booking, 'decline')"
              [disabled]="updating[booking.id]"
              class="text-sm px-3 py-2 border border-red-400 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              (click)="openActionModal(booking, 'complete')"
              [disabled]="updating[booking.id]"
              class="flex-1 text-sm py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span *ngIf="!updating[booking.id]">Mark as Completed</span>
              <span *ngIf="updating[booking.id]" class="flex items-center justify-center gap-1">
                <i class="ri-loader-4-line animate-spin text-xs"></i> Updating...
              </span>
            </button>
          </div>

          <!-- View details link -->
          <button
            (click)="viewDetails(booking.id)"
            class="mt-2 w-full text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-center py-1"
          >
            View full details →
          </button>
        </div>
      </div>

      <!-- Confirm Action Modal -->
      <app-confirm-modal
        *ngIf="showActionModal"
        [title]="modalAction === 'accept' ? 'Accept Booking' : modalAction === 'complete' ? 'Complete Booking' : 'Cancel Booking'"
        [message]="
          modalAction === 'accept'
            ? 'Confirm booking from ' + selectedBooking?.customer?.name + '?'
            : modalAction === 'complete'
            ? 'Mark this booking as completed?'
            : 'Cancel booking from ' + selectedBooking?.customer?.name + '?'
        "
        [confirmText]="modalAction === 'accept' ? 'Accept' : modalAction === 'complete' ? 'Complete' : 'Cancel Booking'"
        [type]="modalAction === 'accept' || modalAction === 'complete' ? 'success' : 'error'"
        [loading]="updating[selectedBooking?.id]"
        (confirmed)="confirmAction()"
        (cancelled)="closeActionModal()"
      >
      </app-confirm-modal>
    </div>
  `,
})
export class BeauticianBookingsComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  loading = true;
  activeTab = "PENDING";
  searchQuery = "";

  showActionModal = false;
  selectedBooking: any = null;
  modalAction: "accept" | "decline" | "complete" | null = null;

  // Track per-booking update state so other cards don't gray out
  updating: Record<string, boolean> = {};

  tabs = [
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    // Uses the same endpoint as mobile: GET /bookings/beautician/:id
    // The auth interceptor attaches the token; the backend filters by the logged-in beautician.
    this.http.get<any>(`${environment.apiUrl}/beauticians/bookings`).subscribe({
      next: (res) => {
        // Mobile interface shows: res.data.bookings (BookingsResponse shape)
        this.bookings = res.data?.bookings || [];
        this.filterBookings();
        this.loading = false;
      },
      error: () => {
        this.toast.error("Failed to load bookings");
        this.loading = false;
      },
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.filterBookings();
  }

  filterBookings() {
    this.filteredBookings = this.bookings.filter((b) => {
      const matchStatus = b.status === this.activeTab;
      const matchSearch =
        !this.searchQuery ||
        (b.customer?.name || "")
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  getCount(status: string) {
    return this.bookings.filter((b) => b.status === status).length;
  }

  getStatusClass(s: string) {
    const m: Record<string, string> = {
      PENDING: "badge-warning",
      CONFIRMED: "badge-info",
      COMPLETED: "badge-success",
      CANCELLED: "badge-error",
    };
    return m[s] || "";
  }

  openActionModal(booking: any, action: "accept" | "decline" | "complete") {
    this.selectedBooking = booking;
    this.modalAction = action;
    this.showActionModal = true;
  }

  closeActionModal() {
    this.showActionModal = false;
    this.selectedBooking = null;
    this.modalAction = null;
  }

  confirmAction() {
    if (!this.selectedBooking || !this.modalAction) return;

    const id = this.selectedBooking.id;
    const statusMap: Record<string, string> = {
      accept: "CONFIRMED",
      decline: "CANCELLED",
      complete: "COMPLETED",
    };
    const newStatus = statusMap[this.modalAction];

    this.updating[id] = true;
    this.showActionModal = false;

    const body: any = { status: newStatus };
    if (newStatus === "CANCELLED") {
      body.cancellationReason = "Declined by beautician";
    }

    // Matches mobile: PUT /bookings/:id/status with { status, cancellationReason? }
    this.http
      .put(`${environment.apiUrl}/bookings/${id}/status`, body)
      .subscribe({
        next: () => {
          // Optimistically update in place — same pattern as mobile refetch
          const booking = this.bookings.find((b) => b.id === id);
          if (booking) booking.status = newStatus;
          this.filterBookings();

          const messages: Record<string, string> = {
            CONFIRMED: `Booking accepted for ${this.selectedBooking?.customer?.name}`,
            CANCELLED: `Booking cancelled`,
            COMPLETED: `Booking marked as completed`,
          };
          this.toast.success(messages[newStatus] || "Booking updated");
          this.updating[id] = false;
          this.closeActionModal();
        },
        error: (err) => {
          this.toast.error(
            err.error?.message || "Failed to update booking",
          );
          this.updating[id] = false;
          this.closeActionModal();
        },
      });
  }

  viewDetails(bookingId: string) {
    this.router.navigate(["/beautician/bookings", bookingId]);
  }
}