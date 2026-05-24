
// src/app/shared/components/ai-upgrade-prompt/ai-upgrade-prompt.component.ts
// NEW FILE
//
// A reusable bottom-sheet modal shown whenever any AI endpoint
// returns HTTP 402 with code "QUOTA_EXCEEDED".
//
// Usage in any component template:
//   <app-ai-upgrade-prompt
//     *ngIf="showUpgradePrompt"
//     [message]="upgradeMessage"
//     [currentPlan]="currentPlan"
//     (dismissed)="showUpgradePrompt = false">
//   </app-ai-upgrade-prompt>
//
// In the component class, handle 402 errors like:
//   error: (err) => {
//     if (err?.status === 402) {
//       this.upgradeMessage = err.error?.message;
//       this.currentPlan    = err.error?.currentPlan;
//       this.showUpgradePrompt = true;
//     }
//   }

import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-ai-upgrade-prompt",
  standalone: false,
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 flex items-end justify-center"
      style="background: rgba(0,0,0,0.5)"
      (click)="dismissed.emit()"
    >
      <!-- Sheet — stopPropagation so tapping inside doesn't close it -->
      <div
        class="w-full max-w-lg rounded-t-3xl p-6 space-y-5"
        style="background-color: var(--color-surface)"
        (click)="$event.stopPropagation()"
      >
        <!-- Handle -->
        <div class="flex justify-center -mt-2 mb-1">
          <div class="w-10 h-1 rounded-full" style="background: var(--color-border)"></div>
        </div>

        <!-- Icon + heading -->
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
               style="background: color-mix(in srgb, var(--color-primary) 12%, transparent)">
            <i class="ri-robot-2-line text-2xl" style="color: var(--color-primary)"></i>
          </div>
          <div class="flex-1">
            <p class="font-black text-base text-[var(--color-text-primary)]">Upgrade your AI plan</p>
            <p class="text-sm text-[var(--color-text-muted)] mt-1 leading-relaxed">{{ message }}</p>
          </div>
        </div>

        <!-- Plan comparison pills -->
        <div class="grid grid-cols-3 gap-2">
          <div class="rounded-xl p-3 text-center border"
               style="border-color: var(--color-border); background: var(--color-background)">
            <p class="text-xs font-bold text-[var(--color-text-muted)]">Free</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-1">Limited</p>
          </div>
          <div class="rounded-xl p-3 text-center border-2 border-blue-400"
               style="background: #EFF6FF">
            <p class="text-xs font-bold text-blue-700">Starter</p>
            <p class="text-xs font-bold text-blue-600 mt-1">GHS 25/mo</p>
          </div>
          <div class="rounded-xl p-3 text-center border-2 border-purple-400"
               style="background: #FAF5FF">
            <p class="text-xs font-bold text-purple-700">Pro</p>
            <p class="text-xs font-bold text-purple-600 mt-1">GHS 50/mo</p>
          </div>
        </div>

        <!-- CTA buttons -->
        <button
          (click)="upgrade()"
          class="w-full py-3.5 rounded-2xl font-bold text-white text-sm"
          style="background-color: var(--color-primary)"
        >
          View Plans & Upgrade
        </button>

        <button
          (click)="dismissed.emit()"
          class="w-full py-3 rounded-2xl font-semibold text-sm"
          style="color: var(--color-text-muted)"
        >
          Maybe later
        </button>
      </div>
    </div>
  `,
})
export class AiUpgradePromptComponent {
  @Input()  message     = "You've reached your limit for this feature.";
  @Input()  currentPlan = "free";
  @Output() dismissed   = new EventEmitter<void>();

  constructor(private router: Router) {}

  upgrade() {
    this.dismissed.emit();
    // Recommend Starter by default; if already on Starter, recommend Pro
    const recommended = this.currentPlan === 'starter' ? 'pro' : 'starter';
    this.router.navigate(['/client/ai-plans'], { queryParams: { recommended } });
  }
}