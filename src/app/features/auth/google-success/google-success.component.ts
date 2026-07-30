// google-success.component.ts
//
// Landing page for the redirect-based Google OAuth fallback flow.
// Used when Google's One Tap popup is blocked or dismissed (e.g. Safari
// ITP, Firefox ETP, or an ad blocker that blocks Google's third-party
// cookies). In that case we send the user to Google's full consent screen
// with a redirect_uri that points at OUR BACKEND (/auth/google/callback).
// The backend exchanges the code for tokens and redirects here with the
// tokens (and whether this was a new signup) in the query string — or, if
// something went wrong (including the cross-provider guard: this email is
// already registered with a password), redirects to /auth/google/error
// with an error code + message instead. Both routes point at this same
// component; ngOnInit branches on which query params are present.
//
// This page's only job is to pick those up, fetch the user's profile, and
// store the session — then route to the right dashboard.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-google-success',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen gap-4">
      <div
        class="w-10 h-10 border-4 rounded-full animate-spin"
        style="border-color: var(--color-border-light); border-top-color: var(--color-primary)"
      ></div>
      <p style="color: var(--color-text-secondary)">Finishing sign-in…</p>
    </div>
  `,
})
export class GoogleSuccessComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    // ── Error path (e.g. /auth/google/error?error=account_exists_with_password&message=...) ──
    const error = params.get('error');
    if (error) {
      const message =
        params.get('message') ||
        'Google sign-in failed. Please try again.';

      if (error === 'account_exists_with_password') {
        // Give them a clear, actionable message and send them to login
        // with their email pre-filled isn't possible here (we don't have
        // it), but the toast explains exactly what to do next.
        this.toast.error(message, 6000);
      } else {
        this.toast.error(message);
      }
      this.router.navigate(['/auth/login']);
      return;
    }

    // ── Success path ──
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const isNewUser = params.get('isNewUser') === 'true';

    if (!accessToken || !refreshToken) {
      this.toast.error('Google sign-in failed. Please try again.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.auth.completeGoogleRedirectAuth(accessToken, refreshToken).subscribe({
      next: () => {
        this.toast.success(
          isNewUser ? 'Account created — welcome to BigLuxx!' : 'Welcome back!',
        );
        this.router.navigate([this.auth.getDashboardRoute()]);
      },
      error: () => {
        this.toast.error('Google sign-in failed. Please try again.');
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
