// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, BehaviorSubject, of } from "rxjs";
import { catchError, filter, take, switchMap } from "rxjs/operators";
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
      switchMap((newToken: string) => {
        this.isRefreshing = false;
        this.refreshDone$.next(newToken);
        return next.handle(this.addToken(req, newToken));
      }),
      catchError((err) => {
        this.isRefreshing = false;
        this.refreshDone$.next(null);
        this.forceLogout();
        return throwError(() => err);
      }),
    );
  }

  private forceLogout(): void {
    // Clear storage directly to avoid circular dependency issues
    localStorage.removeItem("@access_token");
    localStorage.removeItem("@refresh_token");
    localStorage.removeItem("@user_data");
    localStorage.removeItem("@user_role");
    // Use router directly rather than auth.logout() to avoid any state issues
    this.router.navigate(["/auth/login"], { replaceUrl: true });
  }
}
