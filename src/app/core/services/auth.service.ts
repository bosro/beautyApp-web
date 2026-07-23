import { Injectable } from "@angular/core";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { Router } from "@angular/router";
import { jwtDecode } from "jwt-decode";
import { User, AuthTokens, AuthState } from "../models";
import { ApiService } from "./api.service";
import { FcmService } from "./fcm.service";

const ACCESS_TOKEN_KEY = "@access_token";
const REFRESH_TOKEN_KEY = "@refresh_token";
const USER_KEY = "@user_data";
const USER_ROLE_KEY = "@user_role";
const ONBOARDING_KEY = "@has_seen_onboarding";

@Injectable({ providedIn: "root" })
export class AuthService {
  private _state = new BehaviorSubject<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  state$ = this._state.asObservable();
  user$ = this.state$.pipe(map((s) => s.user));

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

  get refreshToken(): string | null {
    return (
      this._state.value.refreshToken ?? localStorage.getItem("@refresh_token")
    );
  }

  refreshTokenRequest(refreshToken: string): Observable<string> {
    return this.api.post<any>("/auth/refresh-token", { refreshToken }).pipe(
      tap((res: any) => {
        if (res?.data?.tokens && res?.data?.user) {
          this.setAuth(res.data.tokens, res.data.user);
        }
      }),
      map((res: any) => res.data.tokens.accessToken),
    );
  }

  constructor(
    private api: ApiService,
    private router: Router,
    private fcmService: FcmService,
  ) {
    this.hydrate();
  }

