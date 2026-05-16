
// settings-layout.component.ts
import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeService } from "../../../core/services/theme.service";
import { User } from "../../../core/models";

@Component({
  selector: "app-client-layout",
  template: `
    <div
      class="flex h-screen overflow-hidden"
      style="background-color: var(--color-bg-primary)"
    >
      <!-- ===== DESKTOP SIDEBAR ===== -->
      <aside
        class="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 h-full border-r overflow-y-auto"
        style="background-color: var(--color-bg-primary); border-color: var(--color-border-light)"
      >
        <div
          class="flex items-center px-6 py-5 border-b"
          style="border-color: var(--color-border-light)"
        >
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
        </div>

        <div
          class="px-4 py-4 border-b"
          style="border-color: var(--color-border-light)"
        >
          <div
            class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
            style="background-color: var(--color-bg-secondary)"
            [routerLink]="['/client/profile']"
          >
            <img
              *ngIf="user?.avatar"
              [src]="user!.avatar"
              [alt]="user?.name"
              class="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div
              *ngIf="!user?.avatar"
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style="background-color: var(--color-primary)"
            >
              {{ user?.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p
                class="text-sm font-semibold truncate"
                style="color: var(--color-text-primary)"
              >
                {{ user?.name }}
              </p>
              <p
                class="text-xs truncate"
                style="color: var(--color-text-secondary)"
              >
                {{ user?.email }}
              </p>
            </div>
          </div>
        </div>

        <nav class="flex-1 px-4 py-4 space-y-1">
          <a
            *ngFor="let item of navItems"
            [routerLink]="[item.route]"
            class="nav-link"
            [class.active]="isActive(item.route)"
          >
            <i
              class="text-lg"
              [class]="isActive(item.route) ? item.activeIcon : item.icon"
            ></i>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <div
          class="px-4 py-4 border-t space-y-1"
          style="border-color: var(--color-border-light)"
        >
          <button (click)="toggleTheme()" class="nav-link w-full text-left">
            <i
              class="text-lg"
              [class]="themeService.isDark ? 'ri-sun-line' : 'ri-moon-line'"
            ></i>
            <span>{{ themeService.isDark ? "Light mode" : "Dark mode" }}</span>
          </button>
          <a
            routerLink="/client/settings"
            class="nav-link"
            [class.active]="isActive('/client/settings')"
          >
            <i class="ri-settings-4-line text-lg"></i>
            <span>Settings</span>
          </a>
          <button
            (click)="showLogout = true"
            class="nav-link w-full text-left text-red-500 hover:bg-red-50"
          >
            <i class="ri-logout-box-r-line text-lg text-red-500"></i>
            <span class="text-red-500">Log out</span>
          </button>
        </div>
      </aside>

      <!-- ===== MAIN CONTENT ===== -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- Mobile top bar (hidden on immersive screens) -->
        <header
          *ngIf="!hideHeader"
          class="lg:hidden flex items-center justify-between px-4 py-3 border-b flex-shrink-0 relative"
          style="background-color: var(--color-bg-primary); border-color: var(--color-border-light)"
        >
          <a routerLink="/client/profile" class="flex items-center">
            <img
              *ngIf="user?.avatar"
              [src]="user!.avatar"
              [alt]="user?.name"
              class="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
            <div
              *ngIf="!user?.avatar"
              class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style="background-color: var(--color-primary)"
            >
              {{ user?.name?.charAt(0)?.toUpperCase() }}
            </div>
          </a>
          <div class="absolute left-1/2 -translate-x-1/2 flex items-center">
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
          </div>
          <div class="flex items-center gap-2">
            <a
              routerLink="/client/notifications"
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background-color: var(--color-bg-secondary)"
            >
              <i
                class="ri-notification-3-line text-base"
                style="color: var(--color-primary)"
              ></i>
            </a>
            <button
              (click)="toggleTheme()"
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background-color: var(--color-bg-secondary)"
            >
              <i
                class="text-base"
                [class]="themeService.isDark ? 'ri-sun-line' : 'ri-moon-line'"
                style="color: var(--color-text-secondary)"
              ></i>
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main
          class="flex-1 overflow-y-auto pb-28 lg:pb-0"
          (scroll)="onScroll($event)"
        >
          <router-outlet></router-outlet>
        </main>

        <!-- ===== MOBILE BOTTOM TAB BAR — Pill style ===== -->
        <nav
        *ngIf="!hideNav"
          class="lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 px-8 pb-5"
          [ngClass]="navHidden ? 'translate-y-full' : 'translate-y-0'"
        >
          <div
            class="flex items-center justify-around rounded-[30px] h-[64px] px-2"
            style="
      background-color: rgba(10,10,10,0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18);
    "
          >
            <a
              *ngFor="let item of mobileNavItems"
              [routerLink]="item.route"
              class="relative flex items-center justify-center h-[44px] rounded-full transition-all duration-300 ease-out"
              [ngClass]="isActive(item.route) ? 'gap-2 px-5' : 'w-[44px]'"
              [style.background-color]="
                isActive(item.route) ? 'var(--color-primary)' : 'transparent'
              "
            >
              <i
                class="text-[20px] leading-none flex-shrink-0"
                [class]="isActive(item.route) ? item.activeIcon : item.icon"
                style="color: white;"
              ></i>
              <span
                *ngIf="isActive(item.route)"
                class="text-white text-xs font-semibold whitespace-nowrap overflow-hidden"
                style="max-width: 80px;"
                >{{ item.label }}</span
              >
            </a>
          </div>
        </nav>
      </div>
    </div>

 
  `,
})
export class SettingsLayoutComponent implements OnInit {
  user: User | null = null;
  currentUrl = "";
  showLogout = false;
  navHidden = false;
  private lastScrollTop = 0;
  private scrollThreshold = 10;

