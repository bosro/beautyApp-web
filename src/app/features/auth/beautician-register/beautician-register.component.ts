import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-beautician-register',
  template: `
    <div class="page-enter">
      <button (click)="router.navigate(['/auth/login'])"
        class="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70"
        style="color: var(--color-text-secondary)">
        <i class="ri-arrow-left-line"></i> Back
      </button>

      <!-- Header -->
      <div class="flex items-center gap-4 mb-7">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
          style="background-color: color-mix(in srgb, var(--color-primary) 15%, transparent)">
          <i class="ri-scissors-2-line text-2xl" style="color: var(--color-primary)"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold" style="color: var(--color-text-primary)">Join as Beautician</h2>
          <p class="text-sm" style="color: var(--color-text-secondary)">Grow your beauty business</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="form-label">Business name</label>
          <div class="relative">
            <i class="ri-store-2-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
            <input formControlName="name" type="text" placeholder="e.g., Glam Beauty Salon"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['name'].errors"/>
          </div>
          <p *ngIf="submitted && f['name'].errors" class="text-xs text-red-500 mt-1">Business name is required</p>
        </div>

        <div>
          <label class="form-label">Email address</label>
          <div class="relative">
            <i class="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
            <input formControlName="email" type="email" placeholder="your@email.com"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['email'].errors"/>
          </div>
          <p *ngIf="submitted && f['email'].errors" class="text-xs text-red-500 mt-1">Valid email required</p>
        </div>

        <div>
          <label class="form-label">Phone number</label>
          <div class="relative">
            <i class="ri-phone-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
            <input formControlName="phone" type="tel" placeholder="+233 50 123 4567"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['phone'].errors"/>
          </div>
          <p *ngIf="submitted && f['phone'].errors" class="text-xs text-red-500 mt-1">Phone is required</p>
        </div>

        <div>
          <label class="form-label">Password</label>
          <div class="relative">
            <i class="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
            <input formControlName="password" [type]="showPwd ? 'text' : 'password'"
              placeholder="Minimum 8 characters" class="form-input pl-10 pr-10"
              [class.border-red-500]="submitted && f['password'].errors"/>
            <button type="button" (click)="showPwd = !showPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-text-secondary)">
              <i [class]="showPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
        </div>

        <div>
          <label class="form-label">Confirm password</label>
          <input formControlName="confirmPassword" [type]="showPwd ? 'text' : 'password'"
            placeholder="Re-enter password" class="form-input"
            [class.border-red-500]="submitted && form.errors?.['mismatch']"/>
          <p *ngIf="submitted && form.errors?.['mismatch']" class="text-xs text-red-500 mt-1">Passwords don't match</p>
        </div>

        <!-- Terms -->
        <label class="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" formControlName="terms" class="mt-0.5 accent-primary rounded"/>
          <span class="text-xs leading-relaxed" style="color: var(--color-text-secondary)">
            I agree to the
            <a class="font-semibold" style="color: var(--color-primary)">Terms & Conditions</a>
            and
            <a class="font-semibold" style="color: var(--color-primary)">Privacy Policy</a>
          </span>
        </label>
        <p *ngIf="submitted && f['terms'].errors" class="text-xs text-red-500">Please accept the terms</p>

        <!-- Benefits -->
        <div class="p-4 rounded-xl space-y-2" style="background-color: var(--color-bg-secondary)">
          <p class="text-xs font-semibold mb-2" style="color: var(--color-text-primary)">What you'll get:</p>
          <div *ngFor="let benefit of benefits" class="flex items-center gap-2 text-xs">
            <i class="ri-checkbox-circle-fill text-green-500"></i>
            <span style="color: var(--color-text-secondary)">{{ benefit }}</span>
          </div>
        </div>

        <button type="submit" class="btn-primary w-full" [disabled]="loading">
          <span class="spinner" *ngIf="loading"></span>
          {{ loading ? 'Creating account...' : 'Create beautician account' }}
        </button>
      </form>

      <p class="text-center text-sm mt-5" style="color: var(--color-text-secondary)">
        Already have an account?
        <a routerLink="/auth/login" class="font-semibold ml-1" style="color: var(--color-primary)">Sign in</a>
      </p>
    </div>
  `,
})
export class BeauticianRegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  showPwd = false;

  benefits = [
    'Professional profile to showcase your work',
    'Easy booking management system',
    'Access to hundreds of potential clients',
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
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

    const { name, email, phone, password } = this.form.value;
    this.auth.register({ name, email, phone, password, role: 'BEAUTICIAN' }).subscribe({
      next: () => {
        this.router.navigate(['/auth/beautician-verify'], { queryParams: { email } });
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Registration failed');
      },
    });
  }
}
