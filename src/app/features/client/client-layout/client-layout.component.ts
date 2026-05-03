import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { User } from '../../../core/models';

interface NavItem {
  label: string;
  icon: string;
  activeIcon: string;
  route: string;
}

@Component({
  selector: 'app-client-layout',
  template: `
    <div class="flex h-screen overflow-hidden" style="background-color: var(--color-bg-primary)">

      <!-- ========== DESKTOP SIDEBAR ========== -->
      <aside
        class="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 h-full border-r overflow-y-auto"
        style="background-color: var(--color-bg-primary); border-color: var(--color-border-light)"
      >
        <!-- Logo -->
        <div class="flex items-center gap-3 px-6 py-6 border-b" style="border-color: var(--color-border-light)">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center"
            style="background-color: var(--color-primary)">
            <i class="ri-scissors-line text-white text-lg"></i>
          </div>
          <span class="text-xl font-bold" style="color: var(--color-text-primary)">BeautyHub</span>
        </div>

        <!-- User mini card -->
        <div class="px-4 py-4 border-b" style="border-color: var(--color-border-light)">
          <div class="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
            style="background-color: var(--color-bg-secondary)"
            [routerLink]="['/client/profile']">
            <img *ngIf="user?.avatar" [src]="user!.avatar" [alt]="user?.name"
              class="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
            <div *ngIf="!user?.avatar"
              class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style="background-color: var(--color-primary)">
              {{ user?.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold truncate" style="color: var(--color-text-primary)">
                {{ user?.name }}
              </p>
              <p class="text-xs truncate" style="color: var(--color-text-secondary)">
                {{ user?.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Nav links -->
        <nav class="flex-1 px-4 py-4 space-y-1">
          <a
            *ngFor="let item of navItems"
            [routerLink]="[item.route]"
            class="nav-link"
            [class.active]="isActive(item.route)"
          >
            <i class="text-lg"
               [class]="isActive(item.route) ? item.activeIcon : item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <!-- Bottom sidebar actions -->
        <div class="px-4 py-4 border-t space-y-1" style="border-color: var(--color-border-light)">
          <!-- Theme toggle -->
          <button
            (click)="toggleTheme()"
            class="nav-link w-full text-left"
          >
            <i class="text-lg" [class]="themeService.isDark ? 'ri-sun-line' : 'ri-moon-line'"></i>
            <span>{{ themeService.isDark ? 'Light mode' : 'Dark mode' }}</span>
          </button>

          <!-- Settings -->
          <a routerLink="/client/settings" class="nav-link" [class.active]="isActive('/client/settings')">
            <i class="ri-settings-4-line text-lg"></i>
            <span>Settings</span>
          </a>

          <!-- Logout -->
          <button (click)="showLogout = true" class="nav-link w-full text-left text-red-500 hover:bg-red-50">
            <i class="ri-logout-box-r-line text-lg text-red-500"></i>
            <span class="text-red-500">Log out</span>
          </button>
        </div>
      </aside>

      <!-- ========== MAIN CONTENT AREA ========== -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- Mobile top bar -->
        <header class="lg:hidden flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style="background-color: var(--color-bg-primary); border-color: var(--color-border-light)">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center"
              style="background-color: var(--color-primary)">
              <i class="ri-scissors-line text-white text-xs"></i>
            </div>
            <span class="font-bold text-base" style="color: var(--color-text-primary)">BeautyHub</span>
          </div>
          <div class="flex items-center gap-2">
            <a routerLink="/client/notifications"
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background-color: var(--color-bg-secondary)">
              <i class="ri-notification-3-line text-base" style="color: var(--color-primary)"></i>
            </a>
            <button (click)="toggleTheme()"
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background-color: var(--color-bg-secondary)">
              <i class="text-base" [class]="themeService.isDark ? 'ri-sun-line' : 'ri-moon-line'"
                style="color: var(--color-text-secondary)"></i>
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <router-outlet></router-outlet>
        </main>

        <!-- ========== MOBILE BOTTOM TAB BAR ========== -->
        <nav class="lg:hidden flex-shrink-0 fixed bottom-0 left-0 right-0 px-4 pb-4 z-40">
          <div class="flex items-center justify-around rounded-[28px] h-[62px] px-3"
            style="background-color: rgba(0,0,0,0.93); box-shadow: 0 -4px 20px rgba(0,0,0,0.2)">
            <a
              *ngFor="let item of mobileNavItems"
              [routerLink]="[item.route]"
              class="flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-200"
              [style.background-color]="isActive(item.route) ? 'var(--color-primary)' : 'transparent'"
            >
              <i class="text-xl text-white"
                [class]="isActive(item.route) ? item.activeIcon : item.icon"></i>
            </a>
          </div>
        </nav>
      </div>

      <!-- Logout Modal -->
      <app-confirm-modal
        [visible]="showLogout"
        title="Log out"
        message="Are you sure you want to log out?"
        type="warning"
        confirmText="Log out"
        cancelText="Cancel"
        [showCancel]="true"
        (confirmed)="logout()"
        (closed)="showLogout = false"
      ></app-confirm-modal>
    </div>
  `,
})
export class ClientLayoutComponent implements OnInit {
  user: User | null = null;
  currentUrl = '';
  showLogout = false;

  navItems: NavItem[] = [
    { label: 'Home', icon: 'ri-home-5-line', activeIcon: 'ri-home-5-fill', route: '/client/home' },
    { label: 'Discover', icon: 'ri-compass-3-line', activeIcon: 'ri-compass-3-fill', route: '/client/discover' },
    { label: 'My Bookings', icon: 'ri-calendar-event-line', activeIcon: 'ri-calendar-event-fill', route: '/client/bookings' },
    { label: 'Favorites', icon: 'ri-heart-3-line', activeIcon: 'ri-heart-3-fill', route: '/client/favorites' },
    { label: 'Notifications', icon: 'ri-notification-3-line', activeIcon: 'ri-notification-3-fill', route: '/client/notifications' },
    { label: 'Wallet', icon: 'ri-wallet-3-line', activeIcon: 'ri-wallet-3-fill', route: '/client/wallet' },
    { label: 'Promotions', icon: 'ri-price-tag-3-line', activeIcon: 'ri-price-tag-3-fill', route: '/client/promotions' },
    { label: 'Referral', icon: 'ri-gift-2-line', activeIcon: 'ri-gift-2-fill', route: '/client/referral' },
    { label: 'Profile', icon: 'ri-user-3-line', activeIcon: 'ri-user-3-fill', route: '/client/profile' },
  ];

  mobileNavItems = [
    { label: 'Home', icon: 'ri-home-5-line', activeIcon: 'ri-home-5-fill', route: '/client/home' },
    { label: 'Discover', icon: 'ri-compass-3-line', activeIcon: 'ri-compass-3-fill', route: '/client/discover' },
    { label: 'Bookings', icon: 'ri-calendar-event-line', activeIcon: 'ri-calendar-event-fill', route: '/client/bookings' },
    { label: 'Profile', icon: 'ri-user-3-line', activeIcon: 'ri-user-3-fill', route: '/client/profile' },
  ];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.user;

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.currentUrl = (e as NavigationEnd).urlAfterRedirects;
      });

    this.currentUrl = this.router.url;
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
