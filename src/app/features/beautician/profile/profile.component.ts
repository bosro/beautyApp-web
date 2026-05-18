// ============================================================
// beautician-profile.component.ts  —  Enhanced UI
// ============================================================

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { AuthService } from "@core/services/auth.service";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-beautician-profile",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between"
      >
        <h1
          class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
        >
          My Profile
        </h1>
        <button
          (click)="router.navigate(['/beautician/business-profile'])"
          class="flex items-center gap-1.5 text-sm text-[var(--color-primary)] font-semibold px-3 py-1.5 rounded-xl hover:bg-[var(--color-primary)]/10 transition-colors"
        >
          <i class="ri-settings-3-line text-sm"></i> Business
        </button>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-40 rounded-3xl"></div>
        <div class="skeleton h-24 rounded-2xl"></div>
        <div class="skeleton h-56 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        <!-- Profile Hero Card -->
        <div class="card rounded-3xl overflow-hidden">
          <!-- Gradient top bar -->
          <div
            class="h-20 relative"
            style="background: linear-gradient(135deg, var(--color-primary), #C84428)"
          >
            <div class="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div class="relative">
                <ng-container
                  *ngIf="
                    previewUrl || beautician?.profileImage;
                    else avatarPlaceholder
                  "
                >
                  <img
                    [src]="previewUrl || beautician?.profileImage"
                    alt="Profile"
                    class="w-20 h-20 rounded-2xl object-cover border-4 border-[var(--color-surface)] shadow-lg"
                  />
                </ng-container>
                <ng-template #avatarPlaceholder>
                  <div
                    class="w-20 h-20 rounded-2xl border-4 border-[var(--color-surface)] shadow-lg flex items-center justify-center"
                    style="background: var(--color-primary)"
                  >
                    <span class="text-2xl font-black text-white">
                      {{
                        (beautician?.businessName || user?.name || "B")
                          .charAt(0)
                          .toUpperCase()
                      }}
                    </span>
                  </div>
                </ng-template>
                <label
                  class="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--color-primary)] rounded-xl flex items-center justify-center cursor-pointer hover:opacity-90 shadow-md"
                >
                  <i class="ri-camera-line text-white text-xs"></i>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    (change)="onFile($event)"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="pt-14 pb-5 px-5 text-center">
            <h2 class="font-black text-lg text-[var(--color-text-primary)]">
              {{ beautician?.businessName || user?.name }}
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)] mt-0.5">
              {{ user?.email }}
            </p>
            <div class="flex items-center justify-center gap-1.5 mt-2">
              <i class="ri-star-fill text-amber-400 text-sm"></i>
              <span
                class="text-sm font-bold text-[var(--color-text-primary)]"
                >{{ beautician?.rating || 0 | number: "1.1-1" }}</span
              >
              <span class="text-xs text-[var(--color-text-muted)]"
                >({{ beautician?.totalReviews || 0 }} reviews)</span
              >
            </div>

            <button
              *ngIf="selectedFile"
              (click)="uploadPhoto()"
              [disabled]="uploading"
              class="btn-primary text-sm px-5 py-2.5 rounded-xl mt-3 flex items-center justify-center gap-2 mx-auto"
            >
              <i *ngIf="uploading" class="ri-loader-4-line animate-spin"></i>
              {{ uploading ? "Uploading…" : "Save Photo" }}
            </button>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="card rounded-2xl p-4 flex items-center">
          <div class="flex-1 text-center py-1">
            <p class="text-2xl font-black text-[var(--color-primary)]">
              {{ beautician?.totalBookings || 0 }}
            </p>
            <p
              class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium"
            >
              Bookings
            </p>
          </div>
          <div class="w-px h-10 bg-[var(--color-border)]"></div>
          <div class="flex-1 text-center py-1">
            <p class="text-2xl font-black text-[var(--color-primary)]">
              {{ beautician?.completedBookings || 0 }}
            </p>
            <p
              class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium"
            >
              Completed
            </p>
          </div>
          <div class="w-px h-10 bg-[var(--color-border)]"></div>
          <div class="flex-1 text-center py-1">
            <p class="text-2xl font-black text-[var(--color-primary)]">
              {{ beautician?.rating || 0 | number: "1.1-1" }}
            </p>
            <p
              class="text-xs text-[var(--color-text-muted)] mt-0.5 font-medium"
            >
              Rating
            </p>
          </div>
        </div>

        <!-- Personal Info -->
        <div class="card rounded-2xl p-5 space-y-4">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
          >
            Personal Information
          </h3>

          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
              >Full Name</label
            >
            <input
              [(ngModel)]="nameInput"
              type="text"
              class="form-input rounded-xl"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
              >Phone</label
            >
            <input
              [(ngModel)]="phone"
              type="tel"
              class="form-input rounded-xl"
              placeholder="e.g. 024 000 0000"
            />
          </div>
          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
              >Email</label
            >
            <input
              [value]="user?.email"
              type="email"
              class="form-input rounded-xl bg-[var(--color-background)] opacity-50 cursor-not-allowed"
              readonly
            />
          </div>
          <button
            (click)="savePersonal()"
            [disabled]="saving"
            class="btn-primary w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-semibold"
          >
            <i *ngIf="saving" class="ri-loader-4-line animate-spin"></i>
            {{ saving ? "Saving…" : "Save Changes" }}
          </button>
        </div>

        <!-- Business Management -->
        <div class="space-y-2">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 px-1"
          >
            Business Management
          </h3>
          <button
            *ngFor="let item of menuItems"
            (click)="item.action()"
            class="card rounded-2xl px-4 py-3.5 flex items-center gap-3 w-full hover:border-[var(--color-primary)] transition-colors group"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
            >
              <i
                [class]="item.icon + ' text-[var(--color-primary)] text-base'"
              ></i>
            </div>
            <div class="flex-1 text-left min-w-0">
              <p class="text-sm font-semibold text-[var(--color-text-primary)]">
                {{ item.title }}
              </p>
              <p
                *ngIf="item.subtitle"
                class="text-xs text-[var(--color-text-secondary)] mt-0.5"
              >
                {{ item.subtitle }}
              </p>
            </div>
            <i
              class="ri-arrow-right-s-line text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
            ></i>
          </button>
        </div>

        <!-- Settings -->
        <div class="space-y-2">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 px-1"
          >
            Settings
          </h3>
          <button
            *ngFor="let item of settingsItems"
            (click)="item.action()"
            class="card rounded-2xl px-4 py-3.5 flex items-center gap-3 w-full hover:border-[var(--color-border)] transition-colors group"
          >
            <div
              class="w-10 h-10 rounded-xl bg-[var(--color-background)] flex items-center justify-center flex-shrink-0"
            >
              <i
                [class]="
                  item.icon + ' text-[var(--color-text-secondary)] text-base'
                "
              ></i>
            </div>
            <p
              class="flex-1 text-sm font-medium text-[var(--color-text-primary)] text-left"
            >
              {{ item.title }}
            </p>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
          </button>
        </div>

        <!-- Logout -->
        <button
          (click)="showLogoutModal = true"
          class="w-full p-4 rounded-2xl flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors border border-red-100 dark:border-red-900/30"
        >
          <i class="ri-logout-box-line text-red-500"></i>
          <span class="text-sm font-bold text-red-500">{{
            loggingOut ? "Logging out…" : "Log Out"
          }}</span>
        </button>

        <p class="text-center text-xs text-[var(--color-text-muted)] pb-2">
          Version 1.0.0
        </p>
      </div>

      <!-- Logout Modal -->
      <app-confirm-modal
        *ngIf="showLogoutModal"
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        type="warning"
        [loading]="loggingOut"
        (confirmed)="handleLogout()"
        (cancelled)="showLogoutModal = false"
      >
      </app-confirm-modal>
    </div>
  `,
})
export class BeauticianProfileComponent implements OnInit {
  user: any = null;
  beautician: any = null;
  loading = true;
  saving = false;
  uploading = false;
  loggingOut = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  nameInput = "";
  phone = "";
  showLogoutModal = false;

  menuItems = [
    {
      icon: "ri-store-2-line",
      title: "Business Profile",
      subtitle: "Manage your business information",
      action: () => this.router.navigate(["/beautician/business-profile"]),
    },
    {
      icon: "ri-calendar-line",
      title: "Schedule",
      subtitle: "Set your availability",
      action: () => this.router.navigate(["/beautician/schedule"]),
    },
    {
      icon: "ri-star-line",
      title: "Reviews",
      subtitle: "View customer feedback",
      action: () => this.router.navigate(["/beautician/reviews"]),
    },
    {
      icon: "ri-shield-check-line",
      title: "Verification",
      subtitle: "Verify your business",
      action: () => this.router.navigate(["/beautician/verification"]),
    },
  ];

  settingsItems = [
    {
      icon: "ri-notification-line",
      title: "Notification Preferences",
      action: () => this.router.navigate(["/settings/notifications"]),
    },
    {
      icon: "ri-lock-line",
      title: "Change Password",
      action: () => this.router.navigate(["/settings/change-password"]),
    },
    {
      icon: "ri-customer-service-line",
      title: "Customer Service",
      action: () => this.router.navigate(["beautician/support"]),
    },
    {
      icon: "ri-file-text-line",
      title: "Terms & Conditions",
      action: () => this.router.navigate(["beautician/terms"]),
    },
    {
      icon: "ri-shield-line",
      title: "Privacy Policy",
      action: () => this.router.navigate(["beautician/privacy-policy"]),
    },
  ];

  constructor(
    public router: Router,
    private http: HttpClient,
    private auth: AuthService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe((u) => {
      if (u) {
        this.user = u;
        this.nameInput = u.name || "";
        this.phone = u.phone ?? "";
      }
    });
    this.http
      .get<any>(`${environment.apiUrl}/users/beautician/profile`)
      .subscribe({
        next: (res) => {
          this.beautician = res.data?.beautician;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const r = new FileReader();
    r.onload = (e) => (this.previewUrl = e.target?.result as string);
    r.readAsDataURL(file);
  }

  uploadPhoto() {
    if (!this.selectedFile) return;
    this.uploading = true;
    const fd = new FormData();
    fd.append("profileImage", this.selectedFile);
    this.http
      .post<any>(`${environment.apiUrl}/users/beautician/images`, fd)
      .subscribe({
        next: (res) => {
          if (res.data?.beautician?.profileImage && this.beautician)
            this.beautician.profileImage = res.data.beautician.profileImage;
          this.uploading = false;
          this.selectedFile = null;
          this.previewUrl = null;
          this.toast.success("Photo updated!");
        },
        error: () => {
          this.uploading = false;
          this.toast.error("Upload failed");
        },
      });
  }

  savePersonal() {
    this.saving = true;
    this.http
      .put<any>(`${environment.apiUrl}/users/profile`, {
        name: this.nameInput,
        phone: this.phone,
      })
      .subscribe({
        next: (res) => {
          this.auth.updateUser(res.data?.user || res.data);
          this.saving = false;
          this.toast.success("Profile updated!");
        },
        error: () => {
          this.saving = false;
          this.toast.error("Update failed");
        },
      });
  }

  handleLogout() {
    this.loggingOut = true;
    try {
      this.auth.logout();
      this.toast.success("Logged out successfully");
      this.router.navigate(["/auth/login"]);
    } catch {
      this.toast.error("Failed to logout");
    } finally {
      this.loggingOut = false;
      this.showLogoutModal = false;
    }
  }
}
