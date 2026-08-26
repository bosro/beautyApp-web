// ============================================================
// business-profile.component.ts  —  Clean rewrite with back button
// ============================================================

import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-business-profile",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-28 lg:pb-10">
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
        style="background-color: var(--color-surface); border-color: var(--color-border)"
      >
        <button
          (click)="back()"
          class="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
          style="background-color: var(--color-background)"
        >
          <i
            class="ri-arrow-left-s-line text-lg text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1
          class="flex-1 text-base font-bold text-[var(--color-text-primary)] tracking-tight"
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

      <!-- ── Skeleton ── -->
      <div *ngIf="loading" class="p-4 max-w-2xl mx-auto space-y-3">
        <div class="skeleton h-44 rounded-2xl"></div>
        <div class="skeleton h-72 rounded-2xl"></div>
        <div class="skeleton h-40 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        <!-- ── Cover Photo ── -->
        <div
          class="rounded-2xl overflow-hidden"
          style="background-color: var(--color-surface)"
        >
          <div
            class="relative h-44 group"
            style="background-color: var(--color-background)"
          >
            <img
              *ngIf="coverPreview"
              [src]="coverPreview"
              alt="Cover"
              class="w-full h-full object-cover"
            />
            <!-- Empty state -->
            <div
              *ngIf="!coverPreview"
              class="w-full h-full flex flex-col items-center justify-center gap-2"
              style="background: color-mix(in srgb, var(--color-primary) 5%, transparent)"
            >
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center"
                style="background: color-mix(in srgb, var(--color-primary) 12%, transparent)"
              >
                <i
                  class="ri-image-add-line text-xl"
                  style="color: var(--color-primary)"
                ></i>
              </div>
              <p class="text-sm text-[var(--color-text-muted)]">
                Upload a cover photo
              </p>
            </div>
            <!-- Hover overlay -->
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
            <!-- Always-visible small button -->
            <label
              class="absolute bottom-3 right-3 cursor-pointer px-3 py-1.5 bg-black/50 text-white text-xs rounded-xl hover:bg-black/70 transition-colors flex items-center gap-1.5 group-hover:opacity-0 pointer-events-auto"
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

        <!-- ── Business Info ── -->
        <div
          class="rounded-2xl p-5 space-y-4"
          style="background-color: var(--color-surface)"
        >
          <p
            class="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest"
          >
            Business Info
          </p>

          <form [formGroup]="form" class="space-y-4">
            <div>
              <label class="field-label">Business Name *</label>
              <input
                formControlName="businessName"
                type="text"
                class="form-input rounded-xl"
                placeholder="Your salon name"
              />
            </div>

            <div>
              <label class="field-label">Category *</label>
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
              <label class="field-label">Bio / Description</label>
              <textarea
                formControlName="bio"
                rows="4"
                class="form-input resize-none rounded-xl"
                placeholder="Tell clients about your specialties, experience, and what makes you unique…"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">City</label>
                <input
                  formControlName="city"
                  type="text"
                  class="form-input rounded-xl"
                  placeholder="e.g. Accra"
                />
              </div>
              <div>
                <label class="field-label">Area</label>
                <input
                  formControlName="region"
                  type="text"
                  class="form-input rounded-xl"
                  placeholder="e.g. East Legon"
                />
              </div>
            </div>

            <div>
              <label class="field-label">Full Address</label>
              <input
                formControlName="businessAddress"
                type="text"
                class="form-input rounded-xl"
                placeholder="Street address"
              />
            </div>
          </form>
        </div>

        <!-- ── Business Type ── -->
        <div
          class="rounded-2xl p-5 space-y-4"
          style="background-color: var(--color-surface)"
        >
          <p
            class="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest"
          >
            Business Type
          </p>

          <form [formGroup]="form" class="space-y-4">
            <label
              class="flex items-center justify-between p-3.5 rounded-xl cursor-pointer"
              style="background-color: var(--color-background)"
            >
              <span class="text-sm font-medium" style="color: var(--color-text-primary)">
                I'm a student entrepreneur working on campus
              </span>
              <input
                type="checkbox"
                formControlName="worksOnCampus"
                class="accent-primary w-5 h-5 rounded flex-shrink-0 ml-3"
              />
            </label>

            <ng-container *ngIf="form.value.worksOnCampus">
              <div>
                <label class="field-label">School / Campus</label>
                <input
                  formControlName="campusName"
                  type="text"
                  class="form-input rounded-xl"
                  placeholder="e.g., University of Ghana, Legon"
                />
              </div>
              <div>
                <label class="field-label">Hostel (optional)</label>
                <input
                  formControlName="hostelName"
                  type="text"
                  class="form-input rounded-xl"
                  placeholder="e.g., Jean Nelson Aka Hall"
                />
              </div>
              <div>
                <label class="field-label">Residency status</label>
                <select formControlName="residencyStatus" class="form-input rounded-xl">
                  <option value="">Select one</option>
                  <option value="RESIDENT">Resident (I live in a hostel/dorm)</option>
                  <option value="NON_RESIDENT">Non-resident (I commute)</option>
                  <option value="NOT_APPLICABLE">Not applicable</option>
                </select>
              </div>
            </ng-container>

            <div *ngIf="!form.value.worksOnCampus">
              <label class="field-label">Which best describes you?</label>
              <select formControlName="employmentType" class="form-input rounded-xl">
                <option value="">Select one</option>
                <option value="SELF_EMPLOYED">Self-employed / freelance</option>
                <option value="SALON_OWNER">Salon owner</option>
                <option value="EMPLOYED">Employed at a salon/spa</option>
              </select>
            </div>

            <label
              class="flex items-center justify-between p-3.5 rounded-xl cursor-pointer"
              style="background-color: var(--color-background)"
            >
              <span class="text-sm font-medium" style="color: var(--color-text-primary)">
                I offer home service (I travel to clients)
              </span>
              <input
                type="checkbox"
                formControlName="offersHomeService"
                class="accent-primary w-5 h-5 rounded flex-shrink-0 ml-3"
              />
            </label>
          </form>
        </div>

        <!-- ── Social Links ── -->
        <div
          class="rounded-2xl p-5 space-y-3"
          style="background-color: var(--color-surface)"
        >
          <p
            class="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest"
          >
            Social Links
          </p>

          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background: #FCE4EC"
            >
              <i class="ri-instagram-line text-pink-500 text-base"></i>
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
              <i class="ri-facebook-line text-blue-500 text-base"></i>
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
              <i class="ri-whatsapp-line text-green-500 text-base"></i>
            </div>
            <input
              [(ngModel)]="whatsapp"
              type="tel"
              class="form-input flex-1 rounded-xl"
              placeholder="WhatsApp number"
            />
          </div>
        </div>

        <!-- ── Save (bottom) ── -->
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
  styles: [
    `
      .field-label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 6px;
      }
    `,
  ],
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
    private location: Location,
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
      worksOnCampus: [false],
      campusName: [""],
      hostelName: [""],
      residencyStatus: [""],
      employmentType: [""],
      offersHomeService: [false],
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
            worksOnCampus: !!b.worksOnCampus,
            campusName: b.campusName || "",
            hostelName: b.hostelName || "",
            residencyStatus: b.residencyStatus || "",
            employmentType: b.employmentType || "",
            offersHomeService: !!b.offersHomeService,
          });
          this.coverPreview = b.coverImage || null;
          this.instagram = b.instagramUrl || "";
          this.facebook = b.facebookUrl || "";
          this.whatsapp = b.whatsappNumber || "";
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  back() {
    this.location.back();
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

    const {
      worksOnCampus, campusName, hostelName, residencyStatus,
      employmentType, offersHomeService, ...rest
    } = this.form.getRawValue();

    const payload = {
      ...rest,
      worksOnCampus: !!worksOnCampus,
      // Enum fields reject empty strings server-side, and campus/employment
      // fields are mutually exclusive depending on the toggle — only send
      // the ones that actually apply, same rule the signup form follows.
      campusName: worksOnCampus && campusName ? campusName : undefined,
      hostelName: worksOnCampus && hostelName ? hostelName : undefined,
      residencyStatus: worksOnCampus && residencyStatus ? residencyStatus : undefined,
      employmentType: !worksOnCampus && employmentType ? employmentType : undefined,
      offersHomeService: !!offersHomeService,
      // instagram/facebook/whatsapp are plain component properties (bound
      // via ngModel), not reactive form controls, so they don't come
      // through in `...rest` — has to be added explicitly, or they silently
      // never reach the backend (which is what was happening before).
      instagramUrl: this.instagram || "",
      facebookUrl: this.facebook || "",
      whatsappNumber: this.whatsapp || "",
    };

    this.http
      .put(`${environment.apiUrl}/users/beautician/profile`, payload)
      .subscribe({
        next: () => {
          if (this.coverFile) {
            const fd = new FormData();
            fd.append("coverImage", this.coverFile!);
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


