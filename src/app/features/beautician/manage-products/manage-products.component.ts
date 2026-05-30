// manage-products.component.ts
// Route: /beautician/products
// Beautician can view, add, edit, toggle and delete their products.
// Mirrors the style of add-edit-service.component.ts already in your codebase.

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-manage-products',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-28">

      <!-- Header -->
      <div class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md
                  border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
        <button (click)="router.navigate(['/beautician/settings'])"
          class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--color-background)] transition-colors">
          <i class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="flex-1 text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          My Products
        </h1>
        <button (click)="openForm()"
          class="btn-primary text-sm px-4 py-2 rounded-xl flex items-center gap-1.5">
          <i class="ri-add-line text-base"></i> Add Product
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-24 rounded-2xl" *ngFor="let i of [1,2,3]"></div>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && products.length === 0" class="p-8 text-center max-w-2xl mx-auto">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)">
          <i class="ri-shopping-bag-3-line text-3xl" style="color: var(--color-primary)"></i>
        </div>
        <h2 class="text-base font-bold text-[var(--color-text-primary)] mb-1">No products yet</h2>
        <p class="text-sm text-[var(--color-text-secondary)] mb-5">
          List shampoos, creams, or any product you sell alongside your services.
        </p>
        <button (click)="openForm()" class="btn-primary px-6">
          Add your first product
        </button>
      </div>

      <!-- Product list -->
      <div *ngIf="!loading && products.length > 0" class="p-4 max-w-2xl mx-auto space-y-3">
        <div *ngFor="let p of products"
          class="flex items-center gap-3 p-3 rounded-2xl border transition-all"
          style="background: var(--color-surface); border-color: var(--color-border)">

          <!-- Image -->
          <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-background)]">
            <img *ngIf="p.image" [src]="p.image" [alt]="p.name" class="w-full h-full object-cover"/>
            <div *ngIf="!p.image" class="w-full h-full flex items-center justify-center">
              <i class="ri-shopping-bag-3-line text-2xl" style="color: var(--color-text-placeholder)"></i>
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-bold text-[var(--color-text-primary)] truncate">{{ p.name }}</p>
              <span *ngIf="!p.isActive"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 flex-shrink-0">
                Hidden
              </span>
            </div>
            <p class="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">
              {{ p.description || p.category }}
            </p>
            <div class="flex items-center gap-3 mt-1.5">
              <span class="text-sm font-bold" style="color: var(--color-primary)">GH₵{{ p.price | number:'1.2-2' }}</span>
              <span class="text-xs text-[var(--color-text-muted)]">
                {{ p.stock === -1 ? 'Unlimited stock' : p.stock + ' in stock' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button (click)="toggleActive(p)"
              class="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              [style.background]="p.isActive
                ? 'color-mix(in srgb, var(--color-primary) 10%, transparent)'
                : 'var(--color-background)'"
              [title]="p.isActive ? 'Hide product' : 'Show product'">
              <i [class]="p.isActive ? 'ri-eye-line' : 'ri-eye-off-line'"
                [style.color]="p.isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'"></i>
            </button>
            <button (click)="openForm(p)"
              class="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--color-background)]">
              <i class="ri-edit-line text-sm text-[var(--color-text-secondary)]"></i>
            </button>
            <button (click)="confirmDelete(p)"
              class="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--color-background)]">
              <i class="ri-delete-bin-line text-sm text-red-500"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Add / Edit Sheet ── -->
      <div *ngIf="showForm"
        class="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
        style="background: rgba(0,0,0,0.45)">
        <div class="w-full max-w-lg bg-[var(--color-surface)] rounded-t-3xl lg:rounded-3xl
                    max-h-[92vh] overflow-y-auto shadow-2xl">

          <!-- Sheet header -->
          <div class="flex items-center justify-between px-5 pt-5 pb-3 sticky top-0
                      bg-[var(--color-surface)] border-b border-[var(--color-border)] z-10">
            <h2 class="text-base font-bold text-[var(--color-text-primary)]">
              {{ editingProduct ? 'Edit Product' : 'Add Product' }}
            </h2>
            <button (click)="closeForm()"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-background)]">
              <i class="ri-close-line text-base text-[var(--color-text-primary)]"></i>
            </button>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="p-5 space-y-4">

            <!-- Image upload -->
            <div class="relative h-36 rounded-2xl overflow-hidden cursor-pointer group"
              style="background: color-mix(in srgb, var(--color-primary) 5%, transparent)">
              <img *ngIf="imagePreview" [src]="imagePreview" class="w-full h-full object-cover"/>
              <div *ngIf="!imagePreview"
                class="w-full h-full flex flex-col items-center justify-center gap-1 pointer-events-none">
                <i class="ri-image-add-line text-2xl" style="color: var(--color-primary)"></i>
                <p class="text-xs font-semibold" style="color: var(--color-primary)">Upload product image</p>
              </div>
              <div *ngIf="imagePreview"
                class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="px-3 py-1.5 bg-white/90 rounded-xl text-xs font-semibold text-gray-800">Change</span>
              </div>
              <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer"
                (change)="onImageChange($event)"/>
            </div>

            <!-- Name -->
            <div>
              <label class="prod-label">Product Name *</label>
              <input formControlName="name" type="text" class="form-input rounded-xl"
                placeholder="e.g. Argan Oil Shampoo"/>
            </div>

            <!-- Description -->
            <div>
              <label class="prod-label">Description</label>
              <textarea formControlName="description" rows="2"
                class="form-input resize-none rounded-xl"
                placeholder="What does this product do?"></textarea>
            </div>

            <!-- Price + Stock -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="prod-label">Price (GH₵) *</label>
                <input formControlName="price" type="number" class="form-input rounded-xl"
                  placeholder="0.00" min="0" step="0.01"/>
              </div>
              <div>
                <label class="prod-label">Stock (-1 = unlimited)</label>
                <input formControlName="stock" type="number" class="form-input rounded-xl"
                  placeholder="-1"/>
              </div>
            </div>

            <!-- Category chips -->
            <div>
              <label class="prod-label">Category *</label>
              <div class="flex flex-wrap gap-2 mt-1">
                <button *ngFor="let cat of productCategories" type="button"
                  (click)="productForm.patchValue({ category: cat.value })"
                  class="px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all"
                  [ngClass]="productForm.get('category')?.value === cat.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                    : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-primary)]'">
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <!-- Active toggle -->
            <label class="flex items-center justify-between py-1 cursor-pointer">
              <div>
                <p class="text-sm font-semibold text-[var(--color-text-primary)]">Visible to clients</p>
                <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Clients can see and enquire about this product</p>
              </div>
              <button type="button"
                (click)="productForm.patchValue({ isActive: !productForm.get('isActive')?.value })"
                class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
                [ngClass]="productForm.get('isActive')?.value ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  [ngClass]="productForm.get('isActive')?.value ? 'translate-x-6' : 'translate-x-0'"></span>
              </button>
            </label>

            <!-- Submit -->
            <button type="submit"
              [disabled]="saving || productForm.invalid"
              class="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-50">
              <i *ngIf="saving" class="ri-loader-4-line animate-spin"></i>
              <i *ngIf="!saving && !editingProduct" class="ri-add-circle-line"></i>
              <i *ngIf="!saving && editingProduct"  class="ri-save-line"></i>
              {{ saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Add Product' }}
            </button>

          </form>
        </div>
      </div>

      <!-- Delete confirm modal -->
      <app-confirm-modal
        *ngIf="showDeleteModal"
        title="Delete Product"
        message="Delete '{{ deletingProduct?.name }}'? This cannot be undone."
        confirmText="Delete"
        type="error"
        [loading]="deleting"
        (confirmed)="deleteProduct()"
        (cancelled)="showDeleteModal = false">
      </app-confirm-modal>

    </div>
  `,
  styles: [`
    .prod-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .skeleton {
      background: linear-gradient(90deg,
        var(--color-border) 25%,
        color-mix(in srgb, var(--color-border) 60%, transparent) 50%,
        var(--color-border) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `],
})
export class ManageProductsComponent implements OnInit {
  products: any[] = [];
  loading = true;
  saving = false;
  deleting = false;
  showForm = false;
  showDeleteModal = false;
  editingProduct: any = null;
  deletingProduct: any = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  productForm!: FormGroup;

  productCategories = [
    { label: 'Hair Care',  value: 'hair_care'  },
    { label: 'Skin Care',  value: 'skin_care'  },
    { label: 'Nail Care',  value: 'nail_care'  },
    { label: 'Fragrance',  value: 'fragrance'  },
    { label: 'Tools',      value: 'tools'      },
    { label: 'Other',      value: 'other'      },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadProducts();
  }

  private buildForm(data?: any) {
    this.productForm = this.fb.group({
      name:        [data?.name        || '', Validators.required],
      description: [data?.description || ''],
      price:       [data?.price       ?? null, [Validators.required, Validators.min(0)]],
      stock:       [data?.stock       ?? -1],
      category:    [data?.category    || 'other', Validators.required],
      isActive:    [data?.isActive    ?? true],
    });
  }

  loadProducts() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/products/my/list`).subscribe({
      next: (res) => { this.products = res.data?.products || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openForm(product?: any) {
    this.editingProduct = product || null;
    this.imagePreview   = product?.image || null;
    this.imageFile      = null;
    this.buildForm(product);
    this.showForm = true;
  }

  closeForm() {
    this.showForm       = false;
    this.editingProduct = null;
    this.imagePreview   = null;
    this.imageFile      = null;
  }

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.imageFile = file;
    const r = new FileReader();
    r.onload = (e) => this.imagePreview = e.target?.result as string;
    r.readAsDataURL(file);
  }

  saveProduct() {
    if (this.productForm.invalid) return;
    this.saving = true;
    const body = this.productForm.getRawValue();

    const req = this.editingProduct
      ? this.http.put<any>(`${environment.apiUrl}/products/${this.editingProduct.id}`, body)
      : this.http.post<any>(`${environment.apiUrl}/products`, body);

    req.subscribe({
      next: (res) => {
        const productId = res.data?.product?.id || this.editingProduct?.id;
        if (this.imageFile && productId) {
          const fd = new FormData();
          fd.append('image', this.imageFile);
          this.http.post(`${environment.apiUrl}/products/${productId}/image`, fd).subscribe({
            next: () => this.finishSave(),
            error: () => { this.toast.error('Saved but image upload failed'); this.finishSave(); },
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
    this.toast.success(this.editingProduct ? 'Product updated!' : 'Product added!');
    this.closeForm();
    this.loadProducts();
  }

  toggleActive(product: any) {
    this.http.put(`${environment.apiUrl}/products/${product.id}`, { isActive: !product.isActive }).subscribe({
      next: () => { product.isActive = !product.isActive; },
      error: () => this.toast.error('Could not update product'),
    });
  }

  confirmDelete(product: any) {
    this.deletingProduct = product;
    this.showDeleteModal = true;
  }

  deleteProduct() {
    if (!this.deletingProduct) return;
    this.deleting = true;
    this.http.delete(`${environment.apiUrl}/products/${this.deletingProduct.id}`).subscribe({
      next: () => {
        this.products    = this.products.filter(p => p.id !== this.deletingProduct.id);
        this.deleting    = false;
        this.showDeleteModal = false;
        this.deletingProduct = null;
        this.toast.success('Product deleted');
      },
      error: () => { this.deleting = false; this.toast.error('Delete failed'); },
    });
  }
}