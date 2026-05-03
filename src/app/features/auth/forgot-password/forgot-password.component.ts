import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  template: `
    <div class="page-enter">
      <button (click)="router.navigate(['/auth/login'])"
        class="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity"
        style="color: var(--color-text-secondary)">
        <i class="ri-arrow-left-line"></i> Back to login
      </button>

      <!-- Icon -->
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
        <i class="ri-lock-password-line text-3xl" style="color: var(--color-primary)"></i>
      </div>

      <h2 class="text-2xl font-bold mb-2" style="color: var(--color-text-primary)">Forgot password?</h2>
      <p class="text-sm mb-8" style="color: var(--color-text-secondary)">
        Enter your email and we'll send you a reset code
      </p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="form-label">Email address</label>
          <div class="relative">
            <i class="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
               style="color: var(--color-primary)"></i>
            <input formControlName="email" type="email" placeholder="you@example.com"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['email'].errors"/>
          </div>
          <p *ngIf="submitted && f['email'].errors" class="text-xs text-red-500 mt-1">Enter a valid email</p>
        </div>

        <button type="submit" class="btn-primary w-full" [disabled]="loading">
          <span class="spinner" *ngIf="loading"></span>
          {{ loading ? 'Sending...' : 'Send reset code' }}
        </button>
      </form>
    </div>
  `,
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.toast.success('Reset code sent to your email');
        this.router.navigate(['/auth/new-password'], {
          queryParams: { email: this.form.value.email },
        });
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Failed to send reset code');
      },
    });
  }
}
