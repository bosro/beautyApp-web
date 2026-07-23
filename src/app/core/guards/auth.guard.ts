// src/app/core/guards/auth.guard.ts
// UPDATED — added SettingsGuard that allows both CUSTOMER and BEAUTICIAN
// UPDATED — guards now wait for AuthService to finish hydrating/silently
// refreshing before deciding, instead of racing ahead of an in-flight
// token refresh (which previously could bounce a valid deep link straight
// to login just because the refresh hadn't resolved yet).

import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/** Emits once AuthService has settled (hydration + any silent refresh done). */
function settled(auth: AuthService) {
  return auth.state$.pipe(
    filter((s) => !s.isLoading),
    take(1),
  );
}

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return settled(this.auth).pipe(
      map(() => {
        if (this.auth.isAuthenticated) return true;
        return this.router.createUrlTree(['/auth/login']);
      }),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return settled(this.auth).pipe(
      map(() => {
        if (!this.auth.isAuthenticated) return true;
        return this.router.createUrlTree([this.auth.getDashboardRoute()]);
      }),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class ClientGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return settled(this.auth).pipe(
      map(() => {
        if (this.auth.isAuthenticated && this.auth.user?.role === 'CUSTOMER') {
          return true;
        }
        if (this.auth.isAuthenticated && this.auth.user?.role === 'BEAUTICIAN') {
          return this.router.createUrlTree(['/beautician/dashboard']);
        }
        return this.router.createUrlTree(['/auth/login']);
      }),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class BeauticianGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return settled(this.auth).pipe(
      map(() => {
        if (this.auth.isAuthenticated && this.auth.user?.role === 'BEAUTICIAN') {
          return true;
        }
        if (this.auth.isAuthenticated && this.auth.user?.role === 'CUSTOMER') {
          return this.router.createUrlTree(['/client/home']);
        }
        return this.router.createUrlTree(['/auth/login']);
      }),
    );
  }
}

/**
 * SettingsGuard — allows ANY authenticated user (CUSTOMER or BEAUTICIAN).
 * Used for shared settings routes: notifications, change-password, security.
 * If not authenticated → redirect to login.
 */
@Injectable({ providedIn: 'root' })
export class SettingsGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return settled(this.auth).pipe(
      map(() => {
        if (this.auth.isAuthenticated) return true;
        return this.router.createUrlTree(['/auth/login']);
      }),
    );
  }
}