  private readonly headerHiddenRoutes = [
    "/client/salon/",
    "/client/map",
    "/client/search",
  ];

  // Add this right below it:
  private readonly navHiddenRoutes = ["/client/map", "/client/search"];

  get hideNav(): boolean {
    return this.navHiddenRoutes.some((prefix) =>
      this.currentUrl.startsWith(prefix),
    );
  }

  get hideHeader(): boolean {
    return this.headerHiddenRoutes.some((prefix) =>
      this.currentUrl.startsWith(prefix),
    );
  }

  navItems = [
    {
      label: "Home",
      icon: "ri-home-5-line",
      activeIcon: "ri-home-5-fill",
      route: "/client/home",
    },
    {
      label: "Discover",
      icon: "ri-compass-3-line",
      activeIcon: "ri-compass-3-fill",
      route: "/client/discover",
    },
    {
      label: "My Bookings",
      icon: "ri-calendar-event-line",
      activeIcon: "ri-calendar-event-fill",
      route: "/client/bookings",
    },
    {
      label: "Favorites",
      icon: "ri-heart-3-line",
      activeIcon: "ri-heart-3-fill",
      route: "/client/favorites",
    },
    {
      label: "Notifications",
      icon: "ri-notification-3-line",
      activeIcon: "ri-notification-3-fill",
      route: "/client/notifications",
    },
    {
      label: "Promotions",
      icon: "ri-price-tag-3-line",
      activeIcon: "ri-price-tag-3-fill",
      route: "/client/promotions",
    },
    {
      label: "Referral",
      icon: "ri-gift-2-line",
      activeIcon: "ri-gift-2-fill",
      route: "/client/referral",
    },
    {
      label: "Settings",
      icon: "ri-settings-4-line",
      activeIcon: "ri-settings-4-fill",
      route: "/client/settings",
    },
  ];

  // 4 tabs: Home, Discover, Bookings, Settings (no Profile — it lives in Settings)
  mobileNavItems = [
    {
      label: "Home",
      icon: "ri-home-5-line",
      activeIcon: "ri-home-5-fill",
      route: "/client/home",
    },
    {
      label: "Discover",
      icon: "ri-compass-3-line",
      activeIcon: "ri-compass-3-fill",
      route: "/client/discover",
    },
    {
      label: "Bookings",
      icon: "ri-calendar-event-line",
      activeIcon: "ri-calendar-event-fill",
      route: "/client/bookings",
    },
    {
      label: "Settings",
      icon: "ri-settings-4-line",
      activeIcon: "ri-settings-4-fill",
      route: "/client/settings",
    },
  ];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.user;
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl = (e as NavigationEnd).urlAfterRedirects;
        this.navHidden = false;
      });
    this.currentUrl = this.router.url;
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const diff = scrollTop - this.lastScrollTop;
    if (Math.abs(diff) < this.scrollThreshold) return;
    this.navHidden = diff > 0 && scrollTop > 60;
    this.lastScrollTop = scrollTop;
  }

  isActive(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  logout(): void {
    this.showLogout = false;
    this.authService.logout();
  }
}
