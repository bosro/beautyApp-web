import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '@environments/environment';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4">
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">My Profile</h1>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 space-y-4 max-w-2xl mx-auto">
        <div class="skeleton h-32 rounded-2xl"></div>
        <div class="skeleton h-64 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- Avatar Section -->
        <div class="card p-6 flex flex-col items-center gap-3">
          <div class="relative">
            <img
              [src]="previewUrl || user?.avatar || 'https://ui-avatars.com/api/?name=' + user?.firstName + '+' + user?.lastName + '&size=100'"
              alt="Profile"
              class="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-primary)]"
            />
            <label class="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--color-primary-dark)] transition-colors">
              <i class="ri-camera-line text-white text-sm"></i>
              <input type="file" accept="image/*" class="hidden" (change)="onFileChange($event)" />
            </label>
          </div>
          <div class="text-center">
            <h2 class="font-semibold text-lg text-[var(--color-text-primary)]">{{ user?.firstName }} {{ user?.lastName }}</h2>
            <p class="text-sm text-[var(--color-text-secondary)]">{{ user?.email }}</p>
          </div>
          <button *ngIf="selectedFile" (click)="uploadAvatar()" [disabled]="uploading" class="btn-primary text-sm px-4 py-2">
            <span *ngIf="!uploading">Save Photo</span>
            <span *ngIf="uploading" class="flex items-center gap-2"><i class="ri-loader-4-line animate-spin"></i> Uploading...</span>
          </button>
        </div>

        <!-- Edit Form -->
        <div class="card p-4 space-y-4">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Personal Information</h3>
          <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">First Name</label>
                <input formControlName="firstName" type="text" class="form-input" placeholder="First name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Last Name</label>
                <input formControlName="lastName" type="text" class="form-input" placeholder="Last name" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Phone Number</label>
              <input formControlName="phone" type="tel" class="form-input" placeholder="+233 XX XXX XXXX" />
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <input formControlName="email" type="email" class="form-input bg-[var(--color-background)] cursor-not-allowed" readonly />
              <p class="text-xs text-[var(--color-text-muted)] mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Location</label>
              <input formControlName="city" type="text" class="form-input" placeholder="City" />
            </div>
            <button type="submit" [disabled]="saving || form.invalid" class="btn-primary w-full">
              <span *ngIf="!saving">Save Changes</span>
              <span *ngIf="saving" class="flex items-center justify-center gap-2"><i class="ri-loader-4-line animate-spin"></i> Saving...</span>
            </button>
          </form>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div class="card p-3 text-center">
            <p class="text-2xl font-bold text-[var(--color-primary)]">{{ stats.totalBookings }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Bookings</p>
          </div>
          <div class="card p-3 text-center">
            <p class="text-2xl font-bold text-[var(--color-primary)]">{{ stats.favorites }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Favourites</p>
          </div>
          <div class="card p-3 text-center">
            <p class="text-2xl font-bold text-[var(--color-primary)]">{{ stats.reviews }}</p>
            <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Reviews</p>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  user: any = null;
  loading = true;
  saving = false;
  uploading = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  stats = { totalBookings: 0, favorites: 0, reviews: 0 };

  form: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private auth: AuthService,
    private toast: ToastService
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
    this.auth.user$.subscribe(user => {
      if (user) {
        this.user = user;
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          city: user.city,
        });
      }
    });
    this.http.get<any>(`${environment.apiUrl}/users/stats`).subscribe({
      next: (res) => { this.stats = res.data; this.loading = false; },
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
    this.http.post<any>(`${environment.apiUrl}/users/avatar`, fd).subscribe({
      next: (res) => {
        this.auth.updateUser(res.data);
        this.uploading = false;
        this.selectedFile = null;
        this.toast.success('Profile photo updated!');
      },
      error: () => { this.uploading = false; this.toast.error('Upload failed'); }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;
    this.http.put<any>(`${environment.apiUrl}/users/profile`, this.form.getRawValue()).subscribe({
      next: (res) => {
        this.auth.updateUser(res.data);
        this.saving = false;
        this.toast.success('Profile updated!');
      },
      error: () => { this.saving = false; this.toast.error('Update failed'); }
    });
  }
}
