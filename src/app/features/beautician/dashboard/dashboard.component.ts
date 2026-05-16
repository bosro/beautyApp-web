import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { AuthService } from "@core/services/auth.service";
import { ToastService } from "@core/services/toast.service";

type Period = "today" | "week" | "month";

@Component({
  selector: "app-beautician-dashboard",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <!-- Header -->
      <div
        class="p-4 lg:p-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-[var(--color-text-muted)]">Welcome back,</p>
            <h1
              class="text-xl font-bold text-[var(--color-text-primary)] mt-0.5"
            >
              {{ user?.name || "Beautician" }}
            </h1>
          </div>
          <div class="text-right">
            <p class="text-xs text-[var(--color-text-muted)]">Today</p>
            <p class="text-sm font-semibold text-[var(--color-text-primary)]">
              {{ today | date: "EEE, MMM d" }}
            </p>
          </div>
        </div>

        <!-- Period selector — mirrors mobile period selector -->
        <div
          class="flex gap-1 bg-[var(--color-background)] p-1 rounded-xl mt-4"
        >
          <button
            *ngFor="let p of periods"
            (click)="setPeriod(p.value)"
            class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
            [ngClass]="
              selectedPeriod === p.value
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)]'
            "
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            *ngFor="let i of [1, 2, 3, 4]"
            class="skeleton h-28 rounded-2xl"
          ></div>
        </div>
        <div class="skeleton h-48 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 space-y-5">
        <!-- Stats Grid — matches mobile statCards array -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
              >
                <i class="ri-calendar-check-line text-green-500 text-xl"></i>
              </div>
              <span class="badge badge-success text-xs">
                {{
                  selectedPeriod === "today"
                    ? "Today"
                    : selectedPeriod === "week"
                      ? "This Week"
                      : "This Month"
                }}
              </span>
            </div>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">
              {{ stats?.todayBookings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
              Bookings ({{
                selectedPeriod === "today"
                  ? "Today"
                  : selectedPeriod === "week"
                    ? "This Week"
                    : "This Month"
              }})
            </p>
          </div>

          <!-- <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
              >
                <i
                  class="ri-money-dollar-circle-line text-blue-500 text-xl"
                ></i>
              </div>
            </div>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">
              GH₵ {{ stats?.totalEarnings || 0 | number: "1.0-0" }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
              Earnings ({{
                selectedPeriod === "today"
                  ? "Today"
                  : selectedPeriod === "week"
                    ? "This Week"
                    : "This Month"
              }})
            </p>
          </div> -->

          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
              >
                <i class="ri-time-line text-amber-500 text-xl"></i>
              </div>
              <span
                *ngIf="(stats?.pendingBookings || 0) > 0"
                class="badge badge-warning text-xs"
                >{{ stats?.pendingBookings }}</span
              >
            </div>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">
              {{ stats?.pendingBookings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
              Pending Requests
            </p>
          </div>

          <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
              <div
                class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"
              >
                <i class="ri-star-line text-amber-500 text-xl"></i>
              </div>
            </div>
            <p class="text-2xl font-bold text-[var(--color-text-primary)]">
              {{ stats?.rating || stats?.averageRating || 0 | number: "1.1-1" }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
              Rating · {{ stats?.totalReviews || 0 }} reviews
            </p>
          </div>
        </div>

        <!-- Desktop grid: main + sidebar -->
        <div class="lg:grid lg:grid-cols-3 lg:gap-5 space-y-5 lg:space-y-0">
          <!-- Left: Quick Actions + Today's Schedule -->
          <div class="lg:col-span-2 space-y-5">
            <!-- Quick Actions — mirrors mobile quickActions grid -->
            <div>
              <h2 class="font-semibold text-[var(--color-text-primary)] mb-3">
                Quick Actions
              </h2>
              <div class="grid grid-cols-2 gap-3">
                <button
                  (click)="router.navigate(['/beautician/bookings'])"
                  class="card p-4 text-left hover:border-[var(--color-primary)] transition-colors"
                >
                  <div
                    class="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-2"
                  >
                    <i
                      class="ri-calendar-line text-[var(--color-primary)] text-xl"
                    ></i>
                  </div>
                  <p
                    class="text-sm font-semibold text-[var(--color-text-primary)]"
                  >
                    Manage Bookings
                  </p>
                  <p class="text-xs text-[var(--color-text-muted)]">
                    {{ stats?.pendingBookings || 0 }} pending approvals
                  </p>
                </button>

                <button
                  (click)="router.navigate(['/beautician/services'])"
                  class="card p-4 text-left hover:border-[var(--color-primary)] transition-colors"
                >
                  <div
                    class="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-2"
                  >
                    <i
                      class="ri-scissors-2-line text-[var(--color-primary)] text-xl"
                    ></i>
                  </div>
                  <p
                    class="text-sm font-semibold text-[var(--color-text-primary)]"
                  >
                    My Services
                  </p>
                  <p class="text-xs text-[var(--color-text-muted)]">
                    {{ stats?.activeServices || 0 }} active services
                  </p>
                </button>

                <button
                  (click)="router.navigate(['/beautician/schedule'])"
                  class="card p-4 text-left hover:border-[var(--color-primary)] transition-colors"
                >
                  <div
                    class="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-2"
                  >
                    <i
                      class="ri-time-line text-[var(--color-primary)] text-xl"
                    ></i>
                  </div>
                  <p
                    class="text-sm font-semibold text-[var(--color-text-primary)]"
                  >
                    Schedule
                  </p>
                  <p class="text-xs text-[var(--color-text-muted)]">
                    Set your availability
                  </p>
                </button>

                <!-- <button
                  (click)="router.navigate(['/beautician/earnings'])"
                  class="card p-4 text-left hover:border-[var(--color-primary)] transition-colors"
                >
                  <div class="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-2">
                    <i class="ri-money-dollar-circle-line text-[var(--color-primary)] text-xl"></i>
                  </div>
                  <p class="text-sm font-semibold text-[var(--color-text-primary)]">Earnings</p>
                  <p class="text-xs text-[var(--color-text-muted)]">View payments & payouts</p>
                </button> -->
              </div>
            </div>

            <!-- Today's Schedule -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h2 class="font-semibold text-[var(--color-text-primary)]">
                  Today's Schedule
                </h2>
                <button
                  (click)="router.navigate(['/beautician/bookings'])"
                  class="text-sm text-[var(--color-primary)] font-medium"
                >
                  View all
                </button>
              </div>

              <app-empty-state
                *ngIf="upcomingBookings.length === 0"
                icon="ri-calendar-line"
                title="No Bookings Today"
                subtitle="Your schedule is clear. Enjoy your day!"
              >
              </app-empty-state>

              <div
                *ngFor="let booking of upcomingBookings"
                class="card p-4 mb-3"
              >
                <div class="flex gap-3 items-center">
                  <img
                    [src]="
                      booking.customer?.avatar ||
                      'https://ui-avatars.com/api/?name=' +
                        (booking.customer?.name || 'C')
                    "
                    class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-semibold text-[var(--color-text-primary)]"
                    >
                      {{ booking.customer?.name || "Customer" }}
                    </p>
                    <p class="text-xs text-[var(--color-text-secondary)]">
                      {{ booking.service?.name || "Service" }} ·
                      {{ booking.bookingDate | date: "MMM d" }}
                    </p>
                    <p
                      class="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5"
                    >
                      <i class="ri-time-line"></i>
                      {{
                        booking.bookingTime || booking.bookingDate
                          | date: "shortTime"
                      }}
                    </p>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <p class="text-sm font-bold text-[var(--color-primary)]">
                      GH₵ {{ booking.totalPrice || 0 }}
                    </p>

                    <!-- PENDING: show accept/decline buttons — same as mobile -->
                    <div
                      *ngIf="booking.status === 'PENDING'"
                      class="flex gap-1"
                    >
                      <button
                        (click)="openBookingModal(booking, 'accept')"
                        [disabled]="updatingBooking[booking.id]"
                        class="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition-colors disabled:opacity-50"
                        title="Accept"
                      >
                        <i class="ri-check-line text-white text-sm"></i>
                      </button>
                      <button
                        (click)="openBookingModal(booking, 'decline')"
                        [disabled]="updatingBooking[booking.id]"
                        class="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Decline"
                      >
                        <i class="ri-close-line text-white text-sm"></i>
                      </button>
                    </div>

                    <!-- Non-pending: status badge -->
                    <span
                      *ngIf="booking.status !== 'PENDING'"
                      class="badge badge-sm"
                      [ngClass]="getStatusClass(booking.status)"
                    >
                      {{
                        booking.status.charAt(0) +
                          booking.status.slice(1).toLowerCase()
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="space-y-4">
            <!-- This Month summary -->
            <div class="card p-4 space-y-3">
              <h3 class="font-semibold text-[var(--color-text-primary)]">
                This Month
              </h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--color-text-secondary)]"
                    >Total Bookings</span
                  >
                  <span
                    class="font-semibold text-[var(--color-text-primary)]"
                    >{{ stats?.totalBookings || 0 }}</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--color-text-secondary)]"
                    >Completed</span
                  >
                  <span class="font-semibold text-green-500">{{
                    stats?.completedBookings || 0
                  }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--color-text-secondary)]"
                    >Pending</span
                  >
                  <span class="font-semibold text-amber-500">{{
                    stats?.pendingBookings || 0
                  }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--color-text-secondary)]"
                    >Active Services</span
                  >
                  <span class="font-semibold text-[var(--color-primary)]">{{
                    stats?.activeServices || 0
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Recent Reviews -->
            <div class="card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-[var(--color-text-primary)]">
                  Latest Reviews
                </h3>
                <button
                  (click)="router.navigate(['/beautician/reviews'])"
                  class="text-xs text-[var(--color-primary)]"
                >
                  See all
                </button>
              </div>
              <div
                *ngFor="let review of recentReviews"
                class="pb-3 border-b border-[var(--color-border)] last:border-0 last:pb-0"
              >
                <div class="flex items-center gap-2 mb-1">
                  <img
                    [src]="
                      review.customer?.avatar ||
                      'https://ui-avatars.com/api/?name=' +
                        (review.customer?.name || 'C')
                    "
                    class="w-6 h-6 rounded-full object-cover"
                  />
                  <p
                    class="text-xs font-semibold text-[var(--color-text-primary)]"
                  >
                    {{ review.customer?.name || "Customer" }}
                  </p>
                  <div class="flex items-center gap-0.5 ml-auto">
                    <i
                      *ngFor="let s of [1, 2, 3, 4, 5]"
                      class="text-xs"
                      [ngClass]="
                        s <= review.rating
                          ? 'ri-star-fill text-amber-400'
                          : 'ri-star-line text-gray-300'
                      "
                    ></i>
                  </div>
                </div>
                <p
                  class="text-xs text-[var(--color-text-secondary)] line-clamp-2"
                >
                  {{ review.comment }}
                </p>
              </div>
              <app-empty-state
                *ngIf="!recentReviews.length"
                icon="ri-star-line"
                title="No reviews yet"
                subtitle=""
              ></app-empty-state>
            </div>

            <!-- Location Status Card -->
            <div class="card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-[var(--color-text-primary)]">
                  Your Location
                </h3>
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  [class.bg-green-100]="hasLocation"
                  [class.text-green-700]="hasLocation"
                  [class.bg-amber-100]="!hasLocation"
                  [class.text-amber-700]="!hasLocation"
                >
                  {{ hasLocation ? "On Map" : "Not Visible" }}
                </span>
              </div>
              <p class="text-xs text-[var(--color-text-secondary)]">
                {{
                  hasLocation
                    ? "Clients can find you on the map"
                    : "Update your profile address to appear on the map"
                }}
              </p>
              <button
                (click)="router.navigate(['/beautician/profile'])"
                class="w-full text-sm py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors"
              >
                {{ hasLocation ? "Update Location" : "Add Location" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking action modal -->
      <app-confirm-modal
        *ngIf="showBookingModal"
        [title]="
          bookingModalAction === 'accept' ? 'Accept Booking' : 'Decline Booking'
        "
        [message]="
          bookingModalAction === 'accept'
            ? 'Confirm booking from ' +
              (selectedBooking?.customer?.name || 'customer') +
              '?'
            : 'Decline booking from ' +
              (selectedBooking?.customer?.name || 'customer') +
              '?'
        "
        [confirmText]="bookingModalAction === 'accept' ? 'Accept' : 'Decline'"
        [type]="bookingModalAction === 'accept' ? 'success' : 'warning'"
        [loading]="updatingBooking[selectedBookingId]"
        (confirmed)="confirmBookingAction()"
        (cancelled)="closeBookingModal()"
      >
      </app-confirm-modal>
    </div>
  `,
})
export class BeauticianDashboardComponent implements OnInit {
  stats: any = null;
  upcomingBookings: any[] = [];
  recentReviews: any[] = [];
  loading = true;
  today = new Date();
  user: any = null;
  selectedPeriod: Period = "today";

  showBookingModal = false;
  selectedBooking: any = null;
  bookingModalAction: "accept" | "decline" | null = null;
  updatingBooking: Record<string, boolean> = {};

  hasLocation = false;

  // Add this to safely use in template
  get selectedBookingId(): string {
    return this.selectedBooking?.id || "";
  }

  periods: { label: string; value: Period }[] = [
    { label: "Today", value: "today" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  constructor(
    private http: HttpClient,
    public router: Router,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe((u) => {
      if (u) this.user = u;
    });
    this.loadDashboard();
  }

  setPeriod(period: Period) {
    this.selectedPeriod = period;
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.http
      .get<any>(`${environment.apiUrl}/users/beautician/dashboard`, {
        params: { period: this.selectedPeriod },
      })
      .subscribe({
        next: (res) => {
          this.stats = res.data?.stats;
          this.upcomingBookings = res.data?.upcomingBookings || [];
          this.recentReviews = res.data?.recentReviews || [];
          this.hasLocation = res.data?.stats?.hasLocation || false;
          this.loading = false;
        },
        error: () => {
          this.toast.error("Failed to load dashboard");
          this.loading = false;
        },
      });
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

  openBookingModal(booking: any, action: "accept" | "decline") {
    this.selectedBooking = booking;
    this.bookingModalAction = action;
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
    this.selectedBooking = null;
    this.bookingModalAction = null;
  }

  confirmBookingAction() {
    if (!this.selectedBooking || !this.bookingModalAction) return;
    const id = this.selectedBooking.id;
    const newStatus =
      this.bookingModalAction === "accept" ? "CONFIRMED" : "CANCELLED";
    const customerName = this.selectedBooking.customer?.name;
    const action = this.bookingModalAction;

    this.updatingBooking = { ...this.updatingBooking, [id]: true };
    this.showBookingModal = false;

    const body: any = { status: newStatus };
    if (newStatus === "CANCELLED")
      body.cancellationReason = "Declined by beautician";

    this.http
      .put(`${environment.apiUrl}/bookings/${id}/status`, body)
      .subscribe({
        next: () => {
          // Update locally without full reload
          const booking = this.upcomingBookings.find((b) => b.id === id);
          if (booking) booking.status = newStatus;
          // Remove from upcoming list if cancelled
          if (newStatus === "CANCELLED") {
            this.upcomingBookings = this.upcomingBookings.filter(
              (b) => b.id !== id,
            );
          }
          this.toast.success(
            action === "accept"
              ? `Booking confirmed for ${customerName}`
              : "Booking declined",
          );
          this.updatingBooking = { ...this.updatingBooking, [id]: false };
          // Refresh stats counts only
          this.http
            .get<any>(`${environment.apiUrl}/users/beautician/dashboard`, {
              params: { period: this.selectedPeriod },
            })
            .subscribe({
              next: (res) => {
                this.stats = res.data?.stats;
              },
            });
        },
        error: (err) => {
          this.toast.error(err.error?.message || "Failed to update booking");
          this.updatingBooking = { ...this.updatingBooking, [id]: false };
          this.closeBookingModal();
        },
      });
  }
}
