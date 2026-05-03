import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { ToastService } from '@core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-settings',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4">
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">Settings</h1>
      </div>

      <div class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- Appearance -->
        <div class="card p-4 space-y-1">
          <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Appearance</h3>

          <div class="flex items-center justify-between py-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                <i class="ri-moon-line text-[var(--color-primary)]"></i>
              </div>
              <span class="text-sm font-medium text-[var(--color-text-primary)]">Theme</span>
            </div>
            <div class="flex bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-0.5 gap-0.5">
              <button *ngFor="let t of themes"
                (click)="setTheme(t.value)"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                [ngClass]="currentTheme === t.value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'">
                {{ t.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="card p-4 space-y-1">
          <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Notifications</h3>
          <div *ngFor="let pref of notifPrefs" class="flex items-center justify-between py-2.5 border-b border-[var(--color-border)] last:border-0">
            <div>
              <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ pref.label }}</p>
              <p class="text-xs text-[var(--color-text-muted)]">{{ pref.desc }}</p>
            </div>
            <button
              (click)="pref.enabled = !pref.enabled; saveNotifPrefs()"
              class="relative w-11 h-6 rounded-full transition-colors duration-200"
              [ngClass]="pref.enabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                [ngClass]="pref.enabled ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
        </div>

        <!-- Account -->
        <div class="card p-4 space-y-1">
          <h3 class="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Account</h3>

          <button (click)="navigate('/client/profile')" class="settings-row">
            <div class="settings-row-left">
              <i class="ri-user-line"></i>
              <span>Edit Profile</span>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
          </button>

          <button class="settings-row">
            <div class="settings-row-left">
              <i class="ri-lock-line"></i>
              <span>Change Password</span>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
          </button>

          <button class="settings-row">
            <div class="settings-row-left">
              <i class="ri-shield-check-line"></i>
              <span>Privacy Policy</span>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
          </button>

          <button class="settings-row">
            <div class="settings-row-left">
              <i class="ri-file-text-line"></i>
              <span>Terms of Service</span>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
          </button>

          <button class="settings-row">
            <div class="settings-row-left">
              <i class="ri-question-line"></i>
              <span>Help & Support</span>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
          </button>
        </div>

        <!-- Danger Zone -->
        <div class="card p-4 space-y-1">
          <h3 class="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Danger Zone</h3>
          <button (click)="showLogoutModal = true" class="settings-row text-red-500">
            <div class="settings-row-left text-red-500">
              <i class="ri-logout-box-r-line"></i>
              <span>Log Out</span>
            </div>
          </button>
          <button (click)="showDeleteModal = true" class="settings-row text-red-500">
            <div class="settings-row-left text-red-500">
              <i class="ri-delete-bin-line"></i>
              <span>Delete Account</span>
            </div>
          </button>
        </div>

        <!-- Version -->
        <p class="text-center text-xs text-[var(--color-text-muted)]">BeautyHub v1.0.0</p>

      </div>

      <!-- Logout Modal -->
      <app-confirm-modal
        *ngIf="showLogoutModal"
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        type="warning"
        (confirmed)="logout()"
        (cancelled)="showLogoutModal = false">
      </app-confirm-modal>

      <!-- Delete Modal -->
      <app-confirm-modal
        *ngIf="showDeleteModal"
        title="Delete Account"
        message="This will permanently delete your account and all data. This cannot be undone."
        confirmText="Delete Account"
        type="error"
        [loading]="deleting"
        (confirmed)="deleteAccount()"
        (cancelled)="showDeleteModal = false">
      </app-confirm-modal>

    </div>
  `,
  styles: [`
    .settings-row {
      @apply flex items-center justify-between w-full py-3 border-b border-[var(--color-border)] last:border-0 hover:opacity-70 transition-opacity;
    }
    .settings-row-left {
      @apply flex items-center gap-3 text-sm font-medium text-[var(--color-text-primary)];
      i { @apply text-lg; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  currentTheme = 'system';
  showLogoutModal = false;
  showDeleteModal = false;
  deleting = false;

  themes = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'Auto', value: 'system' },
  ];

  notifPrefs = [
    { key: 'booking_reminders', label: 'Booking Reminders', desc: 'Get reminded before your appointments', enabled: true },
    { key: 'promotions', label: 'Promotions', desc: 'Deals and discount notifications', enabled: true },
    { key: 'reviews', label: 'Review Requests', desc: 'Reminded to rate after bookings', enabled: false },
    { key: 'system', label: 'System Updates', desc: 'App updates and announcements', enabled: true },
  ];

  constructor(
    private router: Router,
    private auth: AuthService,
    private themeService: ThemeService,
    private toast: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.currentTheme = this.themeService.getMode();
  }

  setTheme(mode: string) {
    this.currentTheme = mode;
    this.themeService.setMode(mode as any);
  }

  navigate(path: string) { this.router.navigate([path]); }

  saveNotifPrefs() {
    const prefs: any = {};
    this.notifPrefs.forEach(p => prefs[p.key] = p.enabled);
    this.http.put(`${environment.apiUrl}/users/notification-preferences`, prefs).subscribe();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  deleteAccount() {
    this.deleting = true;
    this.http.delete(`${environment.apiUrl}/users/account`).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/auth/login']);
        this.toast.success('Account deleted');
      },
      error: () => { this.deleting = false; this.toast.error('Failed to delete account'); }
    });
  }
}
