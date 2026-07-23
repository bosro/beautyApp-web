import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '@environments/environment';

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

        <!-- ── Tell us more about your business (all optional) ── -->
        <div class="pt-2 pb-1">
          <p class="text-sm font-semibold" style="color: var(--color-text-primary)">
            Tell us about your business
          </p>
          <p class="text-xs" style="color: var(--color-text-secondary)">
            Optional — helps us match you with the right clients
          </p>
        </div>

        <!-- Campus toggle -->
        <label class="flex items-center justify-between p-3.5 rounded-xl cursor-pointer"
          style="background-color: var(--color-bg-secondary)">
          <span class="text-sm font-medium" style="color: var(--color-text-primary)">
            I'm a student entrepreneur working on campus
          </span>
          <input type="checkbox" formControlName="worksOnCampus" class="accent-primary w-5 h-5 rounded flex-shrink-0 ml-3"/>
        </label>

        <!-- Campus fields (shown only when worksOnCampus is checked) -->
        <ng-container *ngIf="form.value.worksOnCampus">
          <div>
            <label class="form-label">School / Campus</label>
            <div class="relative">
              <i class="ri-building-4-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
              <input formControlName="campusName" type="text" placeholder="e.g., University of Ghana, Legon"
                class="form-input pl-10"/>
            </div>
          </div>

          <div>
            <label class="form-label">Hostel (optional)</label>
            <div class="relative">
              <i class="ri-home-4-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
              <input formControlName="hostelName" type="text" placeholder="e.g., Jean Nelson Aka Hall"
                class="form-input pl-10"/>
            </div>
          </div>

          <div>
            <label class="form-label">Residency status</label>
            <select formControlName="residencyStatus" class="form-input">
              <option value="">Select one</option>
              <option value="RESIDENT">Resident (I live in a hostel/dorm)</option>
              <option value="NON_RESIDENT">Non-resident (I commute)</option>
              <option value="NOT_APPLICABLE">Not applicable</option>
            </select>
          </div>
        </ng-container>

        <!-- Employment type (shown only when NOT on campus) -->
        <div *ngIf="!form.value.worksOnCampus">
          <label class="form-label">Which best describes you?</label>
          <select formControlName="employmentType" class="form-input">
            <option value="">Select one</option>
            <option value="SELF_EMPLOYED">Self-employed / freelance</option>
            <option value="SALON_OWNER">Salon owner</option>
            <option value="EMPLOYED">Employed at a salon/spa</option>
          </select>
        </div>

        <!-- Home service toggle — always shown, independent of the above -->
        <label class="flex items-center justify-between p-3.5 rounded-xl cursor-pointer"
          style="background-color: var(--color-bg-secondary)">
          <span class="text-sm font-medium" style="color: var(--color-text-primary)">
            I offer home service (I travel to clients)
          </span>
          <input type="checkbox" formControlName="offersHomeService" class="accent-primary w-5 h-5 rounded flex-shrink-0 ml-3"/>
        </label>

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
        // ── All optional — categorization only, never blocks signup ──
        worksOnCampus: [false],
        campusName: [''],
        hostelName: [''],
        residencyStatus: [''],
        employmentType: [''],
        offersHomeService: [false],
      },
      { validators: (g: FormGroup) =>
          g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true }
      }
    );

    // Initialize Google SDK for this page specifically — the callback
    // must know this is a BEAUTICIAN signup, which the shared
    // login/register pages' Google buttons never did.
    const google = (window as any).google;
    if (google) {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response),
      });
    }
  }

  onGoogleSignIn(): void {
    const google = (window as any).google;
    if (!google) {
      this.toast.error('Google Sign-In is not available.');
      return;
    }
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        google.accounts.id.cancel();
        // One Tap blocked/dismissed — fall back to a full redirect,
        // explicitly requesting the BEAUTICIAN role so the account isn't
        // created as a CUSTOMER by default.
        this.auth.getGoogleAuthUrl('BEAUTICIAN').subscribe({
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
    this.auth.googleSignIn(response.credential, 'BEAUTICIAN').subscribe({
      next: (res: any) => {
        const isNewUser = res?.data?.isNewUser ?? res?.isNewUser;
        this.toast.success(
          isNewUser ? 'Welcome to Bigluxx!' : 'You already have an account — signed you in.',
        );
        this.router.navigate([this.auth.getDashboardRoute()]);
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err?.error?.message || 'Google sign-up failed');
      },
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading = true;

    const {
      name, email, phone, password,
      worksOnCampus, campusName, hostelName, residencyStatus,
      employmentType, offersHomeService,
    } = this.form.value;

    this.auth.register({
      name, email, phone, password,
      role: 'BEAUTICIAN',
      worksOnCampus: !!worksOnCampus,
      // Only send campus-specific fields when actually on campus, and
      // only send employmentType when not — keeps the payload clean and
      // avoids storing stale values from a toggle the user flipped back.
      campusName: worksOnCampus && campusName ? campusName : undefined,
      hostelName: worksOnCampus && hostelName ? hostelName : undefined,
      residencyStatus: worksOnCampus && residencyStatus ? residencyStatus : undefined,
      employmentType: !worksOnCampus && employmentType ? employmentType : undefined,
      offersHomeService: !!offersHomeService,
    }).subscribe({
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


