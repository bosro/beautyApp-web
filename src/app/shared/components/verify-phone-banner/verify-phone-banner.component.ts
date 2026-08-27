// verify-phone-banner.component.ts
//
// A dismissible card, shown to BEAUTICIANS ONLY, whenever their account
// has a phone number on file that hasn't been OTP-verified yet. Mounted
// once at the app root (see app.component.ts) so it reacts to AuthService's
// user$ stream directly — meaning it naturally "pops up" right after
// signing in or right after signing up (both of those end with a fresh
// user$ emission), without needing separate hooks wired into the login
// and register flows.
//
// Dismissing it only hides it for the rest of this app session (mirrors
// InstallAppBadgeComponent's pattern) — it comes back next time they open
// the app if they still haven't verified, since an unverified phone means
// they can silently miss booking alerts, which is worth resurfacing.
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-verify-phone-banner',
  standalone: false,
  template: `
    <div *ngIf="visible" class="verify-phone-banner" role="status" aria-live="polite">
      <div class="verify-phone-icon">
        <i class="ri-shield-keyhole-line"></i>
      </div>
      <div class="verify-phone-body">
        <p class="verify-phone-title">Verify your phone number</p>
        <p class="verify-phone-text">
          If a push notification ever doesn't reach you — like when you're
          offline — we'll text you your booking alerts instead. Takes under
          a minute.
        </p>
        <div class="verify-phone-actions">
          <button type="button" class="verify-phone-cta" (click)="verifyNow()">
            Verify now
          </button>
          <button type="button" class="verify-phone-later" (click)="dismiss()">
            Not now
          </button>
        </div>
      </div>
      <button
        type="button"
        class="verify-phone-close"
        (click)="dismiss()"
        aria-label="Dismiss"
      >
        <i class="ri-close-line"></i>
      </button>
    </div>
  `,
  styles: [
    `
      .verify-phone-banner {
        position: fixed;
        left: 16px;
        right: 16px;
        bottom: calc(150px + env(safe-area-inset-bottom, 0px));
        z-index: 55;
        max-width: 420px;
        margin: 0 auto;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: var(--color-surface, #fff);
        border: 1px solid var(--color-border, #eee);
        border-radius: 20px;
        padding: 16px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
        animation: verify-phone-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes verify-phone-in {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .verify-phone-icon {
        flex-shrink: 0;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-primary, #de3939);
        color: #fff;
        font-size: 18px;
      }

      .verify-phone-body {
        flex: 1;
        min-width: 0;
      }

      .verify-phone-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--color-text-primary, #1a1a1a);
        margin: 0 0 4px;
      }

      .verify-phone-text {
        font-size: 12.5px;
        line-height: 1.45;
        color: var(--color-text-secondary, #6b6b6b);
        margin: 0 0 12px;
      }

      .verify-phone-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .verify-phone-cta {
        background: var(--color-primary, #de3939);
        color: #fff;
        border: none;
        border-radius: 999px;
        padding: 8px 16px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }

      .verify-phone-later {
        background: transparent;
        color: var(--color-text-secondary, #6b6b6b);
        border: none;
        padding: 8px 6px;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }

      .verify-phone-close {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--color-text-muted, #9a9a9a);
        cursor: pointer;
        font-size: 15px;
      }
    `,
  ],
})
export class VerifyPhoneBannerComponent implements OnInit, OnDestroy {
  visible = false;

  private dismissedThisSession = false;
  private sub?: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.auth.user$.subscribe((user) => {
      // Only beauticians — clients aren't asked to do this, and someone
      // who never gave us a phone number at all has a different problem
      // ("add a phone") than "verify the one you gave us", so we don't
      // nag them with this particular banner either.
      const needsVerification =
        !!user && user.role === 'BEAUTICIAN' && !!user.phone && !user.phoneVerified;
      this.visible = needsVerification && !this.dismissedThisSession;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  verifyNow(): void {
    this.visible = false;
    this.router.navigate(['/settings/security']);
  }

  dismiss(): void {
    this.dismissedThisSession = true;
    this.visible = false;
  }
}
