import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

@Component({
  selector: "app-beautician-services",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-24 lg:pb-8">
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center justify-between"
      >
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          My Services
        </h1>
        <button
          (click)="addService()"
          class="btn-primary text-sm px-3 py-2 flex items-center gap-1.5"
        >
          <i class="ri-add-line"></i> Add Service
        </button>
      </div>

      <div *ngIf="loading" class="p-4 space-y-3">
        <div
          *ngFor="let i of [1, 2, 3, 4]"
          class="skeleton h-24 rounded-xl"
        ></div>
      </div>

      <app-empty-state
        *ngIf="!loading && services.length === 0"
        icon="ri-scissors-2-line"
        title="No Services Yet"
        subtitle="Add your first service to start receiving bookings."
      >
      </app-empty-state>

      <div
        *ngIf="!loading && services.length > 0"
        class="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
      >
        <div *ngFor="let service of services" class="card p-4">
          <!-- Image -->
          <div
            *ngIf="service.image"
            class="h-32 rounded-xl overflow-hidden mb-3 -mx-0 -mt-0"
          >
            <img
              [src]="service.image"
              [alt]="service.name"
              class="w-full h-full object-cover"
            />
          </div>

          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-[var(--color-text-primary)]">
                {{ service.name }}
              </h3>
              <p
                class="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2"
              >
                {{ service.description }}
              </p>
            </div>
            <!-- Toggle active -->
            <button
              (click)="toggleActive(service)"
              class="relative w-9 h-5 rounded-full flex-shrink-0 transition-colors"
              [ngClass]="
                service.isActive
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-gray-300 dark:bg-gray-600'
              "
            >
              <span
                class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                [ngClass]="service.isActive ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <span class="badge badge-info text-xs">{{ service.category }}</span>
            <span
              class="text-xs text-[var(--color-text-muted)] flex items-center gap-1"
            >
              <i class="ri-time-line"></i> {{ service.duration }} mins
            </span>
            <span *ngIf="service.isPopular" class="badge badge-warning text-xs"
              >Popular</span
            >
          </div>

          <div
            class="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]"
          >
            <p class="font-bold text-[var(--color-primary)]">
              GH₵ {{ service.price | number: "1.2-2" }}
            </p>
            <div class="flex gap-2">
              <button
                (click)="editService(service)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-background)] hover:border hover:border-[var(--color-primary)] transition-colors"
              >
                <i
                  class="ri-pencil-line text-[var(--color-text-secondary)] text-sm"
                ></i>
              </button>
              <button
                (click)="serviceToDelete = service; showDeleteModal = true"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors"
              >
                <i class="ri-delete-bin-line text-red-500 text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <app-confirm-modal
        *ngIf="showDeleteModal"
        title="Delete Service"
        message="Are you sure you want to delete this service? This cannot be undone."
        confirmText="Delete"
        type="error"
        [loading]="deleting"
        (confirmed)="deleteService()"
        (cancelled)="showDeleteModal = false; serviceToDelete = null"
      >
      </app-confirm-modal>
    </div>
  `,
})
export class BeauticianServicesComponent implements OnInit {
  services: any[] = [];
  loading = true;
  showDeleteModal = false;
  serviceToDelete: any = null;
  deleting = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/services/mine`).subscribe({
      next: (res) => {
        this.services = res.data || [];
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  addService() {
    this.router.navigate(["/beautician/services/add"]);
  }
  editService(s: any) {
    this.router.navigate(["/beautician/services/edit", s.id]);
  }

  toggleActive(service: any) {
    this.http
      .patch(`${environment.apiUrl}/services/${service.id}/toggle`, {})
      .subscribe({
        next: () => {
          service.isActive = !service.isActive;
        },
        error: () => this.toast.error("Failed to update service"),
      });
  }

  deleteService() {
    if (!this.serviceToDelete) return;
    this.deleting = true;
    this.http
      .delete(`${environment.apiUrl}/services/${this.serviceToDelete.id}`)
      .subscribe({
        next: () => {
          this.services = this.services.filter(
            (s) => s.id !== this.serviceToDelete.id,
          );
          this.showDeleteModal = false;
          this.deleting = false;
          this.serviceToDelete = null;
          this.toast.success("Service deleted");
        },
        error: () => {
          this.deleting = false;
          this.toast.error("Failed to delete");
        },
      });
  }
}
