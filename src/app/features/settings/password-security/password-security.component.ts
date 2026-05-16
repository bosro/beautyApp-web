
// src/app/features/settings/password-security/password-security.component.ts
// Route: /settings/security  (clients) or /beautician/settings/security

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';

interface SecurityInfo {
  lastLogin: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountAge: string;
  activeDevices: { platform: string; lastActive: string; deviceInfo: any }[];
  recentPasswordChanges: number;
}

@Component({
  selector: 'app-password-security',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-28">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3">
        <button onclick="history.back()" class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center">
          <i class="ri-arrow-left-line text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Password & Security</h1>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-32 rounded-2xl"></div>
        <div class="skeleton h-40 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 max-w-2xl mx-auto space-y-5">

        <!-- Security score card -->
        <div class="card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-[var(--color-text-primary)]">Security Overview</h3>
            <div class="flex items-center gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full" [ngClass]="scoreColor()"></div>
              <span class="text-sm font-semibold" [ngClass]="scoreTextColor()">{{ scoreLabel() }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <!-- Email verified -->
            <div class="flex items-center justify-between py-1">
              <div class="flex items-center gap-3">
                <i class="ri-mail-line text-[var(--color-text-muted)] text-lg"></i>
                <span class="text-sm text-[var(--color-text-primary)]">Email Verified</span>
              </div>
              <div class="flex items-center gap-1.5">
                <i [class]="info?.emailVerified ? 'ri-shield-check-fill text-green-500' : 'ri-error-warning-fill text-amber-500'" class="text-base"></i>
                <span class="text-xs font-medium" [ngClass]="info?.emailVerified ? 'text-green-500' : 'text-amber-500'">
                  {{ info?.emailVerified ? 'Verified' : 'Not verified' }}
                </span>
              </div>
            </div>

            <!-- Phone verified -->
            <div class="flex items-center justify-between py-1">
              <div class="flex items-center gap-3">
                <i class="ri-smartphone-line text-[var(--color-text-muted)] text-lg"></i>
                <span class="text-sm text-[var(--color-text-primary)]">Phone Verified</span>
              </div>
              <div class="flex items-center gap-1.5">
                <i [class]="info?.phoneVerified ? 'ri-shield-check-fill text-green-500' : 'ri-error-warning-fill text-amber-500'" class="text-base"></i>
                <span class="text-xs font-medium" [ngClass]="info?.phoneVerified ? 'text-green-500' : 'text-amber-500'">
                  {{ info?.phoneVerified ? 'Verified' : 'Not verified' }}
                </span>
              </div>
            </div>

            <!-- Last login -->
            <div class="flex items-center justify-between py-1" *ngIf="info?.lastLogin">
              <div class="flex items-center gap-3">
                <i class="ri-login-circle-line text-[var(--color-text-muted)] text-lg"></i>
                <span class="text-sm text-[var(--color-text-primary)]">Last Login</span>
              </div>
              <span class="text-xs text-[var(--color-text-muted)]">{{ info?.lastLogin | date:'medium' }}</span>
            </div>

            <!-- Member since -->
            <div class="flex items-center justify-between py-1" *ngIf="info?.accountAge">
              <div class="flex items-center gap-3">
                <i class="ri-calendar-line text-[var(--color-text-muted)] text-lg"></i>
                <span class="text-sm text-[var(--color-text-primary)]">Member Since</span>
              </div>
              <span class="text-xs text-[var(--color-text-muted)]">{{ info?.accountAge | date:'mediumDate' }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="card overflow-hidden">
          <div class="px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <h3 class="font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">Security Actions</h3>
          </div>

          <!-- Change password -->
          <button (click)="router.navigate([changePasswordRoute])"
                  class="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <i class="ri-lock-password-line text-blue-500"></i>
              </div>
              <div class="text-left">
                <p class="text-sm font-medium text-[var(--color-text-primary)]">Change Password</p>
                <p class="text-xs text-[var(--color-text-muted)]">Update your account password</p>
              </div>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)] text-xl"></i>
          </button>

          <!-- Verify email (if not verified) -->
          <button *ngIf="!info?.emailVerified"
                  (click)="sendEmailVerification()"
                  [disabled]="verifyEmailLoading"
                  class="w-full flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)] hover:bg-[var(--color-background)] transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <i class="ri-mail-check-line text-amber-500"></i>
              </div>
              <div class="text-left">
                <p class="text-sm font-medium text-[var(--color-text-primary)]">Verify Email</p>
                <p class="text-xs text-[var(--color-text-muted)]">Send verification link to your email</p>
              </div>
            </div>
            <i *ngIf="!verifyEmailLoading" class="ri-arrow-right-s-line text-[var(--color-text-muted)] text-xl"></i>
            <i *ngIf="verifyEmailLoading" class="ri-loader-4-line animate-spin text-[var(--color-text-muted)]"></i>
          </button>

          <!-- Sign out all devices -->
          <button (click)="showRevokeModal = true"
                  class="w-full flex items-center justify-between px-4 py-4 hover:bg-[var(--color-background)] transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <i class="ri-logout-box-line text-red-500"></i>
              </div>
              <div class="text-left">
                <p class="text-sm font-medium text-[var(--color-text-primary)]">Sign Out All Devices</p>
                <p class="text-xs text-[var(--color-text-muted)]">
                  {{ info?.activeDevices?.length || 0 }} active device(s)
                </p>
              </div>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)] text-xl"></i>
          </button>
        </div>

        <!-- Active Devices -->
        <div *ngIf="info?.activeDevices?.length" class="card overflow-hidden">
          <div class="px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <h3 class="font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">Active Devices</h3>
          </div>
          <div *ngFor="let device of info?.activeDevices; let last = last"
               class="flex items-center gap-3 px-4 py-3.5"
               [class.border-b]="!last"
               [class.border-[var(--color-border)]]="!last">
            <div class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center">
              <i [class]="deviceIcon(device.platform)" class="text-[var(--color-text-muted)]"></i>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-[var(--color-text-primary)] capitalize">{{ device.platform }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">Last active {{ device.lastActive | date:'short' }}</p>
            </div>
            <div class="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
        </div>

      </div>

      <!-- Revoke devices modal -->
      <app-confirm-modal
        *ngIf="showRevokeModal"
        title="Sign Out All Devices"
        message="This will sign you out of all devices including this one. You'll need to log in again."
        confirmText="Sign Out All"
        type="warning"
        [loading]="revoking"
        (confirmed)="revokeAllDevices()"
        (cancelled)="showRevokeModal = false"
      ></app-confirm-modal>

    </div>
  `,
})
export class PasswordSecurityComponent implements OnInit {
  info: SecurityInfo | null = null;
  loading = true;
  showRevokeModal = false;
  revoking = false;
  verifyEmailLoading = false;

  // Override in subclass or via route data for beautician path
  changePasswordRoute = '/settings/change-password';

  constructor(
    private http: HttpClient,
    public router: Router,
    private toast: ToastService,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/security/info`).subscribe({
      next: res => {
        this.info = res.data.security;
        this.loading = false;
      },
      error: () => this.loading = false,
    });
  }

  securityScore(): number {
    if (!this.info) return 0;
    let score = 0;
    if (this.info.emailVerified) score++;
    if (this.info.phoneVerified) score++;
    if (this.info.recentPasswordChanges > 0) score++;
    return score;
  }

  scoreLabel(): string {
    const s = this.securityScore();
    return ['Weak', 'Fair', 'Good', 'Strong'][s] ?? 'Strong';
  }

  scoreColor(): string {
    const s = this.securityScore();
    if (s <= 0) return 'bg-red-500';
    if (s === 1) return 'bg-amber-400';
    if (s === 2) return 'bg-blue-500';
    return 'bg-green-500';
  }

  scoreTextColor(): string {
    const s = this.securityScore();
    if (s <= 0) return 'text-red-500';
    if (s === 1) return 'text-amber-500';
    if (s === 2) return 'text-blue-500';
    return 'text-green-500';
  }

  deviceIcon(platform: string): string {
    if (platform === 'ios') return 'ri-apple-line';
    if (platform === 'android') return 'ri-android-line';
    return 'ri-computer-line';
  }

  sendEmailVerification() {
    this.verifyEmailLoading = true;
    this.http.post<any>(`${environment.apiUrl}/verification/email/send`, {}).subscribe({
      next: () => {
        this.verifyEmailLoading = false;
        this.toast.success('Verification email sent! Check your inbox.');
      },
      error: err => {
        this.verifyEmailLoading = false;
        this.toast.error(err?.error?.message || 'Failed to send verification email');
      },
    });
  }

  revokeAllDevices() {
    this.revoking = true;
    this.http.post<any>(`${environment.apiUrl}/security/revoke-devices`, {}).subscribe({
      next: () => {
        this.revoking = false;
        this.showRevokeModal = false;
        this.toast.success('Signed out of all devices');
        this.auth.logout();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.revoking = false;
        this.toast.error('Failed to revoke devices');
      },
    });
  }
}