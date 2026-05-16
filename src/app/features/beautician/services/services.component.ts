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
      <!-- Header -->
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 space-y-3"
      >
        <div class="flex items-center justify-between">
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

        <!-- Search -->
        <div class="relative">
          <i class="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm"></i>
          <input
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterServices()"
            type="text"
            placeholder="Search services..."
            class="form-input pl-8 text-sm w-full"
          />
        </div>

        <!-- Category Tabs -->
        <div class="flex gap-1 bg-[var(--color-background)] p-1 rounded-xl">
          <button
            *ngFor="let tab of categoryTabs"
            (click)="activeCategory = tab.value; filterServices()"
            class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors"
            [ngClass]="
              activeCategory === tab.value
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)]'
            "
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Stats bar — mirrors mobile stat row -->
      <div *ngIf="!loading && services.length > 0"
        class="mx-4 mt-4 flex items-center justify-around bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)]"
      >
        <div class="text-center">
          <p class="text-lg font-bold text-[var(--color-primary)]">{{ activeCount }}</p>
          <p class="text-xs text-[var(--color-text-muted)]">Active</p>
        </div>
        <div class="w-px h-8 bg-[var(--color-border)]"></div>
        <div class="text-center">
          <p class="text-lg font-bold text-[var(--color-primary)]">{{ services.length }}</p>
          <p class="text-xs text-[var(--color-text-muted)]">Total Services</p>
        </div>
        <div class="w-px h-8 bg-[var(--color-border)]"></div>
        <div class="text-center">
          <p class="text-lg font-bold text-[var(--color-primary)]">{{ totalBookings }}</p>
          <p class="text-xs text-[var(--color-text-muted)]">Total Bookings</p>
        </div>
      </div>

      <div *ngIf="loading" class="p-4 space-y-3">
        <div
          *ngFor="let i of [1, 2, 3, 4]"
          class="skeleton h-36 rounded-xl"
        ></div>
      </div>

      <app-empty-state
        *ngIf="!loading && filteredServices.length === 0 && services.length === 0"
        icon="ri-scissors-2-line"
        title="No Services Yet"
        subtitle="Add your first service to start receiving bookings."
      >
      </app-empty-state>

      <app-empty-state
        *ngIf="!loading && filteredServices.length === 0 && services.length > 0"
        icon="ri-search-line"
        title="No services found"
        subtitle="Try adjusting your search or category filter."
      >
      </app-empty-state>

      <div
        *ngIf="!loading && filteredServices.length > 0"
        class="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
      >
        <div *ngFor="let service of filteredServices" class="card p-4">
          <!-- Image -->
          <div
            *ngIf="service.image"
            class="h-32 rounded-xl overflow-hidden mb-3"
          >
            <img
              [src]="service.image"
              [alt]="service.name"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Name + active toggle -->
          <div class="flex items-start justify-between gap-2 mb-2">
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
            <!-- Active toggle — mirrors mobile isActive indicator -->
            <button
              (click)="toggleActive(service)"
              class="relative w-9 h-5 rounded-full flex-shrink-0 transition-colors"
              [ngClass]="
                service.isActive
                  ? 'bg-[var(--color-primary)]'
                  : 'bg-gray-300 dark:bg-gray-600'
              "
              [attr.aria-label]="service.isActive ? 'Deactivate service' : 'Activate service'"
            >
              <span
                class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                [ngClass]="service.isActive ? 'translate-x-4' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          <!-- Badges: category + duration + active status -->
          <div class="flex items-center gap-2 flex-wrap mb-3">
            <span class="badge badge-info text-xs">
              {{ service.category === 'all' ? 'All' : service.category === 'male' ? 'Male' : service.category === 'female' ? 'Female' : service.category }}
            </span>
            <span class="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
              <i class="ri-time-line"></i> {{ service.duration || service.durationMinutes + ' mins' }}
            </span>
            <span
              class="text-xs px-2 py-0.5 rounded-md font-medium"
              [ngClass]="service.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'"
            >
              {{ service.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <!-- Details row: price + bookings -->
          <div class="flex items-center gap-4 mb-3 text-xs text-[var(--color-text-secondary)]">
            <span class="flex items-center gap-1">
              <i class="ri-money-dollar-circle-line text-[var(--color-primary)]"></i>
              <span class="font-bold text-[var(--color-primary)] text-sm">GH₵ {{ service.price | number: "1.2-2" }}</span>
            </span>
            <span *ngIf="service.totalBookings !== undefined" class="flex items-center gap-1">
              <i class="ri-calendar-check-line text-[var(--color-primary)]"></i>
              {{ service.totalBookings }} bookings
            </span>
            <span *ngIf="service.bookingCount !== undefined" class="flex items-center gap-1">
              <i class="ri-calendar-check-line text-[var(--color-primary)]"></i>
              {{ service.bookingCount }} bookings
            </span>
          </div>

          <!-- Action row -->
          <div
            class="flex items-center justify-between pt-3 border-t border-[var(--color-border)]"
          >
            <div class="flex gap-2">
              <!-- Deactivate/Activate text button -->
              <button
                (click)="toggleActive(service)"
                class="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                {{ service.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
            <div class="flex gap-2">
              <button
                (click)="editService(service)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 transition-colors"
                title="Edit"
              >
                <i class="ri-pencil-line text-blue-500 text-sm"></i>
              </button>
              <button
                (click)="serviceToDelete = service; showDeleteModal = true"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors"
                title="Delete"
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
        [message]="'Are you sure you want to delete &quot;' + serviceToDelete?.name + '&quot;? This action cannot be undone.'"
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
  filteredServices: any[] = [];
  loading = true;
  showDeleteModal = false;
  serviceToDelete: any = null;
  deleting = false;
  searchQuery = "";
  activeCategory = "all";

  categoryTabs = [
    { label: "All", value: "all" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  get activeCount() {
    return this.services.filter((s) => s.isActive).length;
  }

  get totalBookings() {
    return this.services.reduce(
      (sum, s) => sum + (s.totalBookings ?? s.bookingCount ?? 0),
      0,
    );
  }

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
    // GET /services/mine — matches serviceApi shape: res.data.services[]
    this.http.get<any>(`${environment.apiUrl}/services/mine`).subscribe({
      next: (res) => {
        // Fix: was `res.data || []` — correct shape is res.data.services
        this.services = res.data?.services || res.data || [];
        this.filterServices();
        this.loading = false;
      },
      error: () => {
        this.toast.error("Failed to load services");
        this.loading = false;
      },
    });
  }

  filterServices() {
    this.filteredServices = this.services.filter((s) => {
      const matchCategory =
        this.activeCategory === "all" || s.category === this.activeCategory;
      const matchSearch =
        !this.searchQuery ||
        (s.name || "").toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }

  addService() {
    this.router.navigate(["/beautician/services/add"]);
  }

  editService(s: any) {
    this.router.navigate(["/beautician/services/edit", s.id]);
  }

  toggleActive(service: any) {
    // Optimistic update
    service.isActive = !service.isActive;
    this.http
      .patch(`${environment.apiUrl}/services/${service.id}/toggle`, {})
      .subscribe({
        next: () => {
          this.toast.success(
            `${service.name} ${service.isActive ? "activated" : "deactivated"}`,
          );
        },
        error: () => {
          // Rollback
          service.isActive = !service.isActive;
          this.toast.error("Failed to update service");
        },
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
          this.filterServices();
          this.showDeleteModal = false;
          this.deleting = false;
          this.serviceToDelete = null;
          this.toast.success("Service deleted");
        },
        error: () => {
          this.deleting = false;
          this.toast.error("Failed to delete service");
        },
      });
  }
}