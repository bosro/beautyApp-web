import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.auth.isAuthenticated) {
      return true;
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isAuthenticated) {
      return true;
    }
    const route = this.auth.getDashboardRoute();
    return this.router.createUrlTree([route]);
  }
}

@Injectable({ providedIn: 'root' })
export class ClientGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.isAuthenticated && this.auth.user?.role === 'CUSTOMER') {
      return true;
    }
    if (this.auth.isAuthenticated && this.auth.user?.role === 'BEAUTICIAN') {
      return this.router.createUrlTree(['/beautician/dashboard']);
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}

@Injectable({ providedIn: 'root' })
export class BeauticianGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.auth.isAuthenticated && this.auth.user?.role === 'BEAUTICIAN') {
      return true;
    }
    if (this.auth.isAuthenticated && this.auth.user?.role === 'CUSTOMER') {
      return this.router.createUrlTree(['/client/home']);
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}


