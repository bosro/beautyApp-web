// client-layout.component.ts - complete rewrite
import { Component, OnInit, HostListener, ElementRef } from "@angular/core";
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
      <!-- Desktop Sidebar -->
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

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- Mobile top bar -->
        <!-- Mobile top bar -->
        <header
          class="lg:hidden flex items-center justify-between px-4 py-3 border-b flex-shrink-0 relative"
          style="background-color: var(--color-bg-primary); border-color: var(--color-border-light)"
        >
          <!-- Left: User avatar -->
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

          <!-- Center: Logo (absolutely centered) -->
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

          <!-- Right: Notifications + theme toggle -->
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
          #mainContent
          class="flex-1 overflow-y-auto pb-20 lg:pb-0"
          (scroll)="onScroll($event)"
        >
          <router-outlet></router-outlet>
        </main>

        <!-- Mobile Bottom Tab Bar — hides on scroll down -->
        <nav
          class="lg:hidden fixed bottom-0 left-0 right-0 px-4 pb-4 z-40 transition-transform duration-300"
          [ngClass]="navHidden ? 'translate-y-full' : 'translate-y-0'"
        >
          <div
            class="flex items-center justify-around rounded-[28px] h-[62px] px-3"
            style="background-color: rgba(0,0,0,0.93); box-shadow: 0 -4px 20px rgba(0,0,0,0.2)"
          >
            <a
              *ngFor="let item of mobileNavItems"
              [routerLink]="item.route !== 'more' ? item.route : null"
              (click)="item.route === 'more' ? (showMoreSheet = true) : null"
              class="flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200"
              [style.background-color]="
                item.route !== 'more' && isActive(item.route)
                  ? 'var(--color-primary)'
                  : item.route === 'more' && showMoreSheet
                    ? 'var(--color-primary)'
                    : 'transparent'
              "
            >
              <i
                class="text-xl text-white"
                [class]="isActive(item.route) ? item.activeIcon : item.icon"
              ></i>
            </a>
          </div>
        </nav>
      </div>
    </div>

    <!-- Bottom Sheet Overlay -->
    <div
      *ngIf="showMoreSheet"
      class="fixed inset-0 bg-black/50 z-50 lg:hidden"
      (click)="showMoreSheet = false"
    ></div>

    <!-- Bottom Sheet -->
    <div
      class="fixed bottom-0 left-0 right-0 lg:hidden transition-transform duration-300 ease-out z-50"
      [ngClass]="showMoreSheet ? 'translate-y-0' : 'translate-y-full'"
    >
      <div
        class="bg-[var(--color-surface)] rounded-t-2xl p-4 pb-10 shadow-2xl"
        (click)="$event.stopPropagation()"
      >
        <div
          class="w-10 h-1 bg-[var(--color-border)] rounded-full mx-auto mb-4"
        ></div>
        <h3 class="font-semibold text-[var(--color-text-primary)] mb-4 px-1">
          More
        </h3>

        <div class="grid grid-cols-4 gap-3">
          <button
            *ngFor="let item of moreItems"
            (click)="navigateTo(item.route)"
            class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[var(--color-background)] transition-colors active:scale-95"
          >
            <div
              class="w-12 h-12 rounded-2xl flex items-center justify-center"
              [ngStyle]="{ 'background-color': item.bg }"
            >
              <i
                [class]="item.icon + ' text-2xl'"
                [ngStyle]="{ color: item.color }"
              ></i>
            </div>
            <span
              class="text-xs font-medium text-[var(--color-text-secondary)] text-center leading-tight"
              >{{ item.label }}</span
            >
          </button>
        </div>

        <div class="border-t border-[var(--color-border)] mt-4 pt-3">
          <button
            (click)="showLogout = true; showMoreSheet = false"
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

    <!-- Logout Modal -->
    <app-confirm-modal
      *ngIf="showLogout"
      title="Log out"
      message="Are you sure you want to log out?"
      type="warning"
      confirmText="Log out"
      (confirmed)="logout()"
      (cancelled)="showLogout = false"
    >
    </app-confirm-modal>
  `,
})
export class ClientLayoutComponent implements OnInit {
  user: User | null = null;
  currentUrl = "";
  showLogout = false;
  showMoreSheet = false;
  navHidden = false;
  private lastScrollTop = 0;
  private scrollThreshold = 10;

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
    // {
    //   label: "Wallet",
    //   icon: "ri-wallet-3-line",
    //   activeIcon: "ri-wallet-3-fill",
    //   route: "/client/wallet",
    // },
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
      label: "Profile",
      icon: "ri-user-3-line",
      activeIcon: "ri-user-3-fill",
      route: "/client/profile",
    },
  ];

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
      label: "Profile",
      icon: "ri-user-3-line",
      activeIcon: "ri-user-3-fill",
      route: "/client/profile",
    },
    {
      label: "More",
      icon: "ri-settings-line",
      activeIcon: "ri-settings-fill",
      route: "more",
    },
  ];

  moreItems = [
    {
      label: "Favorites",
      icon: "ri-heart-3-line",
      route: "/client/favorites",
      bg: "#FFF0F0",
      color: "#EF4444",
    },
    {
      label: "Notifications",
      icon: "ri-notification-3-line",
      route: "/client/notifications",
      bg: "#EEF2FF",
      color: "#6366F1",
    },
    // {
    //   label: "Wallet",
    //   icon: "ri-wallet-3-line",
    //   route: "/client/wallet",
    //   bg: "#F0FDF4",
    //   color: "#22C55E",
    // },
    {
      label: "Promotions",
      icon: "ri-price-tag-3-line",
      route: "/client/promotions",
      bg: "#FDF4FF",
      color: "#A855F7",
    },
    {
      label: "Referral",
      icon: "ri-gift-2-line",
      route: "/client/referral",
      bg: "#FFFBEB",
      color: "#F59E0B",
    },
    {
      label: "Settings",
      icon: "ri-settings-4-line",
      route: "/client/settings",
      bg: "#F8FAFC",
      color: "#64748B",
    },
    {
      label: "Support",
      icon: "ri-customer-service-2-line",
      route: "/client/support",
      bg: "#EFF6FF",
      color: "#3B82F6",
    },
    {
      label: "Profile",
      icon: "ri-user-3-line",
      route: "/client/profile",
      bg: "#FFF7ED",
      color: "#F97316",
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
        // Show nav on every route change
        this.navHidden = false;
        this.showMoreSheet = false;
      });
    this.currentUrl = this.router.url;
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const diff = scrollTop - this.lastScrollTop;

    if (Math.abs(diff) < this.scrollThreshold) return;

    if (diff > 0 && scrollTop > 60) {
      // Scrolling down — hide nav
      this.navHidden = true;
    } else {
      // Scrolling up — show nav
      this.navHidden = false;
    }

    this.lastScrollTop = scrollTop;
  }

  isActive(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  navigateTo(route: string) {
    this.showMoreSheet = false;
    this.router.navigate([route]);
  }

  logout(): void {
    this.showLogout = false;
    this.authService.logout();
  }
}
