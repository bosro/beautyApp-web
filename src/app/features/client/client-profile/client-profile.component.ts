// settings.component.ts — replace your entire file with this

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@core/services/auth.service";
import { ThemeService } from "@core/services/theme.service";
import { ToastService } from "@core/services/toast.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { User } from "@core/models";

@Component({
  selector: "app-settings",
  standalone: false,
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="settings-header">
        <h1 class="settings-title">Profile</h1>
      </div>

      <div class="settings-body">
        <!-- Profile card -->
        <div class="profile-card" (click)="navigate('/client/profile')">
          <div class="profile-avatar">
            <img *ngIf="user?.avatar" [src]="user!.avatar" [alt]="user?.name" />
            <div *ngIf="!user?.avatar" class="avatar-fallback">
              {{ user?.name?.charAt(0)?.toUpperCase() }}
            </div>
          </div>
          <div class="profile-info">
            <p class="profile-name">{{ user?.name || "Guest" }}</p>
            <p class="profile-email">{{ user?.email }}</p>
          </div>
        </div>

        <!-- Menu rows -->
        <div class="menu-list">
          <button class="menu-row" (click)="navigate('/client/profile')">
            <div class="menu-row-left">
              <i class="ri-user-line"></i>
              <span>Manage Profile</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row">
            <div class="menu-row-left">
              <i class="ri-lock-line"></i>
              <span>Password & Security</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <!-- <button class="menu-row" (click)="navigate('/client/notifications')">
            <div class="menu-row-left">
              <i class="ri-notification-3-line"></i>
              <span>Notifications</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button> -->

          <!-- Theme inline toggle -->
          <div class="menu-row">
            <div class="menu-row-left">
              <i class="ri-contrast-2-line"></i>
              <span>Theme</span>
            </div>
            <div class="theme-toggle">
              <button
                *ngFor="let t of themes"
                (click)="setTheme(t.value)"
                class="theme-btn"
                [class.theme-btn-active]="currentTheme === t.value"
              >
                {{ t.label }}
              </button>
            </div>
          </div>

          <button class="menu-row" (click)="navigate('/client/bookings')">
            <div class="menu-row-left">
              <i class="ri-calendar-event-line"></i>
              <span>Appointments</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row" (click)="navigate('/client/referral')">
            <div class="menu-row-left">
              <i class="ri-gift-2-line"></i>
              <span>Referral</span>
            </div>
            <div class="menu-row-right">
              <span class="new-badge">New</span>
              <i class="ri-arrow-right-s-line menu-arrow"></i>
            </div>
          </button>

          <!-- <button class="menu-row" (click)="navigate('/client/about')">
            <div class="menu-row-left">
              <i class="ri-information-line"></i>
              <span>About Us</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button> -->

          <!-- <button class="menu-row" (click)="navigate('/client/support')">
            <div class="menu-row-left">
              <i class="ri-question-line"></i>
              <span>Help Center</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button> -->

          <button class="menu-row" (click)="navigate('/client/support')">
            <div class="menu-row-left">
              <i class="ri-customer-service-2-line"></i>
              <span>Contact Us</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row" (click)="navigate('/client/privacy-policy')">
            <div class="menu-row-left">
              <i class="ri-shield-check-line"></i>
              <span>Privacy Policy</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row" (click)="navigate('/client/terms')">
            <div class="menu-row-left">
              <i class="ri-file-text-line"></i>
              <span>Terms of Service</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button
            class="menu-row danger-row"
            (click)="showLogoutModal = true"
            [disabled]="loggingOut"
          >
            <div class="menu-row-left danger">
              <i class="ri-logout-box-r-line"></i>
              <span>{{ loggingOut ? "Logging out..." : "Log Out" }}</span>
            </div>
          </button>

          <button class="menu-row danger-row" (click)="showDeleteModal = true">
            <div class="menu-row-left danger">
              <i class="ri-delete-bin-line"></i>
              <span>Delete Account</span>
            </div>
          </button>
        </div>

        <p class="version-label">Bigluxx v1.0.0</p>
      </div>

      <!-- Logout Modal -->
      <app-confirm-modal
        [visible]="showLogoutModal"
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        type="warning"
        [loading]="loggingOut"
        (confirmed)="logout()"
        (cancelled)="showLogoutModal = false"
        (closed)="showLogoutModal = false"
      >
      </app-confirm-modal>

      <!-- Delete Modal -->
      <app-confirm-modal
        [visible]="showDeleteModal"
        title="Delete Account"
        message="This will permanently delete your account and all data. This cannot be undone."
        confirmText="Delete Account"
        type="error"
        [loading]="deleting"
        (confirmed)="deleteAccount()"
        (cancelled)="showDeleteModal = false"
        (closed)="showDeleteModal = false"
      >
      </app-confirm-modal>
    </div>
  `,
  styles: [
    `
      .settings-page {
        min-height: 100vh;
        background-color: var(--color-bg-primary);
        padding-bottom: 100px;
      }

      /* Header */
      .settings-header {
        padding: 20px 20px 12px;
        background-color: var(--color-bg-primary);
      }
      .settings-title {
        font-size: 22px;
        font-weight: 700;
        color: var(--color-text-primary);
        text-align: center;
      }

      .settings-body {
        padding: 8px 20px 0;
        max-width: 560px;
        margin: 0 auto;
      }

      /* Profile card */
      .profile-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        border-radius: 20px;
        background-color: var(--color-bg-secondary);
        cursor: pointer;
        margin-bottom: 24px;
        transition: opacity 0.2s;
      }
      .profile-card:active {
        opacity: 0.75;
      }

      .profile-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        overflow: hidden;
        flex-shrink: 0;
      }
      .profile-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar-fallback {
        width: 100%;
        height: 100%;
        background-color: var(--color-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        font-weight: 700;
      }

      .profile-name {
        font-size: 17px;
        font-weight: 700;
        color: var(--color-text-primary);
      }
      .profile-email {
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-top: 2px;
      }

      /* Menu list */
      .menu-list {
        background-color: var(--color-bg-secondary);
        border-radius: 20px;
        overflow: hidden;
      }

      .menu-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 16px 18px;
        background: none;
        border: none;
        border-bottom: 1px solid var(--color-border-light);
        cursor: pointer;
        transition: background 0.15s;
        text-align: left;
      }
      .menu-row:last-child {
        border-bottom: none;
      }
      .menu-row:active {
        background-color: var(--color-bg-primary);
      }
      .menu-row:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .menu-row-left {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 15px;
        font-weight: 500;
        color: var(--color-text-primary);
      }
      .menu-row-left i {
        font-size: 20px;
        color: var(--color-text-primary);
        width: 22px;
        text-align: center;
      }

      .menu-row-right {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .menu-arrow {
        font-size: 20px;
        color: var(--color-text-secondary);
      }

      /* New badge */
      .new-badge {
        font-size: 10px;
        font-weight: 700;
        color: #fff;
        background-color: #4caf50;
        padding: 2px 7px;
        border-radius: 20px;
      }

      /* Theme toggle inline */
      .theme-toggle {
        display: flex;
        gap: 4px;
        background-color: var(--color-bg-primary);
        border-radius: 10px;
        padding: 3px;
      }
      .theme-btn {
        padding: 4px 10px;
        border-radius: 7px;
        border: none;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        background: transparent;
        color: var(--color-text-secondary);
        font-family: inherit;
        transition: all 0.15s;
      }
      .theme-btn-active {
        background-color: var(--color-primary);
        color: white;
      }

      /* Danger rows */
      .danger-row .menu-row-left {
        color: #ef4444;
      }
      .danger-row .menu-row-left i {
        color: #ef4444;
      }

      /* Version */
      .version-label {
        text-align: center;
        font-size: 12px;
        color: var(--color-text-secondary);
        margin-top: 20px;
        opacity: 0.6;
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  currentTheme = "system";
  showLogoutModal = false;
  showDeleteModal = false;
  loggingOut = false;
  deleting = false;
  user: User | null = null;

  themes = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "Auto", value: "system" },
  ];

  constructor(
    private router: Router,
    private auth: AuthService,
    private themeService: ThemeService,
    private toast: ToastService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.currentTheme = this.themeService.getMode();
    this.user = this.auth.user;
  }

  setTheme(mode: string) {
    this.currentTheme = mode;
    this.themeService.setMode(mode as any);
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.loggingOut = true;
    this.showLogoutModal = false;
    try {
      this.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    this.loggingOut = false;
    this.router.navigate(["/auth/login"]);
  }

  deleteAccount() {
    this.deleting = true;
    this.http.delete(`${environment.apiUrl}/users/account`).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(["/auth/login"]);
        this.toast.success("Account deleted");
      },
      error: () => {
        this.deleting = false;
        this.toast.error("Failed to delete account");
      },
    });
  }
}
