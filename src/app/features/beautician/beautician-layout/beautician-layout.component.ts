// ============================================================
// beautician-layout.component.ts
//
// Fixes applied vs previous version:
//  1. navLinks now uses a consistent `path` field everywhere
//     (verification previously used `route`, breaking [routerLink])
//  2. verificationStatus badge is derived via a getter so it
//     always reflects the live value rather than being frozen
//     at class-definition time
//  3. Verification nav item is structurally identical to all
//     other nav items — same fields, same template path
//  4. Badge dot is actually rendered in the sidebar template
//  5. Verification banner is wired up with the live getter
// ============================================================

import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil, filter } from "rxjs/operators";
import { AuthService } from "@core/services/auth.service";
import { environment } from "@environments/environment";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-beautician-layout",
  standalone: false,
  template: `
    <div
      class="flex h-screen overflow-hidden"
      style="background-color: var(--color-background)"
    >
      <!-- ══════════════════════════════════════
           DESKTOP SIDEBAR
      ══════════════════════════════════════ -->
      <aside
        class="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 h-full border-r overflow-y-auto"
        style="background-color: var(--color-surface); border-color: var(--color-border)"
      >
        <!-- Logo -->
        <div
          class="flex items-center justify-between px-5 py-4 border-b"
          style="border-color: var(--color-border)"
        >
          <div>
            <img
              src="assets/images/logo.png"
              alt="Bigluxx"
              class="logo-light h-8 w-auto object-contain"
            />
            <img
              src="assets/images/logo-dark.png"
              alt="Bigluxx"
              class="logo-dark h-8 w-auto object-contain"
            />
            <p
              class="text-[10px] text-[var(--color-primary)] font-bold mt-0.5 tracking-wider uppercase"
            >
              Business
            </p>
          </div>
        </div>

        <!-- Business Card -->
        <div class="p-4 border-b" style="border-color: var(--color-border)">
          <div
            class="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity"
            style="background: color-mix(in srgb, var(--color-primary) 6%, transparent)"
            [routerLink]="['/beautician/profile']"
          >
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <img
                *ngIf="user?.avatar || user?.profileImage"
                [src]="user?.avatar || user?.profileImage"
                alt="Business"
                class="w-11 h-11 rounded-xl object-cover"
              />
              <div
                *ngIf="!user?.avatar && !user?.profileImage"
                class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg"
                style="background: var(--color-primary)"
              >
                {{
                  (user?.businessName || user?.firstName || user?.name || "B")
                    .charAt(0)
                    .toUpperCase()
                }}
              </div>
              <!-- Online dot -->
              <div
                class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2"
                style="border-color: var(--color-surface)"
              ></div>
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="text-sm font-bold text-[var(--color-text-primary)] truncate"
              >
                {{ user?.businessName || user?.firstName || user?.name }}
              </p>
              <p class="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                {{ user?.email }}
              </p>
            </div>
            <i
              class="ri-arrow-right-s-line text-[var(--color-text-muted)] flex-shrink-0"
            ></i>
          </div>
        </div>

        <!-- ── Verification banner (sidebar, non-approved only) ── -->
        <div
          *ngIf="!isVerified"
          class="mx-3 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-opacity hover:opacity-80"
          [style.background-color]="
            verificationStatus === 'REJECTED'
              ? 'color-mix(in srgb, #EF4444 10%, transparent)'
              : 'color-mix(in srgb, #F59E0B 10%, transparent)'
          "
          (click)="router.navigate(['/beautician/verification'])"
        >
          <i
            class="text-base flex-shrink-0"
            [class]="
              verificationStatus === 'REJECTED'
                ? 'ri-shield-cross-fill'
                : 'ri-shield-check-line'
            "
            [style.color]="
              verificationStatus === 'REJECTED' ? '#EF4444' : '#D97706'
            "
          ></i>
          <div class="flex-1 min-w-0">
            <p
              class="text-xs font-bold leading-tight"
              [style.color]="
                verificationStatus === 'REJECTED' ? '#DC2626' : '#B45309'
              "
            >
              {{
                verificationStatus === "REJECTED"
                  ? "Verification rejected"
                  : "Verification pending"
              }}
            </p>
            <p
              class="text-[10px] mt-0.5 leading-snug"
              [style.color]="
                verificationStatus === 'REJECTED' ? '#EF4444' : '#D97706'
              "
            >
              {{
                verificationStatus === "REJECTED"
                  ? "Tap to review and resubmit"
                  : "Complete to receive bookings"
              }}
            </p>
          </div>
          <i
            class="ri-arrow-right-s-line text-sm flex-shrink-0"
            [style.color]="
              verificationStatus === 'REJECTED' ? '#EF4444' : '#D97706'
            "
          ></i>
        </div>

        <!-- Nav Links -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p
            class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest px-3 mb-2"
          >
            Main
          </p>
          <a
            *ngFor="let link of mainNavLinks"
            [routerLink]="link.path"
            class="nav-link group"
            [ngClass]="{ 'nav-link-active': isActive(link.path) }"
          >
            <i
              [ngClass]="
                isActive(link.path) ? link.activeIcon || link.icon : link.icon
              "
              class="text-lg flex-shrink-0"
            ></i>
            <span class="flex-1">{{ link.label }}</span>
            <span
              *ngIf="link.badge"
              class="ml-auto text-white text-[10px] font-black px-1.5 py-0.5 rounded-full"
              style="background: var(--color-primary)"
              >{{ link.badge }}</span
            >
          </a>

          <div
            class="h-px mx-3 my-3"
            style="background-color: var(--color-border)"
          ></div>
          <p
            class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest px-3 mb-2"
          >
            Manage
          </p>
          <a
            *ngFor="let link of manageNavLinks"
            [routerLink]="link.path"
            class="nav-link group"
            [ngClass]="{ 'nav-link-active': isActive(link.path) }"
          >
            <i
              [ngClass]="
                isActive(link.path) ? link.activeIcon || link.icon : link.icon
              "
              class="text-lg flex-shrink-0"
            ></i>
            <span class="flex-1">{{ link.label }}</span>

            <!-- Verification badge dot: amber when pending, red when rejected -->
            <span
              *ngIf="link.path === '/beautician/verification' && !isVerified"
              class="w-2 h-2 rounded-full flex-shrink-0"
              [style.background-color]="
                verificationStatus === 'REJECTED' ? '#EF4444' : '#F59E0B'
              "
            ></span>
          </a>
        </nav>

        <!-- Bottom: Settings -->
        <div class="p-3 border-t" style="border-color: var(--color-border)">
          <a
            routerLink="/beautician/settings"
            class="nav-link"
            [ngClass]="{ 'nav-link-active': isActive('/beautician/settings') }"
          >
            <i class="ri-settings-3-line text-lg"></i>
            <span>Settings</span>
          </a>
        </div>
      </aside>

      <!-- ══════════════════════════════════════
           MAIN CONTENT AREA
      ══════════════════════════════════════ -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- Mobile Top Bar -->
        <header
          class="lg:hidden flex items-center justify-between px-4 py-3 border-b flex-shrink-0 relative"
          style="background-color: var(--color-surface); border-color: var(--color-border)"
        >
          <!-- Left: avatar shortcut -->
          <a
            [routerLink]="['/beautician/profile']"
            class="flex items-center flex-shrink-0"
          >
            <img
              *ngIf="user?.avatar || user?.profileImage"
              [src]="user?.avatar || user?.profileImage"
              class="w-9 h-9 rounded-xl object-cover"
            />
            <div
              *ngIf="!user?.avatar && !user?.profileImage"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black"
              style="background: var(--color-primary)"
            >
              {{
                (user?.businessName || user?.name || "B")
                  .charAt(0)
                  .toUpperCase()
              }}
            </div>
          </a>

          <!-- Centre: logo -->
          <div
            class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
          >
            <img
              src="assets/images/logo.png"
              alt="Bigluxx"
              class="logo-light h-7 w-auto object-contain"
            />
            <img
              src="assets/images/logo-dark.png"
              alt="Bigluxx"
              class="logo-dark h-7 w-auto object-contain"
            />
          </div>

          <!-- Right: settings shortcut + verification dot indicator -->
          <!-- <a
            routerLink="/beautician/settings"
            class="relative w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
            style="background-color: var(--color-background)"
          >
            <i
              class="ri-settings-3-line text-base text-[var(--color-text-secondary)]"
            ></i>
            <span
              *ngIf="!isVerified"
              class="absolute top-1 right-1 w-2 h-2 rounded-full"
              [style.background-color]="
                verificationStatus === 'REJECTED' ? '#EF4444' : '#F59E0B'
              "
            ></span>
          </a> -->
           <a
            routerLink="/beautician/notifications"
            class="w-9 h-9 rounded-xl flex items-center justify-center"
            style="background-color: var(--color-bg-secondary)"
          >
            <i
              class="ri-notification-3-line text-base"
              style="color: var(--color-primary)"
            ></i>
          </a>
        </header>

        <!-- Mobile verification banner (shown below top bar) -->
        <div
          *ngIf="!isVerified"
          class="lg:hidden flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-opacity active:opacity-70"
          [style.background-color]="
            verificationStatus === 'REJECTED'
              ? 'color-mix(in srgb, #EF4444 10%, transparent)'
              : 'color-mix(in srgb, #F59E0B 10%, transparent)'
          "
          (click)="router.navigate(['/beautician/verification'])"
        >
          <i
            class="text-sm flex-shrink-0"
            [class]="
              verificationStatus === 'REJECTED'
                ? 'ri-shield-cross-fill'
                : 'ri-shield-check-line'
            "
            [style.color]="
              verificationStatus === 'REJECTED' ? '#EF4444' : '#D97706'
            "
          ></i>
          <p
            class="text-xs font-semibold flex-1"
            [style.color]="
              verificationStatus === 'REJECTED' ? '#DC2626' : '#B45309'
            "
          >
            {{
              verificationStatus === "REJECTED"
                ? "Verification rejected — tap to review and resubmit"
                : "Complete your verification to start receiving bookings"
            }}
          </p>
          <i
            class="ri-arrow-right-s-line text-sm flex-shrink-0"
            [style.color]="
              verificationStatus === 'REJECTED' ? '#EF4444' : '#D97706'
            "
          ></i>
        </div>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto pb-28 lg:pb-0">
          <router-outlet></router-outlet>
        </main>

        <!-- ══════════════════════════════════════
             MOBILE BOTTOM NAV — 4 direct tabs
        ══════════════════════════════════════ -->
        <nav
          class="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-6 pb-5 pointer-events-none"
        >
          <div
            class="flex items-center justify-around rounded-[30px] h-[64px] px-2 pointer-events-auto"
            style="
              background-color: rgba(10,10,10,0.94);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
            "
          >
            <a
              *ngFor="let tab of mobileTabs"
              [routerLink]="tab.path"
              class="relative flex items-center justify-center h-[44px] rounded-full transition-all duration-300 ease-out"
              [ngClass]="isActive(tab.path) ? 'gap-2 px-5' : 'w-[44px]'"
              [style.background-color]="
                isActive(tab.path) ? 'var(--color-primary)' : 'transparent'
              "
            >
              <i
                [ngClass]="
                  isActive(tab.path) ? tab.activeIcon || tab.icon : tab.icon
                "
                class="text-[20px] leading-none flex-shrink-0 text-white"
              ></i>
              <span
                *ngIf="isActive(tab.path)"
                class="text-white text-xs font-semibold whitespace-nowrap overflow-hidden"
                style="max-width: 80px"
                >{{ tab.label }}</span
              >
            </a>
          </div>
        </nav>
      </div>
    </div>
  `,
})
export class BeauticianLayoutComponent implements OnInit, OnDestroy {
  user: any = null;
  currentUrl = "";
  private destroy$ = new Subject<void>();

