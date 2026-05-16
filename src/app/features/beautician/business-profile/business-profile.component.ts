// business-profile.component.ts
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-business-profile",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between"
      >
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Business Profile
        </h1>
        <button
          (click)="save()"
          [disabled]="saving || form.invalid"
          class="btn-primary text-sm px-3 py-2"
        >
          <span *ngIf="!saving">Save</span>
          <span *ngIf="saving" class="flex items-center gap-1.5"
            ><i class="ri-loader-4-line animate-spin"></i> Saving</span
          >
        </button>
      </div>

      <div *ngIf="loading" class="p-4 max-w-2xl mx-auto space-y-4">
        <div class="skeleton h-48 rounded-2xl"></div>
        <div class="skeleton h-64 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        <!-- Cover Image -->
        <div class="card overflow-hidden">
          <div class="relative h-40 bg-[var(--color-background)]">
            <img
              *ngIf="coverPreview"
              [src]="coverPreview"
              alt="Cover"
              class="w-full h-full object-cover"
            />
            <div
              *ngIf="!coverPreview"
              class="w-full h-full flex flex-col items-center justify-center"
            >
              <i
                class="ri-image-line text-3xl text-[var(--color-text-muted)]"
              ></i>
              <p class="text-sm text-[var(--color-text-muted)] mt-1">
                Cover photo
              </p>
            </div>
            <label
              class="absolute bottom-2 right-2 px-3 py-1.5 bg-black/50 text-white text-xs rounded-lg cursor-pointer hover:bg-black/70 transition-colors flex items-center gap-1.5"
            >
              <i class="ri-camera-line"></i> Change Cover
              <input
                type="file"
                accept="image/*"
                class="hidden"
                (change)="onCover($event)"
              />
            </label>
          </div>
        </div>

        <!-- Business Info -->
        <div class="card p-4 space-y-4">
          <h3 class="font-semibold text-[var(--color-text-primary)]">
            Business Information
          </h3>

          <form [formGroup]="form" class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                >Business Name *</label
              >
              <input
                formControlName="businessName"
                type="text"
                class="form-input"
              />
            </div>
            <div>
              <label
                class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                >Category *</label
              >
              <select formControlName="businessCategory" class="form-input">
                <option value="">Select category</option>
                <option
                  *ngFor="let cat of categories"
                  [value]="cat.toLowerCase()"
                >
                  {{ cat }}
                </option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                >Bio / Description</label
              >
              <textarea
                formControlName="bio"
                rows="4"
                class="form-input resize-none"
                placeholder="Tell clients about your salon, specialties, experience..."
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                  >City</label
                >
                <input
                  formControlName="city"
                  type="text"
                  class="form-input"
                  placeholder="Accra"
                />
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                  >Area/Neighbourhood</label
                >
                <input
                  formControlName="region"
                  type="text"
                  class="form-input"
                  placeholder="East Legon"
                />
              </div>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
                >Full Address</label
              >
              <input
                formControlName="businessAddress"
                type="text"
                class="form-input"
                placeholder="Street address"
              />
            </div>
          </form>
        </div>

        <!-- Social Links -->
        <div class="card p-4 space-y-4">
          <h3 class="font-semibold text-[var(--color-text-primary)]">
            Social Links
          </h3>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <div
                class="w-9 h-9 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <i class="ri-instagram-line text-pink-500"></i>
              </div>
              <input
                [(ngModel)]="instagram"
                type="url"
                class="form-input flex-1"
                placeholder="Instagram URL"
              />
            </div>
            <div class="flex items-center gap-2">
              <div
                class="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <i class="ri-facebook-line text-blue-500"></i>
              </div>
              <input
                [(ngModel)]="facebook"
                type="url"
                class="form-input flex-1"
                placeholder="Facebook URL"
              />
            </div>
            <div class="flex items-center gap-2">
              <div
                class="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
              >
                <i class="ri-whatsapp-line text-green-500"></i>
              </div>
              <input
                [(ngModel)]="whatsapp"
                type="tel"
                class="form-input flex-1"
                placeholder="WhatsApp number"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BusinessProfileComponent implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  coverFile: File | null = null;
  coverPreview: string | null = null;
  instagram = "";
  facebook = "";
  whatsapp = "";

  categories = [
    "Hair",
    "Makeup",
    "Nails",
    "Skincare",
    "Waxing",
    "Spa",
    "Braiding",
    "Lashes",
    "Mixed",
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      businessName: ["", Validators.required],
      businessCategory: ["", Validators.required], // fixed: was 'category'
      bio: [""],
      city: [""],
      region: [""], // fixed: was 'area'
      businessAddress: [""], // fixed: was 'address'
    });
  }

  ngOnInit() {
    this.http
      .get<any>(`${environment.apiUrl}/users/beautician/profile`)
      .subscribe({
        next: (res) => {
          const b = res.data?.beautician || res.data;
          this.form.patchValue({
            businessName: b.businessName || "",
            businessCategory: b.businessCategory || "",
            bio: b.bio || "",
            city: b.city || "",
            region: b.region || "",
            businessAddress: b.businessAddress || "",
          });
          this.coverPreview = b.coverImage || null;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  onCover(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverFile = file;
    const r = new FileReader();
    r.onload = (e) => (this.coverPreview = e.target?.result as string);
    r.readAsDataURL(file);
  }

  save() {
    if (this.form.invalid) return;
    this.saving = true;

    const payload = {
      ...this.form.getRawValue(),
    };

    // Save text fields first
    this.http
      .put(`${environment.apiUrl}/users/beautician/profile`, payload)
      .subscribe({
        next: () => {
          // Then upload cover if changed
          if (this.coverFile) {
            const fd = new FormData();
            fd.append("coverImage", this.coverFile);
            this.http
              .post(`${environment.apiUrl}/users/beautician/images`, fd)
              .subscribe({
                next: () => {
                  this.saving = false;
                  this.toast.success("Business profile updated!");
                },
                error: () => {
                  this.saving = false;
                  this.toast.error("Profile saved but cover upload failed");
                },
              });
          } else {
            this.saving = false;
            this.toast.success("Business profile updated!");
          }
        },
        error: () => {
          this.saving = false;
          this.toast.error("Save failed");
        },
      });
  }
}


