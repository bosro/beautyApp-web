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
            Bookings
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
            (click)="activeTab = tab.value; filterBookings()"
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
          class="skeleton h-28 rounded-xl"
        ></div>
      </div>

      <app-empty-state
        *ngIf="!loading && filteredBookings.length === 0"
        icon="ri-calendar-line"
        title="No Bookings"
        subtitle="No bookings found for this status."
      >
      </app-empty-state>

      <div
        *ngIf="!loading && filteredBookings.length > 0"
        class="p-4 space-y-3"
      >
        <div *ngFor="let booking of filteredBookings" class="card p-4">
          <div class="flex gap-3">
            <!-- Client -->
            <img
              [src]="
                booking.client?.avatar ||
                'https://ui-avatars.com/api/?name=' +
                  booking.client?.firstName +
                  '+' +
                  booking.client?.lastName
              "
              class="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            />

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p
                  class="font-semibold text-[var(--color-text-primary)] truncate"
                >
                  {{ booking.client?.firstName }} {{ booking.client?.lastName }}
                </p>
                <span
                  class="badge badge-sm flex-shrink-0"
                  [ngClass]="getStatusClass(booking.status)"
                  >{{ booking.status }}</span
                >
              </div>
              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {{ booking.date | date: "EEE, MMM d" }} ·
                {{ booking.startTime }} – {{ booking.endTime }}
              </p>
              <p class="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                {{ getServiceNames(booking) }}
              </p>
              <div class="flex items-center justify-between mt-2">
                <p class="text-sm font-bold text-[var(--color-primary)]">
                  GH₵ {{ booking.totalAmount | number: "1.2-2" }}
                </p>
                <div class="flex gap-2">
                  <button
                    *ngIf="booking.status === 'PENDING'"
                    (click)="updateStatus(booking, 'CONFIRMED')"
                    class="text-xs px-2.5 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                  >
                    Confirm
                  </button>
                  <button
                    *ngIf="booking.status === 'CONFIRMED'"
                    (click)="updateStatus(booking, 'COMPLETED')"
                    class="text-xs px-2.5 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    Complete
                  </button>
                  <button
                    *ngIf="
                      booking.status === 'PENDING' ||
                      booking.status === 'CONFIRMED'
                    "
                    (click)="bookingToCancel = booking; showCancelModal = true"
                    class="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg hover:bg-red-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    (click)="viewClient(booking.client?.id)"
                    class="text-xs px-2.5 py-1 bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg"
                  >
                    Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div
            *ngIf="booking.notes"
            class="mt-2 pt-2 border-t border-[var(--color-border)]"
          >
            <p class="text-xs text-[var(--color-text-muted)] italic">
              "{{ booking.notes }}"
            </p>
          </div>
        </div>
      </div>

      <app-confirm-modal
        *ngIf="showCancelModal"
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? The client will be notified."
        confirmText="Yes, Cancel"
        type="error"
        [loading]="cancelling"
        (confirmed)="cancelBooking()"
        (cancelled)="showCancelModal = false; bookingToCancel = null"
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
  showCancelModal = false;
  bookingToCancel: any = null;
  cancelling = false;

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
    this.http.get<any>(`${environment.apiUrl}/beauticians/bookings`).subscribe({
      next: (res) => {
        this.bookings = res.data?.bookings || []; // was: res.data || []
        this.filterBookings();
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  filterBookings() {
    this.filteredBookings = this.bookings.filter((b) => {
      const matchStatus = b.status === this.activeTab;
      const matchSearch =
        !this.searchQuery ||
        `${b.client?.firstName} ${b.client?.lastName}`
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  getCount(status: string) {
    return this.bookings.filter((b) => b.status === status).length;
  }

  getStatusClass(s: string) {
    const m: any = {
      PENDING: "badge-warning",
      CONFIRMED: "badge-info",
      COMPLETED: "badge-success",
      CANCELLED: "badge-error",
    };
    return m[s] || "";
  }

  getServiceNames(booking: any) {
    return (booking.services || []).map((s: any) => s.service?.name).join(", ");
  }

  updateStatus(booking: any, status: string) {
    this.http
      .patch(
        `${environment.apiUrl}/bookings/${booking.id}/${status.toLowerCase()}`,
        {},
      )
      .subscribe({
        next: () => {
          booking.status = status;
          this.filterBookings();
          this.toast.success(`Booking ${status.toLowerCase()}`);
        },
        error: () => this.toast.error("Update failed"),
      });
  }

  cancelBooking() {
    if (!this.bookingToCancel) return;
    this.cancelling = true;
    this.http
      .patch(
        `${environment.apiUrl}/bookings/${this.bookingToCancel.id}/cancel`,
        {},
      )
      .subscribe({
        next: () => {
          this.bookingToCancel.status = "CANCELLED";
          this.filterBookings();
          this.showCancelModal = false;
          this.cancelling = false;
          this.bookingToCancel = null;
          this.toast.success("Booking cancelled");
        },
        error: () => {
          this.cancelling = false;
          this.toast.error("Failed to cancel");
        },
      });
  }

  viewClient(id: string) {
    this.router.navigate(["/beautician/clients", id]);
  }
}