  hydrate(): void {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userRaw = localStorage.getItem(USER_KEY);

      if (!accessToken || !userRaw) {
        this._state.next({ ...this._state.value, isLoading: false });
        return;
      }

      const user: User = JSON.parse(userRaw);

      if (!this.isTokenExpired(accessToken)) {
        this._state.next({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }

      // Access token has expired (this happens routinely — it's only
      // valid for an hour). If we still have a refresh token, try a
      // silent refresh before deciding the session is dead. Don't grant
      // isAuthenticated on the known-dead access token in the meantime —
      // that previously let route guards render the full authenticated
      // sidebar for a session that couldn't actually make any API call,
      // and clicking a tab silently bounced the user back to the
      // dashboard instead of telling them to log in.
      if (refreshToken && !this.isTokenExpired(refreshToken)) {
        this._state.next({ ...this._state.value, isLoading: true });
        this.refreshTokenRequest(refreshToken).subscribe({
          next: () => {
            // refreshTokenRequest already updates storage + state internally
            this._state.next({ ...this._state.value, isLoading: false });
          },
          error: () => this.clearSessionState(),
        });
      } else {
        this.clearSessionState();
      }
    } catch {
      this._state.next({ ...this._state.value, isLoading: false });
    }
  }

  /** Decodes a JWT client-side and checks its exp claim. Treats malformed tokens as expired. */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<{ exp?: number }>(token);
      if (!decoded.exp) return false;
      // Small buffer so we don't treat a token as valid right as it expires.
      return decoded.exp * 1000 < Date.now() + 5000;
    } catch {
      return true;
    }
  }

  /** Clears both localStorage and in-memory state without hitting the API (used when we already know the session is dead). */
  clearSessionState(): void {
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
  }

  setAuth(tokens: AuthTokens, user: User): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(
      USER_ROLE_KEY,
      user.role === "BEAUTICIAN" ? "beautician" : "client",
    );

    this._state.next({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });

    // Now that we have a valid session, it's safe to register this device
    // for push notifications (previously this ran unconditionally on app
    // boot, including on public pages, causing 401s).
    this.fcmService.requestPermissionAndRegister();
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
    return localStorage.getItem("beautyHub_theme") || "system";
  }

  logout(): void {
    // Fire and forget API logout
    this.api.post("/auth/logout", {}).subscribe({ error: () => {} });

    localStorage.removeItem("@access_token");
    localStorage.removeItem("@refresh_token");
    localStorage.removeItem("@user_data");
    localStorage.removeItem("@user_role");

    this._state.next({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // Navigate after state is cleared
    this.router.navigate(["/auth/login"]);
  }

  // ===== API Calls =====
  login(email: string, password: string): Observable<unknown> {
    return this.api.post("/auth/login", { email, password }).pipe(
      tap((res: any) => {
        if (res?.data?.tokens && res?.data?.user) {
          this.setAuth(res.data.tokens, res.data.user);
        }
      }),
    );
  }

  register(payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "CUSTOMER" | "BEAUTICIAN";
    // ── Beautician signup categorization (all optional) ──────────────────
    worksOnCampus?: boolean;
    campusName?: string;
    hostelName?: string;
    residencyStatus?: "RESIDENT" | "NON_RESIDENT" | "NOT_APPLICABLE";
    employmentType?: "SELF_EMPLOYED" | "EMPLOYED" | "SALON_OWNER";
    offersHomeService?: boolean;
  }): Observable<unknown> {
    return this.api.post("/auth/register", payload).pipe(
      tap((res: any) => {
        if (res?.data?.tokens && res?.data?.user) {
          this.setAuth(res.data.tokens, res.data.user);
        }
      }),
    );
  }

  googleSignIn(idToken: string, role: "CUSTOMER" | "BEAUTICIAN" = "CUSTOMER"): Observable<any> {
    return this.api.post("/auth/google", { idToken, role }).pipe(
      tap((res: any) => {
        if (res?.data?.tokens && res?.data?.user) {
          this.setAuth(res.data.tokens, res.data.user);
        }
      }),
    );
  }

  /**
   * Fetches the backend-generated Google OAuth URL. Used for the redirect
   * fallback when the One Tap popup is blocked/dismissed (e.g. Safari ITP,
   * Firefox ETP, or ad blockers that block Google's third-party cookies).
   * The redirect_uri baked into this URL points at OUR BACKEND, not the
   * frontend, because only the backend holds the client secret needed to
   * exchange the auth code for tokens.
   */
  getGoogleAuthUrl(role: "CUSTOMER" | "BEAUTICIAN" = "CUSTOMER"): Observable<{ url: string }> {
    return this.api
      .get<any>(`/auth/google/url?role=${role}`)
      .pipe(map((res: any) => res.data));
  }

  /**
   * Completes the redirect-based Google OAuth flow: the backend already
   * exchanged the code for tokens and redirected here with them in the
   * query string. We just need to fetch the user's profile and store the
   * session the same way a normal login would.
   */
  completeGoogleRedirectAuth(
    accessToken: string,
    refreshToken: string,
  ): Observable<User> {
    // The auth interceptor reads the token from in-memory state (not
    // localStorage) to attach the Authorization header, so update state
    // first or the /auth/me call below would go out unauthenticated.
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this._state.next({
      ...this._state.value,
      accessToken,
      refreshToken,
    });

    return this.getMe().pipe(
      map((res: any) => (res?.data?.user ?? res?.data ?? res) as User),
      tap((user: User) => {
        this.setAuth({ accessToken, refreshToken }, user);
      }),
    );
  }

  verifyEmail(email: string, otp: string): Observable<unknown> {
    return this.api.post("/auth/verify-email", { email, otp }).pipe(
      tap((res: any) => {
        if (res?.data?.tokens && res?.data?.user) {
          this.setAuth(res.data.tokens, res.data.user);
        }
      }),
    );
  }

  resendOTP(email: string): Observable<unknown> {
    return this.api.post("/auth/resend-otp", { email });
  }

  forgotPassword(email: string): Observable<unknown> {
    return this.api.post("/auth/forgot-password", { email });
  }

  verifyResetOTP(email: string, otp: string): Observable<unknown> {
    return this.api.post("/auth/verify-reset-otp", { email, otp });
  }

  resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
  ): Observable<unknown> {
    return this.api.post("/auth/reset-password", {
      email,
      resetToken,
      newPassword,
    });
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<unknown> {
    return this.api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }

  getMe(): Observable<unknown> {
    return this.api.get("/auth/me").pipe(
      tap((res: any) => {
        if (res?.data?.user) {
          this.setUser(res.data.user);
        }
      }),
    );
  }

  hasSeenOnboarding(): boolean {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  }

  markOnboardingComplete(): void {
    localStorage.setItem(ONBOARDING_KEY, "true");
  }

  getDashboardRoute(): string {
    return this.user?.role === "BEAUTICIAN"
      ? "/beautician/dashboard"
      : "/client/home";
  }
}


