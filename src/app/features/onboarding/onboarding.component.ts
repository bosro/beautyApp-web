// onboarding.component.ts
//
// First-run intro shown exactly once, right after a user's first
// signup/verify/login (see AuthService.getDashboardRoute() and
// OnboardingGuard). Two full-bleed image screens, dark overlay so the
// headline pops, and a couple of subtle motion touches (Ken Burns drift on
// the image, staggered text/dot entrance). Copy adapts to CUSTOMER vs
// BEAUTICIAN since one flow serves both roles.

import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
} from '@angular/animations';
import { AuthService } from '../../core/services/auth.service';

interface OnboardingSlide {
  image: string;
  eyebrow: string;
  headline: string;
  subtext: string;
}

@Component({
  selector: 'app-onboarding',
  animations: [
    trigger('slideSwap', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'scale(1.06)' }),
            animate(
              '650ms cubic-bezier(0.22, 1, 0.36, 1)',
              style({ opacity: 1, transform: 'scale(1)' }),
            ),
          ],
          { optional: true },
        ),
        query(
          ':leave',
          [animate('350ms ease-out', style({ opacity: 0 }))],
          { optional: true },
        ),
      ]),
    ]),
    trigger('textIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(28px)' }),
        animate(
          '600ms 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
  template: `
    <div
      class="onboarding-root"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)"
    >
      <!-- Background image + overlay, swapped with the slideSwap trigger -->
      <div class="image-layer" [@slideSwap]="currentIndex">
        <div
          *ngIf="true"
          class="bg-image"
          [style.backgroundImage]="'url(' + slides[currentIndex].image + ')'"
        ></div>
      </div>
      <div class="scrim"></div>

      <!-- Skip -->
      <button class="skip-btn" type="button" (click)="finish()">Skip</button>

      <!-- Tap zones for prev/next (kept behind the text/controls) -->
      <button
        class="tap-zone tap-left"
        type="button"
        aria-label="Previous"
        (click)="prev()"
      ></button>
      <button
        class="tap-zone tap-right"
        type="button"
        aria-label="Next"
        (click)="next()"
      ></button>

      <!-- Foreground content -->
      <div class="content">
        <div [@textIn]="currentIndex" class="text-block">
          <span class="eyebrow">{{ slides[currentIndex].eyebrow }}</span>
          <h1 class="headline">{{ slides[currentIndex].headline }}</h1>
          <p class="subtext">{{ slides[currentIndex].subtext }}</p>
        </div>

        <div class="controls">
          <div class="dots">
            <button
              *ngFor="let s of slides; let i = index"
              type="button"
              class="dot"
              [class.dot-active]="i === currentIndex"
              (click)="goTo(i)"
              [attr.aria-label]="'Go to slide ' + (i + 1)"
            ></button>
          </div>

          <button class="cta-btn" type="button" (click)="onCtaClick()">
            {{ isLastSlide ? "Get Started" : "Next" }}
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&display=swap');

      .onboarding-root {
        position: fixed;
        inset: 0;
        overflow: hidden;
        background: #000;
        z-index: 1000;
        touch-action: pan-y;
      }

      .image-layer {
        position: absolute;
        inset: 0;
      }

      .bg-image {
        position: absolute;
        inset: -3%;
        background-size: cover;
        background-position: center;
        animation: kenburns 9s ease-in-out infinite alternate;
        will-change: transform;
      }

      @keyframes kenburns {
        from {
          transform: scale(1);
        }
        to {
          transform: scale(1.08);
        }
      }

      .scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.55) 0%,
          rgba(0, 0, 0, 0.15) 32%,
          rgba(0, 0, 0, 0.35) 62%,
          rgba(0, 0, 0, 0.88) 100%
        );
        pointer-events: none;
      }

      .skip-btn {
        position: absolute;
        top: max(20px, env(safe-area-inset-top));
        right: 20px;
        z-index: 5;
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 999px;
        padding: 8px 18px;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.02em;
        cursor: pointer;
      }

      .tap-zone {
        position: absolute;
        top: 0;
        bottom: 160px;
        width: 40%;
        background: transparent;
        border: none;
        padding: 0;
        z-index: 2;
      }
      .tap-left {
        left: 0;
      }
      .tap-right {
        right: 0;
      }

      .content {
        position: absolute;
        inset: 0;
        z-index: 4;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 0 28px;
        padding-bottom: max(36px, env(safe-area-inset-bottom));
        pointer-events: none;
      }

      .text-block {
        margin-bottom: 36px;
        max-width: 520px;
      }

      .eyebrow {
        display: inline-block;
        color: var(--color-primary, #de3939);
        background: rgba(255, 255, 255, 0.94);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 18px;
      }

      .headline {
        font-family: 'Fraunces', Georgia, serif;
        font-weight: 600;
        font-style: italic;
        font-size: 40px;
        line-height: 1.12;
        color: #fff;
        margin: 0 0 14px;
        white-space: pre-line;
      }

      .subtext {
        font-size: 15.5px;
        line-height: 1.55;
        color: rgba(255, 255, 255, 0.86);
        margin: 0;
        max-width: 420px;
      }

      .controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        pointer-events: auto;
      }

      .dots {
        display: flex;
        gap: 8px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.35);
        border: none;
        padding: 0;
        cursor: pointer;
        transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s;
      }

      .dot-active {
        width: 26px;
        background: #fff;
      }

      .cta-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: var(--color-primary, #de3939);
        color: #fff;
        border: none;
        border-radius: 999px;
        padding: 14px 26px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(222, 57, 57, 0.4);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .cta-btn:active {
        transform: scale(0.96);
      }

      @media (min-width: 640px) {
        .headline {
          font-size: 52px;
        }
        .subtext {
          font-size: 17px;
        }
        .text-block {
          max-width: 620px;
        }
      }
    `,
  ],
})
export class OnboardingComponent implements OnInit {
  currentIndex = 0;

