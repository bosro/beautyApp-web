// ============================================================
// business-profile.component.ts  —  Enhanced UI
// ============================================================

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
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between"
      >
        <h1
          class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
        >
          Business Profile
        </h1>
        <button
          (click)="save()"
          [disabled]="saving || form.invalid"
          class="btn-primary text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 disabled:opacity-50"
        >
          <i *ngIf="saving" class="ri-loader-4-line animate-spin text-xs"></i>
          <i *ngIf="!saving" class="ri-save-line text-xs"></i>
          {{ saving ? "Saving…" : "Save" }}
        </button>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="p-4 max-w-2xl mx-auto space-y-3">
        <div class="skeleton h-48 rounded-3xl"></div>
        <div class="skeleton h-72 rounded-2xl"></div>
        <div class="skeleton h-40 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4 pb-8">
        <!-- Cover Image -->
        <div class="card rounded-2xl overflow-hidden">
          <div class="relative h-44 bg-[var(--color-background)] group">
            <img
              *ngIf="coverPreview"
              [src]="coverPreview"
              alt="Cover"
              class="w-full h-full object-cover"
            />
            <div
              *ngIf="!coverPreview"
              class="w-full h-full flex flex-col items-center justify-center gap-2"
              style="background: color-mix(in srgb, var(--color-primary) 5%, transparent)"
            >
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center"
                style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
              >
                <i
                  class="ri-image-add-line text-xl text-[var(--color-primary)]"
                ></i>
              </div>
              <p class="text-sm text-[var(--color-text-muted)]">
                Upload a cover photo
              </p>
            </div>
            <!-- Overlay label -->
            <div
              class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <label
                class="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/90 rounded-xl text-sm font-semibold text-gray-800 hover:bg-white transition-colors"
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
            <label
              class="absolute bottom-3 right-3 cursor-pointer px-3 py-1.5 bg-black/50 text-white text-xs rounded-xl hover:bg-black/70 transition-colors flex items-center gap-1.5 group-hover:hidden"
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
        <div class="card rounded-2xl p-5 space-y-4">
          <h3
            class="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
          >
            Business Info
          </h3>

          <form [formGroup]="form" class="space-y-4">
            <div>
              <label
                class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
                >Business Name *</label
              >
              <input
                formControlName="businessName"
                type="text"
                class="form-input rounded-xl"
                placeholder="Your salon name"
              />
            </div>

            <div>
              <label
                class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
                >Category *</label
              >
              <select
                formControlName="businessCategory"
                class="form-input rounded-xl"
              >
                <option value="">Select a category</option>
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
                class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
                >Bio / Description</label
              >
              <textarea
                formControlName="bio"
                rows="4"
                class="form-input resize-none rounded-xl"
                placeholder="Tell clients about your specialties, experience, and what makes you unique…"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
                  >City</label
                >
                <input
                  formControlName="city"
                  type="text"
                  class="form-input rounded-xl"
                  placeholder="e.g. Accra"
                />
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
                  >Area</label
                >
                <input
                  formControlName="region"
                  type="text"
                  class="form-input rounded-xl"
                  placeholder="e.g. East Legon"
                />
              </div>
            </div>

            <div>
              <label
                class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
                >Full Address</label
              >
              <input
                formControlName="businessAddress"
                type="text"
                class="form-input rounded-xl"
                placeholder="Street address"
              />
            </div>
          </form>
        </div>

        <!-- Social Links -->
        <div class="card rounded-2xl p-5 space-y-3">
          <h3
            class="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
          >
            Social Links
          </h3>

          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: #FCE4EC"
            >
              <i class="ri-instagram-line text-pink-500"></i>
            </div>
            <input
              [(ngModel)]="instagram"
              type="url"
              class="form-input flex-1 rounded-xl"
              placeholder="Instagram URL"
            />
          </div>

          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: #E3F2FD"
            >
              <i class="ri-facebook-line text-blue-500"></i>
            </div>
            <input
              [(ngModel)]="facebook"
              type="url"
              class="form-input flex-1 rounded-xl"
              placeholder="Facebook URL"
            />
          </div>

          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: #E8F5E9"
            >
              <i class="ri-whatsapp-line text-green-500"></i>
            </div>
            <input
              [(ngModel)]="whatsapp"
              type="tel"
              class="form-input flex-1 rounded-xl"
              placeholder="WhatsApp number"
            />
          </div>
        </div>

        <!-- Save button (bottom, large) -->
        <button
          (click)="save()"
          [disabled]="saving || form.invalid"
          class="btn-primary w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <i *ngIf="saving" class="ri-loader-4-line animate-spin"></i>
          <i *ngIf="!saving" class="ri-save-line"></i>
          {{ saving ? "Saving changes…" : "Save Changes" }}
        </button>
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
      businessCategory: ["", Validators.required],
      bio: [""],
      city: [""],
      region: [""],
      businessAddress: [""],
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
    this.http
      .put(`${environment.apiUrl}/users/beautician/profile`, {
        ...this.form.getRawValue(),
      })
      .subscribe({
        next: () => {
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