  // Loaded once on init; drives all badge/banner visibility reactively via getter
  verificationStatus: string | null = null;

  /** True only when fully approved — used in *ngIf throughout the template */
  get isVerified(): boolean {
    return this.verificationStatus === "APPROVED";
  }

  // ── Sidebar nav ──────────────────────────────────────────────────────────
  // All items use `path` consistently so [routerLink]="link.path" never breaks.
  // The first 4 appear under "Main", the rest under "Manage".

  mainNavLinks = [
    {
      path: "/beautician/dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-line",
      activeIcon: "ri-dashboard-fill",
      badge: null as string | null,
    },
    {
      path: "/beautician/bookings",
      label: "Bookings",
      icon: "ri-calendar-line",
      activeIcon: "ri-calendar-fill",
      badge: null as string | null,
    },
    {
      path: "/beautician/services",
      label: "Services",
      icon: "ri-scissors-2-line",
      activeIcon: "ri-scissors-2-fill",
      badge: null as string | null,
    },
    {
      path: "/beautician/schedule",
      label: "Schedule",
      icon: "ri-time-line",
      activeIcon: "ri-time-fill",
      badge: null as string | null,
    },
  ];

  manageNavLinks = [
    {
      path: "/beautician/verification",
      label: "Verification",
      icon: "ri-shield-check-line",
      activeIcon: "ri-shield-check-fill",
      badge: null as string | null,
    },
    {
      path: "/beautician/clients",
      label: "Clients",
      icon: "ri-group-line",
      activeIcon: "ri-group-fill",
      badge: null as string | null,
    },
    {
      path: "/beautician/reviews",
      label: "Reviews",
      icon: "ri-star-line",
      activeIcon: "ri-star-fill",
      badge: null as string | null,
    },
    {
      path: "/beautician/profile",
      label: "My Profile",
      icon: "ri-user-line",
      activeIcon: "ri-user-fill",
      badge: null as string | null,
    },
  ];

