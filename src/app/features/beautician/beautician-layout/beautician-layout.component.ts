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
    <div class="flex h-screen bg-[var(--color-background)] overflow-hidden">
      <!-- Desktop Sidebar -->
      <aside
        class="hidden lg:flex flex-col w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex-shrink-0"
      >
        <!-- Logo -->
        <div class="px-5 py-4 border-b border-[var(--color-border)]">
          <img
            src="assets/images/logo.png"
            alt="Bigluxx"
            class="logo-light h-9 w-auto object-contain"
          />
          <img
            src="assets/images/logo-dark.png"
            alt="Bigluxx"
            class="logo-dark h-9 w-auto object-contain"
          />
          <p
            class="text-[10px] text-[var(--color-primary)] font-medium mt-0.5 pl-0.5"
          >
            Business
          </p>
        </div>

        <!-- Business Card -->
        <div class="p-4 border-b border-[var(--color-border)]">
          <div class="flex items-center gap-3">
            <img
              [src]="
                user?.avatar ||
                'https://ui-avatars.com/api/?name=' +
                  user?.businessName +
                  '&size=40&background=E88B7B&color=fff'
              "
              alt="Business"
              class="w-10 h-10 rounded-xl object-cover"
            />
            <div class="min-w-0">
              <p
                class="text-sm font-semibold text-[var(--color-text-primary)] truncate"
              >
                {{ user?.businessName || user?.firstName }}
              </p>
              <p class="text-xs text-[var(--color-text-muted)] truncate">
                {{ user?.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Nav Links -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <a
            *ngFor="let link of navLinks"
            [routerLink]="link.path"
            class="nav-link"
            [ngClass]="{ 'nav-link-active': isActive(link.path) }"
          >
            <i [ngClass]="link.icon" class="text-xl"></i>
            <span>{{ link.label }}</span>
            <span
              *ngIf="link.badge"
              class="ml-auto bg-[var(--color-primary)] text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
              >{{ link.badge }}</span
            >
          </a>
        </nav>

        <!-- Bottom -->
        <div class="p-3 border-t border-[var(--color-border)] space-y-1">
          <button (click)="toggleTheme()" class="nav-link w-full">
            <i
              [ngClass]="isDark ? 'ri-sun-line' : 'ri-moon-line'"
              class="text-xl"
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
            <i class="ri-settings-3-line text-xl"></i>
            <span>Settings</span>
          </a>
          <!-- <button
            (click)="showLogoutModal = true"
            class="nav-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <i class="ri-logout-box-r-line text-xl"></i>
            <span>Log Out</span>
          </button> -->
          <button
            (click)="confirmLogout()"
            class="nav-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <i class="ri-logout-box-r-line text-xl"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Mobile Top Bar -->
        <header
          class="lg:hidden flex items-center px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] gap-3"
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
          <span class="text-xs font-semibold text-[var(--color-primary)] flex-1"
            >Business</span
          >
          <button
            (click)="toggleTheme()"
            class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]"
          >
            <i
              [ngClass]="isDark ? 'ri-sun-line' : 'ri-moon-line'"
              class="text-[var(--color-text-secondary)]"
            ></i>
          </button>
        </header>

        <!-- Scroll Area -->
        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>

        <!-- Mobile Bottom Nav -->
        <nav
          class="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-2 py-2 flex items-center justify-around z-40"
        >
          <a
            *ngFor="let tab of mobileTabs"
            [routerLink]="tab.path !== 'more' ? tab.path : null"
            (click)="tab.path === 'more' ? (showMoreSheet = true) : null"
            class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative"
            [ngClass]="
              tab.path === 'more'
                ? showMoreSheet
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)]'
                : isActive(tab.path)
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)]'
            "
          >
            <i [ngClass]="tab.icon" class="text-xl"></i>
            <span class="text-[10px] font-medium">{{ tab.label }}</span>
          </a>
        </nav>

        <!-- Bottom Sheet Overlay — OUTSIDE nav, z-index higher than nav -->
        <div
          *ngIf="showMoreSheet"
          class="fixed inset-0 bg-black/50 z-50 lg:hidden"
          (click)="showMoreSheet = false"
        ></div>

        <!-- Bottom Sheet Panel — OUTSIDE nav -->
        <div
          class="fixed bottom-0 left-0 right-0 lg:hidden transition-transform duration-300 ease-out z-50"
          [ngClass]="showMoreSheet ? 'translate-y-0' : 'translate-y-full'"
        >
          <div
            class="bg-[var(--color-surface)] rounded-t-2xl p-4 pb-10 shadow-2xl"
            (click)="$event.stopPropagation()"
          >
            <!-- Handle -->
            <div
              class="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-4"
            ></div>

            <h3
              class="font-semibold text-[var(--color-text-primary)] mb-4 px-1"
            >
              More Options
            </h3>

            <div class="grid grid-cols-3 gap-3">
              <button
                *ngFor="let item of moreItems"
                (click)="navigateTo(item.path)"
                class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-background)] transition-colors active:scale-95"
              >
                <div
                  class="w-12 h-12 rounded-2xl flex items-center justify-center"
                  [ngStyle]="{ background: item.bg }"
                >
                  <i
                    [ngClass]="item.icon"
                    class="text-2xl"
                    [ngStyle]="{ color: item.color }"
                  ></i>
                </div>
                <span
                  class="text-xs font-medium text-[var(--color-text-secondary)] text-center leading-tight"
                >
                  {{ item.label }}
                </span>
              </button>
            </div>

            <!-- Divider -->
            <div class="border-t border-[var(--color-border)] my-3"></div>

            <!-- Logout -->
            <button
              (click)="confirmLogout()"
              class="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <div
                class="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
              >
                <i class="ri-logout-box-r-line text-xl text-red-500"></i>
              </div>
              <span class="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirm -->
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
  private destroy$ = new Subject<void>();

  navLinks = [
    {
      path: "/beautician/dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-line",
      badge: null,
    },
    {
      path: "/beautician/bookings",
      label: "Bookings",
      icon: "ri-calendar-line",
      badge: null,
    },
    {
      path: "/beautician/services",
      label: "Services",
      icon: "ri-scissors-2-line",
      badge: null,
    },
    {
      path: "/beautician/schedule",
      label: "Schedule",
      icon: "ri-time-line",
      badge: null,
    },
    {
      path: "/beautician/earnings",
      label: "Earnings",
      icon: "ri-money-dollar-circle-line",
      badge: null,
    },
    {
      path: "/beautician/reviews",
      label: "Reviews",
      icon: "ri-star-line",
      badge: null,
    },
    {
      path: "/beautician/clients",
      label: "Clients",
      icon: "ri-group-line",
      badge: null,
    },
    {
      path: "/beautician/profile",
      label: "My Profile",
      icon: "ri-user-line",
      badge: null,
    },
  ];

  showMoreSheet = false;

  mobileTabs = [
    {
      path: "/beautician/dashboard",
      label: "Home",
      icon: "ri-dashboard-line",
      badge: null,
    },
    {
      path: "/beautician/bookings",
      label: "Bookings",
      icon: "ri-calendar-line",
      badge: null,
    },
    {
      path: "/beautician/services",
      label: "Services",
      icon: "ri-scissors-2-line",
      badge: null,
    },
    {
      path: "/beautician/earnings",
      label: "Earnings",
      icon: "ri-money-dollar-circle-line",
      badge: null,
    },
    { path: "more", label: "More", icon: "ri-settings-line", badge: null },
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
      path: "/beautician/reviews",
      label: "Reviews",
      icon: "ri-star-line",
      bg: "#FFFBEB",
      color: "#F59E0B",
    },
    {
      path: "/beautician/clients",
      label: "Clients",
      icon: "ri-group-line",
      bg: "#F0FDF4",
      color: "#22C55E",
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
      path: "/beautician/stats",
      label: "Stats",
      icon: "ri-bar-chart-line",
      bg: "#EFF6FF",
      color: "#3B82F6",
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
      .subscribe((e: any) => (this.currentUrl = e.urlAfterRedirects));
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
  this.showMoreSheet = false;  // close sheet first
  this.showLogoutModal = true; // then show modal
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
