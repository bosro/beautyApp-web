// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, BehaviorSubject, of, TimeoutError } from "rxjs";
import { catchError, filter, take, switchMap, timeout } from "rxjs/operators";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshDone$ = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Skip auth endpoints
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(req);
    }

    const token = this.auth.accessToken;
    const authReq = token ? this.addToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (
          err.status === 401 ||
          (err.status === 500 &&
            err.error?.stack?.includes("Invalid or expired token"))
        ) {
          return this.handle401(req, next);
        }
        return throwError(() => err);
      }),
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh-token") ||
      url.includes("/auth/resend-otp") ||
      url.includes("/auth/verify-email") ||
      url.includes("/auth/forgot-password")
    );
  }

  private addToken(req: HttpRequest<unknown>, token: string) {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private handle401(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const refreshToken = this.auth.refreshToken;

    if (!refreshToken) {
      this.forceLogout();
      return throwError(() => new Error("No refresh token"));
    }

    if (this.isRefreshing) {
      // Queue this request until refresh completes
      return this.refreshDone$.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addToken(req, token!))),
      );
    }

    this.isRefreshing = true;
    this.refreshDone$.next(null);

    return this.auth.refreshTokenRequest(refreshToken).pipe(
      // Without this, a refresh call that never resolves — e.g. its
      // underlying request got dropped by the OS while the app was
      // backgrounded, which mobile browsers do fairly readily to
      // installed PWAs — leaves isRefreshing stuck true forever. Every
      // request made after that point (from any component, not just the
      // one that triggered this) gets queued on refreshDone$ waiting for
      // a value that will never arrive, so nothing ever reaches the
      // network again until a full page reload recreates this
      // interceptor. Bounding it guarantees isRefreshing always gets
      // reset one way or another.
      timeout(15000),
      switchMap((newToken: string) => {
        this.isRefreshing = false;
        this.refreshDone$.next(newToken);
        return next.handle(this.addToken(req, newToken));
      }),
      catchError((err) => {
        this.isRefreshing = false;
        this.refreshDone$.next(null);
        // A timeout most likely means the refresh call got stuck due to
        // the connection being suspended (backgrounded tab, network
        // handoff, etc.) — not that the refresh token itself is invalid.
        // Don't nuke the session over what's probably a transient network
        // hiccup; just fail this one request so the calling code can show
        // an error/let the user retry, now that isRefreshing is reset and
        // the next attempt has a clean slate.
        if (err instanceof TimeoutError) {
          return throwError(() => err);
        }
        this.forceLogout();
        return throwError(() => err);
      }),
    );
  }

  private forceLogout(): void {
    // IMPORTANT: must reset AuthService's in-memory state, not just
    // localStorage. Previously this only cleared localStorage directly,
    // leaving auth.isAuthenticated still reporting true (stale in-memory
    // BehaviorSubject) — so navigating to /auth/login right after got
    // immediately bounced back to the dashboard by GuestGuard, instead of
    // showing the login page.
    this.auth.logout();
  }
}
