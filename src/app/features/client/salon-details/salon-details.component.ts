import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { BeauticianProfile, BeautyService, Review } from '../../../core/models';
import { environment } from '../../../../environments/environment';

type TabType = 'about' | 'services' | 'reviews';

@Component({
  selector: 'app-salon-details',
  template: `
    <div class="page-enter" *ngIf="!loading; else loadingTpl">
      <!-- ===== HERO IMAGE ===== -->
      <div class="relative h-64 lg:h-80 overflow-hidden">
        <img
          [src]="salon?.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200'"
          [alt]="salon?.businessName"
          class="w-full h-full object-cover"
        />
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>

        <!-- Overlay actions -->
        <div class="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            (click)="goBack()"
            class="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center shadow"
          >
            <i class="ri-arrow-left-line text-gray-800"></i>
          </button>
          <p class="text-white font-semibold text-sm">Service Profile</p>
          <button
            (click)="toggleFavorite()"
            class="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center shadow"
          >
            <i class="text-lg" [class]="isFavorite ? 'ri-heart-3-fill' : 'ri-heart-3-line'"
              [style.color]="isFavorite ? 'var(--color-primary)' : '#374151'"></i>
          </button>
        </div>
      </div>

      <div class="lg:grid lg:grid-cols-12 lg:gap-6 lg:px-6 lg:py-6">
        <!-- LEFT: Main content -->
        <div class="lg:col-span-8">

          <!-- Info card -->
          <div class="relative px-4 lg:px-0">
            <div class="flex gap-4 -mt-10 lg:mt-0 mb-4">
              <img
                [src]="salon?.profileImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200'"
                [alt]="salon?.businessName"
                class="w-20 h-20 rounded-2xl object-cover border-4 flex-shrink-0"
                style="border-color: var(--color-bg-primary); background-color: var(--color-bg-secondary)"
              />
              <div class="flex-1 pt-10 lg:pt-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-xl font-bold" style="color: var(--color-text-primary)">
                    {{ salon?.businessName }}
                  </h1>
                  <i *ngIf="salon?.verificationStatus === 'APPROVED'"
                    class="ri-verified-badge-fill text-blue-500 text-lg"></i>
                </div>
                <div class="flex items-center gap-3 mt-1 flex-wrap">
                  <div class="flex items-center gap-1">
                    <i class="ri-star-fill text-yellow-400 text-sm"></i>
                    <span class="text-sm font-semibold" style="color: var(--color-text-primary)">
                      {{ salon?.rating?.toFixed(1) || '0.0' }}
                    </span>
                    <span class="text-xs" style="color: var(--color-text-secondary)">
                      ({{ salon?.totalReviews || 0 }} reviews)
                    </span>
                  </div>
                  <span class="text-xs px-2 py-0.5 rounded-full"
                    style="background-color: color-mix(in srgb, var(--color-success) 12%, transparent); color: var(--color-success)">
                    Open
                  </span>
                </div>
                <p class="text-xs mt-1 flex items-center gap-1" style="color: var(--color-text-secondary)">
                  <i class="ri-map-pin-2-line"></i>
                  {{ salon?.city }}, {{ salon?.region }}
                </p>
              </div>
            </div>

            <!-- Quick contact actions -->
            <div class="grid grid-cols-3 gap-2 mb-5">
              <button
                (click)="call()"
                class="flex flex-col items-center gap-1 p-3 rounded-xl transition-opacity hover:opacity-80"
                style="background-color: var(--color-bg-secondary)"
              >
                <div class="w-9 h-9 rounded-full flex items-center justify-center"
                  style="background-color: color-mix(in srgb, var(--color-primary) 12%, transparent)">
                  <i class="ri-phone-line text-base" style="color: var(--color-primary)"></i>
                </div>
                <span class="text-xs" style="color: var(--color-text-secondary)">Call</span>
              </button>
              <button
                class="flex flex-col items-center gap-1 p-3 rounded-xl transition-opacity hover:opacity-80"
                style="background-color: var(--color-bg-secondary)"
              >
                <div class="w-9 h-9 rounded-full flex items-center justify-center"
                  style="background-color: color-mix(in srgb, var(--color-primary) 12%, transparent)">
                  <i class="ri-map-pin-2-line text-base" style="color: var(--color-primary)"></i>
                </div>
                <span class="text-xs" style="color: var(--color-text-secondary)">Directions</span>
              </button>
              <button
                class="flex flex-col items-center gap-1 p-3 rounded-xl transition-opacity hover:opacity-80"
                style="background-color: var(--color-bg-secondary)"
              >
                <div class="w-9 h-9 rounded-full flex items-center justify-center"
                  style="background-color: color-mix(in srgb, var(--color-primary) 12%, transparent)">
                  <i class="ri-share-line text-base" style="color: var(--color-primary)"></i>
                </div>
                <span class="text-xs" style="color: var(--color-text-secondary)">Share</span>
              </button>
            </div>

            <!-- Tabs -->
            <div class="flex gap-2 mb-5">
              <button *ngFor="let t of tabList"
                (click)="activeTab = t.value"
                class="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                [style.background-color]="activeTab === t.value ? '#1a1a1a' : 'var(--color-bg-secondary)'"
                [style.color]="activeTab === t.value ? 'white' : 'var(--color-text-secondary)'"
              >{{ t.label }}</button>
            </div>

            <!-- ===== ABOUT ===== -->
            <div *ngIf="activeTab === 'about'" class="space-y-5">
              <div>
                <h3 class="font-semibold text-sm mb-2" style="color: var(--color-primary)">Summary</h3>
                <p class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
                  {{ salon?.bio || 'No description available.' }}
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-sm mb-2" style="color: var(--color-primary)">Working Hours</h3>
                <div class="p-3 rounded-xl" style="background-color: var(--color-bg-secondary)">
                  <p class="text-sm mb-1" style="color: var(--color-text-primary)">
                    {{ salon?.workingDays?.join(', ') || 'Mon – Fri' }}
                  </p>
                  <p class="text-sm font-semibold" style="color: var(--color-primary)">
                    {{ salon?.openingTime }} – {{ salon?.closingTime }}
                  </p>
                </div>
              </div>

              <div>
                <h3 class="font-semibold text-sm mb-2" style="color: var(--color-primary)">Contact</h3>
                <div class="space-y-2">
                  <div class="flex items-center gap-2 text-sm" style="color: var(--color-text-secondary)">
                    <i class="ri-map-pin-2-line" style="color: var(--color-primary)"></i>
                    {{ salon?.businessAddress }}, {{ salon?.city }}
                  </div>
                  <div *ngIf="salon?.user?.phone" class="flex items-center gap-2 text-sm">
                    <i class="ri-phone-line" style="color: var(--color-primary)"></i>
                    <span style="color: var(--color-primary)">{{ salon?.user?.phone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ===== SERVICES ===== -->
            <div *ngIf="activeTab === 'services'" class="space-y-3">
              <div *ngIf="loadingServices" class="skeleton h-20 rounded-xl" *ngFor="let _ of [1,2,3]"></div>
              <div
                *ngFor="let svc of services"
                (click)="selectService(svc)"
                class="p-4 rounded-xl cursor-pointer border-2 transition-all"
                [style.border-color]="isSelected(svc.id) ? 'var(--color-primary)' : 'transparent'"
                [style.background-color]="isSelected(svc.id) ? 'color-mix(in srgb, var(--color-primary) 6%, transparent)' : 'var(--color-bg-secondary)'"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="font-bold text-sm" style="color: var(--color-text-primary)">{{ svc.name }}</p>
                    <span *ngIf="svc.totalBookings > 20"
                      class="text-xs px-2 py-0.5 rounded-full font-semibold bg-yellow-100 text-yellow-700">
                      Popular
                    </span>
                  </div>
                  <!-- Selection circle -->
                  <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    [style.border-color]="isSelected(svc.id) ? 'var(--color-primary)' : 'var(--color-border-light)'"
                    [style.background-color]="isSelected(svc.id) ? 'var(--color-primary)' : 'transparent'">
                    <i *ngIf="isSelected(svc.id)" class="ri-check-line text-white text-xs"></i>
                  </div>
                </div>
                <div class="flex items-center gap-4 text-xs mb-2" style="color: var(--color-text-secondary)">
                  <span><i class="ri-time-line mr-1"></i>{{ svc.duration }}</span>
                  <span><i class="ri-calendar-event-line mr-1"></i>{{ svc.totalBookings }} bookings</span>
                </div>
                <p class="text-lg font-bold" style="color: var(--color-primary)">
                  GHS {{ svc.price?.toFixed(2) }}
                </p>
              </div>

              <app-empty-state *ngIf="!loadingServices && services.length === 0"
                icon="ri-scissors-2-line" title="No services" subtitle="This salon has no services listed">
              </app-empty-state>

              <!-- Summary if selected -->
              <div *ngIf="selectedServices.length > 0"
                class="sticky bottom-20 lg:bottom-4 p-3 rounded-xl flex items-center justify-between shadow-lg"
                style="background-color: color-mix(in srgb, var(--color-primary) 10%, transparent); border: 1px solid var(--color-primary)">
                <span class="text-sm font-medium" style="color: var(--color-text-primary)">
                  {{ selectedServices.length }} service{{ selectedServices.length > 1 ? 's' : '' }}
                </span>
                <span class="font-bold" style="color: var(--color-primary)">
                  GHS {{ totalPrice.toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- ===== REVIEWS ===== -->
            <div *ngIf="activeTab === 'reviews'" class="space-y-4">
              <!-- Summary -->
              <div class="flex items-center gap-6 p-4 rounded-xl" style="background-color: var(--color-bg-secondary)">
                <div class="text-center">
                  <p class="text-4xl font-bold" style="color: var(--color-primary)">
                    {{ salon?.rating?.toFixed(1) || '0.0' }}
                  </p>
                  <div class="flex justify-center mt-1">
                    <app-star-rating [rating]="salon?.rating || 0" [showCount]="false" [starSize]="14"></app-star-rating>
                  </div>
                  <p class="text-xs mt-1" style="color: var(--color-text-secondary)">
                    {{ salon?.totalReviews || 0 }} reviews
                  </p>
                </div>
              </div>

              <div *ngFor="let review of reviews"
                class="p-4 rounded-xl" style="background-color: var(--color-bg-secondary)">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style="background-color: var(--color-primary)">
                    {{ review.customer?.name?.charAt(0) | uppercase }}
                  </div>
                  <div>
                    <p class="font-semibold text-sm" style="color: var(--color-text-primary)">
                      {{ review.customer?.name }}
                    </p>
                    <p class="text-xs" style="color: var(--color-text-secondary)">
                      {{ review.createdAt | date:'MMM d, y' }}
                    </p>
                  </div>
                  <div class="ml-auto">
                    <app-star-rating [rating]="review.rating" [showCount]="false" [starSize]="13"></app-star-rating>
                  </div>
                </div>
                <p *ngIf="review.comment" class="text-sm leading-relaxed" style="color: var(--color-text-secondary)">
                  {{ review.comment }}
                </p>
              </div>

              <app-empty-state *ngIf="!loadingReviews && reviews.length === 0"
                icon="ri-star-line" title="No reviews yet" subtitle="Be the first to leave a review!">
              </app-empty-state>
            </div>
          </div>
        </div>

        <!-- RIGHT: Booking panel (desktop) -->
        <div class="hidden lg:block lg:col-span-4">
          <div class="sticky top-4 rounded-2xl p-5" style="background-color: var(--color-bg-secondary)">
            <h3 class="font-bold mb-4" style="color: var(--color-text-primary)">Book Appointment</h3>

            <div *ngIf="selectedServices.length === 0" class="text-center py-6">
              <i class="ri-scissors-2-line text-4xl mb-2" style="color: var(--color-text-placeholder)"></i>
              <p class="text-sm" style="color: var(--color-text-secondary)">
                Select a service from the Services tab to book
              </p>
            </div>

            <div *ngIf="selectedServices.length > 0">
              <div class="space-y-2 mb-4">
                <div *ngFor="let svc of getSelectedServiceObjects()"
                  class="flex items-center justify-between text-sm">
                  <span style="color: var(--color-text-primary)">{{ svc.name }}</span>
                  <span class="font-semibold" style="color: var(--color-primary)">GHS {{ svc.price?.toFixed(2) }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between py-3 border-t mb-4"
                style="border-color: var(--color-border-light)">
                <span class="font-bold" style="color: var(--color-text-primary)">Total</span>
                <span class="font-bold text-lg" style="color: var(--color-primary)">GHS {{ totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <button
              (click)="book()"
              class="btn-primary w-full"
              [disabled]="selectedServices.length === 0"
            >
              <i class="ri-calendar-event-line"></i>
              {{ activeTab === 'reviews' ? 'Leave a Review' : 'Book Now' }}
            </button>

            <button
              (click)="activeTab = 'services'"
              *ngIf="activeTab !== 'services'"
              class="btn-secondary w-full mt-2"
            >
              View Services
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile CTA bar -->
      <div class="lg:hidden fixed bottom-[72px] left-0 right-0 px-4 z-30">
        <button
          (click)="book()"
          class="btn-primary w-full shadow-lg"
        >
          <i class="ri-calendar-event-line"></i>
          {{ getButtonLabel() }}
        </button>
      </div>
    </div>

    <ng-template #loadingTpl>
      <app-spinner [fullPage]="true" label="Loading salon details..."></app-spinner>
    </ng-template>
  `,
})
export class SalonDetailsComponent implements OnInit {
  salonId = '';
  salon: BeauticianProfile | null = null;
  services: BeautyService[] = [];
  reviews: Review[] = [];
  isFavorite = false;
  activeTab: TabType = 'about';
  loading = true;
  loadingServices = false;
  loadingReviews = false;
  selectedServices: string[] = [];

