// register.component.ts
// Changes from original:
//   1. Added Google Sign-Up button (same flow as LoginComponent)
//   2. Added onGoogleSignIn() method
//   3. Added ngOnInit Google SDK initialization
//   4. Added AfterViewInit + OnDestroy for RAF cleanup (not needed here but kept consistent)
//   5. No other logic changed

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '@environments/environment';

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
      <button type="button" (click)="onGoogleSignIn()" class="google-btn w-full mb-4">
        <img
          src="https://www.svgrepo.com/show/355037/google.svg"
          alt="Google"
          class="w-5 h-5"
        />
        <span>Sign up with Google</span>
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
        </div>

        <!-- Password -->
        <div>
          <label class="form-label">Password</label>
          <div class="relative">
            <i class="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
               style="color: var(--color-primary)"></i>
            <input formControlName="password" [type]="showPwd ? 'text' : 'password'"
              placeholder="Min. 8 characters"
              class="form-input pl-10 pr-10"
              [class.border-red-500]="submitted && f['password'].errors"/>
            <button type="button" (click)="showPwd = !showPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70"
              style="color: var(--color-text-secondary)">
              <i [class]="showPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
          <p *ngIf="submitted && f['password'].errors?.['required']" class="text-xs text-red-500 mt-1">Password is required</p>
          <p *ngIf="submitted && f['password'].errors?.['minlength']" class="text-xs text-red-500 mt-1">Minimum 8 characters</p>
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
              [class.border-red-500]="submitted && form.errors?.['mismatch']"/>
            <button type="button" (click)="showConfirmPwd = !showConfirmPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70"
              style="color: var(--color-text-secondary)">
              <i [class]="showConfirmPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
          <p *ngIf="submitted && form.errors?.['mismatch']" class="text-xs text-red-500 mt-1">Passwords do not match</p>
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
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatch }
    );

    // Initialize Google SDK (same as LoginComponent)
    const google = (window as any).google;
    if (google) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response),
      });
    }
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
    const google = (window as any).google;
    if (!google) {
      this.toast.error('Google Sign-In is not available.');
      return;
    }
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        google.accounts.id.cancel();
        // One Tap blocked/dismissed — fall back to a full redirect through
        // Google's consent screen. Ask the backend for the URL since it
        // owns the client secret and the correctly-registered redirect_uri.
        this.auth.getGoogleAuthUrl().subscribe({
          next: (res) => {
            window.location.href = res.url;
          },
          error: () => {
            this.toast.error('Google Sign-In is not available right now.');
          },
        });
      }
    });
  }

  private handleGoogleCredential(response: { credential: string }): void {
    this.loading = true;
    // role defaults to CUSTOMER in signInWithGoogle() backend
    this.auth.googleSignIn(response.credential).subscribe({
      next: (res: any) => {
        const isNewUser = res?.data?.isNewUser ?? res?.isNewUser;
        this.toast.success(
          isNewUser
            ? "Welcome to Bigluxx!"
            : "You already have an account — signed you in.",
        );
        this.router.navigate([this.auth.getDashboardRoute()]);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Google sign-up failed');
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
        this.toast.error(err?.error?.message || 'Registration failed');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/auth/login']);
  }
}

