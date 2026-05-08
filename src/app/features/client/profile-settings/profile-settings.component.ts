// profile-settings.component.ts
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeService } from "../../../core/services/theme.service";
import { User } from "../../../core/models";

interface SettingsItem {
  icon: string;
  label: string;
  route?: string;
  action?: string;
  value?: string;
  danger?: boolean;
}

@Component({
  selector: "app-profile-settings",
  template: `
    <div
      class="page-enter pb-36"
      style="background-color: var(--color-bg-primary); min-height: 100vh;"
    >
      <!-- ===== HEADER ===== -->
      <div class="flex items-center justify-center px-4 pt-6 pb-5">
        <h1 class="text-lg font-bold" style="color: var(--color-text-primary)">
          Profile
        </h1>
      </div>

      <!-- ===== USER CARD ===== -->
      <div class="mx-4 mb-6">
        <div
          class="flex items-center gap-4 p-4 rounded-2xl"
          style="background-color: var(--color-bg-secondary)"
        >
          <div class="relative flex-shrink-0">
            <img
              *ngIf="user?.avatar"
              [src]="user!.avatar"
              [alt]="user?.name"
              class="w-16 h-16 rounded-full object-cover"
            />
            <div
              *ngIf="!user?.avatar"
              class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style="background-color: var(--color-primary)"
            >
              {{ user?.name?.charAt(0)?.toUpperCase() }}
            </div>
            <button
              class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow"
              style="background-color: var(--color-primary)"
            >
              <i class="ri-pencil-line text-white" style="font-size: 11px;"></i>
            </button>
          </div>

          <div class="flex-1 min-w-0">
            <p
              class="font-bold text-base truncate"
              style="color: var(--color-text-primary)"
            >
              {{ user?.name || "Guest User" }}
            </p>
            <p
              class="text-xs mt-0.5 truncate"
              style="color: var(--color-text-secondary)"
            >
              {{ user?.email || "" }}
            </p>
          </div>
        </div>
      </div>

      <!-- ===== FLAT SETTINGS LIST ===== -->
      <div class="px-4">
        <div
          *ngFor="let item of allItems; let last = last"
          (click)="handleItem(item)"
          class="flex items-center gap-4 py-4 cursor-pointer active:opacity-60 transition-opacity"
          [style.border-bottom]="
            last ? 'none' : '1px solid var(--color-border-light)'
          "
        >
          <!-- Icon -->
          <i
            class="text-xl flex-shrink-0"
            [class]="item.icon"
            [style.color]="
              item.danger ? '#ef4444' : 'var(--color-text-primary)'
            "
          ></i>

          <!-- Label -->
          <span
            class="flex-1 text-sm font-medium"
            [style.color]="
              item.danger ? '#ef4444' : 'var(--color-text-primary)'
            "
          >
            {{ item.label }}
          </span>

          <!-- Optional value hint -->
          <span
            *ngIf="item.value"
            class="text-xs mr-1"
            style="color: var(--color-text-secondary)"
            >{{ item.value }}</span
          >

          <!-- Chevron -->
          <i
            class="ri-arrow-right-s-line text-xl flex-shrink-0"
            [style.color]="
              item.danger ? '#ef4444' : 'var(--color-text-secondary)'
            "
          ></i>
        </div>
      </div>

      <!-- App version -->
      <p
        class="text-center text-xs mt-8"
        style="color: var(--color-text-secondary)"
      >
        Bigluxx v1.0.0
      </p>
    </div>

    <!-- Logout Confirm Modal -->
    <app-confirm-modal
      *ngIf="showLogout"
      title="Log out"
      message="Are you sure you want to log out?"
      type="warning"
      confirmText="Log out"
      (confirmed)="logout()"
      (cancelled)="showLogout = false"
    ></app-confirm-modal>
  `,
})
export class ProfileSettingsComponent implements OnInit {
  user: User | null = null;
  showLogout = false;
  allItems: SettingsItem[] = [];

  constructor(
    private authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.user;
    this.buildItems();
  }

  private buildItems(): void {
    this.allItems = [
      {
        icon: "ri-user-settings-line",
        label: "Manage Profile",
        route: "/client/profile/edit",
      },
      {
        icon: "ri-lock-password-line",
        label: "Password & Security",
        route: "/client/settings/security",
      },
      {
        icon: "ri-notification-3-line",
        label: "Notifications",
        route: "/client/notifications",
      },
      {
        icon: "ri-global-line",
        label: "Language",
        value: "English",
        route: "/client/settings/language",
      },
      {
        icon: "ri-information-line",
        label: "About Us",
        route: "/client/about",
      },
      {
        icon: this.themeService.isDark ? "ri-sun-line" : "ri-moon-line",
        label: "Theme",
        value: this.themeService.isDark ? "Dark" : "Light",
        action: "toggleTheme",
      },
      {
        icon: "ri-calendar-event-line",
        label: "Appointments",
        route: "/client/bookings",
      },
      {
        icon: "ri-customer-service-2-line",
        label: "Help Center",
        route: "/client/support",
      },
      { icon: "ri-phone-line", label: "Contact Us", route: "/client/contact" },
      {
        icon: "ri-heart-3-line",
        label: "Favorites",
        route: "/client/favorites",
      },
      {
        icon: "ri-price-tag-3-line",
        label: "Promotions",
        route: "/client/promotions",
      },
      { icon: "ri-gift-2-line", label: "Referral", route: "/client/referral" },
      {
        icon: "ri-logout-box-r-line",
        label: "Log Out",
        action: "logout",
        danger: true,
      },
    ];
  }

  handleItem(item: SettingsItem): void {
    if (item.action === "logout") {
      this.showLogout = true;
      return;
    }
    if (item.action === "toggleTheme") {
      this.themeService.toggle();
      this.buildItems();
      return;
    }
    if (item.route) this.router.navigate([item.route]);
  }

  logout(): void {
    this.showLogout = false;
    this.authService.logout();
  }
}
