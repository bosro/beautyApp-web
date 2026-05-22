// ============================================================
// booking-details.component.ts  —  Enhanced UI
// ============================================================

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-booking-details",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)]">
      <!-- Header -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3"
      >
        <button
          (click)="router.navigate(['/beautician/bookings'])"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors"
        >
          <i
            class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1
          class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
        >
          Booking Details
        </h1>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-12 rounded-xl"></div>
        <div class="skeleton h-52 rounded-2xl"></div>
        <div class="skeleton h-40 rounded-2xl"></div>
        <div class="skeleton h-32 rounded-2xl"></div>
      </div>

      <!-- Error -->
      <div
        *ngIf="!loading && !booking"
        class="flex flex-col items-center justify-center py-28 gap-4 px-6 text-center"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"
        >
          <i class="ri-error-warning-line text-2xl text-red-400"></i>
        </div>
        <div>
          <p class="font-semibold text-[var(--color-text-primary)]">
            Failed to load booking
          </p>
          <p class="text-sm text-[var(--color-text-secondary)] mt-1">
            Something went wrong. Please try again.
          </p>
        </div>
        <button
          (click)="load()"
          class="btn-primary text-sm px-6 py-2.5 rounded-xl"
        >
          Retry
        </button>
      </div>

      <div
        *ngIf="!loading && booking"
        class="p-4 lg:p-6 max-w-2xl mx-auto space-y-3 pb-8"
      >
        <!-- Status Banner -->
        <div
          class="rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm"
          [ngStyle]="{
            background: statusBg(booking.status),
            color: statusColor(booking.status),
          }"
        >
          <i [class]="statusIcon(booking.status) + ' text-base'"></i>
          {{ statusLabel(booking.status) }}
        </div>

        <!-- Client Card -->
        <div class="card rounded-2xl p-4 space-y-4">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
          >
            Client
          </h3>

          <div class="flex items-center gap-3">
            <div
              class="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-[var(--color-primary)]/10 flex items-center justify-center"
            >
              <img
                *ngIf="booking.customer?.avatar"
                [src]="booking.customer.avatar"
                class="w-full h-full object-cover"
              />
              <span
                *ngIf="!booking.customer?.avatar"
                class="text-xl font-bold text-[var(--color-primary)]"
              >
                {{ booking.customer?.name?.charAt(0) || "?" }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-[var(--color-text-primary)]">
                {{ booking.customer?.name || "Customer" }}
              </p>
              <p
                *ngIf="booking.customer?.phone"
                class="text-sm text-[var(--color-text-secondary)] mt-0.5"
              >
                {{ booking.customer.phone }}
              </p>
              <p
                *ngIf="booking.customer?.email"
                class="text-xs text-[var(--color-text-muted)] mt-0.5"
              >
                {{ booking.customer.email }}
              </p>
            </div>
          </div>

          <!-- Contact row -->
          <div class="grid grid-cols-3 gap-2">
            <a
              *ngIf="booking.customer?.phone"
              [href]="'tel:' + booking.customer.phone"
              class="flex flex-col items-center gap-1 py-2.5 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
            >
              <i class="ri-phone-line text-[var(--color-primary)] text-lg"></i>
              <span
                class="text-xs font-medium text-[var(--color-text-secondary)]"
                >Call</span
              >
            </a>
            <a
              *ngIf="booking.customer?.phone"
              [href]="'sms:' + booking.customer.phone"
              class="flex flex-col items-center gap-1 py-2.5 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
            >
              <i
                class="ri-message-line text-[var(--color-primary)] text-lg"
              ></i>
              <span
                class="text-xs font-medium text-[var(--color-text-secondary)]"
                >Message</span
              >
            </a>
            <button
              (click)="viewClientProfile()"
              class="flex flex-col items-center gap-1 py-2.5 border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
            >
              <i class="ri-user-line text-[var(--color-primary)] text-lg"></i>
              <span
                class="text-xs font-medium text-[var(--color-text-secondary)]"
                >Profile</span
              >
            </button>
          </div>

          <!-- Client history stats -->
          <div
            *ngIf="customerStats"
            class="flex items-center rounded-xl p-3 gap-0"
            style="background: color-mix(in srgb, var(--color-primary) 5%, transparent)"
          >
            <div class="flex-1 text-center">
              <p class="font-bold text-[var(--color-primary)]">
                {{ customerStats.totalVisits || 0 }}
              </p>
              <p class="text-xs text-[var(--color-text-muted)]">Visits</p>
            </div>
            <div class="w-px h-8 bg-[var(--color-border)]"></div>
            <div class="flex-1 text-center">
              <p class="font-bold text-[var(--color-primary)]">
                GH₵{{ customerStats.totalSpent || 0 | number: "1.0-0" }}
              </p>
              <p class="text-xs text-[var(--color-text-muted)]">Spent</p>
            </div>
            <div class="w-px h-8 bg-[var(--color-border)]"></div>
            <div class="flex-1 text-center">
              <p class="text-sm font-bold text-[var(--color-primary)]">
                {{
                  customerStats.lastVisit
                    ? (customerStats.lastVisit | date: "MMM d")
                    : "N/A"
                }}
              </p>
              <p class="text-xs text-[var(--color-text-muted)]">Last Visit</p>
            </div>
          </div>
        </div>

        <!-- Service Details -->
        <div class="card rounded-2xl p-4 space-y-3">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
          >
            Service
          </h3>
          <div class="flex items-center gap-3" *ngFor="let row of serviceRows">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
            >
              <i
                [class]="row.icon + ' text-[var(--color-primary)] text-sm'"
              ></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-[var(--color-text-muted)]">
                {{ row.label }}
              </p>
              <p
                class="text-sm font-semibold"
                [class]="
                  row.primary
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-primary)]'
                "
              >
                {{ row.value }}
              </p>
            </div>
          </div>
        </div>

        <!-- Booking meta -->
        <div class="card rounded-2xl p-4 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-[var(--color-text-secondary)]"
              >Booking Number</span
            >
            <span class="text-sm font-bold text-[var(--color-primary)]"
              >#{{ booking.bookingNumber }}</span
            >
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-[var(--color-text-secondary)]"
              >Booked On</span
            >
            <span
              class="text-sm font-medium text-[var(--color-text-primary)]"
              >{{ booking.createdAt | date: "MMM d, y" }}</span
            >
          </div>
        </div>

        <!-- Special Notes -->
        <div *ngIf="booking.note" class="card rounded-2xl p-4">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-3"
          >
            Special Notes
          </h3>
          <div
            class="flex gap-2.5 p-3 rounded-xl"
            style="background: color-mix(in srgb, #FF9800 10%, transparent)"
          >
            <i
              class="ri-sticky-note-line text-amber-500 flex-shrink-0 mt-0.5 text-sm"
            ></i>
            <p class="text-sm text-[var(--color-text-primary)] leading-relaxed">
              {{ booking.note }}
            </p>
          </div>
        </div>

        <!-- Payment -->
        <div class="card rounded-2xl p-4 space-y-0">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-3"
          >
            Payment
          </h3>
          <div
            class="flex justify-between py-2.5 border-b border-[var(--color-border)]"
          >
            <span class="text-sm text-[var(--color-text-secondary)]"
              >Your Earnings</span
            >
            <span class="text-sm font-bold text-[var(--color-primary)]"
              >GH₵{{ booking.beauticianEarnings | number: "1.2-2" }}</span
            >
          </div>
          <div
            class="flex justify-between py-2.5 border-b border-[var(--color-border)]"
          >
            <span class="text-sm text-[var(--color-text-secondary)]"
              >Platform Fee</span
            >
            <span class="text-sm text-[var(--color-text-secondary)]"
              >GH₵{{ booking.commission | number: "1.2-2" }}</span
            >
          </div>
          <div class="flex justify-between py-2.5">
            <span class="text-sm font-semibold text-[var(--color-text-primary)]"
              >Total Price</span
            >
            <span class="text-sm font-bold text-[var(--color-text-primary)]"
              >GH₵{{ booking.price | number: "1.2-2" }}</span
            >
          </div>
        </div>

        <!-- Cancellation info -->
        <div
          *ngIf="booking.status === 'CANCELLED' && booking.cancellationReason"
          class="card rounded-2xl p-4 border-l-4 border-red-400"
        >
          <h3
            class="font-bold text-sm text-red-500 mb-2 flex items-center gap-2"
          >
            <i class="ri-close-circle-line"></i> Cancellation Reason
          </h3>
          <p class="text-sm text-[var(--color-text-primary)]">
            {{ booking.cancellationReason }}
          </p>
          <p
            *ngIf="booking.cancelledAt"
            class="text-xs text-[var(--color-text-muted)] mt-2"
          >
            Cancelled on {{ booking.cancelledAt | date: "MMM d, y" }}
          </p>
        </div>

        <!-- ── Action Buttons — in scroll flow ── -->
        <div
          *ngIf="booking.status === 'PENDING' || booking.status === 'CONFIRMED'"
          class="pt-2 pb-2"
        >
          <!-- PENDING: Decline + Accept -->
          <div *ngIf="booking.status === 'PENDING'" class="flex gap-3">
            <button
              (click)="showCancelModal = true"
              [disabled]="updating"
              class="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-red-400 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <i class="ri-close-line text-base"></i> Decline
            </button>
            <button
              (click)="showAcceptModal = true"
              [disabled]="updating"
              class="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <i class="ri-check-line text-base"></i> Accept Booking
            </button>
          </div>

          <!-- CONFIRMED: Mark Complete -->
          <button
            *ngIf="booking.status === 'CONFIRMED'"
            (click)="showCompleteModal = true"
            [disabled]="updating"
            class="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50"
          >
            <i *ngIf="updating" class="ri-loader-4-line animate-spin"></i>
            <i *ngIf="!updating" class="ri-checkbox-circle-line text-base"></i>
            Mark as Completed
          </button>
        </div>
      </div>

      <!-- Modals -->
      <app-confirm-modal
        [visible]="showAcceptModal"
        title="Accept Booking"
        message="Confirm this booking?"
        confirmText="Accept"
        type="success"
        [loading]="updating"
        (confirmed)="updateStatus('CONFIRMED')"
        (cancelled)="showAcceptModal = false"
      ></app-confirm-modal>

      <app-confirm-modal
        [visible]="showCompleteModal"
        title="Complete Booking"
        message="Mark this booking as completed?"
        confirmText="Complete"
        type="success"
        [loading]="updating"
        (confirmed)="updateStatus('COMPLETED')"
        (cancelled)="showCompleteModal = false"
      ></app-confirm-modal>

      <app-confirm-modal
        [visible]="showCancelModal"
        title="Decline Booking"
        message="Are you sure you want to decline this booking? The client will be notified."
        confirmText="Decline Booking"
        type="error"
        [loading]="updating"
        (confirmed)="updateStatus('CANCELLED')"
        (cancelled)="showCancelModal = false"
      ></app-confirm-modal>
    </div>
  `,
})
export class BookingDetailsComponent implements OnInit {
  bookingId = "";
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
      {
        icon: "ri-scissors-2-line",
        label: "Service",
        value: this.booking.service?.name || "Service",
        primary: false,
      },
      {
        icon: "ri-calendar-line",
        label: "Date",
        value: new Date(this.booking.bookingDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        primary: false,
      },
      {
        icon: "ri-time-line",
        label: "Time",
        value: `${this.booking.bookingTime} (${this.booking.service?.durationMinutes || this.booking.service?.duration || 0} mins)`,
        primary: false,
      },
      {
        icon: "ri-money-dollar-circle-line",
        label: "Price",
        value: `GH₵ ${(this.booking.price || 0).toFixed(2)}`,
        primary: true,
      },
    ];
  }

  statusIcon(s: string): string {
    const map: Record<string, string> = {
      PENDING: "ri-time-line",
      CONFIRMED: "ri-calendar-check-line",
      COMPLETED: "ri-checkbox-circle-line",
      CANCELLED: "ri-close-circle-line",
    };
    return map[s] || "ri-information-line";
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDING: "Pending Confirmation",
      CONFIRMED: "Confirmed",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };
    return map[s] || s;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: "#FF9800",
      CONFIRMED: "#2196F3",
      COMPLETED: "#4CAF50",
      CANCELLED: "#F44336",
    };
    return map[status] || "var(--color-text-secondary)";
  }

  statusBg(status: string): string {
    const map: Record<string, string> = {
      PENDING: "rgba(255,152,0,0.12)",
      CONFIRMED: "rgba(33,150,243,0.12)",
      COMPLETED: "rgba(76,175,80,0.12)",
      CANCELLED: "rgba(244,67,54,0.12)",
    };
    return map[status] || "var(--color-background-secondary)";
  }

  constructor(
    private http: HttpClient,
    public router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.bookingId = this.route.snapshot.paramMap.get("id") || "";
    this.load();
  }

  load() {
    this.loading = true;
    this.http
      .get<any>(`${environment.apiUrl}/bookings/${this.bookingId}`)
      .subscribe({
        next: (res) => {
          this.booking = res.data?.booking;
          this.loading = false;
          if (this.booking?.customerId) {
            this.http
              .get<any>(
                `${environment.apiUrl}/beauticians/customers/${this.booking.customerId}`,
              )
              .subscribe({ next: (r) => (this.customerStats = r.data?.stats) });
          }
        },
        error: () => {
          this.toast.error("Failed to load booking");
          this.loading = false;
        },
      });
  }

  updateStatus(status: "CONFIRMED" | "COMPLETED" | "CANCELLED") {
    this.updating = true;
    const body: any = { status };
    if (status === "CANCELLED")
      body.cancellationReason = "Declined by beautician";
    this.http
      .put<any>(`${environment.apiUrl}/bookings/${this.bookingId}/status`, body)
      .subscribe({
        next: () => {
          this.booking.status = status;
          this.updating = false;
          this.showAcceptModal = false;
          this.showCompleteModal = false;
          this.showCancelModal = false;
          const messages: Record<string, string> = {
            CONFIRMED: "Booking confirmed",
            COMPLETED: "Booking marked as completed",
            CANCELLED: "Booking declined",
          };
          this.toast.success(messages[status]);
          if (status === "COMPLETED" || status === "CANCELLED") {
            setTimeout(
              () => this.router.navigate(["/beautician/bookings"]),
              1200,
            );
          }
        },
        error: (err) => {
          this.updating = false;
          this.toast.error(err.error?.message || "Failed to update booking");
        },
      });
  }

  viewClientProfile() {
    if (this.booking?.customerId)
      this.router.navigate(["/beautician/clients", this.booking.customerId]);
  }
}
