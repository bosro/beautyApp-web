// beautician-reviews.component.ts
// Fixed + enhanced to match mobile BeauticianReviewsScreen:
//   - Rating breakdown bars (clickable filter)
//   - Filter chips by star rating
//   - Reply inline (existing web feature kept)
//   - customer field: res.data.reviews[].customer (not .client)

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-beautician-reviews",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <div class="pp-header">
        <button class="pp-back-btn" (click)="goBack()">
          <i class="ri-arrow-left-line"></i>
        </button>
        <h1 class="pp-title">Reviews</h1>
        <div class="pp-spacer"></div>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-28 rounded-2xl"></div>
        <div *ngFor="let i of [1, 2, 3]" class="skeleton h-36 rounded-xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        <!-- Rating overview — mirrors mobile overviewCard -->
        <div class="card p-5 flex gap-5">
          <!-- Big average number -->
          <div
            class="flex flex-col items-center justify-center pr-5 border-r border-[var(--color-border)]"
          >
            <p class="text-5xl font-black text-[var(--color-primary)]">
              {{ summary?.averageRating || 0 | number: "1.1-1" }}
            </p>
            <div class="flex items-center gap-0.5 mt-1">
              <i
                *ngFor="let s of [1, 2, 3, 4, 5]"
                class="text-lg"
                [ngClass]="
                  s <= (summary?.averageRating || 0)
                    ? 'ri-star-fill text-amber-400'
                    : 'ri-star-line text-gray-300'
                "
              ></i>
            </div>
            <p class="text-xs text-[var(--color-text-muted)] mt-1">
              {{ summary?.totalReviews || 0 }} reviews
            </p>
          </div>

          <!-- Breakdown bars — clickable filter, mirrors mobile RatingBar -->
          <div class="flex-1 space-y-1.5 justify-center flex flex-col">
            <div
              *ngFor="let bar of ratingBars"
              (click)="setFilter(bar.star)"
              class="flex items-center gap-2 cursor-pointer group"
            >
              <span class="text-xs text-[var(--color-text-muted)] w-3">{{
                bar.star
              }}</span>
              <div
                class="flex-1 h-2 bg-[var(--color-background)] rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-amber-400 rounded-full transition-all duration-300"
                  [style.width.%]="bar.percent"
                ></div>
              </div>
              <span
                class="text-xs text-[var(--color-text-muted)] w-4 text-right"
                >{{ bar.count }}</span
              >
            </div>
          </div>
        </div>

        <!-- Filter chips — mirrors mobile filterChips -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            (click)="setFilter('all')"
            class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
            [ngClass]="
              activeFilter === 'all'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]'
            "
          >
            All ({{ summary?.totalReviews || 0 }})
          </button>
          <ng-container *ngFor="let bar of ratingBars">
            <button
              *ngIf="bar.count > 0"
              (click)="setFilter(bar.star)"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
              [ngClass]="
                activeFilter === bar.star
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-[var(--color-background-secondary)] text-[var(--color-text-primary)]'
              "
            >
              <i
                class="ri-star-fill text-amber-400"
                [ngClass]="{ 'text-white': activeFilter === bar.star }"
              >
              </i>

              {{ bar.star }} ({{ bar.count }})
            </button>
          </ng-container>
        </div>

        <!-- Empty -->
        <app-empty-state
          *ngIf="filteredReviews.length === 0"
          icon="ri-star-line"
          title="No Reviews Yet"
          subtitle="Reviews from clients will appear here after completed bookings."
        >
        </app-empty-state>

        <!-- Review cards -->
        <div *ngFor="let review of filteredReviews" class="card p-4 space-y-3">
          <!-- Header: avatar + name + stars + date -->
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-[var(--color-primary)]/10 flex items-center justify-center"
            >
              <img
                *ngIf="review.customer?.avatar || review.client?.avatar"
                [src]="review.customer?.avatar || review.client?.avatar"
                class="w-full h-full object-cover"
              />
              <i
                *ngIf="!review.customer?.avatar && !review.client?.avatar"
                class="ri-user-line text-lg text-[var(--color-primary)]"
              ></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <p
                  class="font-semibold text-sm text-[var(--color-text-primary)]"
                >
                  {{
                    review.customer?.name ||
                      review.client?.firstName +
                        " " +
                        review.client?.lastName ||
                      "Client"
                  }}
                </p>
                <p class="text-xs text-[var(--color-text-muted)]">
                  {{ review.createdAt | date: "MMM d, y" }}
                </p>
              </div>
              <div class="flex items-center gap-0.5 mt-0.5">
                <i
                  *ngFor="let s of [1, 2, 3, 4, 5]"
                  class="text-sm"
                  [ngClass]="
                    s <= review.rating
                      ? 'ri-star-fill text-amber-400'
                      : 'ri-star-line text-gray-300'
                  "
                ></i>
              </div>
            </div>
          </div>

          <!-- Service tag -->
          <span
            *ngIf="
              review.booking?.service?.name ||
              review.booking?.services?.[0]?.service?.name
            "
            class="inline-block badge badge-info text-xs"
          >
            {{
              review.booking?.service?.name ||
                review.booking?.services?.[0]?.service?.name
            }}
          </span>

          <!-- Comment -->
          <p
            *ngIf="review.comment"
            class="text-sm text-[var(--color-text-secondary)]"
          >
            {{ review.comment }}
          </p>

          <!-- Existing reply -->
          <div
            *ngIf="review.reply"
            class="bg-[var(--color-background)] rounded-xl p-3 border-l-2 border-[var(--color-primary)]"
          >
            <p class="text-xs font-semibold text-[var(--color-primary)] mb-1">
              Your Reply
            </p>
            <p class="text-sm text-[var(--color-text-secondary)]">
              {{ review.reply }}
            </p>
          </div>

          <!-- Reply form / button -->
          <div *ngIf="!review.reply">
            <div *ngIf="replyingId === review.id" class="space-y-2">
              <textarea
                [(ngModel)]="replyText"
                rows="2"
                class="form-input resize-none text-sm"
                placeholder="Write a reply..."
              ></textarea>
              <div class="flex gap-2">
                <button
                  (click)="replyingId = null; replyText = ''"
                  class="flex-1 py-1.5 border border-[var(--color-border)] rounded-lg text-xs text-[var(--color-text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  (click)="submitReply(review)"
                  [disabled]="!replyText.trim() || replying"
                  class="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <i *ngIf="replying" class="ri-loader-4-line animate-spin"></i>
                  <span *ngIf="!replying">Reply</span>
                </button>
              </div>
            </div>
            <button
              *ngIf="replyingId !== review.id"
              (click)="replyingId = review.id"
              class="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1"
            >
              <i class="ri-reply-line"></i> Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pp-page {
        min-height: 100vh;
        background-color: var(--color-background);
        display: flex;
        flex-direction: column;
      }

      .pp-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background-color: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .pp-back-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background-color: var(--color-bg-secondary, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 18px;
        color: var(--color-text-primary);
        transition: opacity 0.2s;
      }

      .pp-back-btn:hover {
        opacity: 0.7;
      }

      .pp-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-text-primary);
        flex: 1;
        text-align: center;
      }

      .pp-spacer {
        width: 36px;
      }
    `,
  ],
})
export class BeauticianReviewsComponent implements OnInit {
  reviews: any[] = [];
  summary: any = null;
  loading = true;
  replyingId: string | null = null;
  replyText = "";
  replying = false;
  activeFilter: number | "all" = "all";

  get ratingBars() {
    const dist = this.summary?.ratingDistribution || {};
    const total = this.summary?.totalReviews || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: dist[star] || 0,
      percent: ((dist[star] || 0) / total) * 100,
    }));
  }

  get filteredReviews() {
    if (this.activeFilter === "all") return this.reviews;
    return this.reviews.filter((r) => r.rating === this.activeFilter);
  }

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Matches mobile useReviews: GET /beauticians/reviews
    // Response: { data: { reviews[], summary: { averageRating, totalReviews, ratingDistribution } } }
    this.http.get<any>(`${environment.apiUrl}/beauticians/reviews`).subscribe({
      next: (res) => {
        this.reviews = res.data?.reviews || [];
        this.summary = res.data?.summary || {
          averageRating: res.meta?.averageRating || 0,
          totalReviews: res.meta?.total || this.reviews.length,
          ratingDistribution: {},
        };
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  setFilter(value: number | "all") {
    this.activeFilter = value;
  }

  submitReply(review: any) {
    if (!this.replyText.trim()) return;
    this.replying = true;
    this.http
      .post(`${environment.apiUrl}/reviews/${review.id}/reply`, {
        reply: this.replyText,
      })
      .subscribe({
        next: () => {
          review.reply = this.replyText;
          this.replyingId = null;
          this.replyText = "";
          this.replying = false;
          this.toast.success("Reply posted!");
        },
        error: () => {
          this.replying = false;
          this.toast.error("Failed to post reply");
        },
      });
  }

  goBack() {
    this.router.navigate(["/beautician/profile"]);
  }
}
