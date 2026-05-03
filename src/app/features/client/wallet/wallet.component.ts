import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-wallet',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4">
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Wallet</h1>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-44 rounded-2xl"></div>
        <div class="skeleton h-48 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- Balance Card -->
        <div class="rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-6 text-white">
          <div class="flex items-start justify-between mb-6">
            <div>
              <p class="text-white/70 text-sm">Available Balance</p>
              <p class="text-4xl font-black mt-1">GH₵ {{ wallet?.balance | number:'1.2-2' }}</p>
            </div>
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i class="ri-wallet-3-line text-2xl"></i>
            </div>
          </div>
          <div class="flex gap-3">
            <button (click)="showTopUp = true" class="flex-1 bg-white text-[var(--color-primary)] font-semibold py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors">
              <i class="ri-add-line mr-1"></i> Top Up
            </button>
            <button class="flex-1 bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-white/30 transition-colors">
              <i class="ri-exchange-line mr-1"></i> Transfer
            </button>
          </div>
        </div>

        <!-- Top Up Form -->
        <div *ngIf="showTopUp" class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Top Up Wallet</h3>
          <div class="grid grid-cols-3 gap-2">
            <button *ngFor="let amt of quickAmounts"
              (click)="topUpAmount = amt"
              class="py-2 rounded-xl border text-sm font-medium transition-colors"
              [ngClass]="topUpAmount === amt
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]'">
              GH₵ {{ amt }}
            </button>
          </div>
          <input [(ngModel)]="topUpAmount" type="number" class="form-input" placeholder="Or enter custom amount" />
          <div class="flex gap-2">
            <button (click)="showTopUp = false" class="flex-1 py-2.5 border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text-secondary)]">Cancel</button>
            <button (click)="processTopUp()" [disabled]="processing || !topUpAmount" class="flex-1 btn-primary text-sm">
              <span *ngIf="!processing">Pay with Paystack</span>
              <span *ngIf="processing" class="flex items-center justify-center gap-2"><i class="ri-loader-4-line animate-spin"></i> Processing...</span>
            </button>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-[var(--color-text-primary)]">Transactions</h3>
            <span class="text-xs text-[var(--color-text-muted)]">{{ transactions.length }} total</span>
          </div>

          <app-empty-state
            *ngIf="transactions.length === 0"
            icon="ri-receipt-line"
            title="No Transactions"
            subtitle="Your transaction history will appear here.">
          </app-empty-state>

          <div *ngFor="let tx of transactions" class="flex items-center gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
            <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              [ngClass]="tx.type === 'CREDIT' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'">
              <i [ngClass]="tx.type === 'CREDIT' ? 'ri-arrow-down-line text-green-500' : 'ri-arrow-up-line text-red-500'" class="text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[var(--color-text-primary)] truncate">{{ tx.description }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">{{ tx.createdAt | date:'MMM d, y · h:mm a' }}</p>
            </div>
            <span class="font-semibold text-sm flex-shrink-0"
              [ngClass]="tx.type === 'CREDIT' ? 'text-green-500' : 'text-red-500'">
              {{ tx.type === 'CREDIT' ? '+' : '-' }}GH₵ {{ tx.amount | number:'1.2-2' }}
            </span>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class WalletComponent implements OnInit {
  wallet: any = null;
  transactions: any[] = [];
  loading = true;
  showTopUp = false;
  topUpAmount: number | null = null;
  processing = false;
  quickAmounts = [10, 20, 50, 100, 200, 500];

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/wallet`).subscribe({
      next: (res) => {
        this.wallet = res.data?.wallet;
        this.transactions = res.data?.transactions || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  processTopUp() {
    if (!this.topUpAmount || this.topUpAmount <= 0) return;
    this.processing = true;
    this.http.post<any>(`${environment.apiUrl}/wallet/topup`, { amount: this.topUpAmount }).subscribe({
      next: (res) => {
        if (res.data?.authorizationUrl) {
          window.location.href = res.data.authorizationUrl;
        } else {
          this.wallet.balance += this.topUpAmount!;
          this.showTopUp = false;
          this.processing = false;
          this.toast.success('Wallet topped up!');
        }
      },
      error: () => { this.processing = false; this.toast.error('Top up failed'); }
    });
  }
}
