import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-booking-details',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3">
        <button (click)="goBack()" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors">
          <i class="ri-arrow-left-line text-xl text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Booking Details</h1>
        <div class="ml-auto" *ngIf="booking">
          <span class="badge" [ngClass]="getStatusClass(booking.status)">{{ booking.status }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 space-y-4">
        <div class="skeleton h-48 rounded-2xl"></div>
        <div class="skeleton h-32 rounded-2xl"></div>
        <div class="skeleton h-32 rounded-2xl"></div>
      </div>

      <!-- Content -->
      <div *ngIf="!loading && booking" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- Beautician Card -->
        <div class="card p-4 flex gap-4">
          <img
            [src]="booking.beautician?.profileImage || 'https://ui-avatars.com/api/?name=' + booking.beautician?.businessName"
            [alt]="booking.beautician?.businessName"
            class="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-[var(--color-text-primary)] truncate">{{ booking.beautician?.businessName }}</h2>
            <p class="text-sm text-[var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
              <i class="ri-map-pin-line"></i> {{ booking.beautician?.city || 'Accra' }}
            </p>
            <div class="flex items-center gap-1 mt-1">
              <i class="ri-star-fill text-amber-400 text-sm"></i>
              <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ booking.beautician?.averageRating | number:'1.1-1' }}</span>
              <span class="text-xs text-[var(--color-text-muted)]">({{ booking.beautician?.reviewCount }} reviews)</span>
            </div>
          </div>
          <button (click)="viewSalon()" class="self-start text-[var(--color-primary)] text-sm font-medium">View</button>
        </div>

        <!-- Booking Info -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Booking Info</h3>
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                <i class="ri-hashtag text-[var(--color-primary)]"></i> Booking #
              </span>
              <span class="text-sm font-mono font-medium text-[var(--color-text-primary)]">{{ booking.bookingNumber }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                <i class="ri-calendar-line text-[var(--color-primary)]"></i> Date
              </span>
              <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ booking.date | date:'EEE, MMM d, y' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                <i class="ri-time-line text-[var(--color-primary)]"></i> Time
              </span>
              <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ booking.startTime }} – {{ booking.endTime }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                <i class="ri-timer-line text-[var(--color-primary)]"></i> Duration
              </span>
              <span class="text-sm font-medium text-[var(--color-text-primary)]">{{ booking.totalDuration }} mins</span>
            </div>
          </div>
        </div>

        <!-- Services -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Services</h3>
          <div class="space-y-2">
            <div *ngFor="let item of booking.services" class="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
              <div>
                <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ item.service?.name }}</p>
                <p class="text-xs text-[var(--color-text-muted)]">{{ item.service?.duration }} mins</p>
              </div>
              <span class="text-sm font-semibold text-[var(--color-text-primary)]">GH₵ {{ item.price | number:'1.2-2' }}</span>
            </div>
          </div>
          <div class="flex items-center justify-between pt-1">
            <span class="font-semibold text-[var(--color-text-primary)]">Total</span>
            <span class="font-bold text-[var(--color-primary)] text-lg">GH₵ {{ booking.totalAmount | number:'1.2-2' }}</span>
          </div>
        </div>

        <!-- Notes -->
        <div class="card p-4 space-y-2" *ngIf="booking.notes">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Your Notes</h3>
          <p class="text-sm text-[var(--color-text-secondary)]">{{ booking.notes }}</p>
        </div>

        <!-- Review -->
        <div class="card p-4 space-y-3" *ngIf="booking.review">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Your Review</h3>
          <div class="flex items-center gap-1">
            <i *ngFor="let star of [1,2,3,4,5]"
               class="text-lg"
               [ngClass]="star <= booking.review.rating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-[var(--color-text-muted)]'"></i>
          </div>
          <p class="text-sm text-[var(--color-text-secondary)]">{{ booking.review.comment }}</p>
          <p class="text-xs text-[var(--color-text-muted)]">{{ booking.review.createdAt | date:'MMM d, y' }}</p>
        </div>

        <!-- Actions -->
        <div class="space-y-3" *ngIf="booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'">

          <!-- Leave Review -->
          <div *ngIf="booking.status === 'COMPLETED' && !booking.review" class="card p-4 border-2 border-[var(--color-primary)] border-dashed">
            <p class="text-sm text-[var(--color-text-secondary)] mb-3">How was your experience? Leave a review to help others.</p>
            <div class="flex items-center gap-1 mb-3">
              <button *ngFor="let star of [1,2,3,4,5]" (click)="reviewRating = star" class="text-2xl transition-transform hover:scale-110">
                <i [ngClass]="star <= reviewRating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-[var(--color-text-muted)]'"></i>
              </button>
            </div>
            <textarea
              [(ngModel)]="reviewComment"
              placeholder="Share your experience..."
              rows="3"
              class="form-input resize-none mb-3"></textarea>
            <button (click)="submitReview()" [disabled]="reviewRating === 0 || submittingReview" class="btn-primary w-full">
              <span *ngIf="!submittingReview">Submit Review</span>
              <span *ngIf="submittingReview" class="flex items-center justify-center gap-2"><i class="ri-loader-4-line animate-spin"></i> Submitting...</span>
            </button>
          </div>

          <!-- Cancel -->
          <button *ngIf="booking.status === 'PENDING'" (click)="showCancelModal = true"
            class="w-full py-3 rounded-xl border-2 border-red-300 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            Cancel Booking
          </button>
        </div>

      </div>

      <!-- Cancel Modal -->
      <app-confirm-modal
        *ngIf="showCancelModal"
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        type="error"
        [loading]="cancelling"
        (confirmed)="cancelBooking()"
        (cancelled)="showCancelModal = false">
      </app-confirm-modal>
    </div>
  `,
})
export class BookingDetailsComponent implements OnInit {
  booking: any = null;
  loading = true;
  showCancelModal = false;
  cancelling = false;
  reviewRating = 0;
  reviewComment = '';
  submittingReview = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.http.get<any>(`${environment.apiUrl}/bookings/${id}`).subscribe({
      next: (res) => { this.booking = res.data; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Failed to load booking'); }
    });
  }

  goBack() { this.router.navigate(['/client/bookings']); }

  viewSalon() { this.router.navigate(['/client/salon', this.booking.beautician?.id]); }

  getStatusClass(status: string) {
    const map: any = { PENDING: 'badge-warning', CONFIRMED: 'badge-info', COMPLETED: 'badge-success', CANCELLED: 'badge-error' };
    return map[status] || '';
  }

  cancelBooking() {
    this.cancelling = true;
    this.http.patch(`${environment.apiUrl}/bookings/${this.booking.id}/cancel`, {}).subscribe({
      next: () => {
        this.booking.status = 'CANCELLED';
        this.showCancelModal = false;
        this.cancelling = false;
        this.toast.success('Booking cancelled');
      },
      error: () => { this.cancelling = false; this.toast.error('Failed to cancel booking'); }
    });
  }

  submitReview() {
    if (this.reviewRating === 0) return;
    this.submittingReview = true;
    this.http.post(`${environment.apiUrl}/reviews`, {
      bookingId: this.booking.id,
      beauticianId: this.booking.beautician?.id,
      rating: this.reviewRating,
      comment: this.reviewComment,
    }).subscribe({
      next: (res: any) => {
        this.booking.review = res.data;
        this.submittingReview = false;
        this.toast.success('Review submitted!');
      },
      error: () => { this.submittingReview = false; this.toast.error('Failed to submit review'); }
    });
  }
}