  // ── Mobile bottom tabs ────────────────────────────────────────────────────
  mobileTabs = [
    {
      path: "/beautician/dashboard",
      label: "Home",
      icon: "ri-dashboard-line",
      activeIcon: "ri-dashboard-fill",
    },
    {
      path: "/beautician/bookings",
      label: "Bookings",
      icon: "ri-calendar-line",
      activeIcon: "ri-calendar-fill",
    },
    {
      path: "/beautician/services",
      label: "Services",
      icon: "ri-scissors-2-line",
      activeIcon: "ri-scissors-2-fill",
    },
    {
      path: "/beautician/settings",
      label: "Settings",
      icon: "ri-settings-3-line",
      activeIcon: "ri-settings-3-fill",
    },
  ];

  constructor(
    public router: Router,
    private auth: AuthService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    // Keep user in sync
    this.auth.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((u) => (this.user = u));

    // Track active route for nav highlighting
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e: any) => {
        this.currentUrl = e.urlAfterRedirects;
      });

    // Load verification status — only once per session is sufficient here;
    // the component re-mounts on hard navigation anyway
    this.loadVerificationStatus();
  }

  private loadVerificationStatus(): void {
    this.http
      .get<any>(`${environment.apiUrl}/verification/status`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.verificationStatus = res?.data?.verificationStatus ?? null;
        },
        error: () => {
          // Silently ignore — banner simply won't appear if we can't load
        },
      });
  }

  isActive(path: string): boolean {
    return this.currentUrl.startsWith(path);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}