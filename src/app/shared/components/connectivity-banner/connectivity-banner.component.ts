import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConnectivityService } from '@core/services/connectivity.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-connectivity-banner',
  standalone: false,
  template: `
    <div
      *ngIf="showBanner"
      class="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900"
      style="padding-top: calc(0.625rem + env(safe-area-inset-top, 0px));"
      role="status"
      aria-live="polite"
    >
      <i class="ri-wifi-off-line text-base flex-shrink-0"></i>
      <span>You're offline — some features won't work until you're back online.</span>
    </div>
  `,
})
export class ConnectivityBannerComponent implements OnInit, OnDestroy {
  showBanner = false;

  private sub?: Subscription;
  private everSeenOffline = false;

  constructor(
    private connectivity: ConnectivityService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.sub = this.connectivity.isOnline$.subscribe((online) => {
      this.showBanner = !online;

      if (!online) {
        this.everSeenOffline = true;
      } else if (this.everSeenOffline) {
        // Only announce "back online" if we actually showed the offline
        // banner this session — don't fire it on initial load.
        this.toast.success("You're back online.");
        this.everSeenOffline = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
