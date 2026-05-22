// ============================================================
// password-security.component.ts  —  Complete rewrite
//
// Changes vs previous version:
//  1. Phone verification flow fully implemented:
//     - "Verify Phone" button calls POST /verification/phone/send
//     - OTP input modal appears with 6 boxes + countdown timer
//     - Submitting calls POST /verification/phone/verify
//     - Handles wrong code, expired code, max attempts
//  2. Resend OTP with 60-second cooldown
//  3. Email verification unchanged (already worked)
// ============================================================

import { Component, OnInit, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";
import { AuthService } from "@core/services/auth.service";

interface SecurityInfo {
  lastLogin: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  accountAge: string;
  activeDevices: { platform: string; lastActive: string; deviceInfo: any }[];
  recentPasswordChanges: number;
}

@Component({
  selector: "app-password-security",
  standalone: false,
  template: `
    <div
      class="min-h-screen pb-28"
      style="background-color: var(--color-background)"
    >
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
        style="background-color: var(--color-surface); border-color: var(--color-border)"
      >
        <button
          (click)="back()"
          class="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style="background-color: var(--color-background)"
        >
          <i class="ri-arrow-left-s-line text-lg text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="flex-1 text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          Password &amp; Security
        </h1>
      </div>

      <!-- ── Skeleton ── -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-36 rounded-2xl"></div>
        <div class="skeleton h-44 rounded-2xl"></div>
        <div class="skeleton h-28 rounded-2xl"></div>
      </div>

      <!-- ── Error state ── -->
      <div *ngIf="!loading && loadError" class="p-4 max-w-2xl mx-auto">
        <div
          class="rounded-2xl p-5 flex flex-col items-center gap-3 text-center"
          style="background-color: var(--color-surface)"
        >
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center" style="background: #FEF2F2">
            <i class="ri-error-warning-line text-xl text-red-500"></i>
          </div>
          <p class="text-sm font-semibold text-[var(--color-text-primary)]">Couldn't load security info</p>
          <p class="text-xs text-[var(--color-text-muted)]">Check your connection and try again.</p>
          <button
            (click)="loadSecurityInfo()"
            class="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
          >
            <i class="ri-refresh-line"></i> Retry
          </button>
        </div>
      </div>

      <!-- ── Main content ── -->
      <div *ngIf="!loading && !loadError" class="p-4 max-w-2xl mx-auto space-y-5">

        <!-- Security Score Banner -->
        <div
          class="rounded-2xl p-4 flex items-center gap-4"
          style="background: color-mix(in srgb, var(--color-primary) 8%, transparent)"
        >
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style="background: color-mix(in srgb, var(--color-primary) 15%, transparent)"
          >
            <i class="ri-shield-keyhole-line text-2xl" style="color: var(--color-primary)"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-[var(--color-text-primary)]">Security Score</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">{{ scoreSubtitle() }}</p>
            <div class="mt-2 h-1.5 rounded-full overflow-hidden" style="background-color: var(--color-border)">
              <div
                class="h-full rounded-full transition-all duration-500"
                [style.width.%]="securityScore() * 33.3"
                [ngClass]="scoreBarColor()"
              ></div>
            </div>
          </div>
          <div class="flex-shrink-0 text-right">
            <span class="text-lg font-black" [ngClass]="scoreTextColor()">{{ scoreLabel() }}</span>
          </div>
        </div>

        <!-- Overview -->
        <p class="section-label">Overview</p>
        <div class="menu-list">

          <!-- Email verification status -->
          <div class="menu-row">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background: #EFF6FF">
                <i class="ri-mail-line" style="color: #3B82F6"></i>
              </div>
              <span>Email</span>
            </div>
            <div class="status-badge" [ngClass]="info?.emailVerified ? 'badge-success' : 'badge-warn'">
              <i [class]="info?.emailVerified ? 'ri-shield-check-fill' : 'ri-error-warning-fill'"></i>
              {{ info?.emailVerified ? 'Verified' : 'Not verified' }}
            </div>
          </div>

          <!-- Phone verification status -->
          <div class="menu-row">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background: #F0FDF4">
                <i class="ri-smartphone-line" style="color: #22C55E"></i>
              </div>
              <div>
                <span class="text-sm font-medium text-[var(--color-text-primary)]">Phone</span>
                <p *ngIf="userPhone" class="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {{ maskPhone(userPhone) }}
                </p>
                <p *ngIf="!userPhone" class="text-xs text-[var(--color-text-muted)] mt-0.5">
                  No phone added
                </p>
              </div>
            </div>
            <div class="status-badge" [ngClass]="info?.phoneVerified ? 'badge-success' : 'badge-warn'">
              <i [class]="info?.phoneVerified ? 'ri-shield-check-fill' : 'ri-error-warning-fill'"></i>
              {{ info?.phoneVerified ? 'Verified' : 'Not verified' }}
            </div>
          </div>

          <!-- Last login -->
          <div *ngIf="info?.lastLogin" class="menu-row">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background: #FDF4FF">
                <i class="ri-login-circle-line" style="color: #A855F7"></i>
              </div>
              <span>Last Login</span>
            </div>
            <span class="text-xs text-[var(--color-text-muted)]">
              {{ info?.lastLogin | date: 'medium' }}
            </span>
          </div>

          <!-- Member since -->
          <div *ngIf="info?.accountAge" class="menu-row no-border">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background: #FFFBEB">
                <i class="ri-calendar-line" style="color: #F59E0B"></i>
              </div>
              <span>Member Since</span>
            </div>
            <span class="text-xs text-[var(--color-text-muted)]">
              {{ info?.accountAge | date: 'mediumDate' }}
            </span>
          </div>
        </div>

        <!-- Security Actions -->
        <p class="section-label">Security Actions</p>
        <div class="menu-list">

          <!-- Change password -->
          <button class="menu-row" (click)="router.navigate(['/settings/change-password'])">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background: #EFF6FF">
                <i class="ri-lock-password-line" style="color: #3B82F6"></i>
              </div>
              <span>Change Password</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <!-- Verify email — only when NOT verified -->
          <button
            *ngIf="!info?.emailVerified"
            class="menu-row"
            (click)="sendEmailVerification()"
            [disabled]="verifyEmailLoading"
          >
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background: #FFFBEB">
                <i class="ri-mail-check-line" style="color: #F59E0B"></i>
              </div>
              <div>
                <span class="text-sm font-medium text-[var(--color-text-primary)]">Verify Email</span>
                <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                  A verification link will be sent to your inbox
                </p>
              </div>
            </div>
            <i *ngIf="!verifyEmailLoading" class="ri-arrow-right-s-line menu-arrow"></i>
            <i *ngIf="verifyEmailLoading" class="ri-loader-4-line animate-spin text-[var(--color-text-muted)]"></i>
          </button>

          <!-- ── Verify Phone — only when NOT verified ── -->
          <button
            *ngIf="!info?.phoneVerified && userPhone"
            class="menu-row"
            (click)="initiatePhoneVerification()"
            [disabled]="sendOtpLoading"
          >
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background: #F0FDF4">
                <i class="ri-smartphone-line" style="color: #22C55E"></i>
              </div>
              <div>
                <span class="text-sm font-medium text-[var(--color-text-primary)]">Verify Phone</span>
                <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Send a 6-digit code to {{ maskPhone(userPhone) }}
                </p>
              </div>
            </div>
            <i *ngIf="!sendOtpLoading" class="ri-arrow-right-s-line menu-arrow"></i>
            <i *ngIf="sendOtpLoading" class="ri-loader-4-line animate-spin text-[var(--color-text-muted)]"></i>
          </button>

          <!-- No phone number — prompt to add one -->
          <div *ngIf="!info?.phoneVerified && !userPhone" class="menu-row">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background: #F0FDF4">
                <i class="ri-smartphone-line" style="color: #22C55E"></i>
              </div>
              <div>
                <span class="text-sm font-medium text-[var(--color-text-primary)]">Verify Phone</span>
                <p class="text-xs text-amber-500 mt-0.5">
                  Add a phone number to your profile first
                </p>
              </div>
            </div>
            <button
              (click)="goToProfile()"
              class="text-xs font-semibold px-3 py-1.5 rounded-xl"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary)"
            >
              Add phone
            </button>
          </div>

          <!-- Sign out all devices -->
          <button class="menu-row no-border danger-row" (click)="showRevokeModal = true">
            <div class="menu-row-left danger">
              <div class="menu-icon-wrap" style="background: #FEF2F2">
                <i class="ri-logout-box-line" style="color: #EF4444"></i>
              </div>
              <span>Sign Out All Devices</span>
            </div>
            <span class="text-xs text-[var(--color-text-muted)]">
              {{ info?.activeDevices?.length || 0 }} active
            </span>
          </button>
        </div>

        <!-- Active Devices -->
        <ng-container *ngIf="info?.activeDevices?.length">
          <p class="section-label">Active Devices</p>
          <div class="menu-list">
            <div
              *ngFor="let device of info?.activeDevices; let last = last"
              class="menu-row"
              [class.no-border]="last"
            >
              <div class="menu-row-left">
                <div class="menu-icon-wrap" style="background-color: var(--color-background)">
                  <i [class]="deviceIcon(device.platform) + ' text-[var(--color-text-muted)]'"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-[var(--color-text-primary)] capitalize">
                    {{ device.platform }}
                  </p>
                  <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Last active {{ device.lastActive | date: 'short' }}
                  </p>
                </div>
              </div>
              <div class="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></div>
            </div>
          </div>
        </ng-container>

      </div><!-- /main content -->

      <!-- ══════════════════════════════════════════════════════
           OTP VERIFICATION MODAL
           Shown after "Verify Phone" is tapped and OTP is sent
      ══════════════════════════════════════════════════════ -->
      <div
        *ngIf="showOtpModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
        style="background: rgba(0,0,0,0.5)"
      >
        <div
          class="w-full max-w-sm rounded-3xl p-6 space-y-5"
          style="background-color: var(--color-surface)"
        >
          <!-- Modal header -->
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-lg font-black text-[var(--color-text-primary)]">Verify your phone</h2>
              <p class="text-sm text-[var(--color-text-muted)] mt-1">
                Enter the 6-digit code sent to<br>
                <span class="font-semibold text-[var(--color-text-primary)]">{{ maskPhone(userPhone) }}</span>
              </p>
            </div>
            <button
              (click)="closeOtpModal()"
              class="w-8 h-8 flex items-center justify-center rounded-xl"
              style="background-color: var(--color-background)"
            >
              <i class="ri-close-line text-[var(--color-text-primary)]"></i>
            </button>
          </div>

          <!-- 6-digit OTP input boxes -->
          <div class="flex gap-2 justify-center">
            <input
              *ngFor="let i of otpIndices"
              #otpInput
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="w-11 h-14 text-center text-xl font-black rounded-xl border-2 outline-none transition-all"
              [class.border-red-400]="otpError"
              [ngClass]="otpDigits[i] ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'"
              style="background-color: var(--color-background); color: var(--color-text-primary)"
              [value]="otpDigits[i]"
              (input)="onOtpInput($event, i)"
              (keydown)="onOtpKeydown($event, i)"
              (paste)="onOtpPaste($event)"
            />
          </div>

          <!-- Error message -->
          <p *ngIf="otpError" class="text-xs text-red-500 text-center -mt-2">
            {{ otpError }}
          </p>

          <!-- Countdown / Resend -->
          <div class="text-center">
            <span
              *ngIf="resendCooldown > 0"
              class="text-xs text-[var(--color-text-muted)]"
            >
              Resend code in {{ resendCooldown }}s
            </span>
            <button
              *ngIf="resendCooldown === 0"
              (click)="resendOtp()"
              [disabled]="sendOtpLoading"
              class="text-xs font-semibold"
              style="color: var(--color-primary)"
            >
              <i *ngIf="sendOtpLoading" class="ri-loader-4-line animate-spin text-xs"></i>
              {{ sendOtpLoading ? 'Sending…' : 'Resend code' }}
            </button>
          </div>

          <!-- Verify button -->
          <button
            (click)="verifyOtp()"
            [disabled]="otpValue.length < 6 || verifyingOtp"
            class="btn-primary w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <i *ngIf="verifyingOtp" class="ri-loader-4-line animate-spin"></i>
            {{ verifyingOtp ? 'Verifying…' : 'Verify Phone Number' }}
          </button>
        </div>
      </div>

      <!-- Revoke all devices modal -->
      <app-confirm-modal
        *ngIf="showRevokeModal"
        title="Sign Out All Devices"
        message="This will sign you out of all devices including this one. You'll need to log in again."
        confirmText="Sign Out All"
        type="warning"
        [loading]="revoking"
        (confirmed)="revokeAllDevices()"
        (cancelled)="showRevokeModal = false"
      ></app-confirm-modal>
    </div>
  `,
  styles: [`
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0 4px;
      margin-bottom: 8px;
    }
    .menu-list {
      background-color: var(--color-surface);
      border-radius: 20px;
      overflow: hidden;
    }
    .menu-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 13px 16px;
      background: none;
      border: none;
      border-bottom: 1px solid var(--color-border);
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    .menu-row:last-child, .menu-row.no-border { border-bottom: none; }
    .menu-row:active { background-color: var(--color-background); }
    .menu-row:disabled { opacity: 0.6; cursor: not-allowed; }
    .menu-row-left {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .menu-icon-wrap {
      width: 36px; height: 36px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 18px;
    }
    .menu-arrow { font-size: 20px; color: var(--color-text-muted); }
    .status-badge {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 700;
      padding: 4px 10px; border-radius: 20px;
    }
    .badge-success { background: #f0fdf4; color: #16a34a; }
    .badge-warn    { background: #fffbeb; color: #d97706; }
    .danger-row .menu-row-left.danger { color: #ef4444; }
  `],
})
export class PasswordSecurityComponent implements OnInit, OnDestroy {
  info: SecurityInfo | null = null;
  loading = true;
  loadError = false;
  showRevokeModal = false;
  revoking = false;

  // Email verification
  verifyEmailLoading = false;

  // Phone OTP state
  sendOtpLoading = false;
  showOtpModal = false;
  verifyingOtp = false;
  otpDigits: string[] = ['', '', '', '', '', ''];
  otpIndices = [0, 1, 2, 3, 4, 5];
  otpError = '';
  resendCooldown = 0;
  private cooldownTimer: any = null;

  // Resolved from auth user
  userPhone = '';

  constructor(
    private http: HttpClient,
    private location: Location,
    public router: Router,
    private toast: ToastService,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    // Grab the phone number from the logged-in user
    this.userPhone = this.auth.user?.phone || '';
    this.loadSecurityInfo();
  }

  ngOnDestroy() {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  // ─────────────────────────────────────────────
  // Security info
  // ─────────────────────────────────────────────

  loadSecurityInfo() {
    this.loading = true;
    this.loadError = false;
    this.http.get<any>(`${environment.apiUrl}/security/info`).subscribe({
      next: (res) => {
        this.info = res.data.security;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      },
    });
  }

  back() { this.location.back(); }

  goToProfile() {
    // Both roles have a profile page; navigate based on role
    const role = this.auth.user?.role;
    this.router.navigate([role === 'BEAUTICIAN' ? '/beautician/profile' : '/client/profile']);
  }

  // ─────────────────────────────────────────────
  // Security score helpers (unchanged)
  // ─────────────────────────────────────────────

  securityScore(): number {
    if (!this.info) return 0;
    let score = 0;
    if (this.info.emailVerified) score++;
    if (this.info.phoneVerified) score++;
    if (this.info.recentPasswordChanges > 0) score++;
    return score;
  }
  scoreLabel(): string    { return ['Weak','Fair','Good','Strong'][this.securityScore()] ?? 'Strong'; }
  scoreSubtitle(): string { return ['Improve your security','A few things to fix','Almost there','Your account is secure'][this.securityScore()] ?? ''; }
  scoreBarColor(): string { const s=this.securityScore(); return s<=0?'bg-red-500':s===1?'bg-amber-400':s===2?'bg-blue-500':'bg-green-500'; }
  scoreTextColor(): string{ const s=this.securityScore(); return s<=0?'text-red-500':s===1?'text-amber-500':s===2?'text-blue-500':'text-green-500'; }
  deviceIcon(platform: string): string { if(platform==='ios')return'ri-apple-line';if(platform==='android')return'ri-android-line';return'ri-computer-line'; }

  /** Show phone as e.g. "+233 *** *** 210" */
  maskPhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) return phone;
    const visible = digits.slice(-3);
    const masked = '*'.repeat(Math.max(0, digits.length - 4));
    return `+${digits.slice(0,3)} ${masked} ${visible}`;
  }

  // ─────────────────────────────────────────────
  // Email verification (existing, unchanged)
  // ─────────────────────────────────────────────

  sendEmailVerification() {
    this.verifyEmailLoading = true;
    this.http.post<any>(`${environment.apiUrl}/verification/email/send`, {}).subscribe({
      next: () => {
        this.verifyEmailLoading = false;
        this.toast.success('Verification email sent! Check your inbox.');
      },
      error: (err) => {
        this.verifyEmailLoading = false;
        if (err?.error?.message?.toLowerCase().includes('already verified')) {
          this.toast.success('Your email is already verified.');
          this.loadSecurityInfo();
        } else {
          this.toast.error(err?.error?.message || 'Failed to send verification email');
        }
      },
    });
  }

  // ─────────────────────────────────────────────
  // Phone verification — step 1: send OTP
  // ─────────────────────────────────────────────

  initiatePhoneVerification() {
    this.sendOtpLoading = true;
    this.http.post<any>(`${environment.apiUrl}/verification/phone/send`, {}).subscribe({
      next: (res) => {
        this.sendOtpLoading = false;
        this.showOtpModal = true;
        this.resetOtpState();
        this.startResendCooldown();
        this.toast.success(res.message || 'Code sent!');
      },
      error: (err) => {
        this.sendOtpLoading = false;
        this.toast.error(err?.error?.message || 'Failed to send verification code');
      },
    });
  }

  resendOtp() {
    if (this.resendCooldown > 0 || this.sendOtpLoading) return;
    this.sendOtpLoading = true;
    this.resetOtpState();
    this.http.post<any>(`${environment.apiUrl}/verification/phone/send`, {}).subscribe({
      next: (res) => {
        this.sendOtpLoading = false;
        this.startResendCooldown();
        this.toast.success('New code sent!');
      },
      error: (err) => {
        this.sendOtpLoading = false;
        this.toast.error(err?.error?.message || 'Failed to resend code');
      },
    });
  }

  private startResendCooldown() {
    this.resendCooldown = 60;
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }

  // ─────────────────────────────────────────────
  // Phone verification — step 2: submit OTP
  // ─────────────────────────────────────────────

  get otpValue(): string {
    return this.otpDigits.join('');
  }

  verifyOtp() {
    if (this.otpValue.length < 6 || this.verifyingOtp) return;
    this.verifyingOtp = true;
    this.otpError = '';

    this.http.post<any>(`${environment.apiUrl}/verification/phone/verify`, {
      code: this.otpValue,
    }).subscribe({
      next: (res) => {
        this.verifyingOtp = false;
        this.showOtpModal = false;
        this.toast.success(res.message || 'Phone verified!');
        // Refresh the security info to show the green badge
        this.loadSecurityInfo();
        // Also update the auth user object so other components see the change
        if (this.auth.user) {
          this.auth.updateUser({ ...this.auth.user, phoneVerified: true });
        }
      },
      error: (err) => {
        this.verifyingOtp = false;
        this.otpError = err?.error?.message || 'Incorrect code. Please try again.';
        // Shake and clear the boxes on error
        this.otpDigits = ['', '', '', '', '', ''];
      },
    });
  }

  // ─────────────────────────────────────────────
  // OTP input box handlers
  // ─────────────────────────────────────────────

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1); // digits only
    this.otpDigits[index] = value;
    this.otpError = '';

    if (value && index < 5) {
      // Move focus to the next box
      const next = input.parentElement?.querySelectorAll('input')[index + 1] as HTMLInputElement;
      next?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (this.otpValue.length === 6) {
      setTimeout(() => this.verifyOtp(), 120);
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const input = event.target as HTMLInputElement;
      const prev = input.parentElement?.querySelectorAll('input')[index - 1] as HTMLInputElement;
      prev?.focus();
      this.otpDigits[index - 1] = '';
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    digits.split('').forEach((d, i) => {
      if (i < 6) this.otpDigits[i] = d;
    });
    this.otpError = '';
    if (digits.length === 6) {
      setTimeout(() => this.verifyOtp(), 120);
    }
  }

  closeOtpModal() {
    this.showOtpModal = false;
    this.resetOtpState();
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
      this.resendCooldown = 0;
    }
  }

  private resetOtpState() {
    this.otpDigits = ['', '', '', '', '', ''];
    this.otpError = '';
  }

  // ─────────────────────────────────────────────
  // Revoke all devices
  // ─────────────────────────────────────────────

  revokeAllDevices() {
    this.revoking = true;
    this.http.post<any>(`${environment.apiUrl}/security/revoke-devices`, {}).subscribe({
      next: () => {
        this.revoking = false;
        this.showRevokeModal = false;
        this.toast.success('Signed out of all devices');
        this.auth.logout();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.revoking = false;
        this.showRevokeModal = false;
        this.toast.error('Failed to revoke devices. Please try again.');
      },
    });
  }
}