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
        <!-- Profile Picture -->
        <div class="card p-5 flex flex-col items-center gap-3">
          <div class="relative">
            <img
              [src]="
                previewUrl ||
                user?.avatar ||
                'https://ui-avatars.com/api/?name=' +
                  user?.firstName +
                  '&size=96&background=E88B7B&color=fff'
              "
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--color-primary)]"
            />
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
              {{ user?.firstName }} {{ user?.lastName }}
            </h2>
            <p class="text-sm text-[var(--color-text-secondary)]">
              {{ user?.businessName }}
            </p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <i class="ri-star-fill text-amber-400 text-sm"></i>
              <span class="text-sm font-semibold">{{
                user?.averageRating | number: "1.1-1"
              }}</span>
              <span class="text-xs text-[var(--color-text-muted)]"
                >({{ user?.reviewCount }} reviews)</span
              >
            </div>
          </div>
          <button
            *ngIf="selectedFile"
            (click)="uploadPhoto()"
            [disabled]="uploading"
            class="btn-primary text-sm px-4 py-2"
          >
            <span *ngIf="!uploading">Save Photo</span>
            <span *ngIf="uploading" class="flex items-center gap-2"
              ><i class="ri-loader-4-line animate-spin"></i> Uploading...</span
            >
          </button>
        </div>

        <!-- Personal Info Form -->
        <div class="card p-4 space-y-4">
          <h3 class="font-semibold text-[var(--color-text-primary)]">
            Personal Information
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label
                class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                >First Name</label
              >
              <input [(ngModel)]="firstName" type="text" class="form-input" />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                >Last Name</label
              >
              <input [(ngModel)]="lastName" type="text" class="form-input" />
            </div>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >Phone</label
            >
            <input [(ngModel)]="phone" type="tel" class="form-input" />
          </div>
          <div>
            <label
              class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
              >Email</label
            >
            <input
              [value]="user?.email"
              type="email"
              class="form-input bg-[var(--color-background)]"
              readonly
            />
          </div>
          <button
            (click)="savePersonal()"
            [disabled]="saving"
            class="btn-primary w-full"
          >
            <span *ngIf="!saving">Save Changes</span>
            <span *ngIf="saving" class="flex items-center justify-center gap-2"
              ><i class="ri-loader-4-line animate-spin"></i> Saving...</span
            >
          </button>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-3">
          <div class="card p-4 text-center">
            <p class="text-2xl font-black text-[var(--color-primary)]">
              {{ stats?.totalCompletedBookings || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">Completed</p>
          </div>
          <div class="card p-4 text-center">
            <p class="text-2xl font-black text-[var(--color-primary)]">
              {{ stats?.totalClients || 0 }}
            </p>
            <p class="text-xs text-[var(--color-text-muted)]">Clients Served</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BeauticianProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  saving = false;
  uploading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  firstName = "";
  lastName = "";
  phone = "";
  stats: any = null;

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
        this.firstName = u.firstName ?? "";
        this.lastName = u.lastName ?? "";
        this.phone = u.phone ?? "";
      }
    });
    this.http.get<any>(`${environment.apiUrl}/beauticians/stats`).subscribe({
      next: (res) => {
        this.stats = res.data;
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
    fd.append("avatar", this.selectedFile);
    this.http.post<any>(`${environment.apiUrl}/users/avatar`, fd).subscribe({
      next: (res) => {
        this.auth.updateUser(res.data);
        this.uploading = false;
        this.selectedFile = null;
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
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
      })
      .subscribe({
        next: (res) => {
          this.auth.updateUser(res.data);
          this.saving = false;
          this.toast.success("Profile updated!");
        },
        error: () => {
          this.saving = false;
          this.toast.error("Update failed");
        },
      });
  }
}
