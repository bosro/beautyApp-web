// profile.component.ts - complete fixed version
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@environments/environment';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { User } from '@core/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

       <div class="pp-header">
        <button class="pp-back-btn" (click)="goBack()">
          <i class="ri-arrow-left-line"></i>
        </button>
        <h1 class="pp-title">Profile</h1>
        <div class="pp-spacer"></div>
      </div>

      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-32 rounded-2xl"></div>
        <div class="skeleton h-64 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- Avatar Section -->
        <div class="card p-6 flex flex-col items-center gap-3 border-none bg-[var(--color-bg-secondary)]">
          <div class="relative">
            <img
              [src]="previewUrl || user?.avatar || avatarUrl"
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover bg-[var(--color-bg-secondary)]"
            />
            <label class="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
              <i class="ri-camera-line text-white text-sm"></i>
              <input type="file" accept="image/*" class="hidden" (change)="onFileChange($event)" />
            </label>
          </div>
          <div class="text-center">
            <h2 class="font-semibold text-lg text-[var(--color-text-primary)]">{{ user?.name }}</h2>
            <p class="text-sm text-[var(--color-text-secondary)]">{{ user?.email }}</p>
          </div>
          <button *ngIf="selectedFile" (click)="uploadAvatar()" [disabled]="uploading" class="btn-primary text-sm px-4 py-2">
            <span *ngIf="!uploading">Save Photo</span>
            <span *ngIf="uploading" class="flex items-center gap-2"><i class="ri-loader-4-line animate-spin"></i> Uploading...</span>
          </button>
        </div>

        <!-- Edit Form -->
        <div class="card p-4 space-y-4 border-none bg-[var(--color-bg-secondary)]">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Personal Information</h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">First Name</label>
                <input formControlName="firstName" type="text" class="form-input bg-[var(--color-bg-secondary)]" placeholder="First name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Last Name</label>
                <input formControlName="lastName" type="text" class="form-input bg-[var(--color-bg-secondary)]" placeholder="Last name" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Phone Number</label>
              <input formControlName="phone" type="tel" class="form-input bg-[var(--color-bg-secondary)]" placeholder="+233 XX XXX XXXX" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <input formControlName="email" type="email" class="form-input bg-[var(--color-bg-secondary)] cursor-not-allowed" readonly />
              <p class="text-xs text-[var(--color-text-muted)] mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">City</label>
              <input formControlName="city" type="text" class="form-input bg-[var(--color-bg-secondary)]" placeholder="City" />
            </div>
            <button type="submit" [disabled]="saving || form.invalid" class="btn-primary w-full">
              <span *ngIf="!saving">Save Changes</span>
              <span *ngIf="saving" class="flex items-center justify-center gap-2"><i class="ri-loader-4-line animate-spin"></i> Saving...</span>
            </button>
          </form>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div class="card p-3 text-center border-none bg-[var(--color-bg-secondary)]">
            <p class="text-2xl font-bold text-[var(--color-primary)]">{{ stats.bookings }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Bookings</p>
          </div>
          <div class="card p-3 text-center border-none bg-[var(--color-bg-secondary)]">
            <p class="text-2xl font-bold text-[var(--color-primary)]">{{ stats.favorites }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Favourites</p>
          </div>
          <div class="card p-3 text-center border-none bg-[var(--color-bg-secondary)]">
            <p class="text-2xl font-bold text-[var(--color-primary)]">{{ stats.reviews }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Reviews</p>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: `
   .pp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .pp-back-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background-color: var(--color-bg-secondary, #f5f5f5);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      color: var(--color-text-primary);
      transition: opacity 0.2s;
    }

    .pp-back-btn:hover { opacity: 0.7; }

    .pp-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      flex: 1;
      text-align: center;
    }

    .pp-spacer { width: 36px; }
  `
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  saving = false;
  uploading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  stats = { bookings: 0, favorites: 0, reviews: 0 };

  get avatarUrl(): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user?.name || 'U')}&size=100`;
  }

  form: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: [''],
      email: [{ value: '', disabled: true }],
      city: [''],
    });
  }

  ngOnInit() {
    this.auth.user$.subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        // Split name into first/last for the form
        const parts = (user.name || '').split(' ');
        this.form.patchValue({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          phone: user.phone || '',
          email: user.email || '',
          city: (user as any).city || '',
        });
      }
    });

    this.http.get<any>(`${environment.apiUrl}/users/stats`).subscribe({
      next: (res) => {
        // Backend returns { bookings, reviews, favorites }
        this.stats = {
          bookings: res.data?.bookings ?? 0,
          favorites: res.data?.favorites ?? 0,
          reviews: res.data?.reviews ?? 0,
        };
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  uploadAvatar() {
    if (!this.selectedFile) return;
    this.uploading = true;
    const fd = new FormData();
    fd.append('avatar', this.selectedFile);
    this.http.post<any>(`${environment.apiUrl}/users/profile/avatar`, fd).subscribe({
      next: (res) => {
        this.auth.updateUser(res.data?.user || res.data);
        this.uploading = false;
        this.selectedFile = null;
        this.previewUrl = null;
        this.toast.success('Profile photo updated!');
      },
      error: () => { this.uploading = false; this.toast.error('Upload failed'); }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;

    const { firstName, lastName, phone, city } = this.form.getRawValue();
    const payload = {
      firstName,  // backend updateProfile maps these to 'name'
      lastName,
      phone,
      city,
    };

    this.http.put<any>(`${environment.apiUrl}/users/profile`, payload).subscribe({
      next: (res) => {
        this.auth.updateUser(res.data?.user || res.data);
        this.saving = false;
        this.toast.success('Profile updated!');
      },
      error: () => { this.saving = false; this.toast.error('Update failed'); }
    });
  }

    goBack() { this.router.navigate(['/client/settings']); }

}


