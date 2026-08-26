// pwa-install.service.ts
//
// Chrome/Edge fire `beforeinstallprompt` once the site qualifies as an
// installable PWA (manifest + active service worker + HTTPS, all already
// in place — see app.module.ts's ServiceWorkerModule registration). The
// browser then withholds its native install UI unless the page calls
// event.preventDefault() and holds onto the event to fire later — which is
// exactly what was missing: nothing was listening, so the moment silently
// passed and there was no way to ever surface "you can install this" to
// the user or replay the prompt on their own schedule.
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  /** True once the browser has told us installation is possible right now. */
  private readonly canInstallSubject = new BehaviorSubject<boolean>(false);
  readonly canInstall$ = this.canInstallSubject.asObservable();

  /** True once the app has actually been installed (hides the badge for good, this session). */
  private readonly installedSubject = new BehaviorSubject<boolean>(false);
  readonly installed$ = this.installedSubject.asObservable();

  constructor(private zone: NgZone) {
    // Already running as an installed PWA (standalone display mode) —
    // nothing to prompt for.
    const alreadyInstalled =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (alreadyInstalled) {
      this.installedSubject.next(true);
    }

    // Pick up an event that already fired before this service was ever
    // constructed — see the capture script in index.html for why that
    // can happen and why it matters.
    const early = (window as any).__deferredInstallPrompt as
      | BeforeInstallPromptEvent
      | undefined;
    if (early && !alreadyInstalled) {
      this.deferredPrompt = early;
      this.canInstallSubject.next(true);
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.zone.run(() => {
        this.deferredPrompt = e as BeforeInstallPromptEvent;
        (window as any).__deferredInstallPrompt = e;
        this.canInstallSubject.next(true);
      });
    });

    window.addEventListener('appinstalled', () => {
      this.zone.run(() => {
        this.deferredPrompt = null;
        (window as any).__deferredInstallPrompt = null;
        this.canInstallSubject.next(false);
        this.installedSubject.next(true);
      });
    });
  }

  /**
   * Shows the browser's own native install prompt (the same one Chrome
   * would've shown from its address-bar icon). Must be called directly
   * from a user gesture (e.g. a click handler) — browsers reject it
   * otherwise. Returns the outcome so callers can react (e.g. hide the
   * badge on 'dismissed' too, so it's not naggy).
   */
  async promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    if (!this.deferredPrompt) return 'unavailable';

    const promptEvent = this.deferredPrompt;
    this.deferredPrompt = null;
    (window as any).__deferredInstallPrompt = null;
    this.canInstallSubject.next(false); // one-shot — the browser invalidates the event after use anyway

    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    return choice.outcome;
  }
}
