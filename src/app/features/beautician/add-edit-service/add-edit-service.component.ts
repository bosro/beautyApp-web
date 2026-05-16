// add-edit-service.component.ts
// NEW — mirrors mobile AddEditServiceScreen exactly.
// Routes: /beautician/services/add  and  /beautician/services/edit/:id
// API:
//   GET  /services/:id          (edit mode pre-fill)
//   POST /services              create → { data: { service } }
//   PUT  /services/:id          update → { data: { service } }
//   POST /services/:id/image    multipart with field "image"

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-add-edit-service',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-28 lg:pb-8">

      <!-- Header -->
      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3">
        <button (click)="goBack()"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]">
          <i class="ri-arrow-left-line text-xl text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          {{ isEdit ? 'Edit Service' : 'Add Service' }}
        </h1>
      </div>

      <!-- Loading (edit mode) -->
      <div *ngIf="loadingService" class="p-4 max-w-2xl mx-auto">
        <div class="skeleton h-96 rounded-2xl"></div>
      </div>

      <form *ngIf="!loadingService" [formGroup]="form" (ngSubmit)="save()"
        class="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">

        <!-- Image upload — mirrors mobile imageUploadButton / imagePreviewContainer -->
        <div class="card p-4">
          <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Service Image</label>
          <div class="relative h-44 rounded-xl overflow-hidden border-2 border-dashed border-[var(--color-border)]
            flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
            [ngClass]="{'border-0': previewUrl}">
            <img *ngIf="previewUrl" [src]="previewUrl" alt="Preview" class="w-full h-full object-cover" />
            <div *ngIf="!previewUrl" class="text-center pointer-events-none">
              <i class="ri-image-add-line text-3xl text-[var(--color-text-muted)]"></i>
              <p class="text-sm text-[var(--color-text-muted)] mt-1">Click to upload image</p>
            </div>
            <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" (change)="onFile($event)" />
            <button *ngIf="previewUrl" type="button"
              (click)="$event.stopPropagation(); previewUrl = null; selectedFile = null"
              class="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center">
              <i class="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Service details card -->
        <div class="card p-4 space-y-4">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Service Details</h3>

          <!-- Service name -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Service Name *
            </label>
            <input formControlName="name" type="text" class="form-input" placeholder="e.g. Full Hair Braiding" />
            <p *ngIf="form.get('name')?.invalid && form.get('name')?.touched"
              class="text-xs text-red-500 mt-1">Service name is required</p>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
            <textarea formControlName="description" rows="3"
              class="form-input resize-none"
              placeholder="Describe what's included..."></textarea>
          </div>

          <!-- Price + Duration -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Price (GH₵) *</label>
              <input formControlName="price" type="number" class="form-input" placeholder="0.00" min="0" step="0.01" />
              <p *ngIf="form.get('price')?.invalid && form.get('price')?.touched"
                class="text-xs text-red-500 mt-1">Enter a valid price</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Duration (mins) *</label>
              <input formControlName="duration" type="number" class="form-input" placeholder="60" min="15" />
              <p *ngIf="form.get('duration')?.invalid && form.get('duration')?.touched"
                class="text-xs text-red-500 mt-1">Min 15 minutes</p>
            </div>
          </div>

          <!-- Category — mirrors mobile categoryTabs (All / Male / Female) -->
          <div>
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Category *</label>
            <div class="flex gap-2">
              <button *ngFor="let cat of categoryTabs" type="button"
                (click)="form.patchValue({ category: cat.value })"
                class="flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors"
                [ngClass]="form.get('category')?.value === cat.value
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)]'"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Options card — mirrors mobile "Options" card -->
        <div class="card p-4 space-y-3">
          <h3 class="font-semibold text-[var(--color-text-primary)]">Options</h3>

          <label class="flex items-center justify-between cursor-pointer">
            <div>
              <p class="text-sm font-medium text-[var(--color-text-primary)]">Mark as Popular</p>
              <p class="text-xs text-[var(--color-text-muted)]">Highlights this service on your profile</p>
            </div>
            <button type="button" (click)="toggle('isPopular')"
              class="relative w-11 h-6 rounded-full transition-colors"
              [ngClass]="form.get('isPopular')?.value ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [ngClass]="form.get('isPopular')?.value ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </label>

          <label class="flex items-center justify-between cursor-pointer pt-2 border-t border-[var(--color-border)]">
            <div>
              <p class="text-sm font-medium text-[var(--color-text-primary)]">Active</p>
              <p class="text-xs text-[var(--color-text-muted)]">Clients can book this service</p>
            </div>
            <button type="button" (click)="toggle('isActive')"
              class="relative w-11 h-6 rounded-full transition-colors"
              [ngClass]="form.get('isActive')?.value ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'">
              <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                [ngClass]="form.get('isActive')?.value ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </label>
        </div>

        <!-- Submit — fixed at bottom on mobile, inline on desktop -->
        <div class="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)] lg:static lg:border-0 lg:bg-transparent lg:p-0">
          <button type="submit"
            [disabled]="saving || form.invalid"
            class="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
            <i *ngIf="saving" class="ri-loader-4-line animate-spin"></i>
            <span *ngIf="!saving">{{ isEdit ? 'Update Service' : 'Add Service' }}</span>
            <span *ngIf="saving">{{ isEdit ? 'Updating...' : 'Adding...' }}</span>
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

  categoryTabs = [
    { label: 'All', value: 'all' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      duration: [60, [Validators.required, Validators.min(15)]],
      category: ['all', Validators.required],
      isPopular: [false],
      isActive: [true],
    });
  }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.serviceId;

    if (this.isEdit) {
      this.loadingService = true;
      // Matches mobile useService: GET /services/:id → { data: { service } } or { data: service }
      this.http.get<any>(`${environment.apiUrl}/services/${this.serviceId}`).subscribe({
        next: (res) => {
          const s = res.data?.service || res.data;
          this.form.patchValue({
            name: s.name,
            description: s.description || '',
            price: s.price,
            // Mobile stores duration as string ("45mins") or number (durationMinutes)
            duration: s.durationMinutes || (typeof s.duration === 'number' ? s.duration : 60),
            category: s.category || 'all',
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
    // Mobile sends both duration string and durationMinutes number
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
      ? this.http.put<any>(`${environment.apiUrl}/services/${this.serviceId}`, body)
      : this.http.post<any>(`${environment.apiUrl}/services`, body);

    req.subscribe({
      next: (res) => {
        const serviceId = res.data?.service?.id || this.serviceId;

        // Upload image if a new file was selected — matches mobile uploadImageMutation
        if (this.selectedFile && serviceId) {
          const fd = new FormData();
          fd.append('image', this.selectedFile);
          this.http.post(`${environment.apiUrl}/services/${serviceId}/image`, fd).subscribe({
            next: () => this.finishSave(),
            error: () => {
              // Don't fail overall save if image upload fails
              this.toast.error('Service saved but image upload failed');
              this.finishSave();
            },
          });
        } else {
          this.finishSave();
        }
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Save failed');
      },
    });
  }

  private finishSave() {
    this.saving = false;
    this.toast.success(this.isEdit ? 'Service updated!' : 'Service added!');
    this.router.navigate(['/beautician/services']);
  }

  goBack() {
    this.router.navigate(['/beautician/services']);
  }
}