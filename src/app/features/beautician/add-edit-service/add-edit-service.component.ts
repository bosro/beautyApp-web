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
    <div class="min-h-screen bg-[var(--color-background)]">
      <!-- Header -->
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

      <!-- Loading skeleton -->
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

          <!-- Name -->
          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
            >
              Service Name *
            </label>
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

          <!-- Description -->
          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
            >
              Description
            </label>
            <textarea
              formControlName="description"
              rows="3"
              class="form-input resize-none rounded-xl"
              placeholder="What's included in this service?…"
            ></textarea>
          </div>

          <!-- Price & Duration -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label
                class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wide"
              >
                Price (GH₵) *
              </label>
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
              >
                Duration (mins) *
              </label>
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

          <!-- Category — scrollable chips -->
          <div>
            <label
              class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2 uppercase tracking-wide"
            >
              Category *
            </label>
            <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                *ngFor="let cat of categoryTabs"
                type="button"
                (click)="form.patchValue({ category: cat.value })"
                class="flex-shrink-0 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all whitespace-nowrap"
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

        <!-- Sub-options / pricing types — e.g. Lash Lift: Classic / Hybrid /
             Volume, each its own price. Entirely optional; only shown once
             the service has been saved, since variants belong to a real
             service id. -->
        <div *ngIf="isEdit" class="card rounded-2xl p-5 space-y-3">
          <div>
            <h3
              class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60"
            >
              Sub-options (optional)
            </h3>
            <p class="text-xs text-[var(--color-text-muted)] mt-1">
              Add different types or tiers of this service, each with its own price — e.g. "Classic", "Hybrid", "Volume".
            </p>
          </div>

          <div *ngIf="loadingVariants" class="space-y-2">
            <div class="skeleton h-12 rounded-xl"></div>
          </div>

          <div *ngIf="!loadingVariants && variants.length > 0" class="space-y-2">
            <div
              *ngFor="let v of variants"
              class="flex items-center justify-between gap-2 p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)]"
            >
              <div class="min-w-0">
                <p class="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                  {{ v.name }}
                </p>
                <p class="text-xs text-[var(--color-text-muted)]">
                  GH₵ {{ v.price | number: "1.2-2" }}
                  <span *ngIf="v.durationMinutes"> · {{ v.durationMinutes }} mins</span>
                </p>
              </div>
              <button
                type="button"
                (click)="removeVariant(v)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors flex-shrink-0"
                title="Remove"
              >
                <i class="ri-delete-bin-line text-red-500 text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Add-variant mini form -->
          <div class="flex items-end gap-2 pt-1">
            <div class="flex-1 min-w-0">
              <label class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Name</label>
              <input
                [(ngModel)]="newVariantName"
                [ngModelOptions]="{ standalone: true }"
                type="text"
                placeholder="e.g. Hybrid"
                class="form-input rounded-xl text-sm"
              />
            </div>
            <div class="w-28 flex-shrink-0">
              <label class="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Price (GH₵)</label>
              <input
                [(ngModel)]="newVariantPrice"
                [ngModelOptions]="{ standalone: true }"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="form-input rounded-xl text-sm"
              />
            </div>
            <button
              type="button"
              (click)="addVariant()"
              [disabled]="addingVariant || !newVariantName || !newVariantPrice"
              class="btn-primary text-sm px-3 py-2.5 rounded-xl flex-shrink-0 disabled:opacity-50"
            >
              <i class="ri-add-line" *ngIf="!addingVariant"></i>
              <i class="ri-loader-4-line animate-spin" *ngIf="addingVariant"></i>
            </button>
          </div>
        </div>

        <!-- Submit — in flow -->
        <div class="pt-2 pb-6">
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

  // Sub-options (variants)
  variants: any[] = [];
  loadingVariants = false;
  addingVariant = false;
  newVariantName = "";
  newVariantPrice: number | null = null;

  categoryTabs = [
    { label: "Hair", value: "hair" },
    { label: "Nails", value: "nails" },
    { label: "Skin", value: "skin" },
    { label: "Makeup", value: "makeup" },
    { label: "Lashes", value: "lashes" },
    { label: "Brows", value: "brows" },
    { label: "Massage", value: "massage" },
    { label: "Other", value: "other" },
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
      category: ["hair", Validators.required],
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

            // Normalize category — guard against null/wrong case
            const validCategories = this.categoryTabs.map((c) => c.value);
            const rawCategory = (s.category || "hair").toLowerCase();
            const category = validCategories.includes(rawCategory)
              ? rawCategory
              : "hair";

            this.form.patchValue({
              name: s.name,
              description: s.description || "",
              price: s.price,
              duration:
                s.durationMinutes ||
                (typeof s.duration === "number" ? s.duration : 60),
              category,
              isPopular: s.isPopular ?? false,
              isActive: s.isActive ?? true,
            });
            this.previewUrl = s.image || null;
            this.loadingService = false;
            this.variants = s.variants || [];
          },
          error: () => (this.loadingService = false),
        });
    }
  }

  loadVariants() {
    if (!this.serviceId) return;
    this.loadingVariants = true;
    this.http
      .get<any>(`${environment.apiUrl}/services/${this.serviceId}/variants`)
      .subscribe({
        next: (res) => {
          this.variants = res.data?.variants || [];
          this.loadingVariants = false;
        },
        error: () => (this.loadingVariants = false),
      });
  }

  addVariant() {
    if (!this.serviceId || !this.newVariantName || !this.newVariantPrice) return;
    this.addingVariant = true;
    this.http
      .post<any>(`${environment.apiUrl}/services/${this.serviceId}/variants`, {
        name: this.newVariantName,
        price: Number(this.newVariantPrice),
      })
      .subscribe({
        next: (res) => {
          this.variants = [...this.variants, res.data.variant];
          this.newVariantName = "";
          this.newVariantPrice = null;
          this.addingVariant = false;
          this.toast.success("Sub-option added");
        },
        error: (err) => {
          this.addingVariant = false;
          this.toast.error(err.error?.message || "Failed to add sub-option");
        },
      });
  }

  removeVariant(v: any) {
    this.http
      .delete(`${environment.apiUrl}/services/variants/${v.id}`)
      .subscribe({
        next: () => {
          this.variants = this.variants.filter((x) => x.id !== v.id);
          this.toast.success("Sub-option removed");
        },
        error: () => this.toast.error("Failed to remove sub-option"),
      });
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
      isActive: values.isActive,
      // isPopular intentionally omitted until migration is done
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
        const wasCreate = !this.isEdit;
        if (this.selectedFile && serviceId) {
          const fd = new FormData();
          fd.append("image", this.selectedFile);
          this.http
            .post(`${environment.apiUrl}/services/${serviceId}/image`, fd)
            .subscribe({
              next: () => this.finishSave(serviceId, wasCreate),
              error: () => {
                this.toast.error("Service saved but image upload failed");
                this.finishSave(serviceId, wasCreate);
              },
            });
        } else {
          this.finishSave(serviceId, wasCreate);
        }
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || "Save failed");
      },
    });
  }

  private finishSave(serviceId?: string, wasCreate?: boolean) {
    this.saving = false;
    this.toast.success(this.isEdit ? "Service updated!" : "Service added!");
    // After creating a brand-new service, drop straight into its edit page
    // (instead of back to the list) so sub-options can be added right away
    // without an extra click to find and reopen it.
    if (wasCreate && serviceId) {
      this.router.navigate(["/beautician/services/edit", serviceId]);
    } else {
      this.router.navigate(["/beautician/services"]);
    }
  }

  goBack() {
    this.router.navigate(["/beautician/services"]);
  }
}
