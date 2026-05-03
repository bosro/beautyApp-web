import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, AuthTokens, AuthState } from '../models';
import { ApiService } from './api.service';

const ACCESS_TOKEN_KEY = '@access_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_KEY = '@user_data';
const USER_ROLE_KEY = '@user_role';
const ONBOARDING_KEY = '@has_seen_onboarding';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _state = new BehaviorSubject<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  state$ = this._state.asObservable();

  get user(): User | null {
    return this._state.value.user;
  }

  get isAuthenticated(): boolean {
    return this._state.value.isAuthenticated;
  }

  get accessToken(): string | null {
    return this._state.value.accessToken;
  }

  get isLoading(): boolean {
    return this._state.value.isLoading;
  }

  get userRole(): string | null {
    return this.user?.role ?? null;
  }

  constructor(private api: ApiService, private router: Router) {
    this.hydrate();
  }

  hydrate(): void {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);

      if (accessToken && userRaw) {
        const user: User = JSON.parse(userRaw);
        this._state.next({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        this._state.next({ ...this._state.value, isLoading: false });
      }
    } catch {
      this._state.next({ ...this._state.value, isLoading: false });
    }
  }

  setAuth(tokens: AuthTokens, user: User): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(USER_ROLE_KEY, user.role === 'BEAUTICIAN' ? 'beautician' : 'client');

    this._state.next({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._state.next({ ...this._state.value, user });
  }

  /** Alias used by profile components */
  updateUser(user: User): void {
    this.setUser(user);
  }

  getMode(): string {
    return localStorage.getItem('beautyHub_theme') || 'system';
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_ROLE_KEY);

    this._state.next({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    this.router.navigate(['/auth/login']);
  }

  // ===== API Calls =====
  login(email: string, password: string): Observable<unknown> {
    return this.api.post('/auth/login', { email, password }).pipe(
      tap((res: any) => {
        if (res?.data?.tokens && res?.data?.user) {
          this.setAuth(res.data.tokens, res.data.user);
        }
      })
    );
  }

  register(payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'CUSTOMER' | 'BEAUTICIAN';
  }): Observable<unknown> {
    return this.api.post('/auth/register', payload).pipe(
      tap((res: any) => {
        if (res?.data?.tokens && res?.data?.user) {
          this.setAuth(res.data.tokens, res.data.user);
        }
      })
    );
  }

  verifyEmail(email: string, otp: string): Observable<unknown> {
    return this.api.post('/auth/verify-email', { email, otp }).pipe(
      tap((res: any) => {
        if (res?.data?.tokens && res?.data?.user) {
          this.setAuth(res.data.tokens, res.data.user);
        }
      })
    );
  }

  resendOTP(email: string): Observable<unknown> {
    return this.api.post('/auth/resend-otp', { email });
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.api.post('/auth/forgot-password', { email });
  }

  verifyResetOTP(email: string, otp: string): Observable<unknown> {
    return this.api.post('/auth/verify-reset-otp', { email, otp });
  }

  resetPassword(email: string, resetToken: string, newPassword: string): Observable<unknown> {
    return this.api.post('/auth/reset-password', { email, resetToken, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<unknown> {
    return this.api.post('/auth/change-password', { currentPassword, newPassword });
  }

  getMe(): Observable<unknown> {
    return this.api.get('/auth/me').pipe(
      tap((res: any) => {
        if (res?.data?.user) {
          this.setUser(res.data.user);
        }
      })
    );
  }

  hasSeenOnboarding(): boolean {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  }

  markOnboardingComplete(): void {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }

  getDashboardRoute(): string {
    return this.user?.role === 'BEAUTICIAN'
      ? '/beautician/dashboard'
      : '/client/home';
  }
}
