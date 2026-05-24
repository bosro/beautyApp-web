
// src/app/features/client/ai-plans/ai-plans.component.ts
// NEW FILE — route: /client/ai-plans
//
// Shows when:
//  1. User hits a quota limit (402 from any AI endpoint)
//  2. User navigates here from settings or AI screens
//
// Payment flow: user sees the plan → taps "Subscribe" →
// sees bank transfer / MoMo instructions → contacts admin
// → admin calls PUT /api/ai/plan to activate. Manual for now.

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

interface QuotaFeature {
  used: number;
  limit: number;
  window: string;
  remaining: number;
}

interface QuotaData {
  plan: string;
  features: {
    chat:             QuotaFeature;
    face_analysis:    QuotaFeature;
    image_generation: QuotaFeature;
    smart_schedule:   QuotaFeature;
  };
}

@Component({
  selector: "app-ai-plans",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-20">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
        <button (click)="back()"
                class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center">
          <i class="ri-arrow-left-line text-[var(--color-text-primary)]"></i>
        </button>
        <div class="flex-1">
          <h1 class="text-base font-bold text-[var(--color-text-primary)]">AI Plans</h1>
          <p class="text-xs text-[var(--color-text-muted)]">Unlock more AI features</p>
        </div>
      </div>

      <div class="max-w-lg mx-auto px-4 py-6 space-y-6">

        <!-- Current usage (shown when quota data loaded) -->
        <div *ngIf="quota" class="rounded-2xl p-4 space-y-3" style="background-color: var(--color-surface)">
          <div class="flex items-center gap-2 mb-1">
            <div class="w-8 h-8 rounded-xl flex items-center justify-center"
                 style="background: color-mix(in srgb, var(--color-primary) 12%, transparent)">
              <i class="ri-robot-2-line text-sm" style="color: var(--color-primary)"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-[var(--color-text-primary)]">Your current plan</p>
              <p class="text-xs text-[var(--color-text-muted)] capitalize">{{ quota.plan }} tier</p>
            </div>
            <span class="ml-auto text-xs px-3 py-1 rounded-full font-bold capitalize"
                  [ngClass]="quota.plan === 'free' ? 'bg-gray-100 text-gray-600' :
                              quota.plan === 'starter' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'">
              {{ quota.plan | titlecase }}
            </span>
          </div>

          <!-- Usage bars -->
          <div class="space-y-2">
            <div *ngFor="let f of usageItems" class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs text-[var(--color-text-muted)]">{{ f.label }}</span>
                <span class="text-xs font-medium text-[var(--color-text-primary)]">
                  {{ f.feature.limit >= 999 ? '∞' : f.feature.used + ' / ' + f.feature.limit }}
                  <span class="text-[var(--color-text-muted)]">per {{ f.feature.window }}</span>
                </span>
              </div>
              <div class="h-1.5 rounded-full overflow-hidden" style="background: var(--color-border)">
                <div class="h-full rounded-full transition-all"
                     [style.width.%]="f.feature.limit >= 999 ? 20 : (f.feature.used / f.feature.limit) * 100"
                     [ngClass]="usageBarColor(f.feature)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Plan cards -->
        <div class="space-y-4">

          <!-- FREE -->
          <div class="rounded-2xl p-5 border-2"
               [ngClass]="quota?.plan === 'free' ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]'"
               style="background-color: var(--color-surface)">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-bold text-[var(--color-text-primary)]">Free</p>
                  <span *ngIf="quota?.plan === 'free'"
                        class="text-xs px-2 py-0.5 rounded-full font-bold"
                        style="background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary)">
                    Current
                  </span>
                </div>
                <p class="text-2xl font-black text-[var(--color-text-primary)]">
                  GHS 0<span class="text-sm font-normal text-[var(--color-text-muted)]">/month</span>
                </p>
              </div>
              <div class="w-10 h-10 rounded-2xl flex items-center justify-center"
                   style="background: var(--color-background)">
                <i class="ri-gift-line text-lg" style="color: var(--color-text-muted)"></i>
              </div>
            </div>
            <ul class="space-y-2">
              <li *ngFor="let f of freeFeatures" class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <i [class]="f.included ? 'ri-check-line text-green-500' : 'ri-close-line text-red-400'"></i>
                {{ f.text }}
              </li>
            </ul>
          </div>

          <!-- STARTER -->
          <div class="rounded-2xl p-5 border-2 relative overflow-hidden"
               [ngClass]="quota?.plan === 'starter' ? 'border-blue-500' : 'border-blue-200'"
               style="background-color: var(--color-surface)">
            <div class="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              Most Popular
            </div>
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-bold text-[var(--color-text-primary)]">Starter</p>
                  <span *ngIf="quota?.plan === 'starter'"
                        class="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                    Current
                  </span>
                </div>
                <p class="text-2xl font-black text-[var(--color-text-primary)]">
                  GHS 25<span class="text-sm font-normal text-[var(--color-text-muted)]">/month</span>
                </p>
              </div>
              <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-blue-100">
                <i class="ri-rocket-line text-lg text-blue-600"></i>
              </div>
            </div>
            <ul class="space-y-2 mb-5">
              <li *ngFor="let f of starterFeatures" class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <i class="ri-check-line text-blue-500 flex-shrink-0"></i>
                {{ f }}
              </li>
            </ul>
            <button *ngIf="quota?.plan !== 'starter'"
                    (click)="subscribe('starter')"
                    class="w-full py-3 rounded-xl font-bold text-white text-sm bg-blue-500">
              Subscribe — GHS 25/month
            </button>
            <div *ngIf="quota?.plan === 'starter'"
                 class="w-full py-3 rounded-xl font-bold text-center text-sm bg-blue-100 text-blue-700">
              ✓ Current Plan
            </div>
          </div>

          <!-- PRO -->
          <div class="rounded-2xl p-5 border-2"
               [ngClass]="quota?.plan === 'pro' ? 'border-purple-500' : 'border-purple-200'"
               style="background-color: var(--color-surface)">
            <div class="flex items-start justify-between mb-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-bold text-[var(--color-text-primary)]">Pro</p>
                  <span *ngIf="quota?.plan === 'pro'"
                        class="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-700">
                    Current
                  </span>
                </div>
                <p class="text-2xl font-black text-[var(--color-text-primary)]">
                  GHS 50<span class="text-sm font-normal text-[var(--color-text-muted)]">/month</span>
                </p>
              </div>
              <div class="w-10 h-10 rounded-2xl flex items-center justify-center bg-purple-100">
                <i class="ri-vip-crown-line text-lg text-purple-600"></i>
              </div>
            </div>
            <ul class="space-y-2 mb-5">
              <li *ngFor="let f of proFeatures" class="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                <i class="ri-check-line text-purple-500 flex-shrink-0"></i>
                {{ f }}
              </li>
            </ul>
            <button *ngIf="quota?.plan !== 'pro'"
                    (click)="subscribe('pro')"
                    class="w-full py-3 rounded-xl font-bold text-white text-sm bg-purple-500">
              Subscribe — GHS 50/month
            </button>
            <div *ngIf="quota?.plan === 'pro'"
                 class="w-full py-3 rounded-xl font-bold text-center text-sm bg-purple-100 text-purple-700">
              ✓ Current Plan
            </div>
          </div>
        </div>

        <!-- Payment instructions (shown after tapping Subscribe) -->
        <div *ngIf="showPaymentInstructions" class="rounded-2xl p-5 space-y-4"
             style="background-color: var(--color-surface); border: 1.5px dashed var(--color-border)">
          <div class="flex items-center gap-2">
            <i class="ri-bank-card-line text-xl" style="color: var(--color-primary)"></i>
            <p class="font-bold text-[var(--color-text-primary)]">How to subscribe</p>
          </div>
          <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">
            We're setting up automated payments. For now, subscribe by sending your payment via
            <strong>MTN MoMo or Telecel Cash</strong> and we'll activate your plan within 24 hours.
          </p>
          <div class="rounded-xl p-4 space-y-2" style="background: var(--color-background)">
            <p class="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Payment details</p>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--color-text-secondary)]">Plan</span>
              <span class="text-sm font-bold text-[var(--color-text-primary)] capitalize">{{ selectedPlan }} — GHS {{ selectedPlan === 'starter' ? 25 : 50 }}/month</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--color-text-secondary)]">MoMo Number</span>
              <span class="text-sm font-bold text-[var(--color-text-primary)]">0XX XXX XXXX</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-[var(--color-text-secondary)]">Reference</span>
              <span class="text-sm font-bold" style="color: var(--color-primary)">AIPLAN-{{ paymentRef }}</span>
            </div>
          </div>
          <p class="text-xs text-[var(--color-text-muted)]">
            After payment, send your reference to us via the
            <button (click)="router.navigate(['/client/support'])"
                    class="font-semibold underline" style="color: var(--color-primary)">
              Contact Us
            </button>
            page and we'll activate your plan.
          </p>
          <button (click)="router.navigate(['/client/support'])"
                  class="w-full py-3 rounded-xl font-semibold text-sm"
                  style="background: color-mix(in srgb, var(--color-primary) 12%, transparent); color: var(--color-primary)">
            Contact Us to Confirm Payment
          </button>
        </div>

      </div>
    </div>
  `,
})
export class AiPlansComponent implements OnInit {
  quota:       QuotaData | null = null;
  selectedPlan = '';
  showPaymentInstructions = false;
  paymentRef   = '';

  freeFeatures = [
    { text: '20 AI chat messages per day',       included: true  },
    { text: '3 face analyses per month',          included: true  },
    { text: 'Basic smart scheduling',             included: true  },
    { text: 'AI image generation',                included: false },
    { text: 'Unlimited usage',                    included: false },
  ];

  starterFeatures = [
    'Unlimited AI chat messages',
    '20 face analyses per month',
    '5 AI hairstyle image generations/month',
    'Unlimited smart scheduling',
    'Priority AI responses',
  ];

  proFeatures = [
    'Everything in Starter',
    'Unlimited face analyses',
    'Unlimited AI image generation',
    'Early access to new AI features',
    'Salon AI insights (coming soon)',
  ];

  constructor(
    private http:   HttpClient,
    public  router: Router,
    private route:  ActivatedRoute,
    private loc:    Location,
    private toast:  ToastService,
  ) {}

  ngOnInit() {
    this.loadQuota();
    // If arriving from a quota error, pre-select the recommended plan
    const plan = this.route.snapshot.queryParams['recommended'];
    if (plan && ['starter','pro'].includes(plan)) {
      this.selectedPlan = plan;
    }
  }

  loadQuota() {
    this.http.get<any>(`${environment.apiUrl}/ai/quota`).subscribe({
      next:  (res) => { this.quota = res.data; },
      error: () => {},
    });
  }

  get usageItems() {
    if (!this.quota) return [];
    return [
      { label: 'Chat messages',      feature: this.quota.features.chat             },
      { label: 'Face analyses',      feature: this.quota.features.face_analysis    },
      { label: 'Image generations',  feature: this.quota.features.image_generation },
      { label: 'Smart schedules',    feature: this.quota.features.smart_schedule   },
    ];
  }

  usageBarColor(f: QuotaFeature): string {
    if (f.limit >= 999) return 'bg-green-400';
    const pct = f.used / f.limit;
    if (pct >= 1)   return 'bg-red-500';
    if (pct >= 0.8) return 'bg-amber-500';
    return 'bg-green-500';
  }

  subscribe(plan: 'starter' | 'pro') {
    this.selectedPlan            = plan;
    this.showPaymentInstructions = true;
    // Generate a unique reference so admin can match the payment
    this.paymentRef = Math.random().toString(36).slice(2, 8).toUpperCase();
    // Scroll to payment instructions
    setTimeout(() => {
      document.querySelector('[style*="border: 1.5px dashed"]')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  back() { this.loc.back(); }
}