  tabList = [
    { label: 'About', value: 'about' as TabType },
    { label: 'Services', value: 'services' as TabType },
    { label: 'Reviews', value: 'reviews' as TabType },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.salonId = this.route.snapshot.paramMap.get('id') || '';
    this.loadSalon();
  }

  loadSalon(): void {
    this.http.get<any>(`${environment.apiUrl}/beauticians/${this.salonId}`).subscribe({
      next: (res) => {
        this.salon = res?.data?.beautician || res?.data || null;
        this.loading = false;
        this.loadServices();
        this.loadReviews();
      },
      error: () => { this.loading = false; },
    });
  }

  loadServices(): void {
    this.loadingServices = true;
    this.http.get<any>(`${environment.apiUrl}/services`, {
      params: { beauticianId: this.salonId, isActive: 'true' },
    }).subscribe({
      next: (res) => {
        this.services = res?.data?.services || [];
        this.loadingServices = false;
      },
      error: () => { this.loadingServices = false; },
    });
  }

  loadReviews(): void {
    this.loadingReviews = true;
    this.http.get<any>(`${environment.apiUrl}/reviews`, {
      params: { beauticianId: this.salonId, limit: '20' },
    }).subscribe({
      next: (res) => {
        this.reviews = res?.data?.reviews || [];
        this.loadingReviews = false;
      },
      error: () => { this.loadingReviews = false; },
    });
  }

