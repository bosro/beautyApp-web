
// src/app/features/settings/change-password/change-password.component.ts
// Used by both /settings/change-password  and  /beautician/settings/change-password

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-28">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3">
        <button onclick="history.back()" class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center">
          <i class="ri-arrow-left-line text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Change Password</h1>
      </div>

      <div class="p-4 max-w-lg mx-auto space-y-5 mt-2">

        <!-- Icon hero -->
        <div class="flex flex-col items-center py-4 gap-3">
          <div class="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
            <i class="ri-lock-password-line text-3xl text-[var(--color-primary)]"></i>
          </div>
          <div class="text-center">
            <h2 class="font-bold text-lg text-[var(--color-text-primary)]">Update your password</h2>
            <p class="text-sm text-[var(--color-text-secondary)] max-w-xs mt-1">
              Choose a strong password with at least 8 characters.
            </p>
          </div>
        </div>

        <!-- Form -->
        <div class="card p-5 space-y-4">

          <!-- Current password -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Current Password</label>
            <div class="relative">
              <input [(ngModel)]="form.currentPassword"
                     [type]="show.current ? 'text' : 'password'"
                     class="form-input pr-11"
                     placeholder="Enter current password"
                     autocomplete="current-password" />
              <button (click)="show.current = !show.current"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <i [class]="show.current ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              </button>
            </div>
          </div>

          <!-- New password -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">New Password</label>
            <div class="relative">
              <input [(ngModel)]="form.newPassword"
                     [type]="show.newPwd ? 'text' : 'password'"
                     class="form-input pr-11"
                     placeholder="At least 8 characters"
                     autocomplete="new-password"
                     (input)="checkStrength()" />
              <button (click)="show.newPwd = !show.newPwd"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <i [class]="show.newPwd ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              </button>
            </div>
            <!-- Strength bar -->
            <div *ngIf="form.newPassword" class="mt-2 space-y-1">
              <div class="flex gap-1">
                <div *ngFor="let i of [1,2,3,4]" class="h-1 flex-1 rounded-full transition-colors duration-300"
                     [ngClass]="i <= strength ? strengthColor() : 'bg-[var(--color-border)]'"></div>
              </div>
              <p class="text-xs" [ngClass]="strengthTextColor()">{{ strengthLabel() }}</p>
            </div>
          </div>

          <!-- Confirm password -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Confirm New Password</label>
            <div class="relative">
              <input [(ngModel)]="form.confirmPassword"
                     [type]="show.confirm ? 'text' : 'password'"
                     class="form-input pr-11"
                     [class.border-red-400]="form.confirmPassword && form.confirmPassword !== form.newPassword"
                     [class.border-green-400]="form.confirmPassword && form.confirmPassword === form.newPassword"
                     placeholder="Re-enter new password"
                     autocomplete="new-password" />
              <button (click)="show.confirm = !show.confirm"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                <i [class]="show.confirm ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              </button>
            </div>
            <p *ngIf="form.confirmPassword && form.confirmPassword !== form.newPassword"
               class="text-xs text-red-500 mt-1 flex items-center gap-1">
              <i class="ri-error-warning-line"></i> Passwords do not match
            </p>
            <p *ngIf="form.confirmPassword && form.confirmPassword === form.newPassword"
               class="text-xs text-green-500 mt-1 flex items-center gap-1">
              <i class="ri-check-line"></i> Passwords match
            </p>
          </div>

          <!-- Requirements -->
          <div class="p-3 bg-[var(--color-background)] rounded-xl space-y-1.5">
            <p class="text-xs font-semibold text-[var(--color-text-secondary)] mb-2">Password Requirements</p>
            <div *ngFor="let req of requirements" class="flex items-center gap-2 text-xs"
                 [ngClass]="req.met ? 'text-green-500' : 'text-[var(--color-text-muted)]'">
              <i [class]="req.met ? 'ri-check-circle-fill' : 'ri-circle-line'"></i>
              {{ req.label }}
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div *ngIf="errorMsg" class="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800 rounded-xl">
          <i class="ri-error-warning-line text-red-500 flex-shrink-0 mt-0.5"></i>
          <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
        </div>

        <!-- Submit -->
        <button (click)="submit()"
                [disabled]="!canSubmit() || loading"
                class="btn-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          <span *ngIf="!loading"><i class="ri-lock-line mr-2"></i>Update Password</span>
          <span *ngIf="loading" class="flex items-center justify-center gap-2">
            <i class="ri-loader-4-line animate-spin"></i> Updating...
          </span>
        </button>

      </div>
    </div>
  `,
})
export class ChangePasswordComponent {
  form = { currentPassword: '', newPassword: '', confirmPassword: '' };
  show = { current: false, newPwd: false, confirm: false };
  loading = false;
  errorMsg = '';
  strength = 0;

  requirements = [
    { label: 'At least 8 characters', met: false, check: (p: string) => p.length >= 8 },
    { label: 'At least one uppercase letter', met: false, check: (p: string) => /[A-Z]/.test(p) },
    { label: 'At least one number', met: false, check: (p: string) => /\d/.test(p) },
    { label: 'At least one special character', met: false, check: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {}

  checkStrength() {
    const p = this.form.newPassword;
    this.requirements.forEach(r => r.met = r.check(p));
    this.strength = this.requirements.filter(r => r.met).length;
  }

  strengthColor() {
    if (this.strength <= 1) return 'bg-red-500';
    if (this.strength === 2) return 'bg-amber-400';
    if (this.strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  }

  strengthTextColor() {
    if (this.strength <= 1) return 'text-red-500';
    if (this.strength === 2) return 'text-amber-500';
    if (this.strength === 3) return 'text-blue-500';
    return 'text-green-500';
  }

  strengthLabel() {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.strength] ?? '';
  }

  canSubmit(): boolean {
    return (
      !!this.form.currentPassword &&
      this.form.newPassword.length >= 8 &&
      this.form.newPassword === this.form.confirmPassword
    );
  }

  submit() {
    if (!this.canSubmit()) return;
    this.loading = true;
    this.errorMsg = '';

    this.http.post<any>(`${environment.apiUrl}/security/change-password`, {
      currentPassword: this.form.currentPassword,
      newPassword: this.form.newPassword,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('Password updated successfully!');
        this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.strength = 0;
        this.requirements.forEach(r => r.met = false);
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to update password. Please try again.';
      },
    });
  }
}