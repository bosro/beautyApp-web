import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

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
  }

  private passwordMatch(group: FormGroup) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  get f() { return this.form.controls; }

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