  private touchStartX = 0;
  private touchStartY = 0;

  slides: OnboardingSlide[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const isBeautician = this.auth.user?.role === 'BEAUTICIAN';

    this.slides = isBeautician
      ? [
          {
            image:
              'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=1600&q=80',
            eyebrow: 'For Beauticians',
            headline: 'Your Talent,\nCenter Stage',
            subtext:
              'Build a stunning profile clients can find, trust, and fall in love with — no website needed.',
          },
          {
            image:
              'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1600&q=80',
            eyebrow: 'Grow With Bigluxx',
            headline: 'Bookings That\nRun Themselves',
            subtext:
              'Manage your calendar, get notified instantly, and grow your business — all from your phone.',
          },
        ]
      : [
          {
            image:
              'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=1600&q=80',
            eyebrow: 'Discover',
            headline: 'Beauty,\nRedefined',
            subtext:
              "Browse Ghana's top-rated hair, nail, spa and makeup professionals — all verified, all reviewed.",
          },
          {
            image:
              'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1600&q=80',
            eyebrow: 'Book Instantly',
            headline: 'Your Moment,\nOne Tap Away',
            subtext:
              'Pick a time, choose your pro, and you\'re booked. No calls, no waiting rooms.',
          },
        ];
  }

  get isLastSlide(): boolean {
    return this.currentIndex === this.slides.length - 1;
  }

  onCtaClick(): void {
    if (this.isLastSlide) {
      this.finish();
    } else {
      this.next();
    }
  }

  next(): void {
    if (this.currentIndex < this.slides.length - 1) {
      this.currentIndex++;
    } else {
      this.finish();
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  goTo(i: number): void {
    this.currentIndex = i;
  }

  finish(): void {
    // Optimistic: completeOnboarding() updates local state immediately so
    // getDashboardRoute() resolves correctly even if the network is slow.
    this.auth.completeOnboarding().subscribe({
      error: () =>
        console.warn('Failed to persist onboarding completion (non-fatal)'),
    });
    this.router.navigate([this.auth.getDashboardRoute()]);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'Escape') this.finish();
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].clientX;
    this.touchStartY = e.changedTouches[0].clientY;
  }

  onTouchEnd(e: TouchEvent): void {
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) this.next();
    else this.prev();
  }
}
