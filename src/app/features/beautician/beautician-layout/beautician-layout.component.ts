// ============================================================
// beautician-layout.component.ts  —  Enhanced UI
// Mirrors the quality of client-layout: pill nav, frosted glass,
// polished sidebar, smooth bottom sheet. All logic unchanged.
// ============================================================

import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil, filter } from "rxjs/operators";
import { AuthService } from "@core/services/auth.service";
import { ThemeService } from "@core/services/theme.service";

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

        <!-- Nav Links -->
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p
            class="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest px-3 mb-2"
          >
            Main
          </p>
          <a
            *ngFor="let link of navLinks.slice(0, 4)"
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
            *ngFor="let link of navLinks.slice(4)"
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
          </a>
        </nav>

        <!-- Bottom actions -->
        <div
          class="p-3 border-t space-y-0.5"
          style="border-color: var(--color-border)"
        >
          <button (click)="toggleTheme()" class="nav-link w-full">
            <i
              [ngClass]="isDark ? 'ri-sun-line' : 'ri-moon-line'"
              class="text-lg"
            ></i>
            <span>{{ isDark ? "Light Mode" : "Dark Mode" }}</span>
          </button>
          <a
            routerLink="/beautician/business-profile"
            class="nav-link"
            [ngClass]="{
              'nav-link-active': isActive('/beautician/business-profile'),
            }"
          >
            <i class="ri-settings-3-line text-lg"></i>
            <span>Settings</span>
          </a>
          <button
            (click)="confirmLogout()"
            class="nav-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <i class="ri-logout-box-r-line text-lg"></i>
            <span>Log Out</span>
          </button>
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

          <!-- Right: theme + notification -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              (click)="toggleTheme()"
              class="w-9 h-9 flex items-center justify-center rounded-xl"
              style="background-color: var(--color-background)"
            >
              <i
                [ngClass]="isDark ? 'ri-sun-line' : 'ri-moon-line'"
                class="text-base text-[var(--color-text-secondary)]"
              ></i>
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto pb-28 lg:pb-0">
          <router-outlet></router-outlet>
        </main>

        <!-- ══════════════════════════════════════
             MOBILE BOTTOM NAV — Pill style
             (mirrors client layout exactly)
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
            <!-- Main tabs -->
            <a
              *ngFor="let tab of mobileTabs"
              [routerLink]="tab.path !== 'more' ? tab.path : null"
              (click)="tab.path === 'more' ? (showMoreSheet = true) : null"
              class="relative flex items-center justify-center h-[44px] rounded-full transition-all duration-300 ease-out"
              [ngClass]="
                tab.path === 'more'
                  ? showMoreSheet
                    ? 'gap-2 px-5'
                    : 'w-[44px]'
                  : isActive(tab.path)
                    ? 'gap-2 px-5'
                    : 'w-[44px]'
              "
              [style.background-color]="
                (tab.path !== 'more' && isActive(tab.path)) ||
                (tab.path === 'more' && showMoreSheet)
                  ? 'var(--color-primary)'
                  : 'transparent'
              "
            >
              <i
                [ngClass]="
                  tab.path === 'more'
                    ? showMoreSheet
                      ? tab.activeIcon || tab.icon
                      : tab.icon
                    : isActive(tab.path)
                      ? tab.activeIcon || tab.icon
                      : tab.icon
                "
                class="text-[20px] leading-none flex-shrink-0 text-white"
              ></i>
              <span
                *ngIf="
                  (tab.path !== 'more' && isActive(tab.path)) ||
                  (tab.path === 'more' && showMoreSheet)
                "
                class="text-white text-xs font-semibold whitespace-nowrap overflow-hidden"
                style="max-width: 80px"
                >{{ tab.label }}</span
              >
            </a>
          </div>
        </nav>

        <!-- ══════════════════════════════════════
             MORE BOTTOM SHEET
        ══════════════════════════════════════ -->
        <!-- Overlay -->
        <div
          *ngIf="showMoreSheet"
          class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          (click)="showMoreSheet = false"
        ></div>

        <!-- Sheet Panel -->
        <div
          class="fixed bottom-0 left-0 right-0 lg:hidden transition-transform duration-300 ease-out z-50"
          [ngClass]="showMoreSheet ? 'translate-y-0' : 'translate-y-full'"
        >
          <div
            class="rounded-t-3xl shadow-2xl overflow-hidden"
            style="background-color: var(--color-surface)"
            (click)="$event.stopPropagation()"
          >
            <!-- Handle + header -->
            <div
              class="px-5 pt-3 pb-4 border-b"
              style="border-color: var(--color-border)"
            >
              <div
                class="w-10 h-1 rounded-full mx-auto mb-4"
                style="background-color: var(--color-border)"
              ></div>
              <div class="flex items-center justify-between">
                <h3
                  class="font-bold text-base text-[var(--color-text-primary)]"
                >
                  More Options
                </h3>
                <button
                  (click)="showMoreSheet = false"
                  class="w-8 h-8 flex items-center justify-center rounded-full"
                  style="background-color: var(--color-background)"
                >
                  <i
                    class="ri-close-line text-[var(--color-text-secondary)]"
                  ></i>
                </button>
              </div>
            </div>

            <!-- Grid items -->
            <div class="p-4 grid grid-cols-3 gap-3">
              <button
                *ngFor="let item of moreItems"
                (click)="navigateTo(item.path)"
                class="flex flex-col items-center gap-2.5 p-3 rounded-2xl hover:opacity-80 transition-all active:scale-95"
                style="background-color: var(--color-background)"
              >
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  [ngStyle]="{ background: item.bg }"
                >
                  <i
                    [ngClass]="item.icon"
                    class="text-2xl"
                    [ngStyle]="{ color: item.color }"
                  ></i>
                </div>
                <span
                  class="text-xs font-semibold text-[var(--color-text-secondary)] text-center leading-tight"
                >
                  {{ item.label }}
                </span>
              </button>
            </div>

            <!-- Divider + Logout -->
            <div
              class="mx-4 border-t pb-2"
              style="border-color: var(--color-border)"
            ></div>
            <div class="px-4 pb-10">
              <button
                (click)="confirmLogout()"
                class="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors"
              >
                <div
                  class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0"
                >
                  <i class="ri-logout-box-r-line text-xl text-red-500"></i>
                </div>
                <span class="font-bold text-sm text-red-500">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirm Modal -->
    <app-confirm-modal
      *ngIf="showLogoutModal"
      title="Log Out"
      message="Are you sure you want to log out?"
      confirmText="Log Out"
      type="warning"
      (confirmed)="logout()"
      (cancelled)="showLogoutModal = false"
    >
    </app-confirm-modal>
  `,
})
export class BeauticianLayoutComponent implements OnInit, OnDestroy {
  user: any = null;
  currentUrl = "";
  showLogoutModal = false;
  isDark = false;
  showMoreSheet = false;
  private destroy$ = new Subject<void>();

  navLinks = [
    {
      path: "/beautician/dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-line",
      activeIcon: "ri-dashboard-fill",
      badge: null,
    },
    {
      path: "/beautician/bookings",
      label: "Bookings",
      icon: "ri-calendar-line",
      activeIcon: "ri-calendar-fill",
      badge: null,
    },
    {
      path: "/beautician/services",
      label: "Services",
      icon: "ri-scissors-2-line",
      activeIcon: "ri-scissors-2-fill",
      badge: null,
    },
    {
      path: "/beautician/schedule",
      label: "Schedule",
      icon: "ri-time-line",
      activeIcon: "ri-time-fill",
      badge: null,
    },
    {
      path: "/beautician/clients",
      label: "Clients",
      icon: "ri-group-line",
      activeIcon: "ri-group-fill",
      badge: null,
    },
    {
      path: "/beautician/reviews",
      label: "Reviews",
      icon: "ri-star-line",
      activeIcon: "ri-star-fill",
      badge: null,
    },
    {
      path: "/beautician/profile",
      label: "My Profile",
      icon: "ri-user-line",
      activeIcon: "ri-user-fill",
      badge: null,
    },
  ];

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
      path: "more",
      label: "More",
      icon: "ri-menu-line",
      activeIcon: "ri-close-line",
    },
  ];

  moreItems = [
    {
      path: "/beautician/schedule",
      label: "Schedule",
      icon: "ri-time-line",
      bg: "#EEF2FF",
      color: "#6366F1",
    },
    {
      path: "/beautician/clients",
      label: "Clients",
      icon: "ri-group-line",
      bg: "#F0FDF4",
      color: "#22C55E",
    },
    {
      path: "/beautician/reviews",
      label: "Reviews",
      icon: "ri-star-line",
      bg: "#FFFBEB",
      color: "#F59E0B",
    },
    {
      path: "/beautician/profile",
      label: "My Profile",
      icon: "ri-user-line",
      bg: "#FFF7ED",
      color: "#F97316",
    },
    {
      path: "/beautician/business-profile",
      label: "Business",
      icon: "ri-store-2-line",
      bg: "#FDF4FF",
      color: "#A855F7",
    },
    {
      path: "/beautician/verification",
      label: "Verification",
      icon: "ri-shield-check-line",
      bg: "#F0FDF4",
      color: "#16A34A",
    },
  ];

  constructor(
    private router: Router,
    private auth: AuthService,
    private themeService: ThemeService,
  ) {}

  ngOnInit() {
    this.auth.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((u) => (this.user = u));
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((e: any) => {
        this.currentUrl = e.urlAfterRedirects;
        this.showMoreSheet = false; // close sheet on navigation
      });
    this.currentUrl = this.router.url;
    this.isDark = this.themeService.getMode() === "dark";
  }

  isActive(path: string) {
    return this.currentUrl.startsWith(path);
  }

  toggleTheme() {
    const next = this.isDark ? "light" : "dark";
    this.isDark = !this.isDark;
    this.themeService.setMode(next as any);
  }

  navigateTo(path: string) {
    this.showMoreSheet = false;
    this.router.navigate([path]);
  }

  confirmLogout() {
    this.showMoreSheet = false;
    this.showLogoutModal = true;
  }

  logout() {
    this.showLogoutModal = false;
    this.auth.logout();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
