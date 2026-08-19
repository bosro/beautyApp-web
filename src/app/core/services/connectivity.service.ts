import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Tracks whether the app can actually reach the Bigluxx API — not just
 * whether the device's network interface is "up".
 *
 * `navigator.onLine` / the browser's `online`/`offline` events only reflect
 * the network interface (e.g. Wi-Fi connected), not real internet or API
 * reachability — you can be "online" on a Wi-Fi network with no internet,
 * or connected but with the API down. So on top of those events (for a fast
 * first signal), this also pings the backend's lightweight `/health`
 * endpoint on an interval to confirm real reachability, and always re-checks
 * a few seconds after the browser reports either transition.
 */
@Injectable({ providedIn: 'root' })
export class ConnectivityService implements OnDestroy {
  private readonly healthUrl = `${environment.apiUrl}/health`;
  private readonly pingIntervalMs = 20000; // 20s while state is uncertain/offline
  private readonly pingTimeoutMs = 6000;

  private _isOnline$ = new BehaviorSubject<boolean>(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  isOnline$ = this._isOnline$.asObservable();

  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private onlineListener = () => this.handleBrowserEvent(true);
  private offlineListener = () => this.handleBrowserEvent(false);

  constructor(private zone: NgZone) {
    if (typeof window === 'undefined') return; // SSR/build-time guard

    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', this.offlineListener);

    // Run pings outside Angular's change detection zone — this is just a
    // background health signal, no need to trigger CD on every tick.
    this.zone.runOutsideAngular(() => {
      this.intervalHandle = setInterval(() => this.pingHealth(), this.pingIntervalMs);
    });

    // Confirm real reachability on load too, in case navigator.onLine lied.
    this.pingHealth();
  }

  get isOnline(): boolean {
    return this._isOnline$.value;
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('online', this.onlineListener);
    window.removeEventListener('offline', this.offlineListener);
    if (this.intervalHandle) clearInterval(this.intervalHandle);
  }

  /** The browser's own signal is a fast first read, but we still confirm
   * against the real API a couple of seconds later rather than trusting it
   * outright. */
  private handleBrowserEvent(browserSaysOnline: boolean): void {
    if (!browserSaysOnline) {
      this.setState(false);
      return;
    }
    setTimeout(() => this.pingHealth(), 2000);
  }

  private async pingHealth(): Promise<void> {
    if (typeof fetch === 'undefined') return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.pingTimeoutMs);

    try {
      const res = await fetch(this.healthUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      this.setState(res.ok);
    } catch {
      this.setState(false);
    } finally {
      clearTimeout(timeout);
    }
  }

  private setState(online: boolean): void {
    if (this._isOnline$.value === online) return;
    this.zone.run(() => this._isOnline$.next(online));
  }
}
