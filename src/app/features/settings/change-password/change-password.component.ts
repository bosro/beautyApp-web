// src/app/features/settings/change-password/change-password.component.ts

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: false,
  template: `
    <div class="min-h-screen pb-28" style="background-color: var(--color-background)">

      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
        style="background-color: var(--color-surface); border-color: var(--color-border)"
      >
        <button
          (click)="back()"
          class="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style="background-color: var(--color-background)"
        >
          <i class="ri-arrow-left-s-line text-lg text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="flex-1 text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          Change Password
        </h1>
      </div>

      <div class="p-4 max-w-lg mx-auto space-y-4">

        <!-- ── Hero ── -->
        <div class="flex flex-col items-center py-5 gap-3">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center"
            style="background: color-mix(in srgb, var(--color-primary) 12%, transparent)"
          >
            <i class="ri-lock-password-line text-3xl" style="color: var(--color-primary)"></i>
          </div>
          <div class="text-center">
            <p class="text-base font-bold text-[var(--color-text-primary)]">Update your password</p>
            <p class="text-sm text-[var(--color-text-muted)] mt-1 leading-relaxed">
              Choose a strong password with at least 8 characters.
            </p>
          </div>
        </div>

        <!-- ── Form card ── -->
        <div class="rounded-2xl p-5 space-y-5" style="background-color: var(--color-surface)">

          <!-- Current password -->
          <div>
            <label class="field-label">Current Password</label>
            <div class="input-wrap">
              <input
                [(ngModel)]="form.currentPassword"
                [type]="show.current ? 'text' : 'password'"
                class="form-input rounded-xl pr-11"
                placeholder="Enter current password"
                autocomplete="current-password"
              />
              <button class="eye-btn" (click)="show.current = !show.current" type="button">
                <i [class]="show.current ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              </button>
            </div>
          </div>

          <!-- New password -->
          <div>
            <label class="field-label">New Password</label>
            <div class="input-wrap">
              <input
                [(ngModel)]="form.newPassword"
                [type]="show.newPwd ? 'text' : 'password'"
                class="form-input rounded-xl pr-11"
                placeholder="At least 8 characters"
                autocomplete="new-password"
                (input)="checkStrength()"
              />
              <button class="eye-btn" (click)="show.newPwd = !show.newPwd" type="button">
                <i [class]="show.newPwd ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              </button>
            </div>

            <!-- Strength bar -->
            <div *ngIf="form.newPassword" class="mt-2.5 space-y-1.5">
              <div class="flex gap-1.5">
                <div
                  *ngFor="let i of [1,2,3,4]"
                  class="h-1.5 flex-1 rounded-full transition-all duration-300"
                  [ngClass]="i <= strength ? strengthBarColor() : 'bg-[var(--color-border)]'"
                ></div>
              </div>
              <p class="text-xs font-semibold" [ngClass]="strengthTextColor()">
                {{ strengthLabel() }}
              </p>
            </div>
          </div>

          <!-- Confirm password -->
          <div>
            <label class="field-label">Confirm New Password</label>
            <div class="input-wrap">
              <input
                [(ngModel)]="form.confirmPassword"
                [type]="show.confirm ? 'text' : 'password'"
                class="form-input rounded-xl pr-11"
                [class.border-red-400]="form.confirmPassword && form.confirmPassword !== form.newPassword"
                [class.border-green-400]="form.confirmPassword && form.confirmPassword === form.newPassword"
                placeholder="Re-enter new password"
                autocomplete="new-password"
              />
              <button class="eye-btn" (click)="show.confirm = !show.confirm" type="button">
                <i [class]="show.confirm ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              </button>
            </div>
            <p
              *ngIf="form.confirmPassword && form.confirmPassword !== form.newPassword"
              class="text-xs text-red-500 mt-1.5 flex items-center gap-1"
            >
              <i class="ri-error-warning-line"></i> Passwords do not match
            </p>
            <p
              *ngIf="form.confirmPassword && form.confirmPassword === form.newPassword"
              class="text-xs text-green-500 mt-1.5 flex items-center gap-1"
            >
              <i class="ri-check-line"></i> Passwords match
            </p>
          </div>

        </div>

        <!-- ── Requirements ── -->
        <div class="rounded-2xl p-4 space-y-2.5" style="background-color: var(--color-surface)">
          <p class="section-label" style="margin-bottom: 4px">Requirements</p>
          <div
            *ngFor="let req of requirements"
            class="flex items-center gap-2.5 text-sm transition-colors"
            [ngClass]="req.met ? 'text-green-500' : 'text-[var(--color-text-muted)]'"
          >
            <i
              [class]="req.met ? 'ri-check-circle-fill' : 'ri-circle-line'"
              class="text-base flex-shrink-0"
            ></i>
            <span>{{ req.label }}</span>
          </div>
        </div>

        <!-- ── Error message ── -->
        <div
          *ngIf="errorMsg"
          class="flex items-start gap-3 p-4 rounded-2xl border border-red-200"
          style="background: #FEF2F2"
        >
          <i class="ri-error-warning-line text-red-500 flex-shrink-0 mt-0.5"></i>
          <p class="text-sm text-red-700">{{ errorMsg }}</p>
        </div>

        <!-- ── Submit ── -->
        <button
          (click)="submit()"
          [disabled]="!canSubmit() || loading"
          class="btn-primary w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <i *ngIf="loading" class="ri-loader-4-line animate-spin"></i>
          <i *ngIf="!loading" class="ri-lock-line"></i>
          {{ loading ? "Updating…" : "Update Password" }}
        </button>

      </div>
    </div>
  `,
  styles: [`
    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .input-wrap { position: relative; }

    .eye-btn {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);
      font-size: 16px;
      padding: 0;
      display: flex;
      align-items: center;
    }
  `],
})
export class ChangePasswordComponent {
  form = { currentPassword: '', newPassword: '', confirmPassword: '' };
  show = { current: false, newPwd: false, confirm: false };
  loading = false;
  errorMsg = '';
  strength = 0;

  requirements = [
    { label: 'At least 8 characters',         met: false, check: (p: string) => p.length >= 8 },
    { label: 'At least one uppercase letter',  met: false, check: (p: string) => /[A-Z]/.test(p) },
    { label: 'At least one number',            met: false, check: (p: string) => /\d/.test(p) },
    { label: 'At least one special character', met: false, check: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  constructor(
    private http: HttpClient,
    private location: Location,
    private router: Router,
    private toast: ToastService,
  ) {}

  back() { this.location.back(); }

  checkStrength() {
    const p = this.form.newPassword;
    this.requirements.forEach(r => (r.met = r.check(p)));
    this.strength = this.requirements.filter(r => r.met).length;
  }

  strengthBarColor(): string {
    if (this.strength <= 1) return 'bg-red-500';
    if (this.strength === 2) return 'bg-amber-400';
    if (this.strength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  }

  strengthTextColor(): string {
    if (this.strength <= 1) return 'text-red-500';
    if (this.strength === 2) return 'text-amber-500';
    if (this.strength === 3) return 'text-blue-500';
    return 'text-green-500';
  }

  strengthLabel(): string {
    return ['', 'Weak', 'Fair', 'Good', 'Strong'][this.strength] ?? '';
  }

  canSubmit(): boolean {
  return (
    !!this.form.currentPassword &&
    this.requirements.every(r => r.met) &&
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
        this.requirements.forEach(r => (r.met = false));
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to update password. Please try again.';
      },
    });
  }
}


