import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-new-password',
  template: `
    <div class="page-enter">
      <button (click)="router.navigate(['/auth/forgot-password'])"
        class="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity"
        style="color: var(--color-text-secondary)">
        <i class="ri-arrow-left-line"></i> Back
      </button>

      <h2 class="text-2xl font-bold mb-2" style="color: var(--color-text-primary)">Set new password</h2>
      <p class="text-sm mb-8" style="color: var(--color-text-secondary)">
        Enter the OTP sent to <strong>{{ email }}</strong> and your new password
      </p>

      <!-- Info banner -->
      <div class="flex items-start gap-3 p-4 rounded-xl mb-6"
        style="background-color: color-mix(in srgb, var(--color-warning) 10%, transparent)">
        <i class="ri-lock-password-line mt-0.5 text-orange-500"></i>
        <p class="text-xs leading-relaxed" style="color: var(--color-text-secondary)">
          Choose a strong password with uppercase, lowercase, and numbers
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- OTP -->
        <div>
          <label class="form-label">Verification OTP</label>
          <input formControlName="otp" type="text" placeholder="6-digit code"
            class="form-input" maxlength="6"
            [class.border-red-500]="submitted && f['otp'].errors"/>
          <p *ngIf="submitted && f['otp'].errors" class="text-xs text-red-500 mt-1">OTP is required</p>
        </div>

        <!-- New password -->
        <div>
          <label class="form-label">New password</label>
          <div class="relative">
            <input formControlName="password" [type]="showPwd ? 'text' : 'password'"
              placeholder="Min. 8 characters" class="form-input pr-10"
              [class.border-red-500]="submitted && f['password'].errors"/>
            <button type="button" (click)="showPwd = !showPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-text-secondary)">
              <i [class]="showPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
        </div>

        <!-- Confirm -->
        <div>
          <label class="form-label">Confirm new password</label>
          <input formControlName="confirmPassword" [type]="showPwd ? 'text' : 'password'"
            placeholder="Re-enter password" class="form-input"
            [class.border-red-500]="submitted && form.errors?.['mismatch']"/>
          <p *ngIf="submitted && form.errors?.['mismatch']" class="text-xs text-red-500 mt-1">Passwords don't match</p>
        </div>

        <!-- Password strength indicators -->
        <div class="p-3 rounded-xl space-y-1.5" style="background-color: var(--color-bg-secondary)">
          <p class="text-xs font-medium mb-2" style="color: var(--color-text-primary)">Password requirements:</p>
          <div *ngFor="let req of requirements" class="flex items-center gap-2 text-xs">
            <i [class]="req.met ? 'ri-checkbox-circle-fill text-green-500' : 'ri-radio-button-line'"
               [style.color]="req.met ? '' : 'var(--color-text-placeholder)'"></i>
            <span [style.color]="req.met ? 'var(--color-success)' : 'var(--color-text-secondary)'">
              {{ req.label }}
            </span>
          </div>
        </div>

        <button type="submit" class="btn-primary w-full" [disabled]="loading">
          <span class="spinner" *ngIf="loading"></span>
          {{ loading ? 'Resetting...' : 'Reset password' }}
        </button>
      </form>
    </div>
  `,
})
export class NewPasswordComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  email = '';
  showPwd = false;

  get requirements() {
    const pwd = this.form?.get('password')?.value || '';
    return [
      { label: 'At least 8 characters', met: pwd.length >= 8 },
      { label: 'Uppercase & lowercase letters', met: /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) },
      { label: 'At least one number', met: /[0-9]/.test(pwd) },
    ];
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private toast: ToastService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.form = this.fb.group(
      {
        otp: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: (g: FormGroup) =>
          g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true }
      }
    );
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;

    const { otp, password } = this.form.value;
    this.auth.resetPassword(this.email, otp, password).subscribe({
      next: () => {
        this.toast.success('Password reset successfully!');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Failed to reset password');
      },
    });
  }
}
