import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { environment } from "@environments/environment";

@Component({
  selector: "app-login",
  template: `
    <div class="page-enter">
      <!-- Heading -->
      <div class="mb-8">
        <h2
          class="text-3xl font-bold mb-2"
          style="color: var(--color-text-primary)"
        >
          Welcome back
        </h2>
        <p class="text-sm" style="color: var(--color-text-secondary)">
          Sign in to book your next beauty appointment
        </p>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Email -->
        <div>
          <label class="form-label">Email address</label>
          <div class="relative">
            <i
              class="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
              style="color: var(--color-primary)"
            ></i>
            <input
              formControlName="email"
              type="email"
              placeholder="you@example.com"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['email'].errors"
            />
          </div>
          <p
            *ngIf="submitted && f['email'].errors?.['required']"
            class="text-xs text-red-500 mt-1"
          >
            Email is required
          </p>
          <p
            *ngIf="submitted && f['email'].errors?.['email']"
            class="text-xs text-red-500 mt-1"
          >
            Enter a valid email
          </p>
        </div>

        <!-- Password -->
        <div>
          <label class="form-label">Password</label>
          <div class="relative">
            <i
              class="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-base"
              style="color: var(--color-primary)"
            ></i>
            <input
              formControlName="password"
              [type]="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="form-input pl-10 pr-10"
              [class.border-red-500]="submitted && f['password'].errors"
            />
            <button
              type="button"
              (click)="showPassword = !showPassword"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
              style="color: var(--color-text-secondary)"
            >
              <i
                [class]="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                class="text-base"
              ></i>
            </button>
          </div>
          <p
            *ngIf="submitted && f['password'].errors?.['required']"
            class="text-xs text-red-500 mt-1"
          >
            Password is required
          </p>
        </div>

        <!-- Forgot password -->
        <div class="flex justify-end">
          <a
            routerLink="/auth/forgot-password"
            class="text-xs font-medium transition-opacity hover:opacity-80"
            style="color: var(--color-primary)"
          >
            Forgot password?
          </a>
        </div>

        <!-- Submit -->
        <button type="submit" class="btn-primary w-full" [disabled]="loading">
          <span class="spinner" *ngIf="loading"></span>
          <span>{{ loading ? "Signing in..." : "Sign in" }}</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-3 my-6">
        <div
          class="flex-1 h-px"
          style="background: var(--color-border-light)"
        ></div>
        <span class="text-xs" style="color: var(--color-text-placeholder)"
          >OR</span
        >
        <div
          class="flex-1 h-px"
          style="background: var(--color-border-light)"
        ></div>
      </div>

      <!-- Google sign-in -->
      <button
        type="button"
        (click)="onGoogleSignIn()"
        class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border font-medium text-sm transition-all hover:opacity-80"
        style="border-color: var(--color-border-light); color: var(--color-text-primary); background: var(--color-bg-primary)"
      >
        <img
          src="https://www.svgrepo.com/show/355037/google.svg"
          alt="Google"
          class="w-5 h-5"
        />
        Continue with Google
      </button>
      <!-- Fallback render target if One Tap is suppressed -->
      <div id="google-btn-container" class="mt-2"></div>

      <!-- Register links -->
      <div class="mt-6 space-y-3 text-center">
        <p class="text-sm" style="color: var(--color-text-secondary)">
          Don't have an account?
          <a
            routerLink="/auth/register"
            class="font-semibold ml-1"
            style="color: var(--color-primary)"
          >
            Sign up
          </a>
        </p>
        <p class="text-xs" style="color: var(--color-text-placeholder)">
          Are you a beautician?
          <a
            routerLink="/auth/beautician-register"
            class="font-semibold"
            style="color: var(--color-primary)"
          >
            Join as beautician
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    });

    const google = (window as any).google;
    if (google) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId, // ← from environment, not hardcoded
        callback: (response: any) => this.handleGoogleCredential(response),
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;

    this.loading = true;
    const { email, password } = this.form.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        this.toast.success("Welcome back!");
        this.router.navigate([this.auth.getDashboardRoute()]);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || "Login failed. Please try again.";
        this.toast.error(msg);
      },
    });
  }

  onGoogleSignIn(): void {
    const google = (window as any).google;

    if (!google) {
      this.toast.error("Google Sign-In is not available. Please try again.");
      return;
    }

    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap was blocked — fall back to popup
        google.accounts.id.renderButton(
          document.getElementById("google-btn-container"),
          { theme: "outline", size: "large", width: "100%" },
        );
      }
    });
  }

  private handleGoogleCredential(response: { credential: string }): void {
    this.loading = true;
    this.auth.googleSignIn(response.credential).subscribe({
      next: () => {
        this.toast.success("Welcome!");
        this.router.navigate([this.auth.getDashboardRoute()]);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || "Google sign-in failed");
      },
    });
  }
}
