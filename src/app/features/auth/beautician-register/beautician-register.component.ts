import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
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

      <button type="button" (click)="openGoogleDetailsModal()" class="google-btn w-full mb-4">
        <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" class="w-5 h-5" />
        <span>Sign up with Google</span>
      </button>

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
              [class.border-red-500]="submitted && f['name'].invalid"/>
          </div>
          <p class="field-hint" [class.hint-error]="submitted && f['name'].invalid" [class.hint-ok]="nameOk">
            <i [class]="(submitted && f['name'].invalid) ? 'ri-error-warning-line' : nameOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && f['name'].errors?.['required']) ? 'Business name is required' : 'At least 2 characters, can be your salon or personal brand name' }}
          </p>
        </div>

        <div>
          <label class="form-label">Email address</label>
          <div class="relative">
            <i class="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
            <input formControlName="email" type="email" placeholder="your@email.com"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['email'].invalid"/>
          </div>
          <p class="field-hint" [class.hint-error]="submitted && f['email'].invalid" [class.hint-ok]="emailOk">
            <i [class]="(submitted && f['email'].invalid) ? 'ri-error-warning-line' : emailOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && f['email'].errors?.['required']) ? 'Email is required' : (submitted && f['email'].errors?.['email']) ? 'Enter a valid email' : "We'll send booking notifications here" }}
          </p>
        </div>

        <div>
          <label class="form-label">Phone number</label>
          <div class="relative">
            <i class="ri-phone-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
            <input formControlName="phone" type="tel" placeholder="+233 50 123 4567"
              class="form-input pl-10"
              [class.border-red-500]="submitted && f['phone'].invalid"/>
          </div>
          <p class="field-hint" [class.hint-error]="submitted && f['phone'].invalid" [class.hint-ok]="phoneOk">
            <i [class]="(submitted && f['phone'].invalid) ? 'ri-error-warning-line' : phoneOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && f['phone'].errors?.['required']) ? 'Phone number is required' : (submitted && f['phone'].errors?.['invalidPhone']) ? 'Enter a valid phone number' : 'Clients use this to reach you — 9–15 digits' }}
          </p>
        </div>

        <div>
          <label class="form-label">Password</label>
          <div class="relative">
            <i class="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
            <input formControlName="password" [type]="showPwd ? 'text' : 'password'"
              placeholder="Minimum 6 characters" class="form-input pl-10 pr-10"
              [class.border-red-500]="submitted && f['password'].invalid"/>
            <button type="button" (click)="showPwd = !showPwd"
              class="absolute right-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-text-secondary)">
              <i [class]="showPwd ? 'ri-eye-off-line' : 'ri-eye-line'" class="text-base"></i>
            </button>
          </div>
          <p class="field-hint" [class.hint-error]="submitted && f['password'].invalid" [class.hint-ok]="passwordOk">
            <i [class]="(submitted && f['password'].invalid) ? 'ri-error-warning-line' : passwordOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && f['password'].errors?.['required']) ? 'Password is required' : (submitted && f['password'].errors?.['minlength']) ? 'Minimum 6 characters' : 'At least 6 characters' }}
          </p>
        </div>

        <div>
          <label class="form-label">Confirm password</label>
          <input formControlName="confirmPassword" [type]="showPwd ? 'text' : 'password'"
            placeholder="Re-enter password" class="form-input"
            [class.border-red-500]="submitted && form.errors?.['mismatch']"/>
          <p class="field-hint" [class.hint-error]="submitted && form.errors?.['mismatch']" [class.hint-ok]="confirmOk">
            <i [class]="(submitted && form.errors?.['mismatch']) ? 'ri-error-warning-line' : confirmOk ? 'ri-checkbox-circle-fill' : 'ri-information-line'"></i>
            {{ (submitted && form.errors?.['mismatch']) ? "Passwords don't match" : 'Must match the password above' }}
          </p>
        </div>

        <!-- ── Tell us more about your business (all optional) ── -->
        <div class="pt-2 pb-1">
          <p class="text-sm font-semibold" style="color: var(--color-text-primary)">Tell us about your business</p>
          <p class="text-xs" style="color: var(--color-text-secondary)">Optional — helps us match you with the right clients</p>
        </div>

        <label class="flex items-center justify-between p-3.5 rounded-xl cursor-pointer"
          style="background-color: var(--color-bg-secondary)">
          <span class="text-sm font-medium" style="color: var(--color-text-primary)">I'm a student entrepreneur working on campus</span>
          <input type="checkbox" formControlName="worksOnCampus" class="accent-primary w-5 h-5 rounded flex-shrink-0 ml-3"/>
        </label>

        <ng-container *ngIf="form.value.worksOnCampus">
          <div>
            <label class="form-label">School / Campus</label>
            <div class="relative">
              <i class="ri-building-4-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
              <input formControlName="campusName" type="text" placeholder="e.g., University of Ghana, Legon" class="form-input pl-10"/>
            </div>
          </div>
          <div>
            <label class="form-label">Hostel (optional)</label>
            <div class="relative">
              <i class="ri-home-4-line absolute left-3.5 top-1/2 -translate-y-1/2" style="color: var(--color-primary)"></i>
              <input formControlName="hostelName" type="text" placeholder="e.g., Jean Nelson Aka Hall" class="form-input pl-10"/>
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

        <div *ngIf="!form.value.worksOnCampus">
          <label class="form-label">Which best describes you?</label>
          <select formControlName="employmentType" class="form-input">
            <option value="">Select one</option>
            <option value="SELF_EMPLOYED">Self-employed / freelance</option>
            <option value="SALON_OWNER">Salon owner</option>
            <option value="EMPLOYED">Employed at a salon/spa</option>
          </select>
        </div>

        <label class="flex items-center justify-between p-3.5 rounded-xl cursor-pointer"
          style="background-color: var(--color-bg-secondary)">
          <span class="text-sm font-medium" style="color: var(--color-text-primary)">I offer home service (I travel to clients)</span>
          <input type="checkbox" formControlName="offersHomeService" class="accent-primary w-5 h-5 rounded flex-shrink-0 ml-3"/>
        </label>

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
      margin-top: 5px;
      color: var(--color-text-secondary);
    }
    .field-hint.hint-error { color: #ef4444; }
    .field-hint.hint-ok { color: #22c55e; }
  `],
})
export class BeauticianRegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  showPwd = false;
  googleLoading = false;

  showGoogleDetailsModal = false;
  googleDetails = {
    worksOnCampus: false,
    campusName: '',
    hostelName: '',
    residencyStatus: '',
    employmentType: '',
    offersHomeService: false,
  };

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
  ) { }

  // Loose 9–15 digit check — allows spaces, dashes, parens, leading '+',
  // so we don't block real numbers on formatting alone.
  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString().trim();
    if (!value) return null; // required handles empty
    const digitsOnly = value.replace(/[^\d]/g, '');
    return digitsOnly.length >= 9 && digitsOnly.length <= 15 ? null : { invalidPhone: true };
  }

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, this.phoneValidator]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
        worksOnCampus: [false],
        campusName: [''],
        hostelName: [''],
        residencyStatus: [''],
        employmentType: [''],
        offersHomeService: [false],
      },
      {
        validators: (g: FormGroup) =>
          g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true }
      }
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

  // ── Live hint helpers — flip to "ok" state once the field is valid,
  // independent of whether the form has been submitted yet ──
  get nameOk(): boolean {
    const c = this.form?.get('name');
    return !!c && c.valid && !!c.value;
  }
  get emailOk(): boolean {
    const c = this.form?.get('email');
    return !!c && c.valid && !!c.value;
  }
  get phoneOk(): boolean {
    const c = this.form?.get('phone');
    return !!c && c.valid && !!c.value;
  }
  get passwordOk(): boolean {
    const c = this.form?.get('password');
    return !!c && c.valid && !!c.value;
  }
  get confirmOk(): boolean {
    const pwd = this.form?.get('password')?.value;
    const confirm = this.form?.get('confirmPassword')?.value;
    return !!confirm && pwd === confirm;
  }

  openGoogleDetailsModal(): void {
    this.showGoogleDetailsModal = true;
  }

  skipGoogleDetails(): void {
    this.googleDetails = {
      worksOnCampus: false,
      campusName: '',
      hostelName: '',
      residencyStatus: '',
      employmentType: '',
      offersHomeService: false,
    };
    this.continueWithGoogle();
  }

  continueWithGoogle(): void {
    this.onGoogleSignIn();
  }

  onGoogleSignIn(): void {
    const google = (window as any).google;
    if (!google) {
      this.toast.error('Google Sign-In is not available.');
      return;
    }
    if (this.googleLoading) return;

    this.googleLoading = true;
    const stopLoading = () => {
      this.googleLoading = false;
      this.showGoogleDetailsModal = false;
    };
    const safetyTimeout = setTimeout(stopLoading, 6000);

    google.accounts.id.prompt((notification: any) => {
      clearTimeout(safetyTimeout);
      stopLoading();
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        google.accounts.id.cancel();
        this.googleLoading = true;
        this.auth.getGoogleAuthUrl('BEAUTICIAN').subscribe({
          next: (res) => {
            window.location.href = res.url;
          },
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
    const { worksOnCampus, campusName, hostelName, residencyStatus, employmentType, offersHomeService } =
      this.googleDetails;

    this.auth
      .googleSignIn(response.credential, 'BEAUTICIAN', {
        worksOnCampus: !!worksOnCampus,
        campusName: worksOnCampus && campusName ? campusName : undefined,
        hostelName: worksOnCampus && hostelName ? hostelName : undefined,
        residencyStatus: worksOnCampus && residencyStatus ? (residencyStatus as any) : undefined,
        employmentType: !worksOnCampus && employmentType ? (employmentType as any) : undefined,
        offersHomeService: !!offersHomeService,
      })
      .subscribe({
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