// app.component.ts
import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeService } from "./core/services/theme.service";
import { AuthService } from "./core/services/auth.service";
import { environment } from "../environments/environment";
import {
  trigger, transition, style, animate, query, group,
} from "@angular/animations";

export const routeAnimations = trigger("routeAnimations", [
  transition("* <=> *", [
    query(":enter", [style({ opacity: 0, transform: "translateY(12px)" })], { optional: true }),
    group([
      query(":leave", [animate("150ms ease-in", style({ opacity: 0, transform: "translateY(-6px)" }))], { optional: true }),
      query(":enter", [animate("280ms 80ms cubic-bezier(0,0,0.2,1)", style({ opacity: 1, transform: "translateY(0)" }))], { optional: true }),
    ]),
  ]),
]);

@Component({
  selector: "app-root",
  template: `
    <div [@routeAnimations]="getRouteState(outlet)" class="min-h-screen">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
    <app-toast></app-toast>
  `,
  animations: [routeAnimations],
})
export class AppComponent implements OnInit {
  constructor(
    private theme: ThemeService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadGoogleMaps();
    this.loadGoogleIdentity();
    this.initAuth();
  }

  private loadGoogleMaps(): void {
    // Avoid loading twice (e.g. on hot reload)
    if (document.querySelector('script[data-google-maps]')) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset['googleMaps'] = 'true'; // marker to prevent double-load
    document.head.appendChild(script);
  }

  private loadGoogleIdentity(): void {
    // Google One Tap / Sign-In SDK
    if (document.querySelector('script[data-google-identity]')) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset['googleIdentity'] = 'true';

    script.onload = () => {
      // Initialize Google Identity with your client ID from environment
      (window as any).google?.accounts.id.initialize({
        client_id: environment.googleClientId,
        // Callback handled per-component (LoginComponent calls prompt())
      });
    };

    document.head.appendChild(script);
  }

  private initAuth(): void {
    if (!this.auth.isAuthenticated) return;

    this.auth.getMe().subscribe({
      error: () => {
        const refreshToken = this.auth.refreshToken;
        if (refreshToken) {
          this.auth.refreshTokenRequest(refreshToken).subscribe({
            error: () => this.auth.logout(),
          });
        } else {
          this.auth.logout();
        }
      },
    });
  }

  getRouteState(outlet: RouterOutlet): string {
    if (!outlet || !outlet.isActivated) return "";
    return (
      outlet.activatedRouteData?.["animation"] ||
      outlet.activatedRoute?.snapshot?.url?.[0]?.path ||
      ""
    );
  }
}