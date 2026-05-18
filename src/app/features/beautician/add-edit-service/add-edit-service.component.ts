// ============================================================
// add-edit-service.component.ts  —  Enhanced UI
// ============================================================

import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-add-edit-service",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-32 lg:pb-8">
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3"
      >
        <button
          (click)="goBack()"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors"
        >
          <i
            class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1
          class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
        >
          {{ isEdit ? "Edit Service" : "Add New Service" }}
        </h1>
      </div>

      <!-- Loading (edit mode) -->
      <div *ngIf="loadingService" class="p-4 max-w-2xl mx-auto space-y-3">
        <div class="skeleton h-48 rounded-3xl"></div>
        <div class="skeleton h-72 rounded-2xl"></div>
      </div>

      <form
        *ngIf="!loadingService"
        [formGroup]="form"
        (ngSubmit)="save()"
        class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4"
      >
        <!-- Image Upload -->
        <div class="card rounded-2xl overflow-hidden">
          <div
            class="relative h-48 group cursor-pointer"
            [ngClass]="
              previewUrl ? '' : 'flex flex-col items-center justify-center'
            "
            style="background: color-mix(in srgb, var(--color-primary) 5%, transparent)"
          >
            <img
              *ngIf="previewUrl"
              [src]="previewUrl"
              alt="Preview"
              class="w-full h-full object-cover"
            />
            <div
              *ngIf="!previewUrl"
              class="flex flex-col items-center gap-2 pointer-events-none"
            >
              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center"
                style="background: color-mix(in srgb, var(--color-primary) 12%, transparent)"
              >
                <i
                  class="ri-image-add-line text-2xl text-[var(--color-primary)]"
                ></i>
              </div>
              <p class="text-sm font-semibold text-[var(--color-primary)]">
                Upload Service Image
              </p>
              <p class="text-xs text-[var(--color-text-muted)]">
                JPG, PNG — recommended 4:3 ratio
              </p>
            </div>
            <!-- hover overlay -->
            <div
              *ngIf="previewUrl"
              class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <span
                class="px-4 py-2 bg-white/90 rounded-xl text-sm font-semibold text-gray-800"
                >Change Image</span
              >
            </div>
            <input
              type="file"
              accept="image/*"
              class="absolute inset-0 opacity-0 cursor-pointer"
              (change)="onFile($event)"
            />
            <button
              *ngIf="previewUrl"
              type="button"
              (click)="
                $event.stopPropagation(); previewUrl = null; selectedFile = null
              "
              class="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-xl flex items-center justify-center z-10 hover:bg-black/70 transition-colors"
            >
              <i class="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Service Details -->
        <div class="card rounded-2xl p-5 space-y-4">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
          >
            Service Details
          </h3>

          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
              >Service Name *</label
            >
            <input
              formControlName="name"
              type="text"
              class="form-input rounded-xl"
              placeholder="e.g. Full Hair Braiding"
            />
            <p
              *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
              class="text-xs text-red-500 mt-1.5 flex items-center gap-1"
            >
              <i class="ri-error-warning-line"></i> Service name is required
            </p>
          </div>

          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
              >Description</label
            >
            <textarea
              formControlName="description"
              rows="3"
              class="form-input resize-none rounded-xl"
              placeholder="What's included in this service?…"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label
                class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
                >Price (GH₵) *</label
              >
              <input
                formControlName="price"
                type="number"
                class="form-input rounded-xl"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <p
                *ngIf="form.get('price')?.invalid && form.get('price')?.touched"
                class="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <i class="ri-error-warning-line"></i> Enter a valid price
              </p>
            </div>
            <div>
              <label
                class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
                >Duration (mins) *</label
              >
              <input
                formControlName="duration"
                type="number"
                class="form-input rounded-xl"
                placeholder="60"
                min="15"
              />
              <p
                *ngIf="
                  form.get('duration')?.invalid && form.get('duration')?.touched
                "
                class="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <i class="ri-error-warning-line"></i> Min 15 minutes
              </p>
            </div>
          </div>

          <!-- Category -->
          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide"
              >Category *</label
            >
            <div class="flex gap-2">
              <button
                *ngFor="let cat of categoryTabs"
                type="button"
                (click)="form.patchValue({ category: cat.value })"
                class="flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all"
                [ngClass]="
                  form.get('category')?.value === cat.value
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]'
                "
              >
                {{ cat.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Options -->
        <div class="card rounded-2xl p-5 space-y-0">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-4"
          >
            Options
          </h3>

          <label class="flex items-center justify-between py-3 cursor-pointer">
            <div>
              <p class="text-sm font-semibold text-[var(--color-text-primary)]">
                Mark as Popular
              </p>
              <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                Highlights this service on your profile
              </p>
            </div>
            <button
              type="button"
              (click)="toggle('isPopular')"
              class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
              [ngClass]="
                form.get('isPopular')?.value
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-gray-300 dark:bg-gray-600'
              "
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [ngClass]="
                  form.get('isPopular')?.value
                    ? 'translate-x-6'
                    : 'translate-x-0'
                "
              ></span>
            </button>
          </label>

          <div class="h-px bg-[var(--color-border)]"></div>

          <label class="flex items-center justify-between py-3 cursor-pointer">
            <div>
              <p class="text-sm font-semibold text-[var(--color-text-primary)]">
                Active
              </p>
              <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                Clients can see and book this service
              </p>
            </div>
            <button
              type="button"
              (click)="toggle('isActive')"
              class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
              [ngClass]="
                form.get('isActive')?.value
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-gray-300 dark:bg-gray-600'
              "
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [ngClass]="
                  form.get('isActive')?.value
                    ? 'translate-x-6'
                    : 'translate-x-0'
                "
              ></span>
            </button>
          </label>
        </div>

        <!-- Submit — sticky on mobile -->
        <div
          class="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)]
          lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:p-0"
        >
          <div class="max-w-2xl mx-auto">
            <button
              type="submit"
              [disabled]="saving || form.invalid"
              class="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50"
            >
              <i *ngIf="saving" class="ri-loader-4-line animate-spin"></i>
              <i
                *ngIf="!saving && !isEdit"
                class="ri-add-circle-line text-base"
              ></i>
              <i *ngIf="!saving && isEdit" class="ri-save-line text-base"></i>
              <span *ngIf="!saving">{{
                isEdit ? "Update Service" : "Add Service"
              }}</span>
              <span *ngIf="saving">{{ isEdit ? "Updating…" : "Adding…" }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class AddEditServiceComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  serviceId: string | null = null;
  loadingService = false;
  saving = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  categoryTabs = [
    { label: "All", value: "all" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      description: [""],
      price: [null, [Validators.required, Validators.min(0)]],
      duration: [60, [Validators.required, Validators.min(15)]],
      category: ["all", Validators.required],
      isPopular: [false],
      isActive: [true],
    });
  }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get("id");
    this.isEdit = !!this.serviceId;

    if (this.isEdit) {
      this.loadingService = true;
      this.http
        .get<any>(`${environment.apiUrl}/services/${this.serviceId}`)
        .subscribe({
          next: (res) => {
            const s = res.data?.service || res.data;
            this.form.patchValue({
              name: s.name,
              description: s.description || "",
              price: s.price,
              duration:
                s.durationMinutes ||
                (typeof s.duration === "number" ? s.duration : 60),
              category: s.category || "all",
              isPopular: s.isPopular || false,
              isActive: s.isActive !== undefined ? s.isActive : true,
            });
            this.previewUrl = s.image || null;
            this.loadingService = false;
          },
          error: () => (this.loadingService = false),
        });
    }
  }

  toggle(field: string) {
    this.form.patchValue({ [field]: !this.form.get(field)?.value });
  }

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const r = new FileReader();
    r.onload = (e) => (this.previewUrl = e.target?.result as string);
    r.readAsDataURL(file);
  }

  async save() {
    if (this.form.invalid) return;
    this.saving = true;
    const values = this.form.getRawValue();
    const body = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      duration: `${values.duration}mins`,
      durationMinutes: Number(values.duration),
      category: values.category,
      isPopular: values.isPopular,
      isActive: values.isActive,
    };
    const req = this.isEdit
      ? this.http.put<any>(
          `${environment.apiUrl}/services/${this.serviceId}`,
          body,
        )
      : this.http.post<any>(`${environment.apiUrl}/services`, body);

    req.subscribe({
      next: (res) => {
        const serviceId = res.data?.service?.id || this.serviceId;
        if (this.selectedFile && serviceId) {
          const fd = new FormData();
          fd.append("image", this.selectedFile);
          this.http
            .post(`${environment.apiUrl}/services/${serviceId}/image`, fd)
            .subscribe({
              next: () => this.finishSave(),
              error: () => {
                this.toast.error("Service saved but image upload failed");
                this.finishSave();
              },
            });
        } else {
          this.finishSave();
        }
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || "Save failed");
      },
    });
  }

  private finishSave() {
    this.saving = false;
    this.toast.success(this.isEdit ? "Service updated!" : "Service added!");
    this.router.navigate(["/beautician/services"]);
  }

  goBack() {
    this.router.navigate(["/beautician/services"]);
  }
}