  isSelected(id: string): boolean {
    return this.selectedServices.includes(id);
  }

  selectService(svc: BeautyService): void {
    if (this.isSelected(svc.id)) {
      this.selectedServices = this.selectedServices.filter((s) => s !== svc.id);
    } else {
      this.selectedServices.push(svc.id);
    }
    this.activeTab = 'services';
  }

  get totalPrice(): number {
    return this.services
      .filter((s) => this.selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  }

  getSelectedServiceObjects(): BeautyService[] {
    return this.services.filter((s) => this.selectedServices.includes(s.id));
  }

  getButtonLabel(): string {
    if (this.activeTab === 'about') return 'Book Appointment';
    if (this.activeTab === 'reviews') return 'Leave a Review';
    return this.selectedServices.length > 0 ? 'Continue to Book' : 'Select a Service';
  }

  book(): void {
    if (this.activeTab === 'reviews') {
      this.toast.info('Review feature coming soon');
      return;
    }
    if (this.selectedServices.length === 0) {
      this.activeTab = 'services';
      this.toast.warning('Please select at least one service');
      return;
    }
    // Navigate to booking with selected services
    this.router.navigate(['/client/salon', this.salonId], {
      queryParams: { services: this.selectedServices.join(','), book: true },
    });
    this.toast.success('Booking flow coming soon!');
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    this.toast.success(this.isFavorite ? 'Added to favorites' : 'Removed from favorites');
  }

  call(): void {
    const phone = this.salon?.user?.phone;
    if (phone) window.open(`tel:${phone}`);
    else this.toast.warning('Phone number not available');
  }

  goBack(): void {
    this.router.navigate(['/client/discover']);
  }
}
