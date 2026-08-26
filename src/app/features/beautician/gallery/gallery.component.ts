import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-beautician-gallery",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <!-- Header -->
      <div
  class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 space-y-2"
>
  <button
    (click)="router.navigate(['/beautician/dashboard'])"
    class="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:opacity-70"
  >
    <i class="ri-arrow-left-line"></i> Back
  </button>

  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
        Gallery
      </h1>
      <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
        Show off your work — completely optional. Clients browsing your profile can view and like these photos.
      </p>
    </div>
    <label
      class="btn-primary text-sm px-3 py-2 flex items-center gap-1.5 cursor-pointer flex-shrink-0"
    >
      <i *ngIf="!uploading" class="ri-add-line"></i>
      <i *ngIf="uploading" class="ri-loader-4-line animate-spin"></i>
      Add Photo
      <input
        type="file"
        accept="image/*"
        class="hidden"
        (change)="onFile($event)"
        [disabled]="uploading"
      />
    </label>
  </div>
</div>

      <div *ngIf="loading" class="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        <div *ngFor="let i of [1, 2, 3, 4]" class="skeleton aspect-square rounded-xl"></div>
      </div>

      <app-empty-state
        *ngIf="!loading && images.length === 0"
        icon="ri-image-line"
        title="No photos yet"
        subtitle="Optional, but a gallery of your work helps clients decide to book you. Tap 'Add Photo' to get started."
      >
      </app-empty-state>

      <div
        *ngIf="!loading && images.length > 0"
        class="p-4 lg:p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3"
      >
        <div
          *ngFor="let img of images"
          class="relative group rounded-xl overflow-hidden aspect-square bg-[var(--color-background)]"
        >
          <img [src]="img.imageUrl" [alt]="img.caption || 'Gallery photo'" class="w-full h-full object-cover" />

          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-2 opacity-0 group-hover:opacity-100"
          >
            <span class="text-white text-xs flex items-center gap-1 drop-shadow">
              <i class="ri-heart-fill text-[var(--color-primary)]"></i> {{ img.likesCount || 0 }}
            </span>
            <button
              (click)="imageToDelete = img; showDeleteModal = true"
              class="w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 hover:bg-white transition-colors"
              title="Remove"
            >
              <i class="ri-delete-bin-line text-red-500 text-sm"></i>
            </button>
          </div>
        </div>
      </div>

      <app-confirm-modal
        [visible]="showDeleteModal"
        title="Remove Photo"
        message="Remove this photo from your gallery? This can't be undone."
        confirmText="Remove"
        type="error"
        [loading]="deleting"
        (confirmed)="deletePhoto()"
        (cancelled)="showDeleteModal = false; imageToDelete = null"
      >
      </app-confirm-modal>
    </div>
  `,
})
export class BeauticianGalleryComponent implements OnInit {
  images: any[] = [];
  loading = true;
  uploading = false;
  showDeleteModal = false;
  imageToDelete: any = null;
  deleting = false;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.loadGallery();
  }

  loadGallery() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/gallery/mine`).subscribe({
      next: (res) => {
        this.images = res.data?.images || [];
        this.loading = false;
      },
      error: () => {
        this.toast.error("Failed to load gallery");
        this.loading = false;
      },
    });
  }

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading = true;
    const fd = new FormData();
    fd.append("image", file);
    this.http.post<any>(`${environment.apiUrl}/gallery`, fd).subscribe({
      next: (res) => {
        this.images = [res.data.image, ...this.images];
        this.uploading = false;
        this.toast.success("Photo added to gallery");
      },
      error: (err) => {
        this.uploading = false;
        this.toast.error(err.error?.message || "Failed to upload photo");
      },
    });
  }

  deletePhoto() {
    if (!this.imageToDelete) return;
    this.deleting = true;
    this.http.delete(`${environment.apiUrl}/gallery/${this.imageToDelete.id}`).subscribe({
      next: () => {
        this.images = this.images.filter((i) => i.id !== this.imageToDelete.id);
        this.showDeleteModal = false;
        this.deleting = false;
        this.imageToDelete = null;
        this.toast.success("Photo removed");
      },
      error: () => {
        this.deleting = false;
        this.toast.error("Failed to remove photo");
      },
    });
  }
}
