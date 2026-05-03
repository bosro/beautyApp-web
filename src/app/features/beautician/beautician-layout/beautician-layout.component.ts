import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-beautician-layout',
  standalone: false,
  template: `
    <div class="flex h-screen bg-[var(--color-background)] overflow-hidden">

      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex flex-col w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex-shrink-0">

        <!-- Logo -->
        <div class="p-5 border-b border-[var(--color-border)]">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center">
              <i class="ri-scissors-line text-white text-lg"></i>
            </div>
            <div>
              <span class="font-bold text-[var(--color-text-primary)]">BeautyHub</span>
              <p class="text-[10px] text-[var(--color-primary)] font-medium">Business</p>
            </div>
          </div>
        </div>

        <!-- Business Card -->
        <div class="p-4 border-b border-[var(--color-border)]">
          <div class="flex items-center gap-3">
            <img
              [src]="user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.businessName + '&size=40&background=E88B7B&color=fff'"
              alt="Business"
              class="w-10 h-10 rounded-xl object-cover"
            />
            <div class="min-w-0">
              <p class="text-sm font-semibold text-[var(--color-text-primary)] truncate">{{ user?.businessName || user?.firstName }}</p>
              <p class="text-xs text-[var(--color-text-muted)] truncate">{{ user?.email }}</p>
            </div>
          </div>
        </div>

        <!-- Nav Links -->
        <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
          <a *ngFor="let link of navLinks"
            [routerLink]="link.path"
            class="nav-link"
            [ngClass]="{'nav-link-active': isActive(link.path)}">
            <i [ngClass]="link.icon" class="text-xl"></i>
            <span>{{ link.label }}</span>
            <span *ngIf="link.badge" class="ml-auto bg-[var(--color-primary)] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{{ link.badge }}</span>
          </a>
        </nav>

        <!-- Bottom -->
        <div class="p-3 border-t border-[var(--color-border)] space-y-1">
          <button (click)="toggleTheme()" class="nav-link w-full">
            <i [ngClass]="isDark ? 'ri-sun-line' : 'ri-moon-line'" class="text-xl"></i>
            <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
          <a routerLink="/beautician/business-profile" class="nav-link" [ngClass]="{'nav-link-active': isActive('/beautician/business-profile')}">
            <i class="ri-settings-3-line text-xl"></i>
            <span>Settings</span>
          </a>
          <button (click)="showLogoutModal = true" class="nav-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <i class="ri-logout-box-r-line text-xl"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <!-- Main -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

        <!-- Mobile Top Bar -->
        <header class="lg:hidden flex items-center px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center">
            <i class="ri-scissors-line text-white text-sm"></i>
          </div>
          <span class="font-bold text-[var(--color-text-primary)] flex-1">BeautyHub Business</span>
          <button (click)="toggleTheme()" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]">
            <i [ngClass]="isDark ? 'ri-sun-line' : 'ri-moon-line'" class="text-[var(--color-text-secondary)]"></i>
          </button>
        </header>

        <!-- Scroll Area -->
        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>

        <!-- Mobile Bottom Nav -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] px-2 py-2 flex items-center justify-around z-50">
          <a *ngFor="let tab of mobileTabs"
            [routerLink]="tab.path"
            class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors relative"
            [ngClass]="isActive(tab.path) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'">
            <i [ngClass]="tab.icon" class="text-xl"></i>
            <span class="text-[10px] font-medium">{{ tab.label }}</span>
            <span *ngIf="tab.badge" class="absolute -top-1 right-1 w-4 h-4 bg-[var(--color-primary)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{{ tab.badge }}</span>
          </a>
        </nav>

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
      (cancelled)="showLogoutModal = false">
    </app-confirm-modal>
  `,
})
export class BeauticianLayoutComponent implements OnInit, OnDestroy {
  user: any = null;
  currentUrl = '';
  showLogoutModal = false;
  isDark = false;
  private destroy$ = new Subject<void>();

  navLinks = [
    { path: '/beautician/dashboard', label: 'Dashboard', icon: 'ri-dashboard-line', badge: null },
    { path: '/beautician/bookings', label: 'Bookings', icon: 'ri-calendar-line', badge: null },
    { path: '/beautician/services', label: 'Services', icon: 'ri-scissors-2-line', badge: null },
    { path: '/beautician/schedule', label: 'Schedule', icon: 'ri-time-line', badge: null },
    { path: '/beautician/earnings', label: 'Earnings', icon: 'ri-money-dollar-circle-line', badge: null },
    { path: '/beautician/reviews', label: 'Reviews', icon: 'ri-star-line', badge: null },
    { path: '/beautician/clients', label: 'Clients', icon: 'ri-group-line', badge: null },
    { path: '/beautician/profile', label: 'My Profile', icon: 'ri-user-line', badge: null },
  ];

  mobileTabs = [
    { path: '/beautician/dashboard', label: 'Home', icon: 'ri-dashboard-line', badge: null },
    { path: '/beautician/bookings', label: 'Bookings', icon: 'ri-calendar-line', badge: null },
    { path: '/beautician/services', label: 'Services', icon: 'ri-scissors-2-line', badge: null },
    { path: '/beautician/earnings', label: 'Earnings', icon: 'ri-money-dollar-circle-line', badge: null },
    { path: '/beautician/profile', label: 'Profile', icon: 'ri-user-line', badge: null },
  ];

  constructor(
    private router: Router,
    private auth: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe(u => this.user = u);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((e: any) => this.currentUrl = e.urlAfterRedirects);
    this.currentUrl = this.router.url;
    this.isDark = this.themeService.getMode() === 'dark';
  }

  isActive(path: string) { return this.currentUrl.startsWith(path); }

  toggleTheme() {
    const next = this.isDark ? 'light' : 'dark';
    this.isDark = !this.isDark;
    this.themeService.setMode(next as any);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
