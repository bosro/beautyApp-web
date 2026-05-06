// app.component.ts
import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ThemeService } from "./core/services/theme.service";
import { AuthService } from "./core/services/auth.service";
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from "@angular/animations";

export const routeAnimations = trigger("routeAnimations", [
  transition("* <=> *", [
    query(":enter", [style({ opacity: 0, transform: "translateY(12px)" })], {
      optional: true,
    }),
    group([
      query(
        ":leave",
        [
          animate(
            "150ms ease-in",
            style({ opacity: 0, transform: "translateY(-6px)" }),
          ),
        ],
        { optional: true },
      ),
      query(
        ":enter",
        [
          animate(
            "280ms 80ms cubic-bezier(0,0,0.2,1)",
            style({ opacity: 1, transform: "translateY(0)" }),
          ),
        ],
        { optional: true },
      ),
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
    if (this.auth.isAuthenticated) {
      // Verify token is still valid on startup
      this.auth.getMe().subscribe({
        error: () => {
          // Token invalid/expired → try refresh, if that fails logout() handles redirect
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
