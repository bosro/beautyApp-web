import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-register',
  template: `
    <div class="page-enter">
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

      <button type="button" (click)="onGoogleSignIn()" class="google-btn w-full mb-4" [disabled]="googleLoading">
        <img *ngIf="!googleLoading" src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" class="w-5 h-5" />
        <i *ngIf="googleLoading" class="ri-loader-4-line animate-spin w-5 h-5"></i>
        <span>{{ googleLoading ? 'Opening Google…' : 'Sign up with Google' }}</span>
      </button>

      <div class="flex items-center gap-3 mb-4">
        <div class="flex-1 h-px" style="background-color: var(--color-border-light)"></div>
        <span class="text-xs font-medium" style="color: var(--color-text-secondary)">OR</span>
        <div class="flex-1 h-px" style="background-color: var(--color-border-light)"></div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Name -->
        <div>
          <label class="form-label">Full name</label>
          <div class="relative">
            <i class="ri-user-3-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base" style="color: var(--color-primary)"></i>
            <input formControlName="name" type="text" placeholder="John Doe"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['name'].invalid" />
          </div>
          <p class="field-hint" [class.hint-error]="submitted && f['name'].invalid" [class.hint-ok]="nameOk">
            <i [class]="(submitted && f['name'].invalid) ? 'ri-error-warning-line' : nameOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && f['name'].errors?.['required']) ? 'Name is required' : 'At least 2 characters' }}
          </p>
        </div>

        <!-- Phone -->
        <div>
          <label class="form-label">Phone number</label>
          <div class="relative">
            <i class="ri-phone-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base" style="color: var(--color-primary)"></i>
            <input formControlName="phone" type="tel" placeholder="+233 50 123 4567"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['phone'].invalid" />
          </div>
          <p class="field-hint" [class.hint-error]="submitted && f['phone'].invalid" [class.hint-ok]="phoneOk">
            <i [class]="(submitted && f['phone'].invalid) ? 'ri-error-warning-line' : phoneOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && f['phone'].errors?.['invalidPhone']) ? 'Enter a valid phone number' : 'Optional — e.g. +233 50 123 4567' }}
          </p>
        </div>

        <!-- Email -->
        <div>
          <label class="form-label">Email address</label>
          <div class="relative">
            <i class="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base" style="color: var(--color-primary)"></i>
            <input formControlName="email" type="email" placeholder="you@example.com"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['email'].invalid" />
          </div>
          <p class="field-hint" [class.hint-error]="submitted && f['email'].invalid" [class.hint-ok]="emailOk">
            <i [class]="(submitted && f['email'].invalid) ? 'ri-error-warning-line' : emailOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && f['email'].errors?.['required']) ? 'Email is required' : (submitted && f['email'].errors?.['email']) ? 'Enter a valid email' : "We'll send a verification code here" }}
          </p>
        </div>

        <!-- Password -->
        <div>
          <label class="form-label">Password</label>
          <div class="relative">
            <i class="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base" style="color: var(--color-primary)"></i>
            <input formControlName="password" [type]="showPwd ? 'text' : 'password'"
              placeholder="Min. 6 characters"
              class="form-input pl-10 pr-10"
              [class.border-red-500]="submitted && f['password'].invalid" />
            <button type="button" (click)="showPwd = !showPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70"
              style="color: var(--color-text-secondary)">
              <i [class]="showPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
          <p class="field-hint" [class.hint-error]="submitted && f['password'].invalid" [class.hint-ok]="passwordOk">
            <i [class]="(submitted && f['password'].invalid) ? 'ri-error-warning-line' : passwordOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && f['password'].errors?.['required']) ? 'Password is required' : (submitted && f['password'].errors?.['minlength']) ? 'Minimum 6 characters' : 'At least 6 characters' }}
          </p>
        </div>

        <!-- Confirm password -->
        <div>
          <label class="form-label">Confirm password</label>
          <div class="relative">
            <i class="ri-lock-2-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base" style="color: var(--color-primary)"></i>
            <input formControlName="confirmPassword" [type]="showConfirmPwd ? 'text' : 'password'"
              placeholder="Re-enter password"
              class="form-input pl-10 pr-10"
              [class.border-red-500]="submitted && form.errors?.['mismatch']" />
            <button type="button" (click)="showConfirmPwd = !showConfirmPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-70"
              style="color: var(--color-text-secondary)">
              <i [class]="showConfirmPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
          <p class="field-hint" [class.hint-error]="submitted && form.errors?.['mismatch']" [class.hint-ok]="confirmOk">
            <i [class]="(submitted && form.errors?.['mismatch']) ? 'ri-error-warning-line' : confirmOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && form.errors?.['mismatch']) ? 'Passwords do not match' : 'Must match the password above' }}
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
    .field-hint {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: var(--color-text-muted);
      margin-top: 5px;
      transition: color 0.15s;
    }
    .field-hint i { font-size: 13px; flex-shrink: 0; }
    .field-hint.hint-ok { color: #16a34a; }
    .field-hint.hint-error { color: #ef4444; }
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
        // Lenient: 2 chars is enough, no restrictive character pattern.
        name: ['', [Validators.required, Validators.minLength(2)]],
        // Optional field — validator only fires once the user types something.
        phone: ['', [this.phoneValidator]],
        email: ['', [Validators.required, Validators.email]],
        // Dropped from 8 to 6 chars, no complexity rules required.
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatch }
    );

    const google = (window as any).google;
    if (google) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response),
        use_fedcm_for_prompt: true,
      });
    }
  }

  // Loose phone check: optional "+", 9–15 digits, spaces/dashes stripped first.
  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const cleaned = String(value).replace(/[\s-]/g, '');
    return /^\+?\d{9,15}$/.test(cleaned) ? null : { invalidPhone: true };
  }

  private passwordMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  get f() { return this.form.controls; }

  // Live hint-state getters (green check once a field is actually filled in correctly)
  get nameOk(): boolean { return this.f['name'].dirty && this.f['name'].valid; }
  get phoneOk(): boolean { return this.f['phone'].dirty && !!this.f['phone'].value && this.f['phone'].valid; }
  get emailOk(): boolean { return this.f['email'].dirty && this.f['email'].valid; }
  get passwordOk(): boolean { return this.f['password'].dirty && this.f['password'].valid; }
  get confirmOk(): boolean {
    return this.f['confirmPassword'].dirty && !!this.f['confirmPassword'].value && !this.form.errors?.['mismatch'];
  }

  onGoogleSignIn(): void {
    const google = (window as any).google;
    if (!google) {
      this.toast.error('Google Sign-In is not available.');
      return;
    }
    if (this.googleLoading) return;

    this.googleLoading = true;
    const stopLoading = () => (this.googleLoading = false);
    const safetyTimeout = setTimeout(stopLoading, 6000);

    google.accounts.id.prompt((notification: any) => {
      clearTimeout(safetyTimeout);
      stopLoading();
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        google.accounts.id.cancel();
        this.googleLoading = true;
        this.auth.getGoogleAuthUrl().subscribe({
          next: (res) => { window.location.href = res.url; },
          error: () => {
            this.googleLoading = false;
            this.toast.error('Google Sign-In is not available right now.');
          },
        });
      }
    });
  }

  private handleGoogleCredential(response: { credential: string }): void {
    this.loading = true;
    this.auth.googleSignIn(response.credential).subscribe({
      next: (res: any) => {
        const isNewUser = res?.data?.isNewUser ?? res?.isNewUser;
        this.toast.success(isNewUser ? 'Welcome to Bigluxx!' : 'You already have an account — signed you in.');
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
        this.router.navigate(['/auth/verify'], { queryParams: { email, type: 'signup' } });
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