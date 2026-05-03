import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-beautician-reviews',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4">
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Reviews</h1>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-28 rounded-2xl"></div>
        <div *ngFor="let i of [1,2,3]" class="skeleton h-36 rounded-xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- Summary -->
        <div class="card p-5">
          <div class="flex items-center gap-5">
            <div class="text-center">
              <p class="text-5xl font-black text-[var(--color-primary)]">{{ summary?.averageRating | number:'1.1-1' }}</p>
              <div class="flex items-center gap-0.5 justify-center mt-1">
                <i *ngFor="let s of [1,2,3,4,5]" class="text-lg"
                   [ngClass]="s <= (summary?.averageRating ?? 0) ?  'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'"></i>
              </div>
              <p class="text-xs text-[var(--color-text-muted)] mt-1">{{ summary?.totalReviews }} reviews</p>
            </div>

            <div class="flex-1 space-y-1.5">
              <div *ngFor="let bar of ratingBars" class="flex items-center gap-2">
                <span class="text-xs text-[var(--color-text-muted)] w-3">{{ bar.star }}</span>
                <div class="flex-1 h-2 bg-[var(--color-background)] rounded-full overflow-hidden">
                  <div class="h-full bg-amber-400 rounded-full" [style.width.%]="bar.percent"></div>
                </div>
                <span class="text-xs text-[var(--color-text-muted)] w-4 text-right">{{ bar.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviews List -->
        <app-empty-state
          *ngIf="reviews.length === 0"
          icon="ri-star-line"
          title="No Reviews Yet"
          subtitle="Reviews from clients will appear here after completed bookings.">
        </app-empty-state>

        <div *ngFor="let review of reviews" class="card p-4 space-y-3">
          <div class="flex items-start gap-3">
            <img
              [src]="review.client?.avatar || 'https://ui-avatars.com/api/?name=' + review.client?.firstName"
              class="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <p class="font-semibold text-sm text-[var(--color-text-primary)]">{{ review.client?.firstName }} {{ review.client?.lastName }}</p>
                <p class="text-xs text-[var(--color-text-muted)]">{{ review.createdAt | date:'MMM d, y' }}</p>
              </div>
              <div class="flex items-center gap-0.5 mt-0.5">
                <i *ngFor="let s of [1,2,3,4,5]" class="text-sm"
                   [ngClass]="s <= review.rating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'"></i>
              </div>
            </div>
          </div>

          <p class="text-sm text-[var(--color-text-secondary)]">{{ review.comment }}</p>

          <!-- Service tag -->
          <span *ngIf="review.booking?.services?.length" class="badge badge-info text-xs">
            {{ review.booking.services[0]?.service?.name }}
          </span>

          <!-- Reply -->
          <div *ngIf="review.reply" class="bg-[var(--color-background)] rounded-xl p-3 border-l-2 border-[var(--color-primary)]">
            <p class="text-xs font-semibold text-[var(--color-primary)] mb-1">Your Reply</p>
            <p class="text-sm text-[var(--color-text-secondary)]">{{ review.reply }}</p>
          </div>

          <div *ngIf="!review.reply">
            <div *ngIf="replyingId === review.id" class="space-y-2">
              <textarea [(ngModel)]="replyText" rows="2" class="form-input resize-none text-sm" placeholder="Write a reply..."></textarea>
              <div class="flex gap-2">
                <button (click)="replyingId = null; replyText = ''" class="flex-1 py-1.5 border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-secondary)]">Cancel</button>
                <button (click)="submitReply(review)" [disabled]="!replyText.trim() || replying" class="flex-1 btn-primary text-xs py-1.5">
                  <span *ngIf="!replying">Reply</span>
                  <span *ngIf="replying" class="flex items-center justify-center gap-1"><i class="ri-loader-4-line animate-spin"></i></span>
                </button>
              </div>
            </div>
            <button *ngIf="replyingId !== review.id" (click)="replyingId = review.id" class="text-xs text-[var(--color-primary)] font-medium">
              <i class="ri-reply-line mr-1"></i> Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BeauticianReviewsComponent implements OnInit {
  reviews: any[] = [];
  summary: any = null;
  loading = true;
  replyingId: string | null = null;
  replyText = '';
  replying = false;

  get ratingBars() {
    const dist = this.summary?.ratingDistribution || {};
    const total = this.summary?.totalReviews || 1;
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: dist[star] || 0,
      percent: ((dist[star] || 0) / total) * 100
    }));
  }

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/beauticians/reviews`).subscribe({
      next: (res) => {
        this.reviews = res.data?.reviews || [];
        this.summary = res.data?.summary;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  submitReply(review: any) {
    if (!this.replyText.trim()) return;
    this.replying = true;
    this.http.post(`${environment.apiUrl}/reviews/${review.id}/reply`, { reply: this.replyText }).subscribe({
      next: () => {
        review.reply = this.replyText;
        this.replyingId = null;
        this.replyText = '';
        this.replying = false;
        this.toast.success('Reply posted!');
      },
      error: () => { this.replying = false; this.toast.error('Failed to post reply'); }
    });
  }
}
