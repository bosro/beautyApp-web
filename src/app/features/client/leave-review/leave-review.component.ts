
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ToastService } from "../../../core/services/toast.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-leave-review",
  template: `
    <div class="min-h-screen" style="background-color: var(--color-bg-primary)">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-4 pt-4 pb-3 lg:px-6">
        <button
          (click)="goBack()"
          class="w-9 h-9 rounded-full flex items-center justify-center"
          style="background-color: var(--color-bg-secondary)"
        >
          <i class="ri-arrow-left-s-line text-xl" style="color: var(--color-text-primary)"></i>
        </button>
        <h1 class="text-base font-bold" style="color: var(--color-text-primary)">
          Leave a Review
        </h1>
        <div class="w-9"></div>
      </div>

      <div class="px-4 lg:px-6 pb-32 max-w-2xl mx-auto">

        <!-- BOOKING SUMMARY CARD -->
        <ng-container *ngIf="loadingBooking">
          <div class="skeleton h-24 rounded-2xl mb-6"></div>
        </ng-container>

        <div
          *ngIf="!loadingBooking && booking"
          class="rounded-2xl p-4 mb-6 flex items-center gap-4"
          style="background-color: var(--color-bg-secondary)"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)"
          >
            <i class="ri-store-2-line text-xl" style="color: var(--color-primary)"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-sm truncate" style="color: var(--color-text-primary)">
              {{ booking.beautician?.businessName || 'Salon' }}
            </p>
            <p class="text-xs mt-0.5 truncate" style="color: var(--color-text-secondary)">
              {{ booking.service?.name || 'Service' }}
            </p>
            <p class="text-xs mt-0.5" style="color: var(--color-text-placeholder)">
              Booking #{{ booking.bookingNumber }}
            </p>
          </div>
        </div>

        <!-- STARS CARD -->
        <div
          class="rounded-2xl p-6 mb-4 text-center"
          style="background-color: var(--color-bg-secondary)"
        >
          <p class="text-sm font-medium mb-5" style="color: var(--color-text-secondary)">
            How would you rate your experience?
          </p>

          <!-- Stars -->
          <div class="flex items-center justify-center gap-3 mb-4">
            <button
              *ngFor="let star of [1,2,3,4,5]"
              (click)="setRating(star)"
              (mouseenter)="hoveredRating = star"
              (mouseleave)="hoveredRating = 0"
              class="transition-transform active:scale-90 hover:scale-110"
              style="background: none; border: none; cursor: pointer; padding: 4px"
            >
              <i
                class="text-4xl transition-colors"
                [class]="(hoveredRating || rating) >= star ? 'ri-star-fill' : 'ri-star-line'"
                [style.color]="(hoveredRating || rating) >= star ? '#FFB800' : 'var(--color-border)'"
              ></i>
            </button>
          </div>

          <!-- Rating label -->
          <div style="min-height: 24px">
            <span
              *ngIf="displayRating > 0"
              class="text-sm font-semibold px-4 py-1 rounded-full"
              style="background-color: color-mix(in srgb, #FFB800 15%, transparent); color: #FFB800"
            >
              {{ ratingLabels[displayRating] }}
            </span>
          </div>
        </div>

        <!-- COMMENT -->
        <div class="mb-6">
          <p class="font-semibold text-sm mb-2" style="color: var(--color-text-primary)">
            Share your experience
            <span style="color: var(--color-text-secondary)">(Optional)</span>
          </p>
          <textarea
            [(ngModel)]="comment"
            placeholder="What did you like or dislike? Your feedback helps others..."
            rows="5"
            class="form-input w-full resize-none"
            [disabled]="submitting"
          ></textarea>
        </div>

      </div>

      <!-- STICKY SUBMIT BUTTON -->
      <div
        class="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 lg:px-6"
        style="background: linear-gradient(to top, var(--color-bg-primary) 80%, transparent)"
      >
        <div class="max-w-2xl mx-auto">
          <button
            (click)="rating > 0 && !submitting ? submitReview() : null"
            class="w-full py-4 rounded-2xl font-bold text-sm transition-all"
            [style.background-color]="rating > 0 && !submitting ? '#1a1a1a' : 'var(--color-bg-secondary)'"
            [style.color]="rating > 0 && !submitting ? '#fff' : 'var(--color-text-placeholder)'"
            [style.cursor]="rating > 0 && !submitting ? 'pointer' : 'not-allowed'"
          >
            <span *ngIf="!submitting">
              {{ rating > 0 ? 'Submit Review' : 'Select a rating to continue' }}
            </span>
            <span *ngIf="submitting" class="flex items-center justify-center gap-2">
              <i class="ri-loader-4-line animate-spin"></i>
              Submitting...
            </span>
          </button>
        </div>
      </div>

    </div>
  `,
})
export class LeaveReviewComponent implements OnInit {
  bookingId = "";
  salonId = "";
  booking: any = null;
  loadingBooking = true;
  submitting = false;

  rating = 0;
  hoveredRating = 0;
  comment = "";

  readonly ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Great",
    5: "Excellent",
  };

  get displayRating(): number {
    return this.hoveredRating || this.rating;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.queryParamMap.get("bookingId") || "";
    this.salonId = this.route.snapshot.queryParamMap.get("salonId") || "";
    if (this.bookingId) {
      this.loadBooking();
    } else {
      this.loadingBooking = false;
    }
  }

  private loadBooking(): void {
    this.http
      .get<any>(`${environment.apiUrl}/bookings/${this.bookingId}`)
      .subscribe({
        next: (res) => {
          this.booking = res?.data?.booking || null;
          this.loadingBooking = false;
        },
        error: () => {
          this.loadingBooking = false;
        },
      });
  }

  setRating(star: number): void {
    this.rating = star;
  }

  async submitReview(): Promise<void> {
    if (this.rating === 0) {
      this.toast.warning("Please select a rating");
      return;
    }
    if (!this.bookingId) {
      this.toast.error("Booking information is missing");
      return;
    }

    this.submitting = true;

    this.http
      .post<any>(`${environment.apiUrl}/reviews`, {
        bookingId: this.bookingId,
        rating: this.rating,
        comment: this.comment.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.toast.success("Review submitted successfully!");
          this.goBack();
        },
        error: (err) => {
          this.submitting = false;
          const message = err?.error?.message || "Failed to submit review";
          this.toast.error(message);
        },
      });
  }

  goBack(): void {
    if (this.salonId) {
      this.router.navigate(["/client/salon", this.salonId]);
    } else {
      this.router.navigate(["/client/bookings"]);
    }
  }
}