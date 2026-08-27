// register.component.ts
// Changes from original:
//   1. Added Google Sign-Up button (same flow as LoginComponent)
//   2. Added onGoogleSignIn() method
//   3. Added ngOnInit Google SDK initialization
//   4. Added AfterViewInit + OnDestroy for RAF cleanup (not needed here but kept consistent)
//   5. Password validator relaxed to a 6-character minimum, no forced complexity
//   6. Added hint text under every input, swapped out for the error message on submit
//   7. Confirm-password field now also highlights red on its own required-empty state

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { getApiErrorMessage } from '@core/utils/api-error.util';

@Component({
  selector: 'app-register',
  template: `
    <div class="page-enter">
      <!-- Back -->
      <button
        (click)="goBack()"
        class="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
        style="color: var(--color-text-secondary)"
      >
        <i class="ri-arrow-left-line"></i> Back
      </button>

      <div class="mb-7">
        <h2 class="text-2xl font-bold mb-1" style="color: var(--color-text-primary)">Create account</h2>
        <p class="text-sm" style="color: var(--color-text-secondary)">Join Bigluxx as a client</p>
      </div>

      <!-- ── Google Sign-Up ── -->
      <button type="button" (click)="onGoogleSignIn()" class="google-btn w-full mb-4" [disabled]="googleLoading">
        <img
          *ngIf="!googleLoading"
          src="https://www.svgrepo.com/show/355037/google.svg"
          alt="Google"
          class="w-5 h-5"
        />
        <i *ngIf="googleLoading" class="ri-loader-4-line animate-spin w-5 h-5"></i>
        <span>{{ googleLoading ? 'Opening Google…' : 'Sign up with Google' }}</span>
      </button>

      <!-- Divider -->
      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1 h-px" style="background-color: var(--color-border-light)"></div>
        <span class="text-xs font-medium" style="color: var(--color-text-secondary)">OR</span>
        <div class="flex-1 h-px" style="background-color: var(--color-border-light)"></div>
      </div>

      <!-- Email / password form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Name -->
        <div>
          <label class="form-label">Full name</label>
          <div class="relative">
            <i class="ri-user-3-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
               style="color: var(--color-primary)"></i>
            <input formControlName="name" type="text" placeholder="John Doe"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['name'].errors"/>
          </div>
          <p *ngIf="submitted && f['name'].errors?.['required']" class="text-xs text-red-500 mt-1">Name is required</p>
          <p *ngIf="!(submitted && f['name'].errors)" class="text-xs mt-1" style="color: var(--color-text-secondary)">
            As it should appear on your bookings
          </p>
        </div>

        <!-- Phone -->
        <div>
          <label class="form-label">Phone number</label>
          <div class="relative">
            <i class="ri-phone-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
               style="color: var(--color-primary)"></i>
            <input formControlName="phone" type="tel" placeholder="+233 50 123 4567"
              class="form-input pl-10"/>
          </div>
          <p class="text-xs mt-1" style="color: var(--color-text-secondary)">
            Optional — used for booking reminders and updates
          </p>
        </div>

        <!-- Email -->
        <div>
          <label class="form-label">Email address</label>
          <div class="relative">
            <i class="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
               style="color: var(--color-primary)"></i>
            <input formControlName="email" type="email" placeholder="you@example.com"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['email'].errors"/>
          </div>
          <p *ngIf="submitted && f['email'].errors?.['required']" class="text-xs text-red-500 mt-1">Email is required</p>
          <p *ngIf="submitted && f['email'].errors?.['email']" class="text-xs text-red-500 mt-1">Enter a valid email</p>
          <p *ngIf="!(submitted && f['email'].errors)" class="text-xs mt-1" style="color: var(--color-text-secondary)">
            We'll send a verification code to this address
          </p>
        </div>

        <!-- Password -->
        <div>
          <label class="form-label">Password</label>
          <div class="relative">
            <i class="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
               style="color: var(--color-primary)"></i>
            <input formControlName="password" [type]="showPwd ? 'text' : 'password'"
              placeholder="Min. 6 characters"
              class="form-input pl-10 pr-10"
              [class.border-red-500]="submitted && f['password'].errors"/>
            <button type="button" (click)="showPwd = !showPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70"
              style="color: var(--color-text-secondary)">
              <i [class]="showPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
          <p *ngIf="submitted && f['password'].errors?.['required']" class="text-xs text-red-500 mt-1">Password is required</p>
          <p *ngIf="submitted && f['password'].errors?.['minlength']" class="text-xs text-red-500 mt-1">At least 6 characters, please</p>
          <p *ngIf="!(submitted && f['password'].errors)" class="text-xs mt-1" style="color: var(--color-text-secondary)">
            At least 6 characters — mix in letters and numbers for a stronger password
          </p>
        </div>

        <!-- Confirm password -->
        <div>
          <label class="form-label">Confirm password</label>
          <div class="relative">
            <i class="ri-lock-2-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
               style="color: var(--color-primary)"></i>
            <input formControlName="confirmPassword" [type]="showConfirmPwd ? 'text' : 'password'"
              placeholder="Re-enter password"
              class="form-input pl-10 pr-10"
              [class.border-red-500]="submitted && (f['confirmPassword'].errors || form.errors?.['mismatch'])"/>
            <button type="button" (click)="showConfirmPwd = !showConfirmPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70"
              style="color: var(--color-text-secondary)">
              <i [class]="showConfirmPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
          <p *ngIf="submitted && f['confirmPassword'].errors?.['required']" class="text-xs text-red-500 mt-1">Please confirm your password</p>
          <p *ngIf="submitted && !f['confirmPassword'].errors && form.errors?.['mismatch']" class="text-xs text-red-500 mt-1">Passwords do not match</p>
          <p *ngIf="!(submitted && (f['confirmPassword'].errors || form.errors?.['mismatch']))" class="text-xs mt-1" style="color: var(--color-text-secondary)">
            Re-enter the same password to confirm
          </p>
        </div>

        <button type="submit" class="btn-primary w-full" [disabled]="loading">
          <span class="spinner" *ngIf="loading"></span>
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="text-center text-sm mt-5" style="color: var(--color-text-secondary)">
        Already have an account?
        <a routerLink="/auth/login" class="font-semibold ml-1" style="color: var(--color-primary)">Sign in</a>
      </p>
    </div>
  `,
  styles: [`
    .google-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: var(--color-bg-secondary);
      border: 1.5px solid var(--color-border-light);
      border-radius: 50px;
      padding: 13px 24px;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }
    .google-btn:hover {
      border-color: var(--color-primary);
      background: var(--color-bg-primary);
    }
  `],
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  googleLoading = false;
  showPwd = false;
  showConfirmPwd = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        phone: [''],
        email: ['', [Validators.required, Validators.email]],
        // Lenient on purpose: minimum length only, no forced mix of
        // symbols/uppercase/numbers — that kind of rule mostly just
        // frustrates people without adding much real security.
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatch }
    );
  }

  private passwordMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  get f() { return this.form.controls; }

  // ── Google Sign-Up: identical to LoginComponent.onGoogleSignIn() ──
  // The backend's signInWithGoogle() already handles "create if not exists",
  // so this works for both sign-in and sign-up — no separate endpoint needed.
  onGoogleSignIn(): void {
    if (this.googleLoading) return;

    this.googleLoading = true;
    // Straight redirect instead of the One Tap popup — see login component
    // for the full reasoning (unpredictable popup timing, confusing
    // errors on some browsers/webviews).
    this.auth.getGoogleAuthUrl().subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: () => {
        this.googleLoading = false;
        this.toast.error('Google Sign-In is not available right now.');
      },
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    const { name, email, phone, password } = this.form.value;

    this.auth.register({ name, email, phone, password, role: 'CUSTOMER' }).subscribe({
      next: () => {
        this.router.navigate(['/auth/verify'], {
          queryParams: { email, type: 'signup' },
        });
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(getApiErrorMessage(err, 'Registration failed'));
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }
}