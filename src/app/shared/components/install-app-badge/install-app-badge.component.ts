// install-app-badge.component.ts
//
// Small pill, bottom-of-screen, that only renders while
// PwaInstallService says installation is actually available right now.
// Clicking it fires the browser's own native "Install app?" dialog —
// this component doesn't build any custom UI for that part, it just
// makes people aware the option exists and gives them a deliberate
// moment to trigger it, instead of it living invisibly behind a browser
// menu most people never open.
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PwaInstallService } from '@core/services/pwa-install.service';

@Component({
  selector: 'app-install-badge',
  standalone: false,
  template: `
    <div
      *ngIf="visible"
      class="install-badge"
      role="status"
    >
      <button type="button" class="install-badge-btn" (click)="install()" [disabled]="installing">
        <i class="ri-download-2-line" *ngIf="!installing"></i>
        <i class="ri-loader-4-line animate-spin" *ngIf="installing"></i>
        <span>{{ installing ? 'Opening install prompt…' : 'Install App' }}</span>
      </button>
      <button type="button" class="install-badge-dismiss" (click)="dismiss()" aria-label="Dismiss">
        <i class="ri-close-line"></i>
      </button>
    </div>
  `,
  styles: [
    `
      .install-badge {
        position: fixed;
        left: 16px;
        bottom: calc(84px + env(safe-area-inset-bottom, 0px));
        z-index: 60;
        display: flex;
        align-items: center;
        gap: 4px;
        background: #1a1a1a;
        border-radius: 999px;
        padding: 4px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
        animation: install-badge-in 0.35s cubic-bezier(0.22, 1, 0.36, 1);
      }

      @keyframes install-badge-in {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .install-badge-btn {
        display: flex;
        align-items: center;
        gap: 7px;
        background: var(--color-primary, #de3939);
        color: #fff;
        border: none;
        border-radius: 999px;
        padding: 9px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }
      .install-badge-btn:disabled {
        opacity: 0.7;
      }

      .install-badge-dismiss {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        font-size: 16px;
      }
      .install-badge-dismiss:hover {
        color: #fff;
      }

      @media (min-width: 768px) {
        .install-badge {
          left: 24px;
          bottom: 24px;
        }
      }
    `,
  ],
})
export class InstallAppBadgeComponent implements OnInit, OnDestroy {
  visible = false;
  installing = false;

  private dismissedThisSession = false;
  private sub?: Subscription;

  constructor(private pwaInstall: PwaInstallService) {}

  ngOnInit(): void {
    this.sub = this.pwaInstall.canInstall$.subscribe((canInstall) => {
      this.visible = canInstall && !this.dismissedThisSession;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async install(): Promise<void> {
    this.installing = true;
    const outcome = await this.pwaInstall.promptInstall();
    this.installing = false;
    // Whatever they chose, the browser's one-shot prompt is now spent —
    // hide the badge either way rather than showing a dead button.
    if (outcome !== 'unavailable') {
      this.visible = false;
    }
  }

  dismiss(): void {
    this.dismissedThisSession = true;
    this.visible = false;
  }
}
