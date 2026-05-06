import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-referral",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4"
      >
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Refer & Earn
        </h1>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4">
        <div class="skeleton h-48 rounded-2xl"></div>
        <div class="skeleton h-32 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        <!-- Hero Banner -->
        <div
          class="rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 text-white text-center"
        >
          <div
            class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="ri-gift-line text-3xl text-white"></i>
          </div>
          <h2 class="text-2xl font-bold mb-2">Invite Friends, Earn Rewards</h2>
          <p class="text-white/80 text-sm">
            Get GH₵ 10 for every friend who books their first appointment
            through your link.
          </p>
        </div>

        <!-- Referral Code -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">
            Your Referral Code
          </h3>
          <div class="flex gap-2">
            <div
              class="flex-1 bg-[var(--color-background)] border-2 border-dashed border-[var(--color-primary)] rounded-xl p-3 text-center"
            >
              <p
                class="text-xl font-bold font-mono text-[var(--color-primary)] tracking-widest"
              >
                {{ referralData?.code || "------" }}
              </p>
            </div>
            <button
              (click)="copyCode()"
              class="btn-primary px-4 rounded-xl flex items-center gap-2"
            >
              <i class="ri-file-copy-line"></i>
              <span class="hidden sm:block">Copy</span>
            </button>
          </div>

          <!-- Share Link -->
          <div class="flex gap-2">
            <input
              [value]="shareUrl"
              readonly
              class="form-input flex-1 text-sm bg-[var(--color-background)] font-mono text-[var(--color-text-muted)]"
            />
            <button
              (click)="shareLink()"
              class="w-10 h-10 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl flex items-center justify-center hover:border-[var(--color-primary)] transition-colors flex-shrink-0"
            >
              <i class="ri-share-line text-[var(--color-text-secondary)]"></i>
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div class="card p-3 text-center">
            <p class="text-2xl font-bold text-[var(--color-primary)]">
              {{ referralData?.totalReferrals || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
              Referrals
            </p>
          </div>
          <div class="card p-3 text-center">
            <p class="text-2xl font-bold text-green-500">
              {{ referralData?.successfulReferrals || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
              Converted
            </p>
          </div>
          <div class="card p-3 text-center">
            <p class="text-2xl font-bold text-[var(--color-primary)]">
              GH₵ {{ referralData?.totalEarnings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Earned</p>
          </div>
        </div>

        <!-- How It Works -->
        <div class="card p-4 space-y-4">
          <h3 class="font-semibold text-[var(--color-text-primary)]">
            How It Works
          </h3>
          <div class="space-y-3">
            <div
              *ngFor="let step of steps; let i = index"
              class="flex gap-3 items-start"
            >
              <div
                class="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0"
              >
                <span class="text-sm font-bold text-[var(--color-primary)]">{{
                  i + 1
                }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-[var(--color-text-primary)]">
                  {{ step.title }}
                </p>
                <p class="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {{ step.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Referrals -->
        <div class="card p-4 space-y-3" *ngIf="referralData?.referrals?.length">
          <h3 class="font-semibold text-[var(--color-text-primary)]">
            Recent Referrals
          </h3>
          <div class="space-y-2">
            <div
              *ngFor="let ref of referralData.referrals"
              class="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center"
                >
                  <i
                    class="ri-user-line text-[var(--color-primary)] text-sm"
                  ></i>
                </div>
                <div>
                  <p
                    class="text-sm font-medium text-[var(--color-text-primary)]"
                  >
                    {{ ref.referee?.name || "Anonymous" }}
                  </p>
                  <p class="text-xs text-[var(--color-text-muted)]">
                    {{ ref.createdAt | date: "MMM d, y" }}
                  </p>
                </div>
              </div>
              <span
                class="badge"
                [ngClass]="
                  ref.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'
                "
              >
                {{ ref.status === "COMPLETED" ? "+GH₵ 10" : "Pending" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ReferralComponent implements OnInit {
  referralData: any = null;
  loading = true;

  steps = [
    {
      title: "Share your link",
      desc: "Send your unique referral link to friends and family.",
    },
    {
      title: "They sign up",
      desc: "Your friend registers using your link or code.",
    },
    { title: "They book", desc: "Your friend completes their first booking." },
    {
      title: "You earn",
      desc: "GH₵ 10 is credited to your wallet automatically.",
    },
  ];

  get shareUrl() {
    return `https://bigluxx.com/join?ref=${this.referralData?.code || ""}`;
  }

  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    // Load code and stats separately
    this.http.get<any>(`${environment.apiUrl}/referrals/code`).subscribe({
      next: (res) => {
        this.referralData = { ...this.referralData, code: res.data?.code };
      },
      error: () => {},
    });

    this.http.get<any>(`${environment.apiUrl}/referrals/stats`).subscribe({
      next: (res) => {
        const d = res.data || {};
        this.referralData = {
          ...this.referralData,
          totalReferrals: d.totalReferrals || 0,
          successfulReferrals: d.pendingRewards || 0,
          totalEarnings: d.totalEarned || 0,
          referrals: [],
        };
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    // Load history
    this.http.get<any>(`${environment.apiUrl}/referrals/history`).subscribe({
      next: (res) => {
        if (this.referralData) {
          this.referralData.referrals = res.data?.referrals || [];
        }
      },
      error: () => {},
    });
  }

  copyCode() {
    navigator.clipboard.writeText(this.referralData?.code || "");
    this.toast.success("Referral code copied!");
  }

  shareLink() {
    if (navigator.share) {
      navigator.share({
        title: "Join Bigluxx",
        text: "Discover, Book, and Experience Luxury!",
        url: this.shareUrl,
      });
    } else {
      navigator.clipboard.writeText(this.shareUrl);
      this.toast.success("Link copied!");
    }
  }
}
