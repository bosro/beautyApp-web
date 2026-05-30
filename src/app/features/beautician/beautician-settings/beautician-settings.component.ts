// beautician-settings.component.ts — updated
// Changes vs previous: added Products and Courses rows to the Business section

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@core/services/auth.service";
import { ThemeService } from "@core/services/theme.service";
import { ToastService } from "@core/services/toast.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";

@Component({
  selector: "app-beautician-settings",
  standalone: false,
  template: `
    <div class="settings-page">
      <!-- Header -->
      <div class="settings-header">
        <h1 class="settings-title">Settings</h1>
      </div>

      <div class="settings-body">
        <!-- Profile card -->
        <div class="profile-card" (click)="navigate('/beautician/profile')">
          <div class="profile-avatar">
            <img
              *ngIf="user?.avatar || user?.profileImage"
              [src]="user?.avatar || user?.profileImage"
              alt="Business"
            />
            <div
              *ngIf="!user?.avatar && !user?.profileImage"
              class="avatar-fallback"
            >
              {{
                (user?.businessName || user?.firstName || user?.name || "B")
                  .charAt(0)
                  .toUpperCase()
              }}
            </div>
          </div>
          <div class="profile-info">
            <p class="profile-name">
              {{
                user?.businessName ||
                  user?.firstName ||
                  user?.name ||
                  "Business"
              }}
            </p>
            <p class="profile-email">{{ user?.email }}</p>
          </div>
          <i class="ri-arrow-right-s-line profile-arrow"></i>
        </div>

        <!-- ── Account ──────────────────────────────────────────────── -->
        <p class="section-label">Account</p>
        <div class="menu-list">
          <button class="menu-row" (click)="navigate('/beautician/profile')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#EEF2FF">
                <i class="ri-user-line" style="color:#6366F1"></i>
              </div>
              <span>My Profile</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button
            class="menu-row"
            (click)="navigate('/beautician/business-profile')"
          >
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#FDF4FF">
                <i class="ri-store-2-line" style="color:#A855F7"></i>
              </div>
              <span>Business Profile</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button
            class="menu-row"
            (click)="navigate('/beautician/verification')"
          >
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#F0FDF4">
                <i class="ri-shield-check-line" style="color:#16A34A"></i>
              </div>
              <span>Verification</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button
            class="menu-row"
            (click)="navigate('/settings/notification-preference')"
          >
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#FFF7ED">
                <i class="ri-notification-3-line" style="color:#F97316"></i>
              </div>
              <span>Notification Preference</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row" (click)="navigate('/settings/security')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#FFF7ED">
                <i class="ri-lock-line" style="color:#F97316"></i>
              </div>
              <span>Password &amp; Security</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>
        </div>

        <!-- ── Business ─────────────────────────────────────────────── -->
        <p class="section-label">Business</p>
        <div class="menu-list">
          <button class="menu-row" (click)="navigate('/beautician/services')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#FFF1F2">
                <i class="ri-scissors-2-line" style="color:#F43F5E"></i>
              </div>
              <span>Services</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row" (click)="navigate('/beautician/schedule')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#EFF6FF">
                <i class="ri-time-line" style="color:#3B82F6"></i>
              </div>
              <span>Schedule &amp; Availability</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row" (click)="navigate('/beautician/clients')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#F0FDF4">
                <i class="ri-group-line" style="color:#22C55E"></i>
              </div>
              <span>Clients</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row" (click)="navigate('/beautician/reviews')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#FFFBEB">
                <i class="ri-star-line" style="color:#F59E0B"></i>
              </div>
              <span>Reviews</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <!-- ── NEW: Products ── -->
          <button class="menu-row" (click)="navigate('/beautician/products')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#FFF1F2">
                <i class="ri-shopping-bag-3-line" style="color:#F43F5E"></i>
              </div>
              <span>Products</span>
            </div>
            <div class="menu-row-right">
              <span class="menu-badge">New</span>
              <i class="ri-arrow-right-s-line menu-arrow"></i>
            </div>
          </button>

          <!-- ── NEW: Courses ── -->
          <button class="menu-row" (click)="navigate('/beautician/courses')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#EEF2FF">
                <i class="ri-play-circle-line" style="color:#6366F1"></i>
              </div>
              <span>Courses &amp; Content</span>
            </div>
            <div class="menu-row-right">
              <span class="menu-badge">New</span>
              <i class="ri-arrow-right-s-line menu-arrow"></i>
            </div>
          </button>
        </div>

        <!-- ── Preferences ───────────────────────────────────────────── -->
        <p class="section-label">Preferences</p>
        <div class="menu-list">
          <div class="menu-row">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#F8FAFC">
                <i class="ri-contrast-2-line" style="color:#64748B"></i>
              </div>
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
        </div>

        <!-- ── Support ───────────────────────────────────────────────── -->
        <p class="section-label">Support</p>
        <div class="menu-list">
          <button class="menu-row" (click)="navigate('/beautician/support')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#F0F9FF">
                <i class="ri-customer-service-2-line" style="color:#0EA5E9"></i>
              </div>
              <span>Contact Us</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button
            class="menu-row"
            (click)="navigate('/beautician/privacy-policy')"
          >
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#F0FDF4">
                <i class="ri-shield-check-line" style="color:#22C55E"></i>
              </div>
              <span>Privacy Policy</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>

          <button class="menu-row" (click)="navigate('/beautician/terms')">
            <div class="menu-row-left">
              <div class="menu-icon-wrap" style="background:#FAFAF9">
                <i class="ri-file-text-line" style="color:#78716C"></i>
              </div>
              <span>Terms of Service</span>
            </div>
            <i class="ri-arrow-right-s-line menu-arrow"></i>
          </button>
        </div>

        <!-- ── Account Actions ───────────────────────────────────────── -->
        <p class="section-label">Account Actions</p>
        <div class="menu-list">
          <button
            class="menu-row danger-row"
            (click)="showLogoutModal = true"
            [disabled]="loggingOut"
          >
            <div class="menu-row-left danger">
              <div class="menu-icon-wrap" style="background:#FEF2F2">
                <i class="ri-logout-box-r-line" style="color:#EF4444"></i>
              </div>
              <span>{{ loggingOut ? "Logging out..." : "Log Out" }}</span>
            </div>
          </button>

          <button class="menu-row danger-row" (click)="showDeleteModal = true">
            <div class="menu-row-left danger">
              <div class="menu-icon-wrap" style="background:#FEF2F2">
                <i class="ri-delete-bin-line" style="color:#EF4444"></i>
              </div>
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
        message="Are you sure you want to log out of your business account?"
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
        message="This will permanently delete your business account and all associated data. This cannot be undone."
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
        background-color: var(--color-background);
        padding-bottom: 120px;
      }

      .settings-header {
        padding: 20px 20px 12px;
        background-color: var(--color-background);
      }
      .settings-title {
        font-size: 22px;
        font-weight: 700;
        color: var(--color-text-primary);
        text-align: center;
      }

      .settings-body {
        padding: 8px 16px 0;
        max-width: 560px;
        margin: 0 auto;
      }

      .section-label {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 0 4px;
        margin: 20px 0 8px;
      }

      /* Profile card */
      .profile-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 16px;
        border-radius: 20px;
        background-color: var(--color-surface);
        cursor: pointer;
        margin-bottom: 4px;
        transition: opacity 0.2s;
      }
      .profile-card:active {
        opacity: 0.75;
      }

      .profile-avatar {
        width: 60px;
        height: 60px;
        border-radius: 16px;
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

      .profile-info {
        flex: 1;
        min-width: 0;
      }
      .profile-name {
        font-size: 16px;
        font-weight: 700;
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .profile-email {
        font-size: 13px;
        color: var(--color-text-muted);
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .profile-arrow {
        font-size: 20px;
        color: var(--color-text-muted);
        flex-shrink: 0;
      }

      /* Menu list */
      .menu-list {
        background-color: var(--color-surface);
        border-radius: 20px;
        overflow: hidden;
      }
      .menu-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 13px 16px;
        background: none;
        border: none;
        border-bottom: 1px solid var(--color-border);
        cursor: pointer;
        transition: background 0.15s;
        text-align: left;
      }
      .menu-row:last-child {
        border-bottom: none;
      }
      .menu-row:active {
        background-color: var(--color-background);
      }
      .menu-row:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .menu-row-left {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        font-weight: 500;
        color: var(--color-text-primary);
      }

      /* Right side of a row (badge + arrow together) */
      .menu-row-right {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .menu-icon-wrap {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .menu-icon-wrap i {
        font-size: 18px;
      }

      .menu-arrow {
        font-size: 20px;
        color: var(--color-text-muted);
      }

      /* "New" badge */
      .menu-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 20px;
        background-color: var(--color-primary);
        color: white;
        letter-spacing: 0.02em;
      }

      /* Theme toggle */
      .theme-toggle {
        display: flex;
        gap: 4px;
        background-color: var(--color-background);
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
        color: var(--color-text-muted);
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
      .danger-row .menu-row-left span {
        color: #ef4444;
      }

      .version-label {
        text-align: center;
        font-size: 12px;
        color: var(--color-text-muted);
        margin-top: 24px;
        opacity: 0.6;
      }
    `,
  ],
})
export class BeauticianSettingsComponent implements OnInit {
  user: any = null;
  currentTheme = "system";
  showLogoutModal = false;
  showDeleteModal = false;
  loggingOut = false;
  deleting = false;

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
    this.user = this.auth.user;
    this.currentTheme = this.themeService.getMode();
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
    } catch (e) {
      console.error("Logout error:", e);
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
