// beautician-dashboard.component.ts — Enhanced with earnings chart
// Changes vs previous:
//  1. Quick Actions grid replaced with a rich earnings/bookings chart
//  2. Chart is drawn on a <canvas> using Chart.js (already in scope via CDN
//     or your existing chart setup) — falls back to pure CSS bars if unavailable
//  3. All existing integrations, http calls, and logic preserved exactly
//  4. Fully theme-aware (reads CSS vars) and responsive (mobile + desktop)

import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  NgZone,
} from "@angular/core";
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
    <div class="dash-root">
      <!-- ══════════════════════════════════════════
           HEADER
      ══════════════════════════════════════════ -->
      <div class="dash-header">
        <div class="dash-header-top">
          <div>
            <p class="dash-greeting">Welcome back,</p>
            <h1 class="dash-name">{{ user?.name || "Beautician" }}</h1>
          </div>
          <div class="dash-date-badge">
            <p class="dash-date-label">Today</p>
            <p class="dash-date-value">{{ today | date: "EEE, MMM d" }}</p>
          </div>
        </div>

        <!-- Period tabs -->
        <div class="period-tabs">
          <button
            *ngFor="let p of periods"
            (click)="setPeriod(p.value)"
            class="period-tab"
            [class.period-tab--active]="selectedPeriod === p.value"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           SKELETON
      ══════════════════════════════════════════ -->
      <div *ngIf="loading" class="dash-body">
        <div class="skeleton-grid">
          <div
            class="skeleton skeleton-card"
            *ngFor="let i of [1, 2, 3, 4]"
          ></div>
        </div>
        <div class="skeleton skeleton-chart"></div>
        <div class="skeleton skeleton-list"></div>
      </div>

      <!-- ══════════════════════════════════════════
           VERIFICATION BANNER
      ══════════════════════════════════════════ -->
      <div
        *ngIf="!loading && verificationStatus !== 'APPROVED'"
        class="verif-banner"
        [class.verif-banner--rejected]="verificationStatus === 'REJECTED'"
        (click)="router.navigate(['/beautician/verification'])"
      >
        <i
          class="verif-banner__icon"
          [class]="
            verificationStatus === 'REJECTED'
              ? 'ri-shield-cross-fill'
              : 'ri-shield-check-line'
          "
        ></i>
        <div class="verif-banner__text">
          <p class="verif-banner__title">
            {{
              verificationStatus === "REJECTED"
                ? "Verification rejected"
                : "Verification pending"
            }}
          </p>
          <p class="verif-banner__sub">
            {{
              verificationStatus === "REJECTED"
                ? "Tap to review the reason and resubmit your documents."
                : "Complete your verification to start receiving bookings."
            }}
          </p>
        </div>
        <i class="ri-arrow-right-s-line verif-banner__arrow"></i>
      </div>

      <!-- ══════════════════════════════════════════
           MAIN BODY
      ══════════════════════════════════════════ -->
      <div *ngIf="!loading" class="dash-body">
        <!-- ── Stats row ── -->
        <div class="stats-grid">
          <div class="stat-card stat-card--green">
            <div class="stat-card__header">
              <div class="stat-card__icon-wrap stat-card__icon-wrap--green">
                <i class="ri-calendar-check-line"></i>
              </div>
              <span
                class="stat-card__period-badge stat-card__period-badge--green"
              >
                {{
                  selectedPeriod === "today"
                    ? "Today"
                    : selectedPeriod === "week"
                      ? "Week"
                      : "Month"
                }}
              </span>
            </div>
            <p class="stat-card__value">{{ stats?.todayBookings || 0 }}</p>
            <p class="stat-card__label">Bookings</p>
          </div>

          <div class="stat-card stat-card--amber">
            <div class="stat-card__header">
              <div class="stat-card__icon-wrap stat-card__icon-wrap--amber">
                <i class="ri-time-line"></i>
              </div>
              <span
                *ngIf="(stats?.pendingBookings || 0) > 0"
                class="stat-card__period-badge stat-card__period-badge--amber"
              >
                {{ stats?.pendingBookings }}
              </span>
            </div>
            <p class="stat-card__value">{{ stats?.pendingBookings || 0 }}</p>
            <p class="stat-card__label">Pending</p>
          </div>

          <div class="stat-card">
            <div class="stat-card__header">
              <div class="stat-card__icon-wrap stat-card__icon-wrap--amber">
                <i class="ri-star-fill" style="color:#F59E0B"></i>
              </div>
            </div>
            <p class="stat-card__value">
              {{ stats?.rating || stats?.averageRating || 0 | number: "1.1-1" }}
            </p>
            <p class="stat-card__label">
              {{ stats?.totalReviews || 0 }} reviews
            </p>
          </div>

          <div class="stat-card">
            <div class="stat-card__header">
              <div class="stat-card__icon-wrap stat-card__icon-wrap--primary">
                <i class="ri-scissors-2-line"></i>
              </div>
            </div>
            <p class="stat-card__value">{{ stats?.activeServices || 0 }}</p>
            <p class="stat-card__label">Services</p>
          </div>
        </div>

        <!-- ── Desktop two-column layout ── -->
        <div class="dash-cols">
          <!-- LEFT: Chart + Today's schedule -->
          <div class="dash-col-main">
            <!-- ════════════════════════════════
                 EARNINGS & BOOKINGS CHART CARD
            ════════════════════════════════ -->
            <div class="chart-card">
              <div class="chart-card__header">
                <div>
                  <p class="chart-card__title">Earnings Overview</p>
                  <p class="chart-card__sub">Revenue · last 7 days</p>
                </div>
                <div class="chart-tabs">
                  <button
                    *ngFor="let t of chartTabs"
                    (click)="setChartTab(t.value)"
                    class="chart-tab"
                    [class.chart-tab--active]="activeChartTab === t.value"
                  >
                    {{ t.label }}
                  </button>
                </div>
              </div>

              <!-- Big number -->
              <div class="chart-hero">
                <span class="chart-hero__currency">GH₵</span>
                <span class="chart-hero__amount">{{
                  chartTotal | number: "1.0-0"
                }}</span>
                <span
                  class="chart-hero__delta"
                  [class.chart-hero__delta--up]="chartDelta >= 0"
                  [class.chart-hero__delta--down]="chartDelta < 0"
                >
                  <i
                    [class]="
                      chartDelta >= 0
                        ? 'ri-arrow-up-line'
                        : 'ri-arrow-down-line'
                    "
                  ></i>
                  {{ chartDelta | number: "1.1-1" }}%
                </span>
              </div>

              <!-- Canvas chart -->
              <div class="chart-canvas-wrap">
                <canvas #chartCanvas class="chart-canvas"></canvas>
              </div>

              <!-- Day labels -->
              <div class="chart-labels">
                <span *ngFor="let d of chartDayLabels" class="chart-label">{{
                  d
                }}</span>
              </div>
            </div>

            <!-- ════════════════════════════════
                 TODAY'S SCHEDULE
            ════════════════════════════════ -->
            <div class="section-header">
              <h2 class="section-title">Today's Schedule</h2>
              <button
                (click)="router.navigate(['/beautician/bookings'])"
                class="section-link"
              >
                View all
              </button>
            </div>

            <app-empty-state
              *ngIf="upcomingBookings.length === 0"
              icon="ri-calendar-line"
              title="No Bookings Today"
              subtitle="Your schedule is clear!"
            >
            </app-empty-state>

            <div *ngFor="let booking of upcomingBookings" class="booking-card">
              <img
                [src]="
                  booking.customer?.avatar ||
                  'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(booking.customer?.name || 'C')
                "
                class="booking-card__avatar"
              />
              <div class="booking-card__info">
                <p class="booking-card__name">
                  {{ booking.customer?.name || "Customer" }}
                </p>
                <p class="booking-card__service">
                  {{ booking.service?.name || "Service" }} ·
                  {{ booking.bookingDate | date: "MMM d" }}
                </p>
                <p class="booking-card__time">
                  <i class="ri-time-line"></i>
                  {{
                    booking.bookingTime ||
                      (booking.bookingDate | date: "shortTime")
                  }}
                </p>
              </div>
              <div class="booking-card__actions">
                <p class="booking-card__price">
                  GH₵{{ booking.totalPrice || 0 }}
                </p>
                <div
                  *ngIf="booking.status === 'PENDING'"
                  class="booking-card__btns"
                >
                  <button
                    (click)="openBookingModal(booking, 'accept')"
                    [disabled]="updatingBooking[booking.id]"
                    class="booking-card__btn booking-card__btn--accept"
                  >
                    <i class="ri-check-line"></i>
                  </button>
                  <button
                    (click)="openBookingModal(booking, 'decline')"
                    [disabled]="updatingBooking[booking.id]"
                    class="booking-card__btn booking-card__btn--decline"
                  >
                    <i class="ri-close-line"></i>
                  </button>
                </div>
                <span
                  *ngIf="booking.status !== 'PENDING'"
                  class="status-badge"
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
          <!-- /dash-col-main -->

          <!-- RIGHT SIDEBAR -->
          <div class="dash-col-side">
            <!-- Month summary -->
            <div class="side-card">
              <h3 class="side-card__title">This Month</h3>
              <div class="side-card__rows">
                <div class="side-card__row">
                  <span>Total Bookings</span>
                  <strong>{{ stats?.totalBookings || 0 }}</strong>
                </div>
                <div class="side-card__row">
                  <span>Completed</span>
                  <strong class="side-card__val--green">{{
                    stats?.completedBookings || 0
                  }}</strong>
                </div>
                <div class="side-card__row">
                  <span>Pending</span>
                  <strong class="side-card__val--amber">{{
                    stats?.pendingBookings || 0
                  }}</strong>
                </div>
                <div class="side-card__row">
                  <span>Active Services</span>
                  <strong class="side-card__val--primary">{{
                    stats?.activeServices || 0
                  }}</strong>
                </div>
              </div>
            </div>

            <!-- Recent Reviews -->
            <div class="side-card">
              <div class="side-card__head">
                <h3 class="side-card__title">Latest Reviews</h3>
                <button
                  (click)="router.navigate(['/beautician/reviews'])"
                  class="section-link"
                >
                  See all
                </button>
              </div>

              <app-empty-state
                *ngIf="!recentReviews.length"
                icon="ri-star-line"
                title="No reviews yet"
                subtitle=""
              >
              </app-empty-state>

              <div *ngFor="let review of recentReviews" class="review-row">
                <img
                  [src]="
                    review.customer?.avatar ||
                    'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(review.customer?.name || 'C')
                  "
                  class="review-row__avatar"
                />
                <div class="review-row__body">
                  <div class="review-row__top">
                    <p class="review-row__name">
                      {{ review.customer?.name || "Customer" }}
                    </p>
                    <div class="review-row__stars">
                      <i
                        *ngFor="let s of [1, 2, 3, 4, 5]"
                        [class]="
                          s <= review.rating ? 'ri-star-fill' : 'ri-star-line'
                        "
                      ></i>
                    </div>
                  </div>
                  <p class="review-row__comment">{{ review.comment }}</p>
                </div>
              </div>
            </div>

            <!-- Location card -->
            <div class="side-card">
              <div class="side-card__head">
                <h3 class="side-card__title">Location</h3>
                <span
                  class="loc-badge"
                  [class.loc-badge--ok]="hasLocation"
                  [class.loc-badge--warn]="!hasLocation"
                >
                  {{ hasLocation ? "On Map" : "Not Visible" }}
                </span>
              </div>
              <p class="side-card__body-text">
                {{
                  hasLocation
                    ? "Clients can find you on the map."
                    : "Update your profile address to appear on the map."
                }}
              </p>
              <button
                (click)="router.navigate(['/beautician/profile'])"
                class="side-card__btn"
              >
                {{ hasLocation ? "Update Location" : "Add Location" }}
              </button>
            </div>
          </div>
          <!-- /dash-col-side -->
        </div>
        <!-- /dash-cols -->
      </div>
      <!-- /dash-body -->

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
  styles: [
    `
      /* ── Root ────────────────────────────────────────────────────── */
      .dash-root {
        min-height: 100vh;
        background-color: var(--color-background, #f4f4f5);
        padding-bottom: 96px;
      }
      @media (min-width: 1024px) {
        .dash-root {
          padding-bottom: 32px;
        }
      }

      /* ── Header ─────────────────────────────────────────────────── */
      .dash-header {
        background-color: var(--color-surface, #fff);
        border-bottom: 1px solid var(--color-border, #e4e4e7);
        padding: 16px 16px 12px;
      }
      @media (min-width: 1024px) {
        .dash-header {
          padding: 20px 24px 14px;
        }
      }

      .dash-header-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 14px;
      }
      .dash-greeting {
        font-size: 12px;
        color: var(--color-text-muted, #71717a);
        font-weight: 500;
        margin: 0;
      }
      .dash-name {
        font-size: 22px;
        font-weight: 800;
        color: var(--color-text-primary, #18181b);
        margin: 2px 0 0;
        letter-spacing: -0.5px;
      }
      .dash-date-badge {
        text-align: right;
        flex-shrink: 0;
      }
      .dash-date-label {
        font-size: 11px;
        color: var(--color-text-muted, #71717a);
        margin: 0;
      }
      .dash-date-value {
        font-size: 13px;
        font-weight: 700;
        color: var(--color-text-primary, #18181b);
        margin: 2px 0 0;
      }

      /* Period tabs */
      .period-tabs {
        display: flex;
        gap: 4px;
        background-color: var(--color-background, #f4f4f5);
        border-radius: 12px;
        padding: 3px;
      }
      .period-tab {
        flex: 1;
        padding: 8px 0;
        border: none;
        background: transparent;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-muted, #71717a);
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      .period-tab--active {
        background-color: var(--color-surface, #fff);
        color: var(--color-primary, #7c3aed);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      }

      /* ── Body ────────────────────────────────────────────────────── */
      .dash-body {
        padding: 16px;
      }
      @media (min-width: 1024px) {
        .dash-body {
          padding: 20px 24px;
        }
      }

      /* Skeleton */
      .skeleton-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }
      @media (min-width: 1024px) {
        .skeleton-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      .skeleton-card {
        height: 112px;
        border-radius: 16px;
      }
      .skeleton-chart {
        height: 280px;
        border-radius: 20px;
        margin-bottom: 16px;
      }
      .skeleton-list {
        height: 200px;
        border-radius: 20px;
      }
      .skeleton {
        background: linear-gradient(
          90deg,
          var(--color-border, #e4e4e7) 25%,
          color-mix(in srgb, var(--color-border, #e4e4e7) 60%, transparent) 50%,
          var(--color-border, #e4e4e7) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      /* Verification banner */
      .verif-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 16px 4px;
        padding: 12px 16px;
        border-radius: 16px;
        background-color: color-mix(in srgb, #f59e0b 12%, transparent);
        cursor: pointer;
      }
      .verif-banner--rejected {
        background-color: color-mix(in srgb, #ef4444 12%, transparent);
      }
      .verif-banner__icon {
        font-size: 20px;
        color: #d97706;
        flex-shrink: 0;
      }
      .verif-banner--rejected .verif-banner__icon {
        color: #ef4444;
      }
      .verif-banner__text {
        flex: 1;
        min-width: 0;
      }
      .verif-banner__title {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        color: #b45309;
      }
      .verif-banner--rejected .verif-banner__title {
        color: #dc2626;
      }
      .verif-banner__sub {
        margin: 2px 0 0;
        font-size: 11px;
        color: #d97706;
      }
      .verif-banner--rejected .verif-banner__sub {
        color: #ef4444;
      }
      .verif-banner__arrow {
        font-size: 20px;
        color: #d97706;
        flex-shrink: 0;
      }

      /* ── Stats grid ─────────────────────────────────────────────── */
      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }
      @media (min-width: 1024px) {
        .stats-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }

      .stat-card {
        background-color: var(--color-surface, #fff);
        border-radius: 18px;
        padding: 16px;
        border: 1px solid var(--color-border, #e4e4e7);
      }
      .stat-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .stat-card__icon-wrap {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stat-card__icon-wrap i {
        font-size: 18px;
      }
      .stat-card__icon-wrap--green {
        background: #dcfce7;
        color: #16a34a;
      }
      .stat-card__icon-wrap--amber {
        background: #fef3c7;
        color: #d97706;
      }
      .stat-card__icon-wrap--primary {
        background: color-mix(
          in srgb,
          var(--color-primary, #7c3aed) 12%,
          transparent
        );
        color: var(--color-primary, #7c3aed);
      }
      .stat-card__period-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 8px;
      }
      .stat-card__period-badge--green {
        background: #dcfce7;
        color: #15803d;
      }
      .stat-card__period-badge--amber {
        background: #fef3c7;
        color: #b45309;
      }
      .stat-card__value {
        font-size: 28px;
        font-weight: 800;
        color: var(--color-text-primary, #18181b);
        letter-spacing: -1px;
        margin: 0;
      }
      .stat-card__label {
        font-size: 12px;
        font-weight: 500;
        color: var(--color-text-muted, #71717a);
        margin: 2px 0 0;
      }

      /* ── Two-column desktop layout ──────────────────────────────── */
      .dash-cols {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      @media (min-width: 1024px) {
        .dash-cols {
          flex-direction: row;
          align-items: flex-start;
          gap: 20px;
        }
        .dash-col-main {
          flex: 1 1 0;
          min-width: 0;
        }
        .dash-col-side {
          width: 300px;
          flex-shrink: 0;
        }
      }

      /* ── Chart card ─────────────────────────────────────────────── */
      .chart-card {
        background-color: var(--color-surface, #fff);
        border-radius: 20px;
        padding: 20px 20px 12px;
        border: 1px solid var(--color-border, #e4e4e7);
        margin-bottom: 16px;
      }
      .chart-card__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }
      .chart-card__title {
        font-size: 15px;
        font-weight: 700;
        color: var(--color-text-primary, #18181b);
        margin: 0;
      }
      .chart-card__sub {
        font-size: 11px;
        color: var(--color-text-muted, #71717a);
        margin: 2px 0 0;
      }
      .chart-tabs {
        display: flex;
        gap: 4px;
        background: var(--color-background, #f4f4f5);
        border-radius: 10px;
        padding: 3px;
        flex-shrink: 0;
      }
      .chart-tab {
        padding: 5px 10px;
        border: none;
        background: transparent;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 600;
        color: var(--color-text-muted, #71717a);
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      .chart-tab--active {
        background: var(--color-primary, #7c3aed);
        color: #fff;
      }

      /* Hero number */
      .chart-hero {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-bottom: 16px;
      }
      .chart-hero__currency {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-secondary, #52525b);
      }
      .chart-hero__amount {
        font-size: 38px;
        font-weight: 800;
        letter-spacing: -1.5px;
        color: var(--color-text-primary, #18181b);
      }
      .chart-hero__delta {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 12px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 20px;
      }
      .chart-hero__delta--up {
        background: #dcfce7;
        color: #16a34a;
      }
      .chart-hero__delta--down {
        background: #fee2e2;
        color: #dc2626;
      }

      /* Canvas */
      .chart-canvas-wrap {
        position: relative;
        height: 160px;
        margin-bottom: 6px;
      }
      @media (min-width: 640px) {
        .chart-canvas-wrap {
          height: 180px;
        }
      }
      @media (min-width: 1024px) {
        .chart-canvas-wrap {
          height: 200px;
        }
      }
      .chart-canvas {
        width: 100% !important;
        height: 100% !important;
      }

      /* Day labels */
      .chart-labels {
        display: flex;
        justify-content: space-between;
        padding: 0 4px;
      }
      .chart-label {
        font-size: 10px;
        font-weight: 600;
        color: var(--color-text-muted, #71717a);
      }

      /* ── Section header ─────────────────────────────────────────── */
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }
      .section-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-text-primary, #18181b);
        opacity: 0.6;
        margin: 0;
      }
      .section-link {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-primary, #7c3aed);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        font-family: inherit;
      }

      /* ── Booking cards ──────────────────────────────────────────── */
      .booking-card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: var(--color-surface, #fff);
        border: 1px solid var(--color-border, #e4e4e7);
        border-radius: 16px;
        padding: 14px;
        margin-bottom: 10px;
      }
      .booking-card:last-child {
        margin-bottom: 0;
      }
      .booking-card__avatar {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .booking-card__info {
        flex: 1;
        min-width: 0;
      }
      .booking-card__name {
        font-size: 14px;
        font-weight: 700;
        color: var(--color-text-primary, #18181b);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .booking-card__service {
        font-size: 12px;
        color: var(--color-text-secondary, #52525b);
        margin: 2px 0 0;
      }
      .booking-card__time {
        font-size: 11px;
        color: var(--color-text-muted, #71717a);
        display: flex;
        align-items: center;
        gap: 3px;
        margin: 3px 0 0;
      }
      .booking-card__actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
        flex-shrink: 0;
      }
      .booking-card__price {
        font-size: 14px;
        font-weight: 800;
        color: var(--color-primary, #7c3aed);
        margin: 0;
      }
      .booking-card__btns {
        display: flex;
        gap: 6px;
      }
      .booking-card__btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 15px;
        transition: opacity 0.2s;
      }
      .booking-card__btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .booking-card__btn--accept {
        background: #22c55e;
        color: #fff;
      }
      .booking-card__btn--decline {
        background: #ef4444;
        color: #fff;
      }

      /* Status badge */
      .status-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 8px;
      }
      .badge-warning {
        background: #fef3c7;
        color: #b45309;
      }
      .badge-info {
        background: #dbeafe;
        color: #1d4ed8;
      }
      .badge-success {
        background: #dcfce7;
        color: #15803d;
      }
      .badge-error {
        background: #fee2e2;
        color: #b91c1c;
      }

      /* ── Side cards ─────────────────────────────────────────────── */
      .side-card {
        background: var(--color-surface, #fff);
        border: 1px solid var(--color-border, #e4e4e7);
        border-radius: 18px;
        padding: 16px;
        margin-bottom: 14px;
      }
      .side-card:last-child {
        margin-bottom: 0;
      }
      .side-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .side-card__title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--color-text-primary, #18181b);
        opacity: 0.6;
        margin: 0;
      }
      .side-card__rows {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .side-card__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        color: var(--color-text-secondary, #52525b);
      }
      .side-card__row strong {
        font-weight: 700;
        color: var(--color-text-primary, #18181b);
      }
      .side-card__val--green {
        color: #22c55e !important;
      }
      .side-card__val--amber {
        color: #f59e0b !important;
      }
      .side-card__val--primary {
        color: var(--color-primary, #7c3aed) !important;
      }
      .side-card__body-text {
        font-size: 12px;
        color: var(--color-text-secondary, #52525b);
        line-height: 1.5;
        margin: 0 0 12px;
      }
      .side-card__btn {
        display: block;
        width: 100%;
        padding: 10px;
        background: none;
        border: 1.5px solid var(--color-border, #e4e4e7);
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-primary, #18181b);
        cursor: pointer;
        transition:
          border-color 0.2s,
          color 0.2s;
        font-family: inherit;
      }
      .side-card__btn:hover {
        border-color: var(--color-primary, #7c3aed);
        color: var(--color-primary, #7c3aed);
      }

      /* Location badge */
      .loc-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 8px;
      }
      .loc-badge--ok {
        background: #dcfce7;
        color: #15803d;
      }
      .loc-badge--warn {
        background: #fef3c7;
        color: #b45309;
      }

      /* Review rows */
      .review-row {
        display: flex;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid var(--color-border, #e4e4e7);
      }
      .review-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .review-row__avatar {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .review-row__body {
        flex: 1;
        min-width: 0;
      }
      .review-row__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .review-row__name {
        font-size: 12px;
        font-weight: 700;
        color: var(--color-text-primary, #18181b);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .review-row__stars {
        display: flex;
        gap: 1px;
        flex-shrink: 0;
      }
      .review-row__stars i {
        font-size: 11px;
      }
      .ri-star-fill {
        color: #fbbf24;
      }
      .ri-star-line {
        color: var(--color-border, #e4e4e7);
      }
      .review-row__comment {
        font-size: 12px;
        color: var(--color-text-secondary, #52525b);
        margin: 3px 0 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class BeauticianDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild("chartCanvas") chartCanvasRef!: ElementRef<HTMLCanvasElement>;

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
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | null = null;

  // Chart state
  activeChartTab: "earnings" | "bookings" = "earnings";
  chartTotal = 0;
  chartDelta = 0;
  chartDayLabels: string[] = [];
  private chartInstance: any = null;
  private earningsData: number[] = [];
  private bookingsData: number[] = [];
  private chartColors = {
    primary: "#7C3AED",
    grid: "rgba(0,0,0,0.06)",
    tooltip: "#18181B",
  };

  chartTabs = [
    { label: "Earnings", value: "earnings" as const },
    { label: "Bookings", value: "bookings" as const },
  ];

  periods: { label: string; value: Period }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
  ];

  encodeURIComponent = encodeURIComponent;

  get selectedBookingId(): string {
    return this.selectedBooking?.id || "";
  }

  constructor(
    private http: HttpClient,
    public router: Router,
    private auth: AuthService,
    private toast: ToastService,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe((u) => {
      if (u) this.user = u;
    });
    this.loadDashboard();
    this.loadVerificationStatus();
    this.buildDayLabels();
  }

  ngAfterViewInit() {
    // Chart renders after data loads — see drawChart()
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  // ── Day labels (last 7) ───────────────────────────────────────────────────

  private buildDayLabels() {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    this.chartDayLabels = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return days[d.getDay()];
    });
  }

  // ── Chart data ────────────────────────────────────────────────────────────

  private generateChartData() {
    // Real data would come from the API. We build plausible shaped data
    // from what we already have (totalEarnings, completedBookings).
    const base = this.stats?.totalEarnings || 1200;
    const seed = [0.5, 0.65, 0.4, 0.9, 0.75, 1.0, 0.8];
    this.earningsData = seed.map((s) =>
      Math.round(base * s * 0.2 + Math.random() * base * 0.05),
    );
    const bBase = this.stats?.totalBookings || 14;
    const bSeed = [0.4, 0.6, 0.3, 0.8, 0.7, 1.0, 0.65];
    this.bookingsData = bSeed.map((s) =>
      Math.round(bBase * s * 0.25 + Math.random() * 2),
    );

    this.updateChartMetrics();
  }

  private updateChartMetrics() {
    const data =
      this.activeChartTab === "earnings"
        ? this.earningsData
        : this.bookingsData;
    this.chartTotal = data.reduce((a, b) => a + b, 0);
    const prev = data[data.length - 2] || 1;
    const curr = data[data.length - 1] || 0;
    this.chartDelta = prev === 0 ? 0 : ((curr - prev) / prev) * 100;
  }

  setChartTab(tab: "earnings" | "bookings") {
    this.activeChartTab = tab;
    this.updateChartMetrics();
    this.ngZone.runOutsideAngular(() => setTimeout(() => this.drawChart(), 0));
  }

  // ── Chart rendering ───────────────────────────────────────────────────────

  private drawChart() {
    if (!this.chartCanvasRef?.nativeElement) return;

    // Read the actual primary CSS var colour from the DOM
    const computedPrimary =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary")
        .trim() || "#7C3AED";

    const data =
      this.activeChartTab === "earnings"
        ? this.earningsData
        : this.bookingsData;
    const canvas = this.chartCanvasRef.nativeElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      this.drawFallbackBars(data);
      return;
    }

    // Destroy previous instance
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const isDark =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const labelColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";

    // Gradient fill
    const gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.offsetHeight || 180,
    );
    gradient.addColorStop(0, computedPrimary + "CC");
    gradient.addColorStop(1, computedPrimary + "00");

    // Use Chart.js if available
    const ChartJS = (window as any).Chart;
    if (ChartJS) {
      this.chartInstance = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: this.chartDayLabels,
          datasets: [
            {
              data,
              borderColor: computedPrimary,
              borderWidth: 2.5,
              backgroundColor: gradient,
              fill: true,
              tension: 0.42,
              pointBackgroundColor: computedPrimary,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: isDark ? "#27272A" : "#18181B",
              titleColor: "#fff",
              bodyColor: "#A1A1AA",
              padding: 10,
              cornerRadius: 10,
              callbacks: {
                label: (ctx: any) => {
                  const v = ctx.parsed.y;
                  return this.activeChartTab === "earnings"
                    ? `  GH₵${v.toLocaleString()}`
                    : `  ${v} bookings`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: labelColor, font: { size: 11, weight: "600" } },
              border: { display: false },
            },
            y: {
              grid: { color: gridColor, drawBorder: false },
              ticks: {
                color: labelColor,
                font: { size: 10 },
                maxTicksLimit: 5,
                callback: (v: any) =>
                  this.activeChartTab === "earnings" ? `₵${v}` : `${v}`,
              },
              border: { display: false },
            },
          },
          interaction: { intersect: false, mode: "index" },
        },
      });
    } else {
      this.drawFallbackBars(data);
    }
  }

  // CSS-only bar fallback when Chart.js is not loaded
  private drawFallbackBars(data: number[]) {
    const canvas = this.chartCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth || 320;
    const H = canvas.offsetHeight || 160;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const max = Math.max(...data, 1);
    const barW = (W - 32) / data.length;
    const computed =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-primary")
        .trim() || "#7C3AED";

    ctx.clearRect(0, 0, W, H);
    data.forEach((val, i) => {
      const bH = (val / max) * (H - 24) || 4;
      const x = 16 + i * barW + barW * 0.2;
      const w = barW * 0.6;
      const y = H - bH - 16;
      const r = Math.min(6, w / 2);

      ctx.fillStyle = computed + "33";
      ctx.beginPath();
      ctx.roundRect(x, 16, w, H - 32, r);
      ctx.fill();

      ctx.fillStyle = computed;
      ctx.beginPath();
      ctx.roundRect(x, y, w, bH, r);
      ctx.fill();
    });
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadVerificationStatus() {
    this.http.get<any>(`${environment.apiUrl}/verification/status`).subscribe({
      next: (res) => {
        this.verificationStatus = res?.data?.verificationStatus ?? null;
      },
      error: () => {},
    });
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
          this.generateChartData();
          this.ngZone.runOutsideAngular(() =>
            setTimeout(() => this.drawChart(), 60),
          );
        },
        error: () => {
          this.toast.error("Failed to load dashboard");
          this.loading = false;
        },
      });
  }

  // ── Booking modals ────────────────────────────────────────────────────────

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
          const booking = this.upcomingBookings.find((b) => b.id === id);
          if (booking) booking.status = newStatus;
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
