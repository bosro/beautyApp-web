import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-promotions",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4"
      >
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Promotions
        </h1>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4">
        <div
          *ngFor="let i of [1, 2, 3]"
          class="skeleton h-40 rounded-2xl"
        ></div>
      </div>

      <app-empty-state
        *ngIf="!loading && promotions.length === 0"
        icon="ri-coupon-line"
        title="No Promotions"
        subtitle="Check back soon for exclusive deals and discounts."
      >
      </app-empty-state>

      <div
        *ngIf="!loading && promotions.length > 0"
        class="p-4 lg:p-6 space-y-4 max-w-2xl mx-auto"
      >
        <div
          *ngFor="let promo of promotions"
          class="card overflow-hidden"
          [ngClass]="{ 'opacity-60': isExpired(promo) }"
        >
          <!-- Colored Header -->
          <div
            class="h-2 w-full"
            [style.background]="promo.color || 'var(--color-primary)'"
          ></div>

          <div class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-2xl">{{ promo.emoji || "🎉" }}</span>
                  <h3 class="font-bold text-[var(--color-text-primary)]">
                    {{ promo.title }}
                  </h3>
                </div>
                <p class="text-sm text-[var(--color-text-secondary)]">
                  {{ promo.description }}
                </p>
              </div>

              <!-- Discount Badge -->
              <div
                class="flex-shrink-0 text-center bg-[var(--color-primary)]/10 rounded-xl p-2 min-w-[60px]"
              >
                <p class="text-xl font-black text-[var(--color-primary)]">
                  {{ promo.discountValue
                  }}{{ promo.discountType === "PERCENTAGE" ? "%" : "₵" }}
                </p>
                <p class="text-xs text-[var(--color-text-muted)]">OFF</p>
              </div>
            </div>

            <!-- Promo Code -->
            <div *ngIf="promo.code" class="mt-3 flex items-center gap-2">
              <div
                class="flex-1 bg-[var(--color-background)] border border-dashed border-[var(--color-border)] rounded-lg px-3 py-2"
              >
                <p
                  class="text-sm font-mono font-semibold text-[var(--color-text-primary)] tracking-widest"
                >
                  {{ promo.code }}
                </p>
              </div>
              <button
                (click)="copyCode(promo.code)"
                class="btn-primary text-sm px-3 py-2"
              >
                <i class="ri-file-copy-line"></i>
              </button>
            </div>

            <!-- Footer -->
            <div
              class="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]"
            >
              <div
                class="flex items-center gap-1 text-xs text-[var(--color-text-muted)]"
              >
                <i class="ri-time-line"></i>
                <span *ngIf="!isExpired(promo)"
                  >Expires {{ promo.endDate | date: "MMM d, y" }}</span
                >
                <span *ngIf="isExpired(promo)" class="text-red-500"
                  >Expired</span
                >
              </div>
              <button
                *ngIf="promo.beautician && !isExpired(promo)"
                (click)="viewSalon(promo.beautician.id)"
                class="text-xs text-[var(--color-primary)] font-medium flex items-center gap-1"
              >
                Book now <i class="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PromotionsComponent implements OnInit {
  promotions: any[] = [];
  loading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/promotions`).subscribe({
      next: (res) => {
        this.promotions = res.data?.promotions || []; // was: res.data || []
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  isExpired(promo: any): boolean {
    return promo.endDate && new Date(promo.endDate) < new Date();
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
    this.toast.success("Promo code copied!");
  }

  viewSalon(id: string) {
    this.router.navigate(["/client/salon", id]);
  }
}
