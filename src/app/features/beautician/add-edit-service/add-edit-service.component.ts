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
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">

      <div class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3">
        <button (click)="goBack()" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)]">
          <i class="ri-arrow-left-line text-xl text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">{{ isEdit ? 'Edit Service' : 'Add Service' }}</h1>
      </div>

      <div *ngIf="loading" class="p-4 max-w-2xl mx-auto">
        <div class="skeleton h-96 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 lg:p-6 max-w-2xl mx-auto">
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">

          <!-- Image Upload -->
          <div class="card p-4">
            <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Service Image</label>
            <div class="relative h-40 rounded-xl overflow-hidden bg-[var(--color-background)] border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
              [ngClass]="{'p-0 border-0': previewUrl}">
              <img *ngIf="previewUrl" [src]="previewUrl" alt="Preview" class="w-full h-full object-cover" />
              <div *ngIf="!previewUrl" class="text-center">
                <i class="ri-image-add-line text-3xl text-[var(--color-text-muted)]"></i>
                <p class="text-sm text-[var(--color-text-muted)] mt-1">Click to upload image</p>
              </div>
              <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" (change)="onFileChange($event)" />
              <button *ngIf="previewUrl" type="button" (click)="$event.stopPropagation(); previewUrl = null; selectedFile = null"
                class="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center">
                <i class="ri-close-line text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="card p-4 space-y-4">
            <h3 class="font-semibold text-[var(--color-text-primary)]">Service Details</h3>

            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Service Name *</label>
              <input formControlName="name" type="text" class="form-input" placeholder="e.g. Full Hair Braiding" />
            </div>

            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Description</label>
              <textarea formControlName="description" rows="3" class="form-input resize-none" placeholder="Describe what's included..."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Price (GH₵) *</label>
                <input formControlName="price" type="number" class="form-input" placeholder="0.00" min="0" />
              </div>
              <div>
                <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Duration (mins) *</label>
                <input formControlName="duration" type="number" class="form-input" placeholder="60" min="15" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Category *</label>
              <select formControlName="category" class="form-input">
                <option value="">Select category</option>
                <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              </select>
            </div>
          </div>

          <!-- Options -->
          <div class="card p-4 space-y-3">
            <h3 class="font-semibold text-[var(--color-text-primary)]">Options</h3>

            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <p class="text-sm font-medium text-[var(--color-text-primary)]">Mark as Popular</p>
                <p class="text-xs text-[var(--color-text-muted)]">Highlights this service on your profile</p>
              </div>
              <button type="button" (click)="toggleField('isPopular')"
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
              <button type="button" (click)="toggleField('isActive')"
                class="relative w-11 h-6 rounded-full transition-colors"
                [ngClass]="form.get('isActive')?.value ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  [ngClass]="form.get('isActive')?.value ? 'translate-x-5' : 'translate-x-0'"></span>
              </button>
            </label>
          </div>

          <!-- Submit -->
          <button type="submit" [disabled]="saving || form.invalid" class="btn-primary w-full py-3">
            <span *ngIf="!saving">{{ isEdit ? 'Update Service' : 'Add Service' }}</span>
            <span *ngIf="saving" class="flex items-center justify-center gap-2">
              <i class="ri-loader-4-line animate-spin"></i> {{ isEdit ? 'Updating...' : 'Adding...' }}
            </span>
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AddEditServiceComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  serviceId: string | null = null;
  loading = false;
  saving = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  categories = ['Hair', 'Makeup', 'Nails', 'Skincare', 'Waxing', 'Spa', 'Braiding', 'Lashes', 'Eyebrows', 'Other'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      duration: [60, [Validators.required, Validators.min(15)]],
      category: ['', Validators.required],
      isPopular: [false],
      isActive: [true],
    });
  }

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.serviceId;
    if (this.isEdit) {
      this.loading = true;
      this.http.get<any>(`${environment.apiUrl}/services/${this.serviceId}`).subscribe({
        next: (res) => {
          const s = res.data;
          this.form.patchValue(s);
          this.previewUrl = s.image || null;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    }
  }

  toggleField(field: string) {
    this.form.patchValue({ [field]: !this.form.get(field)?.value });
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.previewUrl = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  async save() {
    if (this.form.invalid) return;
    this.saving = true;

    const fd = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([k, v]) => fd.append(k, String(v)));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    const req = this.isEdit
      ? this.http.put(`${environment.apiUrl}/services/${this.serviceId}`, fd)
      : this.http.post(`${environment.apiUrl}/services`, fd);

    req.subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(this.isEdit ? 'Service updated!' : 'Service added!');
        this.router.navigate(['/beautician/services']);
      },
      error: () => { this.saving = false; this.toast.error('Save failed'); }
    });
  }

  goBack() { this.router.navigate(['/beautician/services']); }
}
