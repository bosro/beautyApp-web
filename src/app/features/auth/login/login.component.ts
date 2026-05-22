// ============================================================
// login.component.ts
//  - No-scroll: entire page fits in 100vh
//  - Mobile marquee reduced to 32vh so form is always visible
//  - Brand logo/watermark moved to TOP of marquee panel
// ============================================================

import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ToastService } from "../../../core/services/toast.service";
import { ThemeService } from "../../../core/services/theme.service";
import { environment } from "@environments/environment";

@Component({
  selector: "app-login",
  template: `
    <div class="auth-root">
      <!-- ══════════════════════════════════════════
           LEFT PANEL — Animated Marquee Bento Grid
      ══════════════════════════════════════════ -->
      <div class="marquee-panel" aria-hidden="true">
        <div class="marquee-fade-bottom"></div>
        <div class="marquee-fade-top"></div>
        <div class="marquee-overlay"></div>

        <!-- Brand watermark at TOP of panel -->
        <div class="panel-brand">
          <div class="panel-logo">
            <img
              src="assets/images/logo-dark.png"
              alt="Bigluxx"
              class="panel-logo-img"
            />
          </div>
          <p class="panel-tagline">Ghana's Premium Beauty Platform</p>
          <div class="panel-pills">
            <span class="ppill"><i class="ri-scissors-line"></i> Hair</span>
            <span class="ppill"><i class="ri-paint-brush-line"></i> Nails</span>
            <span class="ppill"><i class="ri-magic-line"></i> Makeup</span>
            <span class="ppill"><i class="ri-leaf-line"></i> Spa</span>
          </div>
        </div>

        <div class="cols-wrap">
          <!-- Col 1 — scrolls up, normal speed -->
          <div class="mcol" id="lc1">
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&q=80"
                alt="Salon"
              />
            </div>
            <div class="mcard med">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80"
                alt="Beauty"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&q=80"
                alt="Makeup"
              />
            </div>
            <div class="mcard med">
              <img
                src="https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=300&q=80"
                alt="Nails"
              />
            </div>
            <!-- duplicates for seamless loop -->
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&q=80"
                alt="Salon"
              />
            </div>
            <div class="mcard med">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&q=80"
                alt="Beauty"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&q=80"
                alt="Makeup"
              />
            </div>
            <div class="mcard med">
              <img
                src="https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=300&q=80"
                alt="Nails"
              />
            </div>
          </div>

          <!-- Col 2 — scrolls down, faster -->
          <div class="mcol" id="lc2">
            <div class="mcard med">
              <img
                src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&q=80"
                alt="Spa"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1552693673-1bf958298935?w=300&q=80"
                alt="Hair"
              />
            </div>
            <div class="mcard sm">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&q=80"
                alt="Barber"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&q=80"
                alt="Facial"
              />
            </div>
            <div class="mcard med">
              <img
                src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&q=80"
                alt="Spa"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1552693673-1bf958298935?w=300&q=80"
                alt="Hair"
              />
            </div>
            <div class="mcard sm">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&q=80"
                alt="Barber"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&q=80"
                alt="Facial"
              />
            </div>
          </div>

          <!-- Col 3 — scrolls up, slower -->
          <div class="mcol" id="lc3">
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80"
                alt="Style"
              />
            </div>
            <div class="mcard sm">
              <img
                src="https://images.unsplash.com/photo-1559599101-f09722fb4948?w=300&q=80"
                alt="Lashes"
              />
            </div>
            <div class="mcard med">
              <img
                src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=300&q=80"
                alt="Skin"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=300&q=80"
                alt="Wax"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80"
                alt="Style"
              />
            </div>
            <div class="mcard sm">
              <img
                src="https://images.unsplash.com/photo-1559599101-f09722fb4948?w=300&q=80"
                alt="Lashes"
              />
            </div>
            <div class="mcard med">
              <img
                src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=300&q=80"
                alt="Skin"
              />
            </div>
            <div class="mcard tall">
              <img
                src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=300&q=80"
                alt="Wax"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════
           RIGHT PANEL — Login Form
      ══════════════════════════════════════════ -->
      <div class="form-panel">
        <!-- Theme toggle — fixed to top-right of form panel -->
        <button
          type="button"
          (click)="themeService.toggle()"
          class="theme-toggle"
          [title]="
            themeService.isDark ? 'Switch to light mode' : 'Switch to dark mode'
          "
        >
          <i [class]="themeService.isDark ? 'ri-sun-line' : 'ri-moon-line'"></i>
        </button>

        <div class="form-inner">
          <!-- Mobile logo — shown on mobile only (desktop brand is in marquee) -->
          <div class="mobile-logo-wrap">
            <img
              src="assets/images/logo.png"
              alt="Bigluxx"
              class="logo-light mobile-logo"
            />
            <img
              src="assets/images/logo-dark.png"
              alt="Bigluxx"
              class="logo-dark mobile-logo"
            />
          </div>

          <div class="form-head">
            <h2 class="form-title">Welcome back</h2>
            <p class="form-sub">Sign in to book your next beauty appointment</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Email -->
            <div class="field-group">
              <label class="field-label">Email address</label>
              <div
                class="field-wrap"
                [class.field-error]="submitted && f['email'].errors"
              >
                <i class="ri-mail-line field-icon"></i>
                <input
                  formControlName="email"
                  type="email"
                  placeholder="you@example.com"
                  class="field-input"
                  autocomplete="email"
                />
              </div>
              <p
                *ngIf="submitted && f['email'].errors?.['required']"
                class="field-err-msg"
              >
                Email is required
              </p>
              <p
                *ngIf="submitted && f['email'].errors?.['email']"
                class="field-err-msg"
              >
                Enter a valid email
              </p>
            </div>

            <!-- Password -->
            <div class="field-group">
              <label class="field-label">Password</label>
              <div
                class="field-wrap"
                [class.field-error]="submitted && f['password'].errors"
              >
                <i class="ri-lock-line field-icon"></i>
                <input
                  formControlName="password"
                  [type]="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="field-input"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="eye-btn"
                  tabindex="-1"
                >
                  <i
                    [class]="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                  ></i>
                </button>
              </div>
              <p
                *ngIf="submitted && f['password'].errors?.['required']"
                class="field-err-msg"
              >
                Password is required
              </p>
            </div>

            <!-- Forgot -->
            <div class="forgot-row">
              <a routerLink="/auth/forgot-password" class="forgot-link"
                >Forgot password?</a
              >
            </div>

            <!-- Submit -->
            <button type="submit" class="submit-btn" [disabled]="loading">
              <span *ngIf="loading" class="spinner-sm"></span>
              <span>{{ loading ? "Signing in…" : "Sign in" }}</span>
              <div *ngIf="!loading" class="btn-arrow">
                <i class="ri-arrow-right-line"></i>
              </div>
            </button>
          </form>

          <!-- Divider -->
          <div class="divider-row">
            <div class="divider-line"></div>
            <span class="divider-text">OR</span>
            <div class="divider-line"></div>
          </div>

          <!-- Google Sign-In -->
          <button type="button" (click)="onGoogleSignIn()" class="google-btn">
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              class="google-icon"
            />
            <span>Continue with Google</span>
          </button>

          <!-- Footer links -->
          <div class="auth-footer">
            <p class="footer-line">
              Don't have an account?
              <a routerLink="/auth/register" class="footer-link">Sign up</a>
            </p>
            <p class="footer-line muted">
              Are you a beautician?
              <a routerLink="/auth/beautician-register" class="footer-link"
                >Join as beautician</a
              >
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      /* ── Root: fixed to viewport, no scroll ── */
      .auth-root {
        display: flex;
        height: 100vh;
        max-height: 100vh;
        overflow: hidden;
        background: var(--color-background);
      }

      /* ══════════════════════════════════════════
         DESKTOP: Left marquee panel
      ══════════════════════════════════════════ */
      .marquee-panel {
        display: none;
        position: relative;
        flex: 0 0 56%;
        max-width: 600px;
        overflow: hidden;
        background: #0a0a0a;
        clip-path: polygon(0 0, 100% 0, 80% 100%, 0 100%);
      }

      @media (min-width: 1024px) {
        .marquee-panel {
          display: block;
        }
      }

      .marquee-fade-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 200px;
        background: linear-gradient(transparent, #0a0a0a);
        z-index: 10;
        pointer-events: none;
      }
      .marquee-fade-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 200px;
        background: linear-gradient(#0a0a0a, transparent);
        z-index: 10;
        pointer-events: none;
      }
      .marquee-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.38);
        z-index: 5;
        pointer-events: none;
      }

      .cols-wrap {
        display: flex;
        gap: 6px;
        padding: 0 6px;
        height: 100%;
      }
      .mcol {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 6px;
        will-change: transform;
      }
      .mcard {
        flex-shrink: 0;
        border-radius: 12px;
        overflow: hidden;
        background: #1a1a1a;
      }
      .mcard img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .mcard.tall {
        height: 200px;
      }
      .mcard.med {
        height: 155px;
      }
      .mcard.sm {
        height: 120px;
      }

      /* Brand watermark — TOP of panel, above the images */
      .panel-brand {
        position: absolute;
        top: 36px;
        left: 0;
        right: 0;
        z-index: 20;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 0 24px;
      }
      .panel-logo {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .panel-logo-img {
        height: 36px;
        width: auto;
        object-fit: contain;
      }
      .panel-tagline {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
        font-weight: 500;
        letter-spacing: 0.3px;
        text-align: center;
      }
      .panel-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .ppill {
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(8px);
        color: white;
        font-size: 12px;
        font-weight: 600;
        padding: 5px 12px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* ══════════════════════════════════════════
         RIGHT: Form panel — fills remaining width,
         scrolls internally if content overflows
      ══════════════════════════════════════════ */
      .form-panel {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px 20px;
        overflow-y: auto;
        background: var(--color-background);
        position: relative;
      }

      /* Theme toggle — top-right of form panel */
      .theme-toggle {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: 1.5px solid var(--color-border);
        background: var(--color-surface);
        color: var(--color-text-secondary);
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
          border-color 0.2s,
          background 0.2s;
        z-index: 10;
      }
      .theme-toggle:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: var(--color-background);
      }
      .form-inner {
        width: 100%;
        max-width: 400px;
      }

      /* Mobile logo — hidden on desktop (brand lives in marquee) */
      .mobile-logo-wrap {
        display: flex;
        justify-content: center;
        margin-bottom: 24px;
      }
      .mobile-logo {
        height: 30px;
        width: auto;
        object-fit: contain;
      }
      @media (min-width: 1024px) {
        .mobile-logo-wrap {
          display: none;
        }
      }

      .form-head {
        margin-bottom: 20px;
      }
      .form-title {
        font-size: 26px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: var(--color-text-primary);
        line-height: 1.15;
        margin-bottom: 4px;
      }
      .form-sub {
        font-size: 13px;
        color: var(--color-text-secondary);
        line-height: 1.5;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .field-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .field-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        letter-spacing: 0.2px;
      }
      .field-wrap {
        position: relative;
        display: flex;
        align-items: center;
        border: 1.5px solid var(--color-border);
        border-radius: 14px;
        background: var(--color-surface);
        transition: border-color 0.2s;
      }
      .field-wrap:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--color-primary) 12%, transparent);
      }
      .field-wrap.field-error {
        border-color: #ef4444;
      }
      .field-icon {
        position: absolute;
        left: 14px;
        font-size: 16px;
        color: var(--color-primary);
        pointer-events: none;
      }
      .field-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        color: var(--color-text-primary);
        font-size: 15px;
        padding: 13px 14px 13px 42px;
        border-radius: 14px;
      }
      .field-input::placeholder {
        color: var(--color-text-muted);
      }
      .eye-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0 14px;
        color: var(--color-text-secondary);
        font-size: 16px;
        display: flex;
        align-items: center;
      }
      .field-err-msg {
        font-size: 12px;
        color: #ef4444;
      }

      .forgot-row {
        display: flex;
        justify-content: flex-end;
        margin-top: -4px;
      }
      .forgot-link {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-primary);
        text-decoration: none;
        opacity: 0.9;
      }
      .forgot-link:hover {
        opacity: 1;
      }

      .submit-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: var(--color-primary);
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 50px;
        padding: 15px 24px;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.3px;
        transition:
          opacity 0.2s,
          transform 0.15s;
        margin-top: 2px;
      }
      .submit-btn:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
      }
      .submit-btn:active:not(:disabled) {
        transform: translateY(0);
      }
      .submit-btn:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .btn-arrow {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
      }
      .spinner-sm {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .divider-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 16px 0;
      }
      .divider-line {
        flex: 1;
        height: 1px;
        background: var(--color-border);
      }
      .divider-text {
        font-size: 12px;
        font-weight: 500;
        color: var(--color-text-muted);
      }

      .google-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: var(--color-surface);
        border: 1.5px solid var(--color-border);
        border-radius: 50px;
        padding: 13px 24px;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-primary);
        cursor: pointer;
        transition:
          border-color 0.2s,
          background 0.2s;
      }
      .google-btn:hover {
        border-color: var(--color-primary);
        background: var(--color-background);
      }
      .google-icon {
        width: 20px;
        height: 20px;
      }

      .auth-footer {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        text-align: center;
      }
      .footer-line {
        font-size: 14px;
        color: var(--color-text-secondary);
      }
      .footer-line.muted {
        font-size: 12px;
        color: var(--color-text-muted);
      }
      .footer-link {
        font-weight: 700;
        color: var(--color-primary);
        text-decoration: none;
        margin-left: 4px;
      }
      .footer-link:hover {
        text-decoration: underline;
      }

      /* ══════════════════════════════════════════
         MOBILE — Stacked layout, no scroll
      ══════════════════════════════════════════ */
      @media (max-width: 1023px) {
        .auth-root {
          flex-direction: column;
          height: 100vh;
          max-height: 100vh;
          overflow: hidden;
        }

        /* Marquee: compact fixed height at top — 32vh keeps form fully visible */
        .marquee-panel {
          display: block;
          position: relative;
          flex: 0 0 32vh;
          min-height: 220px;
          max-height: 280px;
          width: 100%;
          max-width: 100%;
          clip-path: none;
          overflow: hidden;
          background: #0a0a0a;
          z-index: 0;
        }

        .cols-wrap {
          height: 100%;
        }

        .marquee-overlay {
          background: rgba(0, 0, 0, 0.5);
        }

        /* Stronger top fade to frame the brand */
        .marquee-fade-top {
          height: 100px;
          background: linear-gradient(#0a0a0a 30%, transparent);
        }

        /* Bottom fade blends into form background */
        .marquee-fade-bottom {
          height: 50%;
          background: linear-gradient(transparent, var(--color-background));
        }

        /* Brand watermark visible on mobile too, at top */
        .panel-brand {
          display: flex;
          top: 20px;
        }

        /* Hide the text tagline and pills on mobile to save space */
        .panel-tagline,
        .panel-pills {
          display: none;
        }

        .panel-logo-img {
          height: 28px;
        }

        /* Form panel: takes remaining height, scrolls if needed */
        .form-panel {
          position: relative;
          z-index: 1;
          flex: 1;
          min-height: 0;
          background: var(--color-background);
          align-items: flex-start;
          justify-content: flex-start;
          padding: 6px 24px 24px;
          overflow-y: auto;
        }

        /* Pull form up slightly to overlap the fade zone */
        .form-inner {
          margin-top: -36px;
          width: 100%;
          max-width: 100%;
        }

        /* Tighten spacing on mobile */
        .form-head {
          margin-bottom: 16px;
        }
        .form-title {
          font-size: 22px;
        }
        .login-form {
          gap: 12px;
        }
        .divider-row {
          margin: 12px 0;
        }
        .auth-footer {
          margin-top: 16px;
        }

        /* CSS animation for mobile (RAF is skipped) */
        #lc1 {
          animation: mScrollUp 20s linear infinite;
        }
        #lc2 {
          animation: mScrollDown 14s linear infinite;
        }
        #lc3 {
          animation: mScrollUp 26s linear infinite;
        }
      }

      @keyframes mScrollUp {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(-50%);
        }
      }
      @keyframes mScrollDown {
        from {
          transform: translateY(-50%);
        }
        to {
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  submitted = false;
  showPassword = false;

  private rafId: number | null = null;
  private cols: { el: HTMLElement; speed: number; y: number; dir: number }[] =
    [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    public themeService: ThemeService,
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
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response),
      });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.startMarquee(), 100);
  }

  private startMarquee(): void {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) return; // CSS animation handles mobile via @keyframes

    const defs = [
      { id: "lc1", speed: 0.45, y: 0, dir: -1 },
      { id: "lc2", speed: 0.7, y: -80, dir: 1 },
      { id: "lc3", speed: 0.3, y: -40, dir: -1 },
    ];

    this.cols = defs
      .map((d) => {
        const el = document.getElementById(d.id) as HTMLElement;
        return { el, speed: d.speed, y: d.y, dir: d.dir };
      })
      .filter((c) => !!c.el);

    const tick = () => {
      this.cols.forEach((c) => {
        c.y += c.speed * c.dir;
        const half = c.el.scrollHeight / 2;
        if (c.dir === -1 && Math.abs(c.y) >= half) c.y += half;
        if (c.dir === 1 && c.y >= 0) c.y -= half;
        c.el.style.transform = `translateY(${c.y}px)`;
      });
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
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
        this.toast.error(
          err?.error?.message || "Login failed. Please try again.",
        );
      },
    });
  }

  onGoogleSignIn(): void {
    const google = (window as any).google;
    if (!google) {
      this.toast.error("Google Sign-In is not available.");
      return;
    }
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        google.accounts.id.cancel();
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${environment.googleClientId}&redirect_uri=${encodeURIComponent(window.location.origin + "/auth/google/callback")}&response_type=code&scope=openid%20email%20profile`;
        window.location.href = oauthUrl;
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


