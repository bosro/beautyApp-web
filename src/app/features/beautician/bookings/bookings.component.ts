// ============================================================
// beautician-bookings.component.ts  —  Enhanced UI
// ============================================================

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
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 pt-3 pb-3 space-y-3"
      >
        <div class="flex items-center justify-between gap-3">
          <h1
            class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
          >
            Bookings
          </h1>
          <div class="relative flex-1 max-w-[200px]">
            <i
              class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]"
            ></i>
            <input
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterBookings()"
              type="text"
              placeholder="Search client…"
              class="form-input text-sm py-2 pl-8 pr-3 rounded-xl w-full"
            />
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-[var(--color-background)] p-1 rounded-xl">
          <button
            *ngFor="let tab of tabs"
            (click)="setActiveTab(tab.value)"
            class="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
            [ngClass]="
              activeTab === tab.value
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            "
          >
            {{ tab.label }}
            <span
              *ngIf="getCount(tab.value)"
              class="ml-0.5 text-[10px] opacity-80"
              >({{ getCount(tab.value) }})</span
            >
          </button>
        </div>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div
          *ngFor="let i of [1, 2, 3]"
          class="skeleton h-40 rounded-2xl"
        ></div>
      </div>

      <!-- ── Empty ── -->
      <app-empty-state
        *ngIf="!loading && filteredBookings.length === 0"
        icon="ri-calendar-line"
        [title]="'No ' + activeTab.toLowerCase() + ' bookings'"
        [subtitle]="
          'Your ' + activeTab.toLowerCase() + ' bookings will appear here.'
        "
      ></app-empty-state>

      <!-- ── List ── -->
      <div
        *ngIf="!loading && filteredBookings.length > 0"
        class="p-4 space-y-3 max-w-2xl mx-auto"
      >
        <div
          *ngFor="let booking of filteredBookings"
          class="card shadow-none rounded-2xl p-4 space-y-3"
        >
          <!-- Top row: avatar + name + status -->
          <div class="flex items-start gap-3">
            <img
              [src]="
                booking.customer?.avatar ||
                'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(booking.customer?.name || 'C') +
                  '&background=random'
              "
              class="w-12 h-12 rounded-xl object-cover flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p
                  class="font-bold text-sm text-[var(--color-text-primary)] truncate"
                >
                  {{ booking.customer?.name || "Customer" }}
                </p>
                <span
                  class="badge badge-sm flex-shrink-0 text-[10px] px-2 py-0.5 rounded-lg font-semibold"
                  [ngClass]="getStatusClass(booking.status)"
                  >{{ booking.status }}</span
                >
              </div>
              <p
                *ngIf="booking.customer?.phone"
                class="text-xs text-[var(--color-text-secondary)] mt-0.5"
              >
                {{ booking.customer.phone }}
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="h-px bg-[var(--color-border)]"></div>

          <!-- Service + meta -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <div
                class="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
              >
                <i
                  class="ri-scissors-2-line text-[var(--color-primary)] text-xs"
                ></i>
              </div>
              <div class="min-w-0">
                <p
                  class="text-sm font-semibold text-[var(--color-text-primary)] truncate"
                >
                  {{ booking.service?.name || "Service" }}
                </p>
                <p class="text-xs text-[var(--color-text-secondary)]">
                  {{ booking.date | date: "EEE, MMM d" }} · {{ booking.time }}
                </p>
              </div>
            </div>
            <p
              class="text-sm font-bold text-[var(--color-primary)] flex-shrink-0 ml-2"
            >
              GH₵{{ booking.price | number: "1.2-2" }}
            </p>
          </div>

          <!-- Note -->
          <div
            *ngIf="booking.note"
            class="flex items-start gap-2 p-2.5 rounded-xl"
            style="background: color-mix(in srgb, #FF9800 10%, transparent)"
          >
            <i
              class="ri-sticky-note-line text-amber-500 text-xs mt-0.5 flex-shrink-0"
            ></i>
            <p
              class="text-xs text-[var(--color-text-secondary)] italic leading-relaxed"
            >
              "{{ booking.note }}"
            </p>
          </div>

          <!-- Actions: PENDING -->
          <div *ngIf="booking.status === 'PENDING'" class="flex gap-2 pt-1">
            <button
              (click)="openActionModal(booking, 'decline')"
              [disabled]="updating[booking.id]"
              class="flex-1 text-sm py-2.5 border border-red-400 text-red-500 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Decline
            </button>
            <button
              (click)="openActionModal(booking, 'accept')"
              [disabled]="updating[booking.id]"
              class="flex-1 text-sm py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <i
                *ngIf="updating[booking.id]"
                class="ri-loader-4-line animate-spin text-xs"
              ></i>
              {{ updating[booking.id] ? "Accepting…" : "Accept" }}
            </button>
          </div>

          <!-- Actions: CONFIRMED -->
          <div *ngIf="booking.status === 'CONFIRMED'" class="flex gap-2 pt-1">
            <button
              (click)="openActionModal(booking, 'decline')"
              [disabled]="updating[booking.id]"
              class="px-4 text-sm py-2.5 border border-red-400 text-red-500 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              (click)="openActionModal(booking, 'complete')"
              [disabled]="updating[booking.id]"
              class="flex-1 text-sm py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <i
                *ngIf="updating[booking.id]"
                class="ri-loader-4-line animate-spin text-xs"
              ></i>
              {{ updating[booking.id] ? "Updating…" : "Mark as Completed" }}
            </button>
          </div>

          <!-- View details -->
          <button
            (click)="viewDetails(booking.id)"
            class="w-full text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors text-center py-1 flex items-center justify-center gap-1"
          >
            View full details <i class="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>

      <!-- Confirm Action Modal -->
      <app-confirm-modal
        [visible]="showActionModal"
        [title]="
          modalAction === 'accept'
            ? 'Accept Booking'
            : modalAction === 'complete'
              ? 'Complete Booking'
              : 'Cancel Booking'
        "
        [message]="
          modalAction === 'accept'
            ? 'Confirm booking from ' + selectedBooking?.customer?.name + '?'
            : modalAction === 'complete'
              ? 'Mark this booking as completed?'
              : 'Cancel booking from ' + selectedBooking?.customer?.name + '?'
        "
        [confirmText]="
          modalAction === 'accept'
            ? 'Accept'
            : modalAction === 'complete'
              ? 'Complete'
              : 'Cancel Booking'
        "
        [type]="
          modalAction === 'accept' || modalAction === 'complete'
            ? 'success'
            : 'error'
        "
        [loading]="updating[selectedBooking?.id]"
        (confirmed)="confirmAction()"
        (cancelled)="closeActionModal()"
      ></app-confirm-modal>
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

  encodeURIComponent = encodeURIComponent;

  loadBookings() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/beauticians/bookings`).subscribe({
      next: (res) => {
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
    if (newStatus === "CANCELLED")
      body.cancellationReason = "Declined by beautician";
    this.http
      .put(`${environment.apiUrl}/bookings/${id}/status`, body)
      .subscribe({
        next: () => {
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
          this.toast.error(err.error?.message || "Failed to update booking");
          this.updating[id] = false;
          this.closeActionModal();
        },
      });
  }

  viewDetails(bookingId: string) {
    this.router.navigate(["/beautician/bookings", bookingId]);
  }
}
