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
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between"
      >
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          My Profile
        </h1>
        <button
          (click)="router.navigate(['/beautician/business-profile'])"
          class="text-sm text-[var(--color-primary)] font-medium flex items-center gap-1"
        >
          <i class="ri-settings-3-line"></i> Business
        </button>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-32 rounded-2xl"></div>
        <div class="skeleton h-64 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        <!-- Profile Card — mirrors mobile profileCard -->
        <div class="card p-5 flex flex-col items-center gap-3">
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
                class="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--color-primary)]"
              />
            </ng-container>
            <ng-template #avatarPlaceholder>
              <div
                class="w-24 h-24 rounded-full ring-4 ring-[var(--color-primary)] bg-[var(--color-primary)] flex items-center justify-center"
              >
                <span class="text-3xl font-bold text-white">
                  {{
                    (beautician?.businessName || user?.name || "B")
                      .charAt(0)
                      .toUpperCase()
                  }}
                </span>
              </div>
            </ng-template>

            <label
              class="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90"
            >
              <i class="ri-camera-line text-white text-sm"></i>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                (change)="onFile($event)"
              />
            </label>
          </div>

          <div class="text-center">
            <h2 class="font-bold text-lg text-[var(--color-text-primary)]">
              {{ beautician?.businessName || user?.name }}
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              {{ user?.email }}
            </p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <i class="ri-star-fill text-amber-400 text-sm"></i>
              <span
                class="text-sm font-semibold text-[var(--color-text-primary)]"
              >
                {{ beautician?.rating || 0 | number: "1.1-1" }}
              </span>
              <span class="text-xs text-[var(--color-text-muted)]">
                ({{ beautician?.totalReviews || 0 }} reviews)
              </span>
            </div>
          </div>

          <button
            *ngIf="selectedFile"
            (click)="uploadPhoto()"
            [disabled]="uploading"
            class="btn-primary text-sm px-4 py-2"
          >
            <span *ngIf="!uploading">Save Photo</span>
            <span *ngIf="uploading" class="flex items-center gap-2">
              <i class="ri-loader-4-line animate-spin"></i> Uploading...
            </span>
          </button>
        </div>

        <!-- Stats Row — mirrors mobile statsContainer -->
        <div class="card p-4 flex items-center">
          <div class="flex-1 text-center">
            <p class="text-xl font-bold text-[var(--color-primary)]">
              {{ beautician?.totalBookings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">Total Bookings</p>
          </div>
          <div class="w-px h-10 bg-[var(--color-border)]"></div>
          <div class="flex-1 text-center">
            <p class="text-xl font-bold text-[var(--color-primary)]">
              {{ beautician?.completedBookings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">Completed</p>
          </div>
          <div class="w-px h-10 bg-[var(--color-border)]"></div>
          <div class="flex-1 text-center">
            <p class="text-xl font-bold text-[var(--color-primary)]">
              {{ beautician?.rating || 0 | number: "1.1-1" }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">Rating</p>
          </div>
        </div>

        <!-- Personal Info Form -->
        <div class="card p-4 space-y-4">
          <h3 class="font-semibold text-[var(--color-text-primary)]">
            Personal Information
          </h3>
          <div>
            <label
              class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >Full Name</label
            >
            <input
              [(ngModel)]="nameInput"
              type="text"
              class="form-input"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >Phone</label
            >
            <input
              [(ngModel)]="phone"
              type="tel"
              class="form-input"
              placeholder="e.g. 024 000 0000"
            />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >Email</label
            >
            <input
              [value]="user?.email"
              type="email"
              class="form-input bg-[var(--color-background)] opacity-60 cursor-not-allowed"
              readonly
            />
          </div>
          <button
            (click)="savePersonal()"
            [disabled]="saving"
            class="btn-primary w-full"
          >
            <span *ngIf="!saving">Save Changes</span>
            <span *ngIf="saving" class="flex items-center justify-center gap-2">
              <i class="ri-loader-4-line animate-spin"></i> Saving...
            </span>
          </button>
        </div>

        <!-- Quick Actions — mirrors mobile menuItems (Business Management) -->
        <div class="space-y-2">
          <h3 class="font-semibold text-[var(--color-text-primary)] px-1">
            Business Management
          </h3>
          <button
            *ngFor="let item of menuItems"
            (click)="item.action()"
            class="card p-4 flex items-center justify-between w-full hover:border-[var(--color-primary)] transition-colors"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center"
              >
                <i [class]="item.icon + ' text-[var(--color-primary)]'"></i>
              </div>
              <div class="text-left">
                <p class="text-sm font-medium text-[var(--color-text-primary)]">
                  {{ item.title }}
                </p>
                <p
                  *ngIf="item.subtitle"
                  class="text-xs text-[var(--color-text-secondary)]"
                >
                  {{ item.subtitle }}
                </p>
              </div>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
          </button>
        </div>

        <!-- Settings -->
        <div class="space-y-2">
          <h3 class="font-semibold text-[var(--color-text-primary)] px-1">
            Settings
          </h3>
          <button
            *ngFor="let item of settingsItems"
            (click)="item.action()"
            class="card p-4 flex items-center justify-between w-full hover:border-[var(--color-primary)] transition-colors"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center"
              >
                <i [class]="item.icon + ' text-[var(--color-primary)]'"></i>
              </div>
              <p class="text-sm font-medium text-[var(--color-text-primary)]">
                {{ item.title }}
              </p>
            </div>
            <i class="ri-arrow-right-s-line text-[var(--color-text-muted)]"></i>
          </button>
        </div>

        <!-- Logout -->
        <button
          (click)="showLogoutModal = true"
          class="w-full p-4 rounded-xl flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors"
        >
          <i class="ri-logout-box-line text-red-500"></i>
          <span class="text-sm font-semibold text-red-500">
            {{ loggingOut ? "Logging out..." : "Log Out" }}
          </span>
        </button>

        <p class="text-center text-xs text-[var(--color-text-muted)]">
          Version 1.0.0
        </p>
      </div>

      <!-- Logout Modal -->
      <app-confirm-modal
        *ngIf="showLogoutModal"
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
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
    // {
    //   icon: "ri-money-dollar-circle-line",
    //   title: "Earnings",
    //   subtitle: "View payments & payouts",
    //   action: () => this.router.navigate(["/beautician/earnings"]),
    // },
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

    // Matches mobile: GET /users/beautician/profile → res.data.beautician
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
    // Matches mobile uploadBeauticianImages: POST /users/beautician/images
    fd.append("profileImage", this.selectedFile);
    this.http
      .post<any>(`${environment.apiUrl}/users/beautician/images`, fd)
      .subscribe({
        next: (res) => {
          if (res.data?.beautician?.profileImage) {
            if (this.beautician) {
              this.beautician.profileImage = res.data.beautician.profileImage;
            }
          }
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
    // Matches mobile updateProfile: PUT /users/profile with { name, phone }
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
