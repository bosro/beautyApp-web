// ============================================================
// beautician-reviews.component.ts  —  Enhanced UI
// ============================================================

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
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3"
      >
        <button
          (click)="goBack()"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors"
        >
          <i
            class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1
          class="text-base font-bold text-[var(--color-text-primary)] tracking-tight flex-1"
        >
          Reviews
        </h1>
        <div
          *ngIf="summary?.totalReviews"
          class="flex items-center gap-1 text-sm text-[var(--color-text-muted)]"
        >
          <i class="ri-star-fill text-amber-400 text-xs"></i>
          <span class="font-bold text-[var(--color-text-primary)]">{{
            summary?.averageRating | number: "1.1-1"
          }}</span>
        </div>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-32 rounded-2xl"></div>
        <div class="skeleton h-10 rounded-xl"></div>
        <div
          *ngFor="let i of [1, 2, 3]"
          class="skeleton h-40 rounded-2xl"
        ></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        <!-- Rating Overview -->
        <div class="card rounded-2xl p-5 flex gap-5 items-center">
          <!-- Big average -->
          <div
            class="flex flex-col items-center justify-center pr-5 border-r border-[var(--color-border)] flex-shrink-0"
          >
            <p
              class="text-5xl font-black text-[var(--color-primary)] leading-none"
            >
              {{ summary?.averageRating || 0 | number: "1.1-1" }}
            </p>
            <div class="flex items-center gap-0.5 mt-2">
              <i
                *ngFor="let s of [1, 2, 3, 4, 5]"
                class="text-base"
                [ngClass]="
                  s <= (summary?.averageRating || 0)
                    ? 'ri-star-fill text-amber-400'
                    : 'ri-star-line text-gray-300'
                "
              ></i>
            </div>
            <p
              class="text-xs text-[var(--color-text-muted)] mt-1.5 font-medium"
            >
              {{ summary?.totalReviews || 0 }} total
            </p>
          </div>

          <!-- Bars -->
          <div class="flex-1 space-y-1.5">
            <div
              *ngFor="let bar of ratingBars"
              (click)="setFilter(bar.star)"
              class="flex items-center gap-2 cursor-pointer group"
            >
              <div class="flex items-center gap-0.5 w-8 flex-shrink-0">
                <span
                  class="text-xs text-[var(--color-text-muted)] font-medium"
                  >{{ bar.star }}</span
                >
                <i
                  class="ri-star-fill text-amber-400"
                  style="font-size:9px"
                ></i>
              </div>
              <div
                class="flex-1 h-2 bg-[var(--color-background)] rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-amber-400 rounded-full transition-all duration-500"
                  [style.width.%]="bar.percent"
                ></div>
              </div>
              <span
                class="text-xs text-[var(--color-text-muted)] w-5 text-right flex-shrink-0"
                >{{ bar.count }}</span
              >
            </div>
          </div>
        </div>

        <!-- Filter chips -->
        <div
          class="flex gap-2 overflow-x-auto pb-1"
          style="-ms-overflow-style:none; scrollbar-width:none"
        >
          <button
            (click)="setFilter('all')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
            [ngClass]="
              activeFilter === 'all'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
            "
          >
            All ({{ summary?.totalReviews || 0 }})
          </button>
          <button
            *ngFor="let bar of ratingBars"
            [style.display]="bar.count > 0 ? '' : 'none'"
            (click)="setFilter(bar.star)"
            class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
            [ngClass]="
              activeFilter === bar.star
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
            "
          >
            <i
              class="ri-star-fill"
              [ngClass]="
                activeFilter === bar.star ? 'text-white' : 'text-amber-400'
              "
            ></i>
            {{ bar.star }} ({{ bar.count }})
          </button>
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
        <div
          *ngFor="let review of filteredReviews"
          class="card rounded-2xl p-4 space-y-3"
        >
          <!-- Header -->
          <div class="flex items-start gap-3">
            <div
              class="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 bg-[var(--color-primary)]/10 flex items-center justify-center"
            >
              <img
                *ngIf="review.customer?.avatar || review.client?.avatar"
                [src]="review.customer?.avatar || review.client?.avatar"
                class="w-full h-full object-cover"
              />
              <span
                *ngIf="!review.customer?.avatar && !review.client?.avatar"
                class="font-bold text-[var(--color-primary)]"
              >
                {{
                  (
                    review.customer?.name ||
                    review.client?.firstName ||
                    "?"
                  ).charAt(0)
                }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <p class="font-bold text-sm text-[var(--color-text-primary)]">
                  {{
                    review.customer?.name ||
                      review.client?.firstName +
                        " " +
                        review.client?.lastName ||
                      "Client"
                  }}
                </p>
                <p class="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                  {{ review.createdAt | date: "MMM d, y" }}
                </p>
              </div>
              <div class="flex items-center gap-0.5 mt-1">
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
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style="background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary)"
          >
            <i class="ri-scissors-2-line text-xs"></i>
            {{
              review.booking?.service?.name ||
                review.booking?.services?.[0]?.service?.name
            }}
          </span>

          <!-- Comment -->
          <p
            *ngIf="review.comment"
            class="text-sm text-[var(--color-text-secondary)] leading-relaxed"
          >
            {{ review.comment }}
          </p>

          <!-- Existing reply -->
          <div
            *ngIf="review.reply"
            class="flex gap-2.5 p-3 rounded-xl"
            style="background: color-mix(in srgb, var(--color-primary) 6%, transparent); border-left: 3px solid var(--color-primary)"
          >
            <div class="flex-1">
              <p class="text-xs font-bold text-[var(--color-primary)] mb-1">
                Your Reply
              </p>
              <p class="text-sm text-[var(--color-text-secondary)]">
                {{ review.reply }}
              </p>
            </div>
          </div>

          <!-- Reply form -->
          <div *ngIf="!review.reply">
            <div *ngIf="replyingId === review.id" class="space-y-2">
              <textarea
                [(ngModel)]="replyText"
                rows="2"
                class="form-input resize-none text-sm rounded-xl"
                placeholder="Write a thoughtful reply…"
              ></textarea>
              <div class="flex gap-2">
                <button
                  (click)="replyingId = null; replyText = ''"
                  class="flex-1 py-2 border border-[var(--color-border)] rounded-xl text-xs font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  (click)="submitReply(review)"
                  [disabled]="!replyText.trim() || replying"
                  class="flex-1 btn-primary text-xs py-2 rounded-xl flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  <i *ngIf="replying" class="ri-loader-4-line animate-spin"></i>
                  <span *ngIf="!replying">Post Reply</span>
                </button>
              </div>
            </div>
            <button
              *ngIf="replyingId !== review.id"
              (click)="replyingId = review.id"
              class="flex items-center gap-1.5 text-xs text-[var(--color-primary)] font-semibold px-3 py-1.5 rounded-xl hover:bg-[var(--color-primary)]/10 transition-colors"
            >
              <i class="ri-reply-line"></i> Reply to Review
